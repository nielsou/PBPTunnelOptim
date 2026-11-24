// src/pricing.js
// Calcul du prix complet, à partir du formulaire et de la config du site (src/sites/*).
// Fonction pure (sans React) : useQuoteLogic l'appelle dans un useMemo.

import { COMPANY_SPECIFIC_PRICING } from './constants';
import { formatMoney } from './sites';

// Distance à vol d'oiseau (km) entre le point de départ du site et le lieu
export function haversineKm(origin, lat2, lon2) {
    const lat1 = origin.lat;
    const lon1 = origin.lng;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function computePrice({ formData, site, t, isPartnerClient, quoteId }) {
    const models = site.models;
    const opts = site.options;

    // 1. PRIX EN HT OU EN TTC
    const displayTTC = !formData.isPro;
    const priceTransformer = (priceHT) => (displayTTC ? (priceHT * site.vatRate) : priceHT);
    const suffixLabel = ` ${t(displayTTC ? 'price.suffix.TTC' : 'price.suffix.HT')}`;
    const money = (priceHT) => `${formatMoney(site, priceTransformer(priceHT))}${suffixLabel}`;

    // 2. Récupération des deals du partenaire (s'il y en a) — Paris uniquement
    const partnerId = formData.companyId?.toString();
    const partnerDeals = (formData.isPartnerMode && COMPANY_SPECIFIC_PRICING[partnerId])
        ? COMPANY_SPECIFIC_PRICING[partnerId]
        : {};

    // 3. Petite fonction pour vérifier si un prix est écrasé
    const getEffectivePrice = (key, defaultPrice) => {
        const deal = partnerDeals[key];
        if (deal === undefined) return defaultPrice;      // Pas d'override
        if (typeof deal === 'number') return deal;        // Override simple (ex: 430)
        if (deal && deal.priceHT !== undefined) return deal.priceHT; // Override Objet (ex: { priceHT: 440 })
        return defaultPrice;
    };

    // 4. Prix unitaires des modèles proposés par le site (avec override partenaire)
    const unitaryModelPrices = {};
    const unitaryDelivery = {};
    Object.entries(models).forEach(([id, m]) => {
        unitaryModelPrices[id] = getEffectivePrice(id, m.priceHT);
        unitaryDelivery[`deliv_${id}`] = m.delivery;
    });
    const priceHT_music360 = models['360'] ? getEffectivePrice('360', models['360'].speaker) : 0;
    let price_template = getEffectivePrice('template', opts.templateProHT);

    // COÛT DE BASE
    const distanceKm = (formData.deliveryLat && formData.deliveryLng)
        ? haversineKm(site.origin, formData.deliveryLat, formData.deliveryLng)
        : 0;

    const { freeRadiusKm, trips, costPerKmHT } = site.delivery;
    const supplementKm = distanceKm > freeRadiusKm
        ? Math.round(distanceKm - freeRadiusKm) * trips * costPerKmHT
        : 0;

    // Modèle absent ou non proposé par ce site : objet par défaut pour ne pas planter l'UI
    if (!formData.model || !models[formData.model]) return {
        totalHT: 0, details: [], displayTTC: displayTTC, priceSuffix: displayTTC ? 'TTC' : 'HT', axonautData: {},
        unitaryPrices: {
            ...unitaryModelPrices,
            ...Object.fromEntries(Object.entries(unitaryDelivery).map(([k, v]) => [k, v + supplementKm])),
        },
    };

    // --- 0. DÉTECTION DU TYPE D'OFFRE ---
    const isSignature = formData.model === 'Signature';
    const is360 = formData.model === '360';

    let details = [];
    const NbJours = formData.eventDuration;
    const modelData = models[formData.model];
    const nomBorne = modelData.name;

    const eventMonth = formData.eventDate.slice(0, 7);
    const surcharge = isPartnerClient ? 0 : ((site.seasonalSurcharge || {})[eventMonth] || 0);

    const effectivePriceHT = Math.round(
        getEffectivePrice(formData.model, modelData.priceHT) * (1 + surcharge) * 100
    ) / 100;

    const effectiveFloorPriceHT = partnerDeals[formData.model]?.floorPriceHT ?? modelData.floorPriceHT;
    let base_price_prestation = effectivePriceHT * NbJours;
    let price_prestation = (effectivePriceHT - effectiveFloorPriceHT) * 10 * (1 - Math.pow(0.9, NbJours)) + effectiveFloorPriceHT * NbJours;
    let discount_prestation = base_price_prestation - price_prestation;

    let price_livraison = modelData.delivery;
    price_template = formData.isPro ? price_template : 0;

    let price_optionImpression = 0;
    let base_price_optionImpression = 0;
    let discount_optionImpression = 0;

    if (opts.extraPrintHT != null && formData.proImpressions > 1) {
        base_price_optionImpression = opts.extraPrintHT * (formData.proImpressions - 1) * NbJours;
        price_optionImpression =
            (opts.extraPrintHT - opts.extraPrintFloorHT) * 10 * (1 - Math.pow(0.9, NbJours))
            + opts.extraPrintFloorHT * (formData.proImpressions - 1) * NbJours;
        discount_optionImpression = base_price_optionImpression - price_optionImpression;
    }

    let price_optionIA = (opts.aiBackgroundHT != null && formData.proFondIA) ? opts.aiBackgroundHT : 0;
    let price_optionRGPD = (opts.rgpdHT != null && formData.proRGPD) ? opts.rgpdHT : 0;
    let price_optionSpeaker = (is360 && formData.optionSpeaker) ? modelData.speaker : 0;
    let heuresAnimPayantes = opts.animation
        ? (is360 ? parseInt(formData.proAnimationHours) - 3 : parseInt(formData.proAnimationHours))
        : NaN;
    let price_optionAnim = modelData.animation_hour * heuresAnimPayantes;
    let totalHT = 0;

    {
        // PRESTATION PHOTOBOOTH OU VIDEOBOOTH
        details.push({
            label: t('price.detail.base', { name: nomBorne }),
            priceHT: price_prestation,
            daily: true,
            originalDisplayPrice: discount_prestation > 0.01 ? money(base_price_prestation) : null,
            displayPrice: money(price_prestation)
        });
        totalHT += price_prestation;

        if (formData.model !== '360') {
            details.push({
                label: t('price.detail.no_time_limit'),
                priceHT: 0,
                daily: false,
                displayPrice: '✓'
            });
            details.push({
                label: t('price.detail.digital_props'),
                priceHT: 0, // Impact nul sur le total
                daily: false,
                // Valeur barrée (ex. "24€ TTC")
                originalDisplayPrice: money(opts.digitalPropsValueHT),
                displayPrice: t('common.included')
            });
        }

        // TEMPLATETOOL
        if (formData.templateTool) {
            const isFree = price_template === 0;
            const originalTemplatePrice = opts.templateProHT;

            details.push({
                label: t('price.detail.template'),
                priceHT: price_template,
                daily: false,
                // Si c'est gratuit, on affiche le prix d'origine barré (sauf s'il n'y en a pas)
                originalDisplayPrice: (isFree && originalTemplatePrice > 0) ? money(originalTemplatePrice) : null,
                displayPrice: isFree ? t('common.included') : money(price_template)
            });
            totalHT += price_template;
        }

        // LIVRAISON
        if (formData.delivery === true) {

            const animationHours = parseInt(formData.proAnimationHours);
            const isShortAnimation = isSignature && animationHours > 0 && animationHours <= 3;
            price_livraison = isShortAnimation ? price_livraison / 2 : price_livraison;

            details.push({
                label: t('price.detail.delivery'),
                priceHT: price_livraison,
                daily: false,
                displayPrice: price_livraison === 0 ? t('common.included') : money(price_livraison)
            });
            totalHT += price_livraison;

            // SUPPLEMENT KILOMETRIQUE
            if (supplementKm > 0) {
                details.push({
                    label: t('price.detail.km_extra', { km: Math.round(distanceKm) }),
                    priceHT: supplementKm,
                    daily: false,
                    displayPrice: `+${money(supplementKm)}`
                });
                totalHT += supplementKm;
            }

        } else {
            details.push({
                label: t('price.detail.pickup'),
                priceHT: 0,
                daily: false,
                displayPrice: t('common.free')
            });
        }

        // OPTION IMPRESSION
        if (price_optionImpression > 0) {
            details.push({
                label: t('price.detail.prints', { qty: NbJours * (formData.proImpressions - 1) }),
                priceHT: price_optionImpression,
                daily: true,
                originalDisplayPrice: discount_optionImpression > 0.01 ? `+${money(base_price_optionImpression)}` : null,
                displayPrice: `+${money(price_optionImpression)}`
            });
            totalHT += price_optionImpression;
        }

        // OPTION ANIM
        if (heuresAnimPayantes > 0) {
            details.push({
                label: `${t('step2.option.anim.label')} ${heuresAnimPayantes}h`,
                priceHT: price_optionAnim,
                daily: false,
                displayPrice: `+${money(price_optionAnim)}`
            });
            totalHT += price_optionAnim;
        }

        // OPTION FOND IA
        if (price_optionIA > 0) {
            details.push({
                label: t('price.detail.ai_bg'),
                priceHT: price_optionIA,
                daily: false,
                displayPrice: `+${money(price_optionIA)}`
            });
            totalHT += price_optionIA;
        }

        // OPTION RGPD
        if (price_optionRGPD > 0) {
            details.push({
                label: t('price.detail.rgpd'),
                priceHT: price_optionRGPD,
                daily: false,
                displayPrice: `+${money(price_optionRGPD)}`
            });
            totalHT += price_optionRGPD;
        }

        // OPTION ENCEINTE
        if (is360 && formData.optionSpeaker) {
            details.push({
                label: t('price.detail.speaker'),
                priceHT: price_optionSpeaker,
                daily: false,
                displayPrice: `+${money(price_optionSpeaker)}`
            });
            totalHT += price_optionSpeaker;
        }
        totalHT = Math.round(totalHT * 100) / 100;
    }

    const axonautData = {
        // base material
        nomBorne,
        nombreMachine: 1,
        nombreJours: NbJours,
        prixMateriel: Math.round(price_prestation * 100) / 100,
        prixMaterielBrut: Math.round(base_price_prestation * 100) / 100,
        remiseMateriel: Math.round(discount_prestation * 100) / 100,

        // livraison
        livraisonIncluse: formData.delivery,
        nombreTirages: formData.proImpressions,
        prixLivraison: Math.round(price_livraison * 100) / 100,
        supplementKilometrique: formData.delivery ? Math.round(supplementKm * 100) / 100 : 0,
        distanceKm: distanceKm,
        supplementLivraisonDifficile: 0,

        // template
        prixTemplate: Math.round(price_template * 100) / 100,

        // impression supp
        supplementImpression: Math.round(price_optionImpression * 100) / 100,
        supplementImpressionBrut: Math.round(base_price_optionImpression * 100) / 100,
        remiseImpression: Math.round(discount_optionImpression * 100) / 100,

        // autres options
        heuresAnimations: heuresAnimPayantes,
        supplementAnimation: price_optionAnim,
        optionFondIA: price_optionIA,
        optionRGPD: price_optionRGPD,
        optionSpeaker: price_optionSpeaker
    };

    return {
        totalHT,
        details,
        displayTTC,
        priceSuffix: displayTTC ? 'TTC' : 'HT',
        axonautData,
        quoteId,
        unitaryPrices: {
            ...unitaryModelPrices,
            ...unitaryDelivery,
            //options
            template: price_template,
            livraison: price_livraison,
            impressionSup: opts.extraPrintHT,
            ia: opts.aiBackgroundHT,
            rgpd: opts.rgpdHT,
            speaker: priceHT_music360,
        },
    };
}
