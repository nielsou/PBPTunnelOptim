// src/hooks/useQuoteLogic.js

import { useState, useMemo, useEffect } from 'react';
import { nanoid } from 'nanoid';
import * as AxonautService from '../services/axonautService';
import { pushToDataLayer } from '../services/gtmService';
import { locales, SUPPORTED_LANGS } from '../locales';

import {
    AXONAUT_FIXED_DEFAULTS,
    COMPANY_SPECIFIC_PRICING, SALES_REPS,
    ENABLE_WEBHOOK_STEP_1, ENABLE_WEBHOOK_STEP_2, ENABLE_WEBHOOK_STEP_3, ENABLE_WEBHOOK_STEP_4,
} from '../constants';
import { getSiteFromUrl } from '../sites';
import { computePrice } from '../pricing';



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
            // /calculette/<slug> → commercial associé (SALES_REPS), sinon ''
            const salesSlug = isCalc ? (path.split('/calculette/')[1] || '').split('/')[0].toLowerCase() : '';
            const salesRep = SALES_REPS[salesSlug] ? salesSlug : '';

            setFormData(prev => {
                if (prev.isPartnerMode === isPartner && prev.isCalculatorMode === isCalc && prev.salesRep === salesRep) {
                    return prev;
                }
                return {
                    ...prev,
                    utm_source,
                    utm_medium,
                    utm_campaign,
                    isPartnerMode: isPartner,
                    isCalculatorMode: isCalc,
                    salesRep
                };
            });
        }
    }, []);

    // --- SITE (ville) : src/sites/*, choisi par ?site= ---
    const [site] = useState(getSiteFromUrl);

    // --- GESTION LANGUE ---
    const [lang, setLang] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const urlLang = params.get('lang');
            return SUPPORTED_LANGS.includes(urlLang) ? urlLang : site.defaultLang;
        }
        return site.defaultLang;
    });

    useEffect(() => {
        if (typeof document !== 'undefined') document.documentElement.lang = lang;
    }, [lang]);

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
        billingCountry: '',
        deliveryCountry: site.defaultCountry,
        billingSameAsEvent: true,
        saveNewBillingAddress: false,
        saveNewDeliveryAddress: true,
        isPartnerMode: false,
        isCalculatorMode: false,
        salesRep: '',
        utm_source: '',
        utm_medium: '',
        utm_campaign: ''
    };

    // --- 1. ÉTATS INTELLIGENTS (AVEC LOCALSTORAGE) ---

    const [currentStep, setCurrentStep] = useState(() => {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path.includes('/partenaires') || path.includes('/calculette')) {
                return 0; // On démarre sur l'écran d'authentification (Step 0)
            }
        }
        return 1; // Tunnel classique
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
    const [formData, setFormData] = useState({ ...initialFormState, ...urlParams });

    // --- LOGIQUE MÉTIER (Reste inchangé) ---
    const isPartnerClient = useMemo(() => {
        if (!formData.companyId) return false;
        return Object.keys(COMPANY_SPECIFIC_PRICING).includes(formData.companyId.toString());
    }, [formData.companyId]);

    // --- CALCUL DE PRIX COMPLET ---
    const calculatePrice = useMemo(
        () => computePrice({ formData, site, t, isPartnerClient, quoteId }),
        [formData, lang, site, isPartnerClient, quoteId]
    );


    const isStepValid = () => {
        switch (currentStep) {
            case 0: // AUTHENTIFICATION (Modes Spéciaux)
                return !!formData.companyId; // Valide si on a trouvé un client

            case 1: // ÉVÉNEMENT (Normal ou Spécial)
                return (
                    formData.eventDate !== '' &&
                    // Condition ajoutée ici : >= si calculette, sinon > pour bloquer clients et partenaires
                    (formData.isCalculatorMode
                        ? formData.eventDate >= new Date().toISOString().split('T')[0]
                        : formData.eventDate > new Date().toISOString().split('T')[0]) &&
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

        // 1. Ajout de la fonction de détection de l'appareil
        const getDeviceType = () => {
            if (typeof window === 'undefined') return 'desktop';
            const width = window.innerWidth;
            if (width < 768) return 'mobile';
            if (width < 1024) return 'tablet';
            return 'desktop';
        };

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
            utm_campaign: formData.utm_campaign,
            device_type: getDeviceType()
        };

        // Villes hors Paris : de quoi router vers le Sheet régional (le payload Paris reste inchangé)
        if (site.id !== 'paris') {
            payload.site = site.id;
            payload.region = site.region;
            payload.currency = site.currency.code;
        }

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
                payload.total_ttc = pricing.totalHT * site.vatRate;
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
            const clientName = formData.isPro ? formData.companyName : formData.fullName;
            // Restauration des Hyperliens pour Excel/Google Sheets (pas de fiche Axonaut en mode demande)
            payload.client = companyId ? `=HYPERLINK("${companyUrl}";"${clientName}")` : clientName;

            payload.contact = formData.fullName;

            if (site.endAction === 'lead') {
                payload.company_id_number = formData.nip || '';     // NIP en Pologne
                payload.lead_only = "TRUE";
            }

            if (quoteData?.customer_portal_url || quoteData?.public_path) {
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
            setCurrentStep(4);
            return;
        }

        // --- LOGIQUE NORMALE (Contact -> Récap) ---
        if (currentStep === 3) {
            if (site.endAction === 'lead') {
                await submitLead(showMessage);
            } else {
                await handleSubmit(showMessage, false);
            }

            // AJOUT DU TRACKING GTM À L'ÉTAPE 3
            // if (formData.utm_medium === 'cpc') {
            pushToDataLayer({
                'event': 'client_request_price',
                'email': formData.email,
                'utm_source': formData.utm_source,
                'utm_medium': formData.utm_medium,
                'utm_campaign': formData.utm_campaign,
                'amount': calculatePrice.totalHT,
                'model': formData.model
            });


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

        // --- GESTION DU SAUT ARRIÈRE EN MODE CALCULETTE/PARTENAIRE ---
        // Si on fait "Retour" depuis le récapitulatif (étape 4), on doit retomber sur la configuration (étape 2)
        if ((formData.isCalculatorMode || formData.isPartnerMode) && currentStep === 4) {
            setCurrentStep(2);
            return;
        }

        if (currentStep > minStep) {
            setCurrentStep(currentStep - 1);
        }
    };

    const resetForm = () => {
        // On nettoie la session ET le local storage
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('pbp_session_step');
            sessionStorage.removeItem('pbp_session_form_data');
            localStorage.removeItem('pbp_step');
            localStorage.removeItem('pbp_form_data');
        }

        // On réinitialise les données tout en gardant le mode actif (Calculette/Partenaire)
        setFormData({
            ...initialFormState,
            isPartnerMode: formData.isPartnerMode,
            isCalculatorMode: formData.isCalculatorMode,
            salesRep: formData.salesRep
        });

        // Si on est en mode calculette ou partenaire, on retourne à l'étape 0 (Login)
        setCurrentStep((formData.isPartnerMode || formData.isCalculatorMode) ? 0 : 1);

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

    // MODE DEMANDE (villes sans facturation en ligne) : pas d'Axonaut ni de Stripe,
    // la demande part au Sheet régional via le webhook n8n et le regional manager rappelle le client.
    const submitLead = async (showMessage) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (formData.billingSameAsEvent) {
                setFormData(prev => ({
                    ...prev,
                    billingStreet: prev.deliveryStreet,
                    billingZipCode: prev.deliveryZipCode,
                    billingCity: prev.deliveryCity,
                    billingCountry: prev.deliveryCountry,
                    billingFullAddress: prev.deliveryFullAddress
                }));
            }
            if (ENABLE_WEBHOOK_STEP_3) {
                triggerWebhook(3, calculatePrice, {}, false);
            }
            setFormData(prev => ({ ...prev, leadSent: true }));
        } catch (error) {
            console.error("Erreur envoi demande:", error);
            showMessage(t('form.error.email_send'));
            throw error;
        } finally {
            setIsSubmitting(false);
        }
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
                formData.billingCountry = formData.deliveryCountry || "France";
                formData.billingFullAddress = formData.deliveryFullAddress;
            }

            // 1. GESTION DU TIERS
            if (!companyId) {
                console.log("Création du tiers...");
                const { companyId: newId } = await AxonautService.createAxonautThirdParty(formData, lang);
                companyId = newId;

                if (formData.isPro) {
                    console.log("Création explicite du contact pour l'entreprise...");
                    await AxonautService.createAxonautEmployee(companyId, formData);
                }
            }

            setAxonautProspectLink(`https://axonaut.com/business/company/show/${companyId}`);

            const addressContactName = formData.isPro ? formData.companyName : formData.fullName;


            // 2. LOGIQUE D'UPDATE ADRESSES
            if (formData.billingSameAsEvent && formData.saveNewDeliveryAddress) {
                // Créer UNE SEULE adresse combinée
                const newAddr = await AxonautService.createAxonautAddress(companyId, {
                    name: formData.newDeliveryAddressName || "Lieu & Facturation",
                    contactName: addressContactName,
                    street: formData.deliveryStreet,
                    zip: formData.deliveryZipCode,
                    city: formData.deliveryCity,
                    country: formData.deliveryCountry || "France"
                }, 'both');

                if (newAddr?.id) {
                    billingAddressId = newAddr.id;
                    // --- AJOUT : Mécanique anti-doublon ---
                    setFormData(prev => ({
                        ...prev,
                        billingAddressId: newAddr.id,
                        deliveryAddressId: newAddr.id,
                        saveNewBillingAddress: false, // On désactive la création pour le prochain clic
                        saveNewDeliveryAddress: false,
                        savedClientData: prev.savedClientData ? {
                            ...prev.savedClientData,
                            billingAddresses: [...(prev.savedClientData.billingAddresses || []), { id: newAddr.id, label: formData.newDeliveryAddressName || "Lieu & Facturation", address: formData.deliveryFullAddress, zip: formData.deliveryZipCode, city: formData.deliveryCity }],
                            deliveryAddresses: [...(prev.savedClientData.deliveryAddresses || []), { id: newAddr.id, label: formData.newDeliveryAddressName || "Lieu & Facturation", address: formData.deliveryFullAddress, zip: formData.deliveryZipCode, city: formData.deliveryCity }]
                        } : prev.savedClientData
                    }));
                }
            } else {
                // Logique classique séparée
                if (formData.saveNewBillingAddress) {
                    const newBillAddr = await AxonautService.createAxonautAddress(companyId, {
                        name: formData.newBillingAddressName || "Facturation",
                        contactName: addressContactName,
                        street: formData.billingStreet,
                        zip: formData.billingZipCode,
                        city: formData.billingCity,
                        country: formData.billingCountry || "France"
                    }, 'billing');

                    if (newBillAddr?.id) {
                        billingAddressId = newBillAddr.id;
                        // --- AJOUT : Mécanique anti-doublon ---
                        setFormData(prev => ({
                            ...prev,
                            billingAddressId: newBillAddr.id,
                            saveNewBillingAddress: false, // On désactive la création
                            savedClientData: prev.savedClientData ? {
                                ...prev.savedClientData,
                                billingAddresses: [...(prev.savedClientData.billingAddresses || []), { id: newBillAddr.id, label: formData.newBillingAddressName || "Facturation", address: formData.billingFullAddress, zip: formData.billingZipCode, city: formData.billingCity }]
                            } : prev.savedClientData
                        }));
                    }
                }

                if (formData.saveNewDeliveryAddress) {
                    const newDelivAddr = await AxonautService.createAxonautAddress(companyId, {
                        name: formData.newDeliveryAddressName || "Lieu Événement",
                        fullAddress: formData.deliveryFullAddress,
                        street: formData.deliveryStreet,
                        zip: formData.deliveryZipCode,
                        city: formData.deliveryCity
                    }, 'delivery');

                    if (newDelivAddr?.id) {
                        // --- AJOUT : Mécanique anti-doublon ---
                        setFormData(prev => ({
                            ...prev,
                            deliveryAddressId: newDelivAddr.id,
                            saveNewDeliveryAddress: false, // On désactive la création
                            savedClientData: prev.savedClientData ? {
                                ...prev.savedClientData,
                                deliveryAddresses: [...(prev.savedClientData.deliveryAddresses || []), { id: newDelivAddr.id, label: formData.newDeliveryAddressName || "Lieu Événement", address: formData.deliveryFullAddress, zip: formData.deliveryZipCode, city: formData.deliveryCity }]
                            } : prev.savedClientData
                        }));
                    }
                }
            }

            // 🔍 PARTENAIRE VIP
            const isVipPartner = Object.keys(COMPANY_SPECIFIC_PRICING).includes(companyId?.toString());

            // --- NOUVEAU : CALCUL DE L'ACOMPTE DYNAMIQUE ---
            const eventDateObj = new Date(formData.eventDate);
            const today = new Date();
            // Calcul de la différence en jours
            const diffTime = eventDateObj - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let finalAcomptePct = AXONAUT_FIXED_DEFAULTS.acomptePct;

            if (isCalculatorMode && formData.acomptePct !== undefined) {
                // Si le commercial a fait son choix via la calculette, on respecte son choix.
                finalAcomptePct = formData.acomptePct;
            } else {
                // Logique standard pour les clients 
                if (diffDays < 7) {
                    finalAcomptePct = 1;
                } else if (isVipPartner && formData.isPartnerMode) {
                    finalAcomptePct = 0;
                } else {
                    finalAcomptePct = AXONAUT_FIXED_DEFAULTS.acomptePct;
                }
            }

            // On sauvegarde ce pourcentage dans formData pour l'utiliser à l'étape 4
            setFormData(prev => ({ ...prev, acomptePct: finalAcomptePct }));
            // ------------------------------------------------

            // 3. CRÉATION DU DEVIS
            // Commercial du devis (business_manager Axonaut) : celui de la calculette, sinon contact@
            const salesRep = SALES_REPS[formData.salesRep];

            const inputsForAxonaut = {
                ...pricing.axonautData,
                ...AXONAUT_FIXED_DEFAULTS,
                ...(salesRep && { commercial: salesRep.email }),
                dateEvenement: formData.eventDate,
                adresseLivraisonComplete: formData.newDeliveryAddressName
                    ? `${formData.newDeliveryAddressName} - ${formData.deliveryFullAddress}`
                    : formData.deliveryFullAddress,
                nombreJours: formData.eventDuration,
                templateInclus: formData.templateTool,
                livraisonIncluse: formData.delivery !== false,

                // On utilise la variable calculée
                acomptePct: finalAcomptePct,
                discountPercent: isCalculatorMode ? (formData.discountPercent || 0) : 0,
                discountComment: isCalculatorMode ? (formData.discountComment || '') : ''

            };

            if (billingAddressId) {
                inputsForAxonaut.company_address_id = billingAddressId;
            }

            const axonautBody = AxonautService.generateAxonautQuotationBody(inputsForAxonaut, companyId, lang);
            const quoteResponse = await AxonautService.sendAxonautQuotation(axonautBody);

            setAxonautQuoteId(quoteResponse.id);

            setFormData(prev => ({ ...prev, axonautQuoteNumber: quoteResponse.number }));

            // I USED TO SEND THE PUSH TO DATALAYER BEFORE AT STEP4 ALSO

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
        triggerWebhook,
        site
    };
};