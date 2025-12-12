// src/PhotoboothQuoteForm.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronRight, ChevronLeft, Check, User, Calendar, Settings, DollarSign, Wand2, Truck } from 'lucide-react';
import { useQuoteLogic } from './hooks/useQuoteLogic';
import { customColor, TVA_RATE } from './constants'; // Ajout de TVA_RATE

import { Step1Contact } from './components/steps/Step1Contact';
import { Step2Event } from './components/steps/Step2Event';
import { Step3Config } from './components/steps/Step3Config';
import { Step4Recap } from './components/steps/Step4Recap';


// ⬅️ MODIFICATION 1 : showMessage DÉPLACÉ EN DEHORS
const showMessage = (message) => {
    const alertElement = document.getElementById('custom-alert');
    if (alertElement) {
      alertElement.textContent = message;
      alertElement.style.display = 'block';
      setTimeout(() => {
        alertElement.style.display = 'none';
      }, 5000);
    } else {
      console.warn("Alerte UI non initialisée.");
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
        resetForm
    } = useQuoteLogic(); 

    const pricingData = calculatePrice; // Utilise le résultat de useMemo
    
    // Gestion du défilement
    useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);


    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1Contact formData={formData} setFormData={setFormData} customColor={customColor} />;
            case 2:
                return <Step2Event formData={formData} setFormData={setFormData} customColor={customColor} />;
            case 3:
                return <Step3Config formData={formData} setFormData={setFormData} pricingData={pricingData} customColor={customColor} />;
            case 4:
                // ⬅️ MODIFICATION 2 : PASSAGE DE showMessage AU Step4Recap
                return <Step4Recap 
                            formData={formData}
                            pricingData={pricingData} 
                            customColor={customColor} 
                            handleSubmit={handleSubmit} 
                            handleEditRequest={() => setCurrentStep(1)} 
                            showMessage={showMessage} 
                        />;
            default:
                return null;
        }
    };


    return (
        // ⬅️ FIX FOND NOIR: Applique le fond clair au composant principal
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 font-sans text-gray-900'>
            <div id="custom-alert"></div>
            <div className='max-w-4xl mx-auto'>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center" style={{ color: customColor }}>
                    Devis Express Photobooth
                </h1>

                {/* Barre d'étapes (omitted for brevity) */}
                {/* ... */}
                
                {/* Contenu du formulaire */}
                <div className='bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100'>
                    
                    {/* Rendu des Étapes */}
                    {renderStep()}

                    {/* Boutons de navigation (seulement pour les étapes 1 à 3) */}
                    {currentStep < 4 && (
                        <div className='flex justify-between mt-10 pt-6 border-t border-gray-200'>
                            {/* Bouton Précédent */}
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

                            {/* Bouton Suivant */}
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