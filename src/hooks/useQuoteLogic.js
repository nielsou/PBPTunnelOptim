// src/hooks/useQuoteLogic.js

import { useState, useMemo } from 'react';
import { nanoid } from 'nanoid';
import * as AxonautService from '../services/axonautService';
import {
    COUNTRIES, TVA_RATE, PARIS_LAT, PARIS_LNG, AXONAUT_FIXED_DEFAULTS,
    ECO_MODELS_PRICING, DELIVERY_BASE_ECO_HT, DELIVERY_BASE_ILLIMITE_HT,
    BASE_PRICE_PRO_HT, PLANCHER_PRICE_PRO_HT_USER_FIX,
    PRO_DELIVERY_BASE_HT, PRO_ANIMATION_HOUR_PRICE_HT,
    P360_EXTRA_ANIMATION_HOUR_PRICE_HT,
    PRO_IMPRESSION_BASE_HT, PRO_IMPRESSION_PLANCHER_HT, PRO_OPTION_FONDIA_HT,
    PRO_OPTION_RGPD_HT, TEMPLATE_TOOL_PRO_PRICE_HT, P360_BASE_PRICE_HT,
    P360_DELIVERY_PRICE_HT, P360_FLOOR_PRICE_HT, COMPANY_SPECIFIC_PRICING,
    ENABLE_ZAPIER_STEP_1, ENABLE_ZAPIER_STEP_2, ENABLE_ZAPIER_STEP_3, ENABLE_ZAPIER_STEP_4
} from '../constants';

// Fonction utilitaire pour la distance
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
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
    // États et Refs
    const [quoteId, setQuoteId] = useState(() => nanoid(10));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [finalPublicLink, setFinalPublicLink] = useState(null);

    // État initial du formulaire
    const initialFormState = {
        fullName: '', email: '', phone: '', isPro: false, companyName: '',

        // Facturation
        billingFullAddress: '', billingLat: null, billingLng: null, billingZipCode: '', billingCity: '',

        // Livraison / Événement
        deliveryFullAddress: '', deliveryLat: null, deliveryLng: null, deliveryZipCode: '', deliveryCity: '',
        deliverySameAsBilling: true, 
        eventDate: '', eventDuration: 1, 
        
        // Le modèle pilote tout désormais
        model: '', 
        
        proAnimationHours: 'none',
        proFondIA: false, proRGPD: false, delivery: true, proImpressions: 1, templateTool: false,
    };

    const [formData, setFormData] = useState(initialFormState);

    // --- CALCUL DE PRIX COMPLET ---
    const calculatePrice = useMemo(() => {

        // --- 0. DÉTECTION DU TYPE D'OFFRE ---
        const isSignature = formData.model === 'Signature';
        const is360 = formData.model === '360';
        const isEco = !isSignature && !is360 && formData.model !== ''; // Inclut Numérique, 150, 300 ET Illimité (Starbooth)

        // --- 1. RÉCUPÉRATION DES TARIFS NÉGOCIÉS ---
        const cid = formData.companyId?.toString();
        const deals = COMPANY_SPECIFIC_PRICING[cid] || {};

        // Définition des variables de prix (Négocié ou Défaut)
        const currentSignaturePrice = deals.priceSignature ?? BASE_PRICE_PRO_HT;
        const currentIllimitePrice = deals.priceIllimite ?? ECO_MODELS_PRICING.illimite.priceHT;
        const currentTemplatePrice = deals.freeTemplate ? 0 : TEMPLATE_TOOL_PRO_PRICE_HT;

        // 2. Distance
        const distanceKm = (formData.deliveryLat && formData.deliveryLng)
            ? calculateHaversineDistance(PARIS_LAT, PARIS_LNG, formData.deliveryLat, formData.deliveryLng)
            : 0;
        const supplementKm = distanceKm > 50 ? Math.round(distanceKm - 50) : 0;

        // 3. Initialisation
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

        // --- LOGIQUE PRIX ECO (Inclut STARBOOTH PRO) ---
        if (isEco) {
            if (formData.model) {
                const modelData = ECO_MODELS_PRICING[formData.model];
                nomBorne = modelData ? modelData.name : 'Modèle Eco';

                let basePriceHT_Model = modelData ? modelData.priceHT : 0;
                if (formData.model === 'illimite') {
                    basePriceHT_Model = currentIllimitePrice;
                }

                baseDayPriceHT += basePriceHT_Model;
                dailyServicesHT += basePriceHT_Model;

                const baseDeliveryPriceHT = formData.model === 'illimite' ? DELIVERY_BASE_ILLIMITE_HT : DELIVERY_BASE_ECO_HT;

                if (formData.delivery === true) {
                    prixLivraisonHT = baseDeliveryPriceHT;
                    oneTimeCostsHT += prixLivraisonHT;
                    if (modelData) {
                        details.push({
                            label: modelData.name,
                            priceHT: basePriceHT_Model,
                            daily: true,
                            displayPrice: `${priceTransformer(basePriceHT_Model).toFixed(0)}${suffix}`
                        });
                    }
                } else {
                    // Retrait
                    prixLivraisonHT = 0;
                    if (modelData) {
                        details.push({
                            label: modelData.name,
                            priceHT: basePriceHT_Model,
                            daily: true,
                            displayPrice: `${priceTransformer(basePriceHT_Model).toFixed(0)}${suffix}`
                        });
                    }
                    details.push({ label: 'Retrait (Arcueil)', priceHT: 0, daily: false, displayPrice: 'Gratuit' });
                }

                // --- OPTIONS PREMIUM POUR STARBOOTH PRO ('illimite') ---
                if (formData.model === 'illimite') {
                    // 1. Animation (Si livraison sélectionnée ou forcée)
                    // Note : Pas de réduction de livraison ici ("C'est toujours animatrice dédiée")
                    if (formData.delivery === true && formData.proAnimationHours !== 'none') {
                        const animationHours = parseInt(formData.proAnimationHours);
                        if (animationHours > 0) {
                            supplementAnimationHT = animationHours * PRO_ANIMATION_HOUR_PRICE_HT;
                            dailyServicesHT += supplementAnimationHT;
                            details.push({ 
                                label: `Animation ${animationHours}h (Animatrice dédiée)`, 
                                priceHT: supplementAnimationHT, 
                                daily: true, 
                                displayPrice: `+${priceTransformer(supplementAnimationHT).toFixed(0)}${suffix}` 
                            });
                        }
                    }

                    // 2. Fond IA
                    if (formData.proFondIA) {
                        const fondIAPriceHT = PRO_OPTION_FONDIA_HT; 
                        dailyServicesHT += fondIAPriceHT; 
                        details.push({ 
                            label: 'Fond IA (personnalisé)', 
                            priceHT: fondIAPriceHT, 
                            daily: true, 
                            displayPrice: `+${priceTransformer(fondIAPriceHT).toFixed(0)}${suffix}` 
                        });
                    }

                    // 3. RGPD
                    if (formData.proRGPD) {
                        const rgpdPriceHT = PRO_OPTION_RGPD_HT; 
                        dailyServicesHT += rgpdPriceHT; 
                        details.push({ 
                            label: 'Conformité RGPD', 
                            priceHT: rgpdPriceHT, 
                            daily: true, 
                            displayPrice: `+${priceTransformer(rgpdPriceHT).toFixed(0)}${suffix}` 
                        });
                    }
                }
            }

        // --- LOGIQUE PRIX PRO (Signature) ---
        } else if (isSignature) {
            nomBorne = 'Signature';
            baseDayPriceHT += currentSignaturePrice;
            dailyServicesHT += currentSignaturePrice;
            details.push({ label: 'Signature (base journalière)', priceHT: currentSignaturePrice, daily: true, displayPrice: `${priceTransformer(currentSignaturePrice).toFixed(0)}${suffix}` });

            const proDeliveryBasePriceHT = PRO_DELIVERY_BASE_HT;
            const animationHours = parseInt(formData.proAnimationHours);
            const isShortAnimation = animationHours > 0 && animationHours <= 3;
            // Réduction Livraison si technicien (1-3h)
            prixLivraisonHT = isShortAnimation ? proDeliveryBasePriceHT / 2 : proDeliveryBasePriceHT;
            oneTimeCostsHT += prixLivraisonHT;
            details.push({ label: 'Logistique/Installation par Technicien Certifié', priceHT: prixLivraisonHT, daily: false, displayPrice: `${priceTransformer(prixLivraisonHT).toFixed(0)}${suffix}` });

            // Animation Signature
            if (formData.proAnimationHours !== 'none') {
                supplementAnimationHT = animationHours * PRO_ANIMATION_HOUR_PRICE_HT;
                dailyServicesHT += supplementAnimationHT;
                const animationDescription = isShortAnimation ? `Animation ${animationHours}h (Technicien)` : `Animation ${animationHours}h (Animatrice dédiée)`;
                details.push({ label: animationDescription, priceHT: supplementAnimationHT, daily: true, displayPrice: `+${priceTransformer(supplementAnimationHT).toFixed(0)}${suffix}` });
            }

            // Impressions Signature
            if (formData.proImpressions > 1) {
                const NbPrint = formData.proImpressions;
                const NbJoursTotalOption = NbJours * (NbPrint - 1);
                const PrixBaseImpression = PRO_IMPRESSION_BASE_HT;
                const PrixPlancherImpression = PRO_IMPRESSION_PLANCHER_HT;
                supplementImpressionHT = Math.round(((PrixBaseImpression - PrixPlancherImpression) * 10 * (1 - Math.pow(0.9, NbJoursTotalOption)) + PrixPlancherImpression * NbJoursTotalOption) * 100) / 100;
                oneTimeCostsHT += supplementImpressionHT;
                details.push({ label: `${NbPrint} impressions par cliché (Total ${NbJours}j)`, priceHT: supplementImpressionHT, daily: false, displayPrice: `+${priceTransformer(supplementImpressionHT).toFixed(0)}${suffix}` });
            }
            if (formData.proFondIA) {
                const fondIAPriceHT = PRO_OPTION_FONDIA_HT; dailyServicesHT += fondIAPriceHT; details.push({ label: 'Fond IA (personnalisé)', priceHT: fondIAPriceHT, daily: true, displayPrice: `+${priceTransformer(fondIAPriceHT).toFixed(0)}${suffix}` });
            }
            if (formData.proRGPD) {
                const rgpdPriceHT = PRO_OPTION_RGPD_HT; dailyServicesHT += rgpdPriceHT; details.push({ label: 'Conformité RGPD', priceHT: rgpdPriceHT, daily: true, displayPrice: `+${priceTransformer(rgpdPriceHT).toFixed(0)}${suffix}` });
            }

        // --- LOGIQUE PRIX 360 ---
        } else if (is360) {
            nomBorne = 'Photobooth 360';
            const basePriceHT = P360_BASE_PRICE_HT;
            const deliveryPriceHT = P360_DELIVERY_PRICE_HT;
            baseDayPriceHT = basePriceHT;
            oneTimeCostsHT = deliveryPriceHT;
            dailyServicesHT += basePriceHT;
            details.push({ label: 'Photobooth 360 (base journalière)', priceHT: basePriceHT, daily: true, displayPrice: `${priceTransformer(basePriceHT).toFixed(0)}${suffix}` });
            details.push({ label: 'Livraison 360 (incluse)', priceHT: deliveryPriceHT, daily: true, displayPrice: `+${priceTransformer(deliveryPriceHT).toFixed(0)}${suffix}` });

            // Animation 360
            let animationHours360 = 3;
            if (formData.proAnimationHours && formData.proAnimationHours !== 'none') {
                animationHours360 = parseInt(formData.proAnimationHours);
            }

            if (animationHours360 > 3) {
                const extraHours = animationHours360 - 3;
                supplementAnimationHT = extraHours * P360_EXTRA_ANIMATION_HOUR_PRICE_HT;
                dailyServicesHT += supplementAnimationHT;
                details.push({
                    label: `Animation ${animationHours360}h (dont 3h incluses)`,
                    priceHT: supplementAnimationHT,
                    daily: true,
                    displayPrice: `+${priceTransformer(supplementAnimationHT).toFixed(0)}${suffix}`
                });
            }
        }

        // Supplément Kilométrique
        if (supplementKm > 0) {
            oneTimeCostsHT += supplementKm;
            details.push({ label: `Supplément Kilométrique (${Math.round(distanceKm)} km)`, priceHT: supplementKm, daily: false, displayPrice: `+${priceTransformer(supplementKm).toFixed(0)}${suffix}` });
        }

        // Outil Template
        if (formData.templateTool && (isEco || isSignature)) {
            prixTemplateHT = formData.isPro ? currentTemplatePrice : 0;
            oneTimeCostsHT += prixTemplateHT;

            let templateDisplay = (formData.isPro && currentTemplatePrice > 0)
                ? `${priceTransformer(prixTemplateHT).toFixed(0)}${suffix}`
                : 'Gratuit (Offert)';

            details.push({ label: 'Outil Template Professionnel', priceHT: prixTemplateHT, daily: false, displayPrice: templateDisplay });
        }

        // --- DÉGRESSIVITÉ ---
        const totalServicesBeforeFormula = dailyServicesHT * duration;
        let totalServicesHT_Degressed = 0;

        if (isSignature) {
            const PBaseJour_Only = currentSignaturePrice;
            const PPlancherJour_Only = PLANCHER_PRICE_PRO_HT_USER_FIX;
            const baseDegressivePart = (PBaseJour_Only - PPlancherJour_Only) * 10 * (1 - Math.pow(0.9, duration));
            const basePlancherPart = PPlancherJour_Only * duration;
            const totalBaseDegressedHT = Math.round(baseDegressivePart + basePlancherPart);
            const dailyOptionsHT = dailyServicesHT - currentSignaturePrice;
            totalServicesHT_Degressed = totalBaseDegressedHT + (dailyOptionsHT * duration);

        } else if (isEco || is360) {
            if (duration <= 1 || dailyServicesHT === 0) {
                totalServicesHT_Degressed = dailyServicesHT;
            } else {
                let PBaseJour_Only = dailyServicesHT;
                let PPlancherJour_Only = 0;
                if (is360) {
                    PBaseJour_Only = P360_BASE_PRICE_HT + P360_DELIVERY_PRICE_HT;
                    PPlancherJour_Only = P360_FLOOR_PRICE_HT;
                } else if (formData.model && ECO_MODELS_PRICING[formData.model]) {
                    PBaseJour_Only = ECO_MODELS_PRICING[formData.model].priceHT;
                    PPlancherJour_Only = ECO_MODELS_PRICING[formData.model].floorPriceHT;
                }
                const baseDegressivePart = (PBaseJour_Only - PPlancherJour_Only) * 10 * (1 - Math.pow(0.9, NbJours));
                const basePlancherPart = PPlancherJour_Only * NbJours;
                totalServicesHT_Degressed = Math.round((baseDegressivePart + basePlancherPart) * 100) / 100;
            }
        }

        const totalHT = totalServicesHT_Degressed + oneTimeCostsHT;

        const axonautData = {
            nomBorne, prixMateriel: totalServicesHT_Degressed, prixTemplate: prixTemplateHT, prixLivraison: prixLivraisonHT,
            nombreMachine: 1, supplementKilometrique: supplementKm, supplementLivraisonDifficile: 0,
            supplementImpression: supplementImpressionHT, supplementAnimation: supplementAnimationHT,
            nombreTirages: formData.proImpressions, heuresAnimations: parseInt(formData.proAnimationHours) || 0, distanceKm: Math.round(distanceKm),
            livraisonIncluse: formData.delivery
        };

        return {
            totalHT, totalServicesHT: totalServicesHT_Degressed, oneTimeCostsHT, baseDayPriceHT,
            totalServicesBeforeFormula, details, displayTTC, priceSuffix: displayTTC ? 'TTC' : 'HT',
            axonautData, quoteId,
            unitaryPrices: {
                template: currentTemplatePrice,
                signature: currentSignaturePrice,
                illimite: currentIllimitePrice
            }
        };
    }, [formData]);


    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                if (!formData.fullName || !formData.email || !formData.phone || !formData.deliveryFullAddress) return false;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) return false;
                
                const selectedCountry = COUNTRIES.find(c => formData.phone.startsWith(c.code));
                if (selectedCountry) {
                    const digitsOnly = formData.phone.replace(selectedCountry.code, '').replace(/\D/g, '');
                    if (digitsOnly.length !== selectedCountry.requiredDigits) return false;
                } else {
                    if (formData.phone.replace(/\D/g, '').length < 9) return false;
                }

                if (formData.isPro && (!formData.companyName || !formData.billingFullAddress)) return false;
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
                payload.needType = 'eco'; 
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
                payload.needType = 'pro';
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
            }

            if (pricing) {
                payload.total_ht = pricing.totalHT.toFixed(2);
            }
        }

        AxonautService.sendZapierWebhook(payload);
    };

    const handleNext = () => {
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
                const { companyId: newId } = await AxonautService.createAxonautThirdParty(formData);
                companyId = newId;
            }

            // 2. LOGIQUE CONDITIONNELLE PRO
            if (formData.isPro) {
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
            }

            // 🔍 PARTENAIRE VIP
            const isVipPartner = Object.keys(COMPANY_SPECIFIC_PRICING).includes(companyId?.toString());

            // 3. CRÉATION DU DEVIS
            const inputsForAxonaut = {
                ...pricing.axonautData,
                ...AXONAUT_FIXED_DEFAULTS,
                dateEvenement: formData.eventDate,
                adresseLivraisonComplete: formData.deliveryFullAddress,
                nombreJours: formData.eventDuration,
                templateInclus: formData.templateTool,
                livraisonIncluse: formData.delivery !== false, 

                // ✅ RÈGLE ACOMPTE
                acomptePct: isVipPartner ? 0 : 1
            };

            if (billingAddressId) {
                inputsForAxonaut.company_address_id = billingAddressId;
            }

            const axonautBody = AxonautService.generateAxonautQuotationBody(inputsForAxonaut, companyId);
            const quoteResponse = await AxonautService.sendAxonautQuotation(axonautBody);

            if (ENABLE_ZAPIER_STEP_4) {
                triggerWebhook(4, true, pricing, quoteResponse.number);
            }

            // 4. FINALISATION
            const signLink = quoteResponse.customer_portal_url;
            setFinalPublicLink(signLink);

            if (!isCalculatorMode) {
                await AxonautService.createAxonautEvent(quoteResponse.id, companyId, formData.email, formData.email, signLink);
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
        finalPublicLink
    };
};