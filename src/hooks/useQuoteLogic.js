// src/hooks/useQuoteLogic.js

import { useState, useMemo } from 'react';
import { nanoid } from 'nanoid';
import * as AxonautService from '../services/axonautService';
import { pushToDataLayer } from '../services/gtmService';

import {
    TVA_RATE,
    PARIS_LAT, PARIS_LNG,
    AXONAUT_FIXED_DEFAULTS,
    PRICING_STRATEGY, COMPANY_SPECIFIC_PRICING,
    OPTION_IMPRESSION_BASE_HT,
    OPTION_FONDIA_HT,
    OPTION_RGPD_HT,
    TEMPLATE_TOOL_PRO_PRICE_HT,
    ENABLE_ZAPIER_STEP_1, ENABLE_ZAPIER_STEP_2, ENABLE_ZAPIER_STEP_3, ENABLE_ZAPIER_STEP_4
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
    // 1. DÉTECTION DE LA LANGUE 
    const lang = useMemo(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('lang') === 'en' ? 'en' : 'fr';
        }
        return 'fr';
    }, []);
    // États et Refs
    const [quoteId, setQuoteId] = useState(() => nanoid(10));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [finalPublicLink, setFinalPublicLink] = useState(null);

    // État initial du formulaire
    const initialFormState = {
        fullName: '',
        email: '',
        phone: '',
        isPro: false,
        companyName: '',

        // Facturation
        billingFullAddress: '',
        billingLat: null,
        billingLng: null,
        billingZipCode: '',
        billingCity: '',

        // Livraison / Événement
        deliveryFullAddress: '',
        deliveryLat: null,
        deliveryLng: null,
        deliveryZipCode: '',
        deliveryCity: '',
        deliverySameAsBilling: true,
        eventDate: '',
        eventDuration: 1,

        // Le modèle pilote tout désormais
        model: '',
        proAnimationHours: 'none',
        proFondIA: false,
        proRGPD: false,
        delivery: true,
        proImpressions: 1,
        templateTool: false,
        optionSpeaker360: false,
    };

    const [formData, setFormData] = useState(initialFormState);

    // --- CALCUL DE PRIX COMPLET ---
    const calculatePrice = useMemo(() => {

        // 1. PRIX EN HT OU EN TTC
        const displayTTC = !formData.isPro;
        const priceTransformer = (priceHT) => (displayTTC ? (priceHT * TVA_RATE) : priceHT);
        const suffix = displayTTC ? '€ TTC' : '€ HT';

        // 2. Récupération des deals du partenaire (s'il y en a)
        const partnerId = formData.companyId?.toString();
        const partnerDeals = COMPANY_SPECIFIC_PRICING[partnerId] || {};

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
            },
        };


        // --- 0. DÉTECTION DU TYPE D'OFFRE ---
        const isSignature = formData.model === 'Signature';
        const is360 = formData.model === '360';

        // Définition des variables de prix (Négocié ou Défaut)
        //TODO: à refaire

        // 2. Distance
        const distanceKm = (formData.deliveryLat && formData.deliveryLng)
            ? calculateHaversineDistance(formData.deliveryLat, formData.deliveryLng)
            : 0;
        const supplementKm = distanceKm > 15 ? Math.round(distanceKm - 15) * 4 * 0.45 : 0;

        let details = [];
        const NbJours = formData.eventDuration;
        const modelData = PRICING_STRATEGY[formData.model];
        const nomBorne = modelData.name;
        let price_prestation = (modelData.priceHT - modelData.floorPriceHT) * 10 * (1 - Math.pow(0.9, NbJours)) + modelData.floorPriceHT * NbJours;
        let price_livraison = modelData.delivery;
        price_template = formData.isPro ? price_template : 0;
        let price_optionImpression = OPTION_IMPRESSION_BASE_HT * (formData.proImpressions - 1) * NbJours;
        let price_optionIA = formData.proFondIA ? OPTION_FONDIA_HT : 0;
        let price_optionRGPD = formData.proRGPD ? OPTION_RGPD_HT : 0;
        let price_optionSpeaker = (is360 && formData.optionSpeaker) ? modelData.speaker : 0;
        let heuresAnimPayantes = is360 ? parseInt(formData.proAnimationHours) - 3 : parseInt(formData.proAnimationHours);
        let price_optionAnim = modelData.animation_hour * heuresAnimPayantes;
        let totalHT = 0;


        {
            // PRESTATION PHOTOBOOTH OU VIDEOBOOTH
            details.push({
                label: 'Prestation: ' + nomBorne,
                priceHT: price_prestation,
                daily: true,
                displayPrice: `${priceTransformer(price_prestation).toFixed(0)}${suffix}`
            });
            totalHT += price_prestation;

            // TEMPLATETOOL
            if (formData.templateTool) {

                let templateDisplay = (price_template > 0)
                    ? `${priceTransformer(price_template).toFixed(0)}${suffix}`
                    : 'Offert';

                details.push({
                    label: 'Outil Template Professionnel',
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
                    label: 'Livraison, installation et reprise',
                    priceHT: price_livraison,
                    daily: false,
                    displayPrice: `+${priceTransformer(price_livraison).toFixed(0)}${suffix}`
                });
                totalHT += price_livraison;
            } else {
                details.push({
                    label: 'Retrait (Arcueil)',
                    priceHT: 0,
                    daily: false,
                    displayPrice: 'Gratuit'
                });
            }

            // OPTION IMPRESSION 
            if (formData.proImpressions > 1) {
                details.push({
                    label: `${NbJours * (formData.proImpressions - 1)}x supplément d'impression`,
                    priceHT: price_optionImpression,
                    daily: true,
                    displayPrice: `+${priceTransformer(price_optionImpression).toFixed(0)}${suffix}`
                });
                totalHT += price_optionImpression;

            }

            // OPTION ANIM
            if (heuresAnimPayantes > 0) {
                details.push({
                    label: `Animation ${heuresAnimPayantes}h`,
                    priceHT: price_optionAnim,
                    daily: false,
                    displayPrice: `+${priceTransformer(price_optionAnim).toFixed(0)}${suffix}`
                });
                totalHT += price_optionAnim;

            }

            // OPTION FOND IA
            if (formData.proFondIA) {
                details.push({
                    label: 'Fond IA (personnalisé)',
                    priceHT: price_optionIA,
                    daily: false,
                    displayPrice: `+${priceTransformer(price_optionIA).toFixed(0)}${suffix}`
                });
                totalHT += price_optionIA;
            }

            // OPTION RGPD
            if (formData.proRGPD) {
                details.push({
                    label: 'Conformité RGPD',
                    priceHT: price_optionRGPD,
                    daily: false,
                    displayPrice: `+${priceTransformer(price_optionRGPD).toFixed(0)}${suffix}`
                });
                totalHT += price_optionRGPD;
            }

            // SUPPLEMENT KILOMETRIQUE
            if (supplementKm > 0) {
                supplementKm;
                details.push({
                    label: `Supplément Kilométrique (${Math.round(distanceKm)} km)`,
                    priceHT: supplementKm,
                    daily: false,
                    displayPrice: `+${priceTransformer(supplementKm).toFixed(0)}${suffix}`
                });
                totalHT += supplementKm;
            }

            // NOUVEAU : OPTION ENCEINTE
            if (is360 && formData.optionSpeaker) {
                details.push({
                    label: 'Enceinte & Musique d\'ambiance',
                    priceHT: price_optionSpeaker,
                    daily: false,
                    displayPrice: `+${priceTransformer(price_optionSpeaker).toFixed(0)}${suffix}`
                });
                totalHT += price_optionSpeaker;
            }
        }

        const axonautData = {
            // base material
            nomBorne,
            nombreMachine: 1,
            nombreJours: NbJours,
            prixMateriel: price_prestation,

            // livraison
            livraisonIncluse: formData.delivery,
            nombreTirages: formData.proImpressions,
            prixLivraison: price_livraison,
            supplementKilometrique: supplementKm,
            supplementLivraisonDifficile: 0,

            // template
            prixTemplate: price_template,

            // impression supp
            nombreTirages: formData.proImpressions,
            supplementImpression: price_optionImpression,

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
            axonautData, quoteId,
            // Le détail complet pour l'UI (Step 3)
            unitaryPrices: {
                'numerique': priceHT_num,
                '150': priceHT_150,
                '300': priceHT_300,
                'illimite': priceHT_pro,
                'Signature': priceHT_sign,
                '360': priceHT_360,
                template: price_template,
                livraison: price_livraison,
                //options
                impressionSup: OPTION_IMPRESSION_BASE_HT,
                ia: OPTION_FONDIA_HT,
                rgpd: OPTION_RGPD_HT,
                speaker: priceHT_music360,
            },
        };
    }, [formData]);


    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                // Champs obligatoires pour tous (Particuliers et Pros)
                if (!formData.fullName || !formData.email || !formData.phone || !formData.deliveryFullAddress) return false;

                // Validation Email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) return false;

                // Validation Téléphone
                if (!formData.phone || formData.phone.trim().length < 9) return false;

                // Validation spécifique PRO
                if (formData.isPro) {
                    // Nom de société obligatoire
                    if (!formData.companyName) return false;

                    // Si facturation différente de livraison, l'adresse de facturation est requise
                    if (!formData.deliverySameAsBilling && !formData.billingFullAddress) return false;
                }
                return true;

            case 2:
                // Seuls date et durée comptent ici
                return (formData.eventDate && formData.eventDuration >= 1);

            case 3:
                // Validation basée uniquement sur la présence d'un model
                if (!formData.model) return false;
                return true;

            default:
                return true;
        }
    };

    // 📍 ENVOI ZAPIER
    const triggerWebhook = (step, finalSubmit, pricing, axonautNumber = null) => {
        const toExcelBool = (val) => val ? "TRUE" : "FALSE";
        const isSignature = formData.model === 'Signature';
        const is360 = formData.model === '360';
        const isEco = !isSignature && !is360 && formData.model !== '';
        // Pour Zapier, illimite reste 'eco' ou une nouvelle catégorie ? 
        // Gardons la logique précédente pour ne pas casser le Zap

        const payload = {
            quote_id: quoteId,
            devis: axonautNumber,
            step_completed: step,
            timestamp: new Date().toISOString(),
        };

        // Étape 1
        payload.fullName = formData.fullName;
        payload.email = formData.email;
        payload.phone = formData.phone;
        payload.isPro = toExcelBool(formData.isPro);
        if (formData.isPro) {
            payload.companyName = formData.companyName;
            payload.billingFullAddress = formData.billingFullAddress;
        }

        // Étape 2
        if (step >= 2 || finalSubmit) {
            payload.deliveryFullAddress = formData.deliveryFullAddress;
            payload.eventDate = formData.eventDate;
            payload.eventDuration = formData.eventDuration;
            payload.deliveryLat = formData.deliveryLat;
            payload.deliveryLng = formData.deliveryLng;
        }

        // Étape 3
        if (step >= 3 || finalSubmit) {
            payload.model = formData.model;

            if (isEco) {
                payload.delivery = toExcelBool(formData.delivery);
                payload.templateTool = toExcelBool(formData.templateTool);

                // NOUVEAU : Envoi des options si Starbooth
                if (formData.model === 'illimite') {
                    payload.proAnimationHours = formData.proAnimationHours;
                    payload.proFondIA = toExcelBool(formData.proFondIA);
                    payload.proRGPD = toExcelBool(formData.proRGPD);
                }
            }
            else if (isSignature) {
                payload.proAnimationHours = formData.proAnimationHours;
                payload.proFondIA = toExcelBool(formData.proFondIA);
                payload.proRGPD = toExcelBool(formData.proRGPD);
                payload.delivery = toExcelBool(formData.delivery);
                payload.proImpressions = formData.proImpressions;
                payload.templateTool = toExcelBool(formData.templateTool);
            }
            else if (is360) {
                payload.needType = '360';
                payload.proAnimationHours = (formData.proAnimationHours === 'none' || !formData.proAnimationHours) ? 3 : formData.proAnimationHours;
                payload.optionSpeaker = toExcelBool(formData.optionSpeaker);
            }

            if (pricing) {
                payload.total_ht = pricing.totalHT.toFixed(2);
            }
        }

        AxonautService.sendZapierWebhook(payload);
    };

    const handleNext = () => {

        pushToDataLayer({
            'event': 'form_step_next',
            'currentStep': currentStep
        });

        if (isStepValid() && currentStep < 4) {
            if (currentStep === 1 && ENABLE_ZAPIER_STEP_1) triggerWebhook(1, false, calculatePrice);
            if (currentStep === 2 && ENABLE_ZAPIER_STEP_2) triggerWebhook(2, false, calculatePrice);
            if (currentStep === 3 && ENABLE_ZAPIER_STEP_3) triggerWebhook(3, false, calculatePrice);
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setCurrentStep(1);
        setIsSubmitted(false);
        setIsSubmitting(false);
        setQuoteId(nanoid(10));
    };

    // GESTION DE LA SOUMISSION 
    const handleSubmit = async (showMessage, isCalculatorMode = false) => {
        if (isSubmitting || isSubmitted) return;

        setIsSubmitting(true);
        const pricing = calculatePrice;

        try {
            let companyId = formData.companyId;
            let billingAddressId = formData.billingAddressId;

            // 1. GESTION DU TIERS
            if (!companyId) {
                console.log("Création du tiers...");
                const { companyId: newId } = await AxonautService.createAxonautThirdParty(formData, lang);
                companyId = newId;
            }

            // 2. LOGIQUE D'UPDATE 
            try {
                await AxonautService.createAxonautEmployee(companyId, formData);
            } catch (err) {
                console.warn("Contact déjà existant.");
            }

            if (formData.saveNewBillingAddress) {
                const newBillAddr = await AxonautService.createAxonautAddress(companyId, {
                    name: formData.newBillingAddressName || "Facturation",
                    fullAddress: formData.billingFullAddress,
                    zip: formData.billingZipCode,
                    city: formData.billingCity
                }, 'billing');
                if (newBillAddr?.id) billingAddressId = newBillAddr.id;
            }

            if (formData.saveNewDeliveryAddress) {
                await AxonautService.createAxonautAddress(companyId, {
                    name: formData.newDeliveryAddressName || "Lieu Événement",
                    fullAddress: formData.deliveryFullAddress,
                    zip: formData.deliveryZipCode,
                    city: formData.deliveryCity
                }, 'delivery');
            }

            // 🔍 PARTENAIRE VIP
            const isVipPartner = Object.keys(COMPANY_SPECIFIC_PRICING).includes(companyId?.toString());

            // 3. CRÉATION DU DEVIS
            const inputsForAxonaut = {
                ...pricing.axonautData,
                ...AXONAUT_FIXED_DEFAULTS,
                dateEvenement: formData.eventDate,
                adresseLivraisonComplete: formData.newDeliveryAddressName
                    ? `${formData.newDeliveryAddressName} - ${formData.deliveryFullAddress}`
                    : formData.deliveryFullAddress, nombreJours: formData.eventDuration,
                templateInclus: formData.templateTool,
                livraisonIncluse: formData.delivery !== false,
                acomptePct: isVipPartner ? 0 : 1
            };

            if (billingAddressId) {
                inputsForAxonaut.company_address_id = billingAddressId;
            }

            const axonautBody = AxonautService.generateAxonautQuotationBody(inputsForAxonaut, companyId, lang);
            const quoteResponse = await AxonautService.sendAxonautQuotation(axonautBody);

            if (ENABLE_ZAPIER_STEP_4) {
                triggerWebhook(4, true, pricing, quoteResponse.number);
            }

            // 4. FINALISATION
            const signLink = quoteResponse.customer_portal_url;
            setFinalPublicLink(signLink);

            if (!isCalculatorMode) {
                await AxonautService.createAxonautEvent(quoteResponse.id, companyId, formData.email, formData.email, signLink, lang);
            } else {
                console.log("Mode Calculette : Devis créé sans email.");
            }

            setIsSubmitted(true);

        } catch (error) {
            console.error("Erreur Submit:", error);
            showMessage(`Erreur: ${error.message}`);
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
        totalSteps: 4,
        isSubmitting,
        isSubmitted,
        resetForm,
        finalPublicLink,
        lang
    };
};