import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useQuoteLogic } from './hooks/useQuoteLogic';
import { customColor } from './constants';
import { redirectToStripeCheckout } from './services/stripeService';

// Import des Steps
import { Step1Event } from './components/steps/Step1Event';
import { Step2Config } from './components/steps/Step2Config';
import { Step3Contact } from './components/steps/Step3Contact';
import { Step4Recap } from './components/steps/Step4Recap';

// Fonction utilitaire pour l'alerte UI
const showMessage = (message) => {
    const alertElement = document.getElementById('custom-alert');
    if (alertElement) {
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }
};

export default function PhotoboothQuoteForm() {
    // État visuel pour le "loading screen" entre les étapes
    const [isProcessingStep, setIsProcessingStep] = useState(false);
    const [processingType, setProcessingType] = useState('stock');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);


    const {
        formData, setFormData, currentStep, setCurrentStep, calculatePrice,
        handleNext, handlePrev, isStepValid, isSubmitting,
        axonautQuoteNumber, isPartnerClient, lang, setLang, t,
    } = useQuoteLogic();

    const [isPartnerMode, setIsPartnerMode] = useState(false);
    const [isCalculatorMode, setIsCalculatorMode] = useState(false);
    const pricingData = calculatePrice;

    useEffect(() => {
        const path = window.location.pathname;
        if (path.includes('/partenaires') || path.includes('/calculette')) {
            setIsPartnerMode(true);
            setIsCalculatorMode(path.includes('/calculette'));
        }
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    // Navigation intelligente avec écran de chargement
    const handleNavigationNext = async () => {
        if (!isStepValid()) return;

        // Si on quitte l'étape 2 (Calcul Stock) ou l'étape 3 (Calcul Prix/API)
        if (currentStep === 2 || currentStep === 3) {
            setProcessingType(currentStep === 2 ? 'stock' : 'price');
            setIsProcessingStep(true);

            try {
                // handleNext gère la logique (API Axonaut si étape 3)
                await handleNext(isCalculatorMode, showMessage);
            } catch (e) {
                console.error("Blocage navigation", e);
            } finally {
                // Petit délai visuel pour éviter le clignotement
                setTimeout(() => setIsProcessingStep(false), 800);
            }
        } else {
            handleNext(isCalculatorMode, showMessage);
        }
    };

    const handleStripePayment = async () => {
        try {
            await redirectToStripeCheckout(pricingData, formData, axonautQuoteNumber);
        } catch (error) {
            showMessage("Erreur redirection paiement.");
        }
    };

    // --- RENDER ---
    if (!isClient) return null;
    // 1. Écran de chargement (Transition)
    if (isProcessingStep) {
        return (
            <div className='min-h-[450px] flex items-center justify-center p-6 bg-white rounded-3xl'>
                <div className='text-center space-y-6 animate-in fade-in duration-500'>
                    <Loader2 className="w-16 h-16 text-[#BE2A55] animate-spin mx-auto" />
                    <div>
                        <h3 className="text-2xl font-black text-gray-900">
                            {processingType === 'stock' ? t('step2.check.availability') : "Génération de votre devis..."}
                        </h3>
                        <p className="text-gray-500 font-medium italic">
                            {processingType === 'stock'
                                ? t('step2.check.analysis', { date: formData.eventDate?.split('-').reverse().join('/') })
                                : "Ajustement des tarifs et de la logistique en cours..."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Écran Principal
    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-2 font-sans text-gray-900'>
            <div id="custom-alert" className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-xl z-50 hidden"></div>

            <div className='max-w-4xl mx-auto'>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center">
                    {isCalculatorMode ? 'Bonjour Héloïse et Cédric !' : isPartnerMode ? 'Devis Partenaires' : 'Devis Express Photobooth'}
                </h1>

                <div className='bg-white rounded-[2.5rem] shadow-2xl p-4 sm:p-10 border border-gray-100'>

                    {currentStep === 1 && <Step1Event formData={formData} setFormData={setFormData} lang={lang} setLang={setLang} t={t} />}
                    {currentStep === 2 && <Step2Config formData={formData} setFormData={setFormData} pricingData={pricingData} isPartnerClient={isPartnerClient} t={t} />}
                    {currentStep === 3 && <Step3Contact formData={formData} setFormData={setFormData} t={t} />}

                    {/* STEP 4 : MAINTENANT C'EST LA FINALE */}
                    {currentStep === 4 && (
                        <Step4Recap
                            formData={formData}
                            pricingData={pricingData}
                            customColor={customColor}
                            // ICI : On branche directement le paiement Stripe
                            onValidate={handleStripePayment}
                            handleEditRequest={handlePrev}
                            isSubmitting={isSubmitting}
                            t={t} // On passe la fonction de traduction pour le bloc "Et après"
                        />
                    )}

                    {/* Navigation classique pour 1, 2, 3 */}
                    {currentStep < 4 && (
                        <div className='flex justify-between mt-12 pt-8 border-t border-gray-100'>
                            {currentStep > 1 ? (
                                <button onClick={handlePrev} className='px-6 py-3 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2'>
                                    <ChevronLeft className='w-5 h-5' /> {t('nav.prev')}
                                </button>
                            ) : <div />}

                            <button
                                onClick={handleNavigationNext}
                                disabled={!isStepValid() || isSubmitting}
                                className={`px-10 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg transition-all ${isStepValid() ? 'bg-[#BE2A55] text-white hover:scale-105' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> {t('nav.submitting')}</>
                                ) : (
                                    <>
                                        <span>{currentStep === 3 ? t('nav.receiving') : t('nav.next')}</span>
                                        <ChevronRight className='w-6 h-6' />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}