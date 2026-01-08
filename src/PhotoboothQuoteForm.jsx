// src/PhotoboothQuoteForm.jsx

import React, { useEffect, useState } from 'react';
// CORRECTION ICI : Ajout de ExternalLink et ArrowLeft dans les imports
import { ChevronRight, ChevronLeft, Check, RefreshCcw, FileSignature, ExternalLink, ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { useQuoteLogic } from './hooks/useQuoteLogic';
import { customColor } from './constants';

// Import des Steps
import { Step1Contact } from './components/steps/Step1Contact';
import { Step1Partenaires } from './components/steps/Step1Partenaires';
import { Step2Event } from './components/steps/Step2Event';
import { Step3Config } from './components/steps/Step3Config';
import { Step4Recap } from './components/steps/Step4Recap';
import { pushToDataLayer } from './services/gtmService';

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
        returnToEdit,       // Récupéré du hook
        finalPublicLink,
        axonautProspectLink,
        sendEmailToClient,
        isSendingEmail,
        emailSent
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
            <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-6 px-2 font-sans text-gray-900 flex items-center justify-center'>
                <div className='bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100 max-w-3xl w-full text-center'>
                    <div className='w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                        <Check className='w-12 h-12 text-green-600' />
                    </div>

                    <h2 className='text-3xl md:text-4xl font-extrabold text-green-800 mb-6'>
                        {isCalculatorMode ? 'Devis Généré !' : 'Merci pour votre confiance !'}
                    </h2>

                    <div className='bg-blue-50 p-8 rounded-2xl border-l-4 border-blue-500 shadow-sm text-left mb-8'>

                        {isCalculatorMode ? (
                            <div className="space-y-6">
                                <h3 className='font-bold text-blue-900 text-lg'>Documents disponibles</h3>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {/* 1. Lien Devis */}
                                    {finalPublicLink && (
                                        <a href={finalPublicLink} target="_blank" rel="noopener noreferrer"
                                            className='flex items-center justify-center gap-2 p-4 bg-white border border-blue-200 rounded-xl text-blue-700 font-bold hover:bg-blue-100 transition-all shadow-sm'>
                                            <FileSignature className="w-5 h-5" />
                                            Ouvrir le Devis
                                        </a>
                                    )}

                                    {/* --- LE NOUVEAU BOUTON --- */}
                                    <button
                                        onClick={() => sendEmailToClient(showMessage)}
                                        // On désactive si ça charge OU si c'est déjà envoyé
                                        disabled={isSendingEmail || emailSent}

                                        // On change la couleur : Bleu par défaut, VERT si envoyé
                                        className={`flex items-center justify-center gap-2 p-4 border rounded-xl text-white font-bold transition-all shadow-md disabled:opacity-80 disabled:cursor-not-allowed
                                            ${emailSent
                                                ? 'bg-green-600 border-green-500' // Style Succès
                                                : 'bg-blue-600 border-blue-500 hover:bg-blue-700' // Style Normal
                                            }`}
                                    >
                                        {isSendingEmail ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Envoi...
                                            </>
                                        ) : emailSent ? (
                                            // VERSION "ACTION FAITE"
                                            <>
                                                <Check className="w-5 h-5" />
                                                Email envoyé !
                                            </>
                                        ) : (
                                            // VERSION NORMALE
                                            <>
                                                <Mail className="w-5 h-5" />
                                                Envoyer par Email
                                            </>
                                        )}
                                    </button>

                                    {/* 2. Lien Fiche Prospect Axonaut */}
                                    {axonautProspectLink && (
                                        <a href={axonautProspectLink} target="_blank" rel="noopener noreferrer"
                                            className='flex items-center justify-center gap-2 p-4 bg-gray-800 border border-gray-700 rounded-xl text-white font-bold hover:bg-gray-900 transition-all shadow-md'>
                                            <ExternalLink className="w-5 h-5" />
                                            Fiche Client Axonaut
                                        </a>
                                    )}
                                </div>
                                <p className='text-xs text-blue-800/60 italic text-center mt-2'>
                                    Cliquer sur "Envoyer" pour faire partir le devis vers le client.
                                </p>
                            </div>
                        ) : (
                            // MODE PUBLIC (Classique)
                            <>
                                <h3 className='font-bold text-blue-900 text-lg mb-2'>Votre commande est validée</h3>
                                <p className='text-blue-800 mb-4'>
                                    Le récapitulatif de votre commande vous a été envoyé par email : <strong>{formData.email}</strong>.
                                </p>
                                {finalPublicLink && (
                                    <a
                                        href={finalPublicLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-3 mb-4'
                                    >
                                        <FileSignature className="w-6 h-6" />
                                        <span className="text-lg">Signer & Payer</span>
                                    </a>
                                )}
                            </>
                        )}
                    </div>

                    {/* BOUTONS D'ACTION (Footer Succès) */}
                    <div className="flex justify-center gap-4">
                        {isCalculatorMode ? (
                            // MODE CALCULETTE : On propose de revenir modifier le devis actuel
                            <button
                                onClick={returnToEdit}
                                className='flex items-center justify-center gap-2 px-6 py-3 text-gray-600 font-bold hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100'
                            >
                                <ArrowLeft className='w-5 h-5' />
                                Retour au devis (Modifier)
                            </button>
                        ) : (
                            // MODE PUBLIC : On propose de repartir à zéro
                            <button
                                onClick={resetForm}
                                className='text-gray-400 hover:text-gray-600 text-sm font-semibold underline decoration-dotted'
                            >
                                Effectuer une nouvelle demande
                            </button>
                        )}
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
                        isCalculatorMode={isCalculatorMode}
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
                return <Step3Config
                    formData={formData}
                    setFormData={setFormData}
                    pricingData={pricingData}
                    customColor={customColor}
                    isPartnerMode={isPartnerMode}
                />;
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
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-2 font-sans text-gray-900'>
            <div id="custom-alert" className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-xl z-50 hidden"></div>
            <div className='max-w-4xl mx-auto'>
                {/* TITRE DYNAMIQUE SELON LE MODE */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center" style={{ color: customColor }}>
                    {isCalculatorMode
                        ? 'Bonjour Héloïse et Cédric !'           // 1. Titre mode Calculette
                        : isPartnerMode
                            ? 'Devis Partenaires Photobooth-Paris'      // 2. Titre mode Partenaire
                            : 'Devis Express Photobooth'                // 3. Titre mode Normal (par défaut)
                    }
                </h1>

                <div className='bg-white rounded-3xl shadow-2xl p-3 sm:p-10 border border-gray-100'>
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
                                onClick={() => {
                                    if (!isStepValid()) {
                                        pushToDataLayer({
                                            'event': 'form_validation_error',
                                            'step': currentStep
                                        });
                                    }
                                    handleNext(isCalculatorMode);
                                }}
                                disabled={!isStepValid()}
                                className={`px-8 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 shadow-md ${isStepValid()
                                    ? 'text-white hover:transform hover:scale-[1.02]'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                style={isStepValid() ? { backgroundColor: customColor } : {}}
                            >
                                <span>
                                    {currentStep === 3
                                        ? (isCalculatorMode ? 'Générer le devis' : 'Voir mon panier')
                                        : 'Suivant'}
                                </span>
                                <ChevronRight className='w-5 h-5' />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}