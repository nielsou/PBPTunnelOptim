// src/PhotoboothQuoteForm.jsx

import React, { useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, RefreshCcw } from 'lucide-react'; // Ajout RefreshCcw
import { useQuoteLogic } from './hooks/useQuoteLogic';
import { customColor } from './constants'; 

import { Step1Contact } from './components/steps/Step1Contact';
import { Step2Event } from './components/steps/Step2Event';
import { Step3Config } from './components/steps/Step3Config';
import { Step4Recap } from './components/steps/Step4Recap';

// (Garder showMessage inchangé)
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
        isSubmitting, // Récupération
        isSubmitted,  // Récupération
        resetForm     // Récupération
    } = useQuoteLogic(); 

    const pricingData = calculatePrice; 
    
    useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep, isSubmitted]); // Scroll up aussi au succès

    // 1. ÉCRAN DE SUCCÈS
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
                        <p className='text-blue-800'>
                            Vous allez recevoir un email d'ici quelques instants à l'adresse <strong>{formData.email}</strong>.
                            <br /><br />
                            Celui-ci contient votre <strong>devis officiel (PDF)</strong> ainsi qu'un lien sécurisé pour effectuer le règlement de l'acompte directement en ligne et bloquer la machine pour votre date.
                        </p>
                    </div>

                    <div className='pt-8'>
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

    // (Le reste du rendu pour le formulaire normal)
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1Contact formData={formData} setFormData={setFormData} customColor={customColor} currentStep={currentStep} setCurrentStep={setCurrentStep} />;
            case 2:
                return <Step2Event formData={formData} setFormData={setFormData} customColor={customColor} />;
            case 3:
                return <Step3Config formData={formData} setFormData={setFormData} pricingData={pricingData} customColor={customColor} />;
            case 4:
                return <Step4Recap 
                            formData={formData}
                            pricingData={pricingData} 
                            customColor={customColor} 
                            handleSubmit={handleSubmit} 
                            handleEditRequest={() => setCurrentStep(1)} 
                            showMessage={showMessage} 
                            isSubmitting={isSubmitting} // Passer la prop
                        />;
            default:
                return null;
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 font-sans text-gray-900'>
            <div id="custom-alert" className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-xl z-50 hidden"></div>
            <div className='max-w-4xl mx-auto'>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center" style={{ color: customColor }}>
                    Devis Express Photobooth
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