// src/hooks/useQuoteLogic.js

import { useState, useMemo, useEffect } from 'react'; // <--- N'oubliez pas d'importer useEffect
import { nanoid } from 'nanoid';
import * as AxonautService from '../services/axonautService';
import { pushToDataLayer } from '../services/gtmService';
import { locales } from '../locales'; // Import manquant ajouté ici

import {
    TVA_RATE,
    PARIS_LAT, PARIS_LNG,
    AXONAUT_FIXED_DEFAULTS,
    PRICING_STRATEGY, COMPANY_SPECIFIC_PRICING,
    OPTION_IMPRESSION_BASE_HT,
    OPTION_IMPRESSION_PLANCHER_HT,
    OPTION_FONDIA_HT,
    OPTION_RGPD_HT,
    TEMPLATE_TOOL_PRO_PRICE_HT,
    ENABLE_WEBHOOK_STEP_1, ENABLE_WEBHOOK_STEP_2, ENABLE_WEBHOOK_STEP_3, ENABLE_WEBHOOK_STEP_4
} from '../constants';



// Fonction utilitaire pour la distance
function calculateHaversineDistance(lat2, lon2) {
    const lat1 = PARIS_LAT;
    const lon1 = PARIS_LNG;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export const useQuoteLogic = () => {

    useEffect(() => {
        if (typeof window !== 'undefined') {

            const params = new URLSearchParams(window.location.search);

            // Lecture des informations de tracking
            const utm_source = params.get('utm_source') || '';
            const utm_medium = params.get('utm_medium') || '';
            const utm_campaign = params.get('utm_campaign') || '';

            const path = window.location.pathname;
            const isPartner = path.includes('/partenaires') || path.includes('/calculette');
            const isCalc = path.includes('/calculette');

            setFormData(prev => {
                if (prev.isPartnerMode === isPartner && prev.isCalculatorMode === isCalc) {
                    return prev;
                }
                return {
                    ...prev,
                    utm_source,
                    utm_medium,
                    utm_campaign,
                    isPartnerMode: isPartner,
                    isCalculatorMode: isCalc
                };
            });
        }
    }, []);

    // --- GESTION LANGUE ---
    const [lang, setLang] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('lang') === 'en' ? 'en' : 'fr';
        }
        return 'fr';
    });

    const t = (key, variables = {}) => {
        let text = locales[key]?.[lang] || locales[key]?.['fr'] || key;
        Object.entries(variables).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, v);
        });
        return text;
    };

    // --- ÉTATS ---
    const [quoteId, setQuoteId] = useState(() => nanoid(10));
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Autres états (Liens, etc.)
    const [finalPublicLink, setFinalPublicLink] = useState(null);
    const [axonautProspectLink, setAxonautProspectLink] = useState(null);
    const [axonautQuoteId, setAxonautQuoteId] = useState(null);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // État initial du formulaire (Constante)
    const initialFormState = {
        eventType: '',
        eventDate: '',
        eventDuration: 1,
        newDeliveryAddressName: '',
        deliveryFullAddress: '',
        deliveryLat: null,
        deliveryLng: null,
        deliveryStreet: '',
        deliveryZipCode: '',
        deliveryCity: '',
        model: '',
        proAnimationHours: 'none',
        proFondIA: false,
        proRGPD: false,
        delivery: true,
        proImpressions: 1,
        templateTool: false,
        optionSpeaker360: false,
        fullName: '',
        email: '',
        phone: '',
        isPro: false,
        companyName: '',
        wantsCallback: true,
        billingFullAddress: '',
        billingStreet: '',
        billingZipCode: '',
        billingCity: '',
        billingSameAsEvent: true,
        saveNewBillingAddress: false,
        saveNewDeliveryAddress: true,
        isPartnerMode: false,
        isCalculatorMode: false,
        utm_source: '',
        utm_medium: '',
        utm_campaign: ''
    };

    // --- 1. ÉTATS INTELLIGENTS (AVEC LOCALSTORAGE) ---
    // A. Étape (Persistance Session)

    const [currentStep, setCurrentStep] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedStep = sessionStorage.getItem('pbp_session_step');
            if (savedStep) return parseInt(savedStep, 10);

            // Si pas de session, on vérifie l'URL pour démarrer à l'étape 0 si besoin
            const path = window.location.pathname;
            if (path.includes('/partenaires') || path.includes('/calculette')) {
                return 0;
            }
        }
        return 1;
    });

    // 1. Définir une fonction pour extraire les UTM instantanément
    const getUrlParams = () => {
        if (typeof window === 'undefined') return {};
        const params = new URLSearchParams(window.location.search);
        return {
            utm_source: params.get('utm_source') || '',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || ''
        };
    };

    const urlParams = getUrlParams(); // Lecture immédiate

    // B. Données (Persistance Session)
    const [formData, setFormData] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedData = sessionStorage.getItem('pbp_session_form_data');
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    return { ...initialFormState, ...JSON.parse(savedData) };
                } catch (e) {
                    console.error("Erreur lecture sauvegarde session", e);
                }
            }
        }
        return { ...initialFormState, ...urlParams };
    });

    // --- 2. SAUVEGARDE AUTOMATIQUE (SESSION) ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('pbp_session_step', currentStep.toString());
            sessionStorage.setItem('pbp_session_form_data', JSON.stringify(formData));
        }
    }, [currentStep, formData]);


    // --- LOGIQUE MÉTIER (Reste inchangé) ---
    const isPartnerClient = useMemo(() => {
        if (!formData.companyId) return false;
        return Object.keys(COMPANY_SPECIFIC_PRICING).includes(formData.companyId.toString());
    }, [formData.companyId]);

    // --- CALCUL DE PRIX COMPLET ---
    const calculatePrice = useMemo(() => {

        // 1. PRIX EN HT OU EN TTC
        const displayTTC = !formData.isPro;
        const priceTransformer = (priceHT) => (displayTTC ? (priceHT * TVA_RATE) : priceHT);
        const suffix = displayTTC ? '€ TTC' : '€ HT';

        // 2. Récupération des deals du partenaire (s'il y en a)
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

        // 4. Définition des variables (avec override automatique)
        const priceHT_num = getEffectivePrice('numerique', PRICING_STRATEGY['numerique'].priceHT);
        const priceHT_150 = getEffectivePrice('150', PRICING_STRATEGY['150'].priceHT);
        const priceHT_300 = getEffectivePrice('300', PRICING_STRATEGY['300'].priceHT);
        const priceHT_pro = getEffectivePrice('illimite', PRICING_STRATEGY['illimite'].priceHT);
        const priceHT_sign = getEffectivePrice('Signature', PRICING_STRATEGY['Signature'].priceHT);
        const priceHT_360 = getEffectivePrice('360', PRICING_STRATEGY['360'].priceHT);
        const priceHT_music360 = getEffectivePrice('360', PRICING_STRATEGY['360'].speaker);
        let price_template = getEffectivePrice('template', TEMPLATE_TOOL_PRO_PRICE_HT);


        // COÛT DE BASE
        let distanceKm = (formData.deliveryLat && formData.deliveryLng)
            ? calculateHaversineDistance(formData.deliveryLat, formData.deliveryLng)
            : 0;

        let supplementKm = distanceKm > 15 ? Math.round(distanceKm - 15) * 4 * 0.45 : 0;

        // 🛡️ GROS TEST EN UNE LIGNE : Si pas de modèle, on renvoie l'objet par défaut pour ne pas planter l'UI
        if (!formData.model) return {
            totalHT: 0, details: [], displayTTC: displayTTC, priceSuffix: displayTTC ? 'TTC' : 'HT', axonautData: {},
            unitaryPrices: {
                'numerique': priceHT_num,
                '150': priceHT_150,
                '300': priceHT_300,
                'illimite': priceHT_pro,
                'Signature': priceHT_sign,
                '360': priceHT_360,
                // Utilisation dynamique des valeurs de constants.js
                'deliv_numerique': PRICING_STRATEGY['numerique'].delivery + supplementKm,
                'deliv_150': PRICING_STRATEGY['150'].delivery + supplementKm,
                'deliv_300': PRICING_STRATEGY['300'].delivery + supplementKm,
                'deliv_illimite': PRICING_STRATEGY['illimite'].delivery + supplementKm,
                'deliv_Signature': PRICING_STRATEGY['Signature'].delivery + supplementKm,
                'deliv_360': PRICING_STRATEGY['360'].delivery + supplementKm,
            },
        };


        // --- 0. DÉTECTION DU TYPE D'OFFRE ---
        const isSignature = formData.model === 'Signature';
        const is360 = formData.model === '360';

        let details = [];
        const NbJours = formData.eventDuration;
        const modelData = PRICING_STRATEGY[formData.model];
        const nomBorne = modelData.name;

        let base_price_prestation = modelData.priceHT * NbJours;
        let price_prestation = (modelData.priceHT - modelData.floorPriceHT) * 10 * (1 - Math.pow(0.9, NbJours)) + modelData.floorPriceHT * NbJours;
        let discount_prestation = base_price_prestation - price_prestation;

        let price_livraison = modelData.delivery;
        price_template = formData.isPro ? price_template : 0;

        let price_optionImpression = 0;
        let base_price_optionImpression = 0;
        let discount_optionImpression = 0;

        if (formData.proImpressions > 1) {
            base_price_optionImpression = OPTION_IMPRESSION_BASE_HT * (formData.proImpressions - 1) * NbJours;
            price_optionImpression =
                (OPTION_IMPRESSION_BASE_HT - OPTION_IMPRESSION_PLANCHER_HT) * 10 * (1 - Math.pow(0.9, NbJours))
                + OPTION_IMPRESSION_PLANCHER_HT * (formData.proImpressions - 1) * NbJours;
            discount_optionImpression = base_price_optionImpression - price_optionImpression;
        }

        let price_optionIA = formData.proFondIA ? OPTION_FONDIA_HT : 0;
        let price_optionRGPD = formData.proRGPD ? OPTION_RGPD_HT : 0;
        let price_optionSpeaker = (is360 && formData.optionSpeaker) ? modelData.speaker : 0;
        let heuresAnimPayantes = is360 ? parseInt(formData.proAnimationHours) - 3 : parseInt(formData.proAnimationHours);
        let price_optionAnim = modelData.animation_hour * heuresAnimPayantes;
        let totalHT = 0;

        {
            // PRESTATION PHOTOBOOTH OU VIDEOBOOTH
            details.push({
                label: t('price.detail.base', { name: nomBorne }),
                priceHT: price_prestation,
                daily: true,
                originalDisplayPrice: discount_prestation > 0.01 ? `${priceTransformer(base_price_prestation).toFixed(0)}${suffix}` : null,
                displayPrice: `${priceTransformer(price_prestation).toFixed(0)}${suffix}`
            });
            totalHT += price_prestation;



            // TEMPLATETOOL
            if (formData.templateTool) {

                let templateDisplay = (price_template > 0)
                    ? `${priceTransformer(price_template).toFixed(0)}${suffix}`
                    : t('common.included');

                details.push({
                    label: t('price.detail.template'),
                    priceHT: price_template,
                    daily: false,
                    displayPrice: templateDisplay
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
                    displayPrice: `+${priceTransformer(price_livraison).toFixed(0)}${suffix}`
                });
                totalHT += price_livraison;

                // SUPPLEMENT KILOMETRIQUE
                if (supplementKm > 0) {
                    supplementKm;
                    details.push({
                        label: t('price.detail.km_extra', { km: Math.round(distanceKm) }),
                        priceHT: supplementKm,
                        daily: false,
                        displayPrice: `+${priceTransformer(supplementKm).toFixed(0)}${suffix}`
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
            if (formData.proImpressions > 1) {
                details.push({
                    label: t('price.detail.prints', { qty: NbJours * (formData.proImpressions - 1) }),
                    priceHT: price_optionImpression,
                    daily: true,
                    originalDisplayPrice: discount_optionImpression > 0.01 ? `+${priceTransformer(base_price_optionImpression).toFixed(0)}${suffix}` : null,
                    displayPrice: `+${priceTransformer(price_optionImpression).toFixed(0)}${suffix}`
                });
                totalHT += price_optionImpression;

            }

            // OPTION ANIM
            if (heuresAnimPayantes > 0) {
                details.push({
                    label: `${t('step2.option.anim.label')} ${heuresAnimPayantes}h`, // <-- Était codé en dur
                    priceHT: price_optionAnim,
                    daily: false,
                    displayPrice: `+${priceTransformer(price_optionAnim).toFixed(0)}${suffix}`
                });
                totalHT += price_optionAnim;

            }

            // OPTION FOND IA
            if (formData.proFondIA) {
                details.push({
                    label: t('price.detail.ai_bg'),
                    priceHT: price_optionIA,
                    daily: false,
                    displayPrice: `+${priceTransformer(price_optionIA).toFixed(0)}${suffix}`
                });
                totalHT += price_optionIA;
            }

            // OPTION RGPD
            if (formData.proRGPD) {
                details.push({
                    label: t('price.detail.rgpd'),
                    priceHT: price_optionRGPD,
                    daily: false,
                    displayPrice: `+${priceTransformer(price_optionRGPD).toFixed(0)}${suffix}`
                });
                totalHT += price_optionRGPD;
            }

            // NOUVEAU : OPTION ENCEINTE
            if (is360 && formData.optionSpeaker) {
                details.push({
                    label: t('price.detail.speaker'),
                    priceHT: price_optionSpeaker,
                    daily: false,
                    displayPrice: `+${priceTransformer(price_optionSpeaker).toFixed(0)}${suffix}`
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
            nombreTirages: formData.proImpressions,
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
            // Le détail complet pour l'UI (Step 3)
            unitaryPrices: {
                'numerique': priceHT_num,
                '150': priceHT_150,
                '300': priceHT_300,
                'illimite': priceHT_pro,
                'Signature': priceHT_sign,
                '360': priceHT_360,
                // Utilisation dynamique des valeurs de constants.js
                'deliv_numerique': PRICING_STRATEGY['numerique'].delivery,
                'deliv_150': PRICING_STRATEGY['150'].delivery,
                'deliv_300': PRICING_STRATEGY['300'].delivery,
                'deliv_illimite': PRICING_STRATEGY['illimite'].delivery,
                'deliv_Signature': PRICING_STRATEGY['Signature'].delivery,
                'deliv_360': PRICING_STRATEGY['360'].delivery,
                //options
                template: price_template,
                livraison: price_livraison,
                impressionSup: OPTION_IMPRESSION_BASE_HT,
                ia: OPTION_FONDIA_HT,
                rgpd: OPTION_RGPD_HT,
                speaker: priceHT_music360,
            },
        };
    }, [formData]);


    const isStepValid = () => {
        switch (currentStep) {
            case 0: // AUTHENTIFICATION (Modes Spéciaux)
                return !!formData.companyId; // Valide si on a trouvé un client
            case 1: // ÉVÉNEMENT (Normal ou Spécial)
                return (
                    formData.eventDate !== '' &&
                    formData.eventDate > new Date().toISOString().split('T')[0] &&
                    formData.newDeliveryAddressName !== '' &&
                    formData.deliveryFullAddress !== '' &&
                    formData.deliveryLat !== null &&
                    (!formData.isPartnerMode && !formData.isCalculatorMode ? formData.eventType !== '' : true)
                );
            case 2: // MODÈLE
                return formData.model !== '';
            case 3: // CONTACT (Mode Normal uniquement)
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const basicInfo = formData.fullName && emailRegex.test(formData.email) && formData.phone.length >= 9;
                if (formData.isPro) {
                    return basicInfo && formData.companyName && (formData.billingSameAsEvent || formData.billingFullAddress);
                }
                return basicInfo;
            default:
                return true;
        }
    };

    // 📍 ENVOI N8N
    const triggerWebhook = (step, pricing, quoteData = null, isCalculatorMode = false) => {
        if (isCalculatorMode) return;

        const formattedDate = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }).replace(',', '');
        const toExcelBool = (val) => val ? "TRUE" : "FALSE";

        // --- PAYLOAD DE BASE ---
        const payload = {
            quote_id: quoteId,
            version: "tunnelOptim_noprice",
            step: step,
            [`step${step}_date`]: formattedDate,
            event_type: formData.eventType,
            delivery_name: formData.newDeliveryAddressName || "",
            delivery_address: formData.deliveryFullAddress,
            event_date: formData.eventDate,
            duration: formData.eventDuration,
            utm_source: formData.utm_source,
            utm_medium: formData.utm_medium,
            utm_campaign: formData.utm_campaign
        };

        // Données de configuration (Étape 2)
        if (step >= 2) {
            payload.model = formData.model; // Colonne 'model'

            // 3. CAS 360 (Vidéo)
            payload.animation_hours = formData.proAnimationHours;
            payload.delivery = toExcelBool(formData.delivery);

            if (formData.model === '360') {
                // 3h incluses par défaut si rien n'est sélectionné ou 'none'
                payload.option_music = toExcelBool(formData.optionSpeaker);
            } else {
                payload.template = toExcelBool(formData.templateTool);
                payload.prints = formData.proImpressions;

                if (formData.model === 'Signature') {
                    payload.option_IA = toExcelBool(formData.proFondIA);
                    payload.option_RGPD = toExcelBool(formData.proRGPD);
                }

                if (formData.model === 'illimite') {
                    payload.option_IA = toExcelBool(formData.proFondIA);
                    payload.option_RGPD = toExcelBool(formData.proRGPD);
                }
            }

            if (pricing) {
                payload.total_ht = pricing.totalHT;
                payload.total_ttc = pricing.totalHT * 1.2;
            }
        }

        // Données finales (Étape 3)
        if (step === 3) {

            payload.billing_address = formData.billingSameAsEvent
                ? formData.deliveryFullAddress
                : (formData.billingFullAddress || formData.deliveryFullAddress);

            payload.email = formData.email;
            payload.phone = `'${formData.phone}`;
            payload.wants_callback = toExcelBool(formData.wantsCallback);
            const companyId = quoteData?.company_id || formData.companyId;
            const companyUrl = `https://axonaut.com/business/company/show/${companyId}`;
            // Restauration des Hyperliens pour Excel/Google Sheets
            if (formData.isPro) {
                payload.client = `=HYPERLINK("${companyUrl}";"${formData.companyName}")`;
            } else {
                payload.client = `=HYPERLINK("${companyUrl}";"${formData.fullName}")`;
            }

            payload.contact = formData.fullName;


            if (quoteData.customer_portal_url || quoteData.public_path) {
                const link = quoteData.customer_portal_url || quoteData.public_path;
                payload.devis = `=HYPERLINK("${link}";"${quoteData.number}")`;
            }
        }

        AxonautService.send_n8n_Webhook(payload); //
    };

    const handleNext = async (isCalculatorMode = false, showMessage) => {
        if (!isStepValid()) return;

        if (currentStep === 1 && ENABLE_WEBHOOK_STEP_1) {
            triggerWebhook(1, calculatePrice, null, isCalculatorMode);
        }

        if (currentStep === 2 && ENABLE_WEBHOOK_STEP_2) {
            triggerWebhook(2, calculatePrice, null, isCalculatorMode);
        }

        // --- LOGIQUE MODES SPÉCIAUX (Depuis l'étape 2 : Choix Borne) ---
        if ((isCalculatorMode || formData.isPartnerMode) && currentStep === 2) {
            if (isCalculatorMode) {
                // Calculette : On génère le devis direct et on va au succès (Step 5)
                await handleSubmit(showMessage, true);
                setCurrentStep(5);
            } else {
                // Partenaire : On va au récap (Step 4)
                setCurrentStep(4);
            }
            return;
        }

        // --- LOGIQUE NORMALE (Contact -> Récap) ---
        if (currentStep === 3) {
            await handleSubmit(showMessage, false);
            setCurrentStep(4);
        }
        // --- RÉCAP -> SUCCÈS ---
        else if (currentStep === 4) {
            setCurrentStep(5);
        }
        // --- NAVIGATION STANDARD ---
        else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        const minStep = (formData.isPartnerMode || formData.isCalculatorMode) ? 0 : 1;
        if (currentStep > minStep) {
            setCurrentStep(currentStep - 1);
        }
    };

    const resetForm = () => {
        // On nettoie le localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('pbp_step');
            localStorage.removeItem('pbp_form_data');
        }
        setFormData(initialFormState);
        setCurrentStep(1);
        setIsSubmitting(false);
        setQuoteId(nanoid(10));
        setAxonautProspectLink(null);
        setAxonautQuoteId(null);
        setIsSendingEmail(false);
        setEmailSent(false);
    };

    const sendEmailToClient = async (showMessage) => {
        if (!axonautQuoteId || !finalPublicLink) return;

        setIsSendingEmail(true);
        try {
            await AxonautService.createAxonautEvent(
                axonautQuoteId,
                formData.companyId,
                formData.email,
                formData.email,
                finalPublicLink,
                lang,
                formData.acomptePct
            );
            showMessage(t('form.success.email_sent'));

            // 2. ON VALIDE L'ACTION
            setEmailSent(true);

        } catch (error) {
            console.error("Erreur envoi email:", error);
            showMessage(t('form.error.email_send'));
        } finally {
            setIsSendingEmail(false);
        }
    };

    const returnToEdit = () => {
        setFinalPublicLink(null);
        setEmailSent(false);
        setIsSubmitting(false);
    };

    // GESTION DE LA SOUMISSION 
    const handleSubmit = async (showMessage, isCalculatorMode = false) => {
        // Garde cette sécurité
        if (isSubmitting) return;

        setIsSubmitting(true);
        const pricing = calculatePrice;

        try {
            let companyId = formData.companyId;
            let billingAddressId = formData.billingAddressId;

            if (formData.billingSameAsEvent) {
                formData.billingStreet = formData.deliveryStreet;
                formData.billingZipCode = formData.deliveryZipCode;
                formData.billingCity = formData.deliveryCity;
                formData.billingFullAddress = formData.deliveryFullAddress;
            }

            // 1. GESTION DU TIERS
            if (!companyId) {
                console.log("Création du tiers...");
                const { companyId: newId } = await AxonautService.createAxonautThirdParty(formData, lang);
                companyId = newId;
            }

            setAxonautProspectLink(`https://axonaut.com/business/company/show/${companyId}`);

            // 2. LOGIQUE D'UPDATE 
            try {
                await AxonautService.createAxonautEmployee(companyId, formData);
            } catch (err) {
                console.warn("Contact déjà existant.");
            }

            const addressContactName = formData.isPro ? formData.companyName : formData.fullName;

            if (formData.saveNewBillingAddress || formData.billingSameAsEvent) {
                const newBillAddr = await AxonautService.createAxonautAddress(companyId, {
                    name: formData.newBillingAddressName || "Facturation",
                    contactName: addressContactName,
                    street: formData.billingStreet,
                    zip: formData.billingZipCode,
                    city: formData.billingCity
                }, 'billing');
                if (newBillAddr?.id) billingAddressId = newBillAddr.id;
            }

            if (formData.saveNewDeliveryAddress) {
                await AxonautService.createAxonautAddress(companyId, {
                    name: formData.newDeliveryAddressName || "Lieu Événement",
                    fullAddress: formData.deliveryFullAddress,
                    street: formData.deliveryStreet,
                    zip: formData.deliveryZipCode,
                    city: formData.deliveryCity
                }, 'delivery');
            }

            // 🔍 PARTENAIRE VIP
            const isVipPartner = Object.keys(COMPANY_SPECIFIC_PRICING).includes(companyId?.toString());

            // --- NOUVEAU : CALCUL DE L'ACOMPTE DYNAMIQUE ---
            const eventDateObj = new Date(formData.eventDate);
            const today = new Date();
            // Calcul de la différence en jours
            const diffTime = eventDateObj - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let finalAcomptePct = AXONAUT_FIXED_DEFAULTS.acomptePct; // Par défaut : 15%

            if (diffDays < 7) {
                finalAcomptePct = 1; // URGENCE (< 7 jours) : 100%
            } else if (isVipPartner && formData.isPartnerMode) { // On utilise formData
                finalAcomptePct = 0; // PARTENAIRE VIP : 0%
            } else {
                finalAcomptePct = AXONAUT_FIXED_DEFAULTS.acomptePct; // STANDARD : 15%
            }

            // On sauvegarde ce pourcentage dans formData pour l'utiliser à l'étape 4
            setFormData(prev => ({ ...prev, acomptePct: finalAcomptePct }));
            // ------------------------------------------------

            // 3. CRÉATION DU DEVIS
            const inputsForAxonaut = {
                ...pricing.axonautData,
                ...AXONAUT_FIXED_DEFAULTS,
                dateEvenement: formData.eventDate,
                adresseLivraisonComplete: formData.newDeliveryAddressName
                    ? `${formData.newDeliveryAddressName} - ${formData.deliveryFullAddress}`
                    : formData.deliveryFullAddress,
                nombreJours: formData.eventDuration,
                templateInclus: formData.templateTool,
                livraisonIncluse: formData.delivery !== false,

                // On utilise la variable calculée
                acomptePct: finalAcomptePct
            };

            if (billingAddressId) {
                inputsForAxonaut.company_address_id = billingAddressId;
            }

            const axonautBody = AxonautService.generateAxonautQuotationBody(inputsForAxonaut, companyId, lang);
            const quoteResponse = await AxonautService.sendAxonautQuotation(axonautBody);

            setAxonautQuoteId(quoteResponse.id);

            setFormData(prev => ({ ...prev, axonautQuoteNumber: quoteResponse.number }));

            pushToDataLayer({
                'event': 'quote_validation',
                'quote_id': quoteId,
                'axonaut_quote_id': quoteResponse.id,
                'amount': pricing.totalHT,
                'model': formData.model
            });

            if (ENABLE_WEBHOOK_STEP_3) {
                triggerWebhook(3, pricing, quoteResponse, isCalculatorMode);
            }

            // 4. FINALISATION
            const signLink = quoteResponse.customer_portal_url;
            setFinalPublicLink(signLink);

            // --- AJOUT ICI ---
            // On sauvegarde l'URL dans formData pour pouvoir l'utiliser à l'étape 4
            setFormData(prev => ({ ...prev, quotationUrl: signLink }));
            // -----------------

            if (!isCalculatorMode) {
                await AxonautService.createAxonautEvent(
                    quoteResponse.id,
                    companyId,
                    formData.email,
                    formData.email,
                    signLink,
                    lang,
                    finalAcomptePct
                );
            } else {
                console.log("Mode Calculette : Devis créé sans email.");
            }

        } catch (error) {
            console.error("Erreur Submit:", error);
            showMessage(`Erreur: ${error.message}`);
            // Important : On relance l'erreur pour que handleNext sache qu'il y a eu un problème
            throw error;
        } finally {
            // On s'assure que le spinner s'arrête dans tous les cas
            setIsSubmitting(false);
        }
    };

    return {
        handleSubmit,
        formData,
        setFormData,
        currentStep,
        setCurrentStep,
        calculatePrice,
        isStepValid,
        handleNext,
        handlePrev,
        totalSteps: 3,
        isSubmitting,
        resetForm,
        returnToEdit,
        finalPublicLink,
        axonautProspectLink,
        emailSent,
        sendEmailToClient,
        isSendingEmail,
        lang,
        setLang,
        t,
        isPartnerClient,
        triggerWebhook
    };
};