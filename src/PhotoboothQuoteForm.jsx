// src/PhotoboothQuoteForm.jsx

import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, Check, RefreshCcw, FileSignature } from 'lucide-react';
import { useQuoteLogic } from './hooks/useQuoteLogic';
import { customColor } from './constants';

// Import des Steps
import { Step1Contact } from './components/steps/Step1Contact';
import { Step1Partenaires } from './components/steps/Step1Partenaires';
import { Step2Event } from './components/steps/Step2Event';
import { Step3Config } from './components/steps/Step3Config';
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
    const {
        formData,
        setFormData,
        currentStep,
        setCurrentStep,
        calculatePrice,
        handleNext,
        handlePrev,
        handleSubmit,
        isStepValid,
        isSubmitting,
        isSubmitted,
        resetForm,
        finalPublicLink
    } = useQuoteLogic();

    // État pour savoir si on est en mode "Partenaires"
    const [isPartnerMode, setIsPartnerMode] = useState(false);
    const [isCalculatorMode, setIsCalculatorMode] = useState(false);

    const pricingData = calculatePrice;

    // Détection de l'URL au chargement
    useEffect(() => {
        // Si l'URL contient "/partenaires" ou "/calculator"
        const path = window.location.pathname;
        if (path.includes('/partenaires') || path.includes('/calculette')) {
            setIsPartnerMode(true);
            setIsCalculatorMode(path.includes('/calculette'));
        }
    }, [setFormData]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep, isSubmitted]);

    // ÉCRAN DE SUCCÈS APRÈS SOUMISSION
    if (isSubmitted) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 font-sans text-gray-900 flex items-center justify-center'>
                <div className='bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-green-100 max-w-2xl w-full text-center space-y-8'>
                    <div className='w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                        <Check className='w-12 h-12 text-green-600' />
                    </div>

                    <h2 className='text-4xl font-extrabold text-green-800'>Merci pour votre confiance !</h2>

                    <p className='text-xl text-gray-700 leading-relaxed'>
                        Votre demande a été traitée avec succès. 🚀
                    </p>

                    <div className='bg-blue-50 p-6 rounded-xl text-left border-l-4 border-blue-500 shadow-sm'>
                        <h3 className='font-bold text-blue-900 text-lg mb-2'>Et maintenant ?</h3>
                        <p className='text-blue-800 mb-4'>
                            Vous allez recevoir un email d'ici quelques instants à l'adresse <strong>{formData.email}</strong>.
                        </p>

                        {/* BOUTON DE SIGNATURE DIRECTE (Si lien disponible via Axonaut) */}
                        {finalPublicLink && (
                            <a
                                href={finalPublicLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-3 mb-4 transform hover:-translate-y-1'
                            >
                                <FileSignature className="w-6 h-6" />
                                <span className="text-lg">Signer le devis et régler l'acompte</span>
                            </a>
                        )}

                        <p className='text-sm text-blue-700 italic'>
                            Le lien est également disponible dans l'email que nous venons de vous envoyer.
                        </p>
                    </div>

                    <div className='pt-4'>
                        <button
                            onClick={resetForm}
                            className='w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center space-x-3 shadow-lg mx-auto'
                        >
                            <RefreshCcw className='w-5 h-5' />
                            <span>Effectuer une nouvelle demande</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // GESTION DU RENDU DES ÉTAPES
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                // Aiguillage selon le mode (Standard vs Partenaire)
                if (isPartnerMode) {
                    return <Step1Partenaires
                        formData={formData}
                        setFormData={setFormData}
                        customColor={customColor}
                        handleNext={handleNext}
                    />;
                }
                return <Step1Contact
                    formData={formData}
                    setFormData={setFormData}
                    customColor={customColor}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                />;
            case 2:
                return <Step2Event formData={formData} setFormData={setFormData} customColor={customColor} />;
            case 3:
                return <Step3Config formData={formData} setFormData={setFormData} pricingData={pricingData} customColor={customColor} />;
            case 4:
                return <Step4Recap
                    formData={formData}
                    pricingData={pricingData}
                    customColor={customColor}
                    handleSubmit={(msg) => handleSubmit(msg, isCalculatorMode)}
                    handleEditRequest={handlePrev}
                    showMessage={showMessage}
                    isSubmitting={isSubmitting}
                />;
            default:
                return null;
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 font-sans text-gray-900'>
            <div id="custom-alert" className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-xl z-50 hidden"></div>
            <div className='max-w-4xl mx-auto'>
                {/* TITRE DYNAMIQUE SELON LE MODE */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center" style={{ color: customColor }}>
                    {isPartnerMode ? 'Devis Express Partenaires' : 'Devis Express Photobooth'}
                </h1>

                <div className='bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100'>
                    {renderStep()}

                    {currentStep < 4 && (
                        <div className='flex justify-between mt-10 pt-6 border-t border-gray-200'>
                            {currentStep > 1 ? (
                                <button
                                    onClick={handlePrev}
                                    className='px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-800 hover:bg-gray-100 transition-colors flex items-center space-x-2 shadow-sm'
                                >
                                    <ChevronLeft className='w-5 h-5' />
                                    <span>Précédent</span>
                                </button>
                            ) : (
                                <div />
                            )}

                            {/* BOUTON SUIVANT : Centralisé sur isStepValid() */}
                            <button
                                onClick={handleNext}
                                disabled={!isStepValid()}
                                className={`px-8 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 shadow-md ${isStepValid()
                                    ? 'text-white hover:transform hover:scale-[1.02]'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                style={isStepValid() ? { backgroundColor: customColor, boxShadow: `0 4px 6px -1px ${customColor}55, 0 2px 4px -2px ${customColor}55` } : {}}
                            >
                                <span>{currentStep === 3 ? 'Voir le devis' : 'Suivant'}</span>
                                <ChevronRight className='w-5 h-5' />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}