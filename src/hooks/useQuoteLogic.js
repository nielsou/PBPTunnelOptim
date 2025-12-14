// src/hooks/useQuoteLogic.js

import { useState, useMemo } from 'react';
import { nanoid } from 'nanoid';
import * as AxonautService from '../services/axonautService'; 
import { 
    TVA_RATE, PARIS_LAT, PARIS_LNG, AXONAUT_FIXED_DEFAULTS, 
    ECO_MODELS_PRICING, DELIVERY_BASE_ECO_HT, DELIVERY_BASE_ILLIMITE_HT, 
    SETUP_PRICE_HT, BASE_PRICE_PRO_HT, PLANCHER_PRICE_PRO_HT_USER_FIX,
    PRO_DELIVERY_BASE_HT, PRO_ANIMATION_HOUR_PRICE_HT, 
    PRO_IMPRESSION_BASE_HT, PRO_IMPRESSION_PLANCHER_HT, PRO_OPTION_FONDIA_HT, 
    PRO_OPTION_RGPD_HT, TEMPLATE_TOOL_PRO_PRICE_HT, P360_BASE_PRICE_HT, 
    P360_DELIVERY_PRICE_HT, P360_FLOOR_PRICE_HT 
} from '../constants'; 

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

export const useQuoteLogic = () => {
    const [quoteId, setQuoteId] = useState(() => nanoid(10));
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [currentStep, setCurrentStep] = useState(1);
    
    const initialFormState = {
        fullName: '', email: '', phone: '', isPro: false, companyName: '', billingFullAddress: '',
        deliveryFullAddress: '', deliveryLat: null, deliveryLng: null, eventDate: '', eventDuration: 1, needType: 'pro',
        ecoModel: '', ecoTransport: 'pickup', proAnimationHours: 'none', proFondIA: false, proRGPD: false, proDelivery: true, proImpressions: 1, templateTool: false,
    };

    const [formData, setFormData] = useState(initialFormState);
    
    const calculatePrice = useMemo(() => {
        const distanceKm = (formData.deliveryLat && formData.deliveryLng) 
            ? calculateHaversineDistance(PARIS_LAT, PARIS_LNG, formData.deliveryLat, formData.deliveryLng) 
            : 0;
        const supplementKm = distanceKm > 50 ? Math.round(distanceKm - 50) : 0;
        
        const displayTTC = !formData.isPro;
        const priceTransformer = (priceHT) => (displayTTC ? (priceHT * TVA_RATE) : priceHT);
        const suffix = displayTTC ? '€ TTC' : '€ HT';

        let dailyServicesHT = 0; 
        let oneTimeCostsHT = 0;   
        let details = [];
        let nomBorne = '';
        let baseDayPriceHT = 0; 
        let prixLivraisonHT = 0;
        let supplementImpressionHT = 0;
        let supplementAnimationHT = 0;
        let prixTemplateHT = 0;
        
        const duration = formData.eventDuration;
        const NbJours = duration;
        
        if (formData.needType === 'eco') {
            if (formData.ecoModel) {
                const model = ECO_MODELS_PRICING[formData.ecoModel];
                nomBorne = model.name;
                baseDayPriceHT += model.priceHT;
                dailyServicesHT += model.priceHT;
                
                const baseDeliveryPriceHT = formData.ecoModel === 'illimite' ? DELIVERY_BASE_ILLIMITE_HT : DELIVERY_BASE_ECO_HT;
                const setupPriceHT = SETUP_PRICE_HT; 

                if (formData.ecoTransport === 'delivery_nosetup') {
                    prixLivraisonHT = baseDeliveryPriceHT;
                    oneTimeCostsHT += prixLivraisonHT;
                } else if (formData.ecoTransport === 'delivery_withsetup') {
                    prixLivraisonHT = baseDeliveryPriceHT + setupPriceHT;
                    oneTimeCostsHT += prixLivraisonHT;
                }
                
                details.push({ label: model.name, priceHT: model.priceHT, daily: true, displayPrice: `${priceTransformer(model.priceHT).toFixed(0)}${suffix}` });
                
                if (prixLivraisonHT > 0) {
                     details.push({ label: formData.ecoTransport === 'delivery_withsetup' ? 'Livraison + Mise en service' : 'Livraison Standard', priceHT: prixLivraisonHT, daily: false, displayPrice: `${priceTransformer(prixLivraisonHT).toFixed(0)}${suffix}` });
                } else if (formData.ecoTransport === 'pickup') {
                    details.push({ label: 'Retrait (Arcueil)', priceHT: 0, daily: false, displayPrice: 'Gratuit' });
                }
            }
        } else if (formData.needType === 'pro') {
            nomBorne = 'Signature';
            baseDayPriceHT += BASE_PRICE_PRO_HT;
            dailyServicesHT += BASE_PRICE_PRO_HT;
            details.push({ label: 'Signature (base journalière)', priceHT: BASE_PRICE_PRO_HT, daily: true, displayPrice: `${priceTransformer(BASE_PRICE_PRO_HT).toFixed(0)}${suffix}` });

            const proDeliveryBasePriceHT = PRO_DELIVERY_BASE_HT; 
            const animationHours = parseInt(formData.proAnimationHours);
            const isShortAnimation = animationHours > 0 && animationHours <= 3;
            prixLivraisonHT = isShortAnimation ? proDeliveryBasePriceHT / 2 : proDeliveryBasePriceHT;
            oneTimeCostsHT += prixLivraisonHT;
            details.push({ label: 'Logistique/Installation par Technicien Certifié', priceHT: prixLivraisonHT, daily: false, displayPrice: `${priceTransformer(prixLivraisonHT).toFixed(0)}${suffix}` });

            if (formData.proAnimationHours !== 'none') {
                supplementAnimationHT = animationHours * PRO_ANIMATION_HOUR_PRICE_HT; 
                dailyServicesHT += supplementAnimationHT;
                const animationDescription = isShortAnimation ? `Animation ${animationHours}h (Technicien)` : `Animation ${animationHours}h (Animatrice dédiée)`;
                details.push({ label: animationDescription, priceHT: supplementAnimationHT, daily: true, displayPrice: `+${priceTransformer(supplementAnimationHT).toFixed(0)}${suffix}` });
            }

            if (formData.proImpressions > 1) {
                const NbPrint = formData.proImpressions;
                const NbJoursTotalOption = NbJours * (NbPrint - 1);
                const PrixBaseImpression = PRO_IMPRESSION_BASE_HT;
                const PrixPlancherImpression = PRO_IMPRESSION_PLANCHER_HT; 
                supplementImpressionHT = Math.trunc((PrixBaseImpression - PrixPlancherImpression) * 10 * (1 - Math.pow(0.9, NbJoursTotalOption)) + PrixPlancherImpression * NbJoursTotalOption);
                oneTimeCostsHT += supplementImpressionHT;
                details.push({ label: `${NbPrint} impressions par cliché (Total ${NbJours}j)`, priceHT: supplementImpressionHT, daily: false, displayPrice: `+${priceTransformer(supplementImpressionHT).toFixed(0)}${suffix}` });
            }
            if (formData.proFondIA) {
                const fondIAPriceHT = PRO_OPTION_FONDIA_HT; dailyServicesHT += fondIAPriceHT; details.push({ label: 'Fond IA (personnalisé)', priceHT: fondIAPriceHT, daily: true, displayPrice: `+${priceTransformer(fondIAPriceHT).toFixed(0)}${suffix}` });
            }
            if (formData.proRGPD) {
                const rgpdPriceHT = PRO_OPTION_RGPD_HT; dailyServicesHT += rgpdPriceHT; details.push({ label: 'Conformité RGPD', priceHT: rgpdPriceHT, daily: true, displayPrice: `+${priceTransformer(rgpdPriceHT).toFixed(0)}${suffix}` });
            }
        } else if (formData.needType === '360') {
            nomBorne = 'Photobooth 360';
            const basePriceHT = P360_BASE_PRICE_HT; 
            const deliveryPriceHT = P360_DELIVERY_PRICE_HT; 
            baseDayPriceHT = basePriceHT;
            prixLivraisonHT = deliveryPriceHT; 
            dailyServicesHT += basePriceHT + deliveryPriceHT;
            details.push({ label: 'Photobooth 360 (base journalière)', priceHT: basePriceHT, daily: true, displayPrice: `${priceTransformer(basePriceHT).toFixed(0)}${suffix}` });
            details.push({ label: 'Livraison 360 (incluse)', priceHT: deliveryPriceHT, daily: true, displayPrice: `+${priceTransformer(deliveryPriceHT).toFixed(0)}${suffix}` });
        }
        
        if (supplementKm > 0) {
            oneTimeCostsHT += supplementKm;
            details.push({ label: `Supplément Kilométrique (${Math.round(distanceKm)} km)`, priceHT: supplementKm, daily: false, displayPrice: `+${priceTransformer(supplementKm).toFixed(0)}${suffix}` });
        }
        
        if (formData.templateTool && (formData.needType === 'eco' || formData.needType === 'pro')) {
            prixTemplateHT = formData.isPro ? TEMPLATE_TOOL_PRO_PRICE_HT : 0; 
            oneTimeCostsHT += prixTemplateHT;
            let templateDisplay = formData.isPro ? `${priceTransformer(prixTemplateHT).toFixed(0)}${suffix}` : 'Gratuit (Offert)';
            details.push({ label: 'Outil Template Professionnel', priceHT: prixTemplateHT, daily: false, displayPrice: templateDisplay });
        }

        const totalServicesBeforeFormula = dailyServicesHT * duration;
        let totalServicesHT_Degressed = 0;

        if (formData.needType === 'pro') {
            const PBaseJour_Only = BASE_PRICE_PRO_HT;
            const PPlancherJour_Only = PLANCHER_PRICE_PRO_HT_USER_FIX;
            const baseDegressivePart = (PBaseJour_Only - PPlancherJour_Only) * 10 * (1 - Math.pow(0.9, duration));
            const basePlancherPart = PPlancherJour_Only * duration;
            const totalBaseDegressedHT = Math.trunc(baseDegressivePart + basePlancherPart);
            const dailyOptionsHT = dailyServicesHT - BASE_PRICE_PRO_HT;
            totalServicesHT_Degressed = totalBaseDegressedHT + (dailyOptionsHT * duration);

        } else if (formData.needType === 'eco' || formData.needType === '360') {
            if (duration <= 1 || dailyServicesHT === 0) {
                totalServicesHT_Degressed = dailyServicesHT;
            } else {
                const is360 = formData.needType === '360';
                const modelKey = is360 ? '360' : formData.ecoModel;
                let PBaseJour_Only = dailyServicesHT; 
                let PPlancherJour_Only = 0;
                if (is360) {
                    PBaseJour_Only = P360_BASE_PRICE_HT + P360_DELIVERY_PRICE_HT; 
                    PPlancherJour_Only = P360_FLOOR_PRICE_HT; 
                } else if (modelKey) {
                    PBaseJour_Only = ECO_MODELS_PRICING[modelKey].priceHT; 
                    PPlancherJour_Only = ECO_MODELS_PRICING[modelKey].floorPriceHT;
                }
                const baseDegressivePart = (PBaseJour_Only - PPlancherJour_Only) * 10 * (1 - Math.pow(0.9, NbJours));
                const basePlancherPart = PPlancherJour_Only * NbJours;
                totalServicesHT_Degressed = Math.round((baseDegressivePart + basePlancherPart)*100)/100;
            }
        }
        
        const totalHT = totalServicesHT_Degressed + oneTimeCostsHT;
        
        const axonautData = {
            nomBorne, prixMateriel: totalServicesHT_Degressed, prixTemplate: prixTemplateHT, prixLivraison: prixLivraisonHT, 
            nombreMachine: 1, supplementKilometrique: supplementKm, supplementLivraisonDifficile: 0, 
            supplementImpression: supplementImpressionHT, supplementAnimation: supplementAnimationHT, 
            nombreTirages: formData.proImpressions, heuresAnimations: parseInt(formData.proAnimationHours) || 0, distanceKm: Math.round(distanceKm), 
        };

        return {
            totalHT, totalServicesHT: totalServicesHT_Degressed, oneTimeCostsHT, baseDayPriceHT,
            totalServicesBeforeFormula, details, displayTTC, priceSuffix: displayTTC ? 'TTC' : 'HT',
            axonautData, quoteId,
        };
    }, [formData]);


    const isStepValid = () => { 
        switch (currentStep) {
            case 1:
                if (!formData.fullName || !formData.email || !formData.phone || formData.phone.replace(/\D/g, '').length < 9) return false;
                if (formData.isPro && (!formData.companyName || !formData.billingFullAddress)) return false;
                return true;
            case 2:
                return (formData.deliveryFullAddress && formData.eventDate && formData.needType && formData.eventDuration >= 1 && formData.deliveryLat !== null);
            case 3:
                if (formData.needType === 'eco') return formData.ecoModel && formData.ecoTransport;
                return true;
            default:
                return true;
        }
    };
    
    // 📍 MODIFICATION ZAPIER : Nettoyage du payload (Ni status, ni TTC)
    const triggerWebhook = (step, finalSubmit, pricing, axonautNumber = null) => {
        const shouldSendPrice = step >= 3 || finalSubmit;

        const payload = {
            quote_id: quoteId,    
            devis: axonautNumber, 
            step_completed: step,
            // status: Supprimé (Inutile)
            timestamp: new Date().toISOString(),
            ...formData, 
        };

        // On envoie total_ht uniquement si pertinent (étape 3+ ou final). 
        // total_ttc est supprimé définitivement.
        if (shouldSendPrice) {
            payload.total_ht = pricing.totalHT.toFixed(2);
        }

        AxonautService.sendZapierWebhook(payload);
    };

    const handleNext = () => {
        if (isStepValid() && currentStep < 4) {
            triggerWebhook(currentStep, false, calculatePrice);
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

    const handleSubmit = async (showMessage) => {
        setIsSubmitting(true);
        const pricing = calculatePrice;

        try {
            const { companyId } = await AxonautService.createAxonautThirdParty(formData);
            
            const inputsForAxonaut = {
                ...pricing.axonautData, 
                ...AXONAUT_FIXED_DEFAULTS, 
                dateEvenement: formData.eventDate,
                adresseLivraisonComplete: formData.deliveryFullAddress,
                nombreJours: formData.eventDuration,
                templateInclus: formData.templateTool,
                livraisonIncluse: formData.ecoTransport !== 'pickup',
                acomptePct: 1
            };

            const axonautBody = AxonautService.generateAxonautQuotationBody(inputsForAxonaut, companyId);
            const quoteResponse = await AxonautService.sendAxonautQuotation(axonautBody); 
            const finalQuoteNumber = quoteResponse.number; 
            
            triggerWebhook(currentStep, true, pricing, finalQuoteNumber);

            setIsSubmitted(true); 
            
        } catch (error) {
            showMessage(`Erreur lors de la confirmation du devis: ${error.message}`);
        } finally {
            setIsSubmitting(false); 
        }
    };

    return {
        formData,
        setFormData,
        currentStep,
        setCurrentStep,
        calculatePrice,
        isStepValid,
        handleSubmit,
        handleNext,
        handlePrev,
        totalSteps: 4,
        isSubmitting,
        isSubmitted, 
        resetForm     
    };
};