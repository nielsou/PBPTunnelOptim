// src/PhotoboothQuoteForm.jsx

import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, Check, RefreshCcw, FileSignature, ExternalLink, ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { useQuoteLogic } from './hooks/useQuoteLogic';
import { customColor } from './constants';

// Import des Steps
import { Step1Event } from './components/steps/Step1Event';
import { Step2Config } from './components/steps/Step2Config';
import { Step3Contact } from './components/steps/Step3Contact';
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
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

    const {
        formData, setFormData, currentStep, setCurrentStep, calculatePrice,
        handleNext, handlePrev, handleSubmit, isStepValid, isSubmitting,
        isSubmitted, resetForm, returnToEdit, finalPublicLink,
        axonautProspectLink, sendEmailToClient, isSendingEmail,
        emailSent, isPartnerClient,
        lang, setLang, t
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
    }, [currentStep, isSubmitted, isCheckingAvailability]);

    const handleNavigationNext = () => {
        if (!isStepValid()) {
            pushToDataLayer({ 'event': 'form_validation_error', 'step': currentStep });
            return;
        }
        if (currentStep === 2) {
            setIsCheckingAvailability(true);
            setTimeout(() => {
                setIsCheckingAvailability(false);
                handleNext(isCalculatorMode, showMessage);
            }, 1800);
        } else {
            handleNext(isCalculatorMode, showMessage);
        }
    };

    // --- BARRE DE PROGRESSION ---
    const ProgressBar = () => {
        // Idéalement, ces labels devraient aussi être dans locales.js
        const steps = [
            { id: 1, label: t('nav.step1') },
            { id: 2, label: t('nav.step2') },
            { id: 3, label: t('nav.step3') }
        ];

        return (
            <div className="mb-12 px-2">
                <div className="flex justify-between items-end">
                    {steps.map((step) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex flex-col items-center relative" style={{ width: '30%' }}>
                                <span className={`uppercase tracking-tighter mb-3 transition-all duration-300 font-black ${isActive
                                    ? 'text-[13px] sm:text-sm text-[#BE2A55] scale-110 opacity-100'
                                    : 'text-[10px] text-gray-400 opacity-60'
                                    }`}>
                                    {step.label}
                                </span>
                                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden relative">
                                    <div
                                        className="h-full transition-all duration-700 ease-out"
                                        style={{
                                            width: (isActive || isCompleted) ? '100%' : '0%',
                                            backgroundColor: (isActive || isCompleted) ? '#BE2A55' : 'transparent'
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (isSubmitted) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4'>
                <div className='max-w-2xl mx-auto bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-gray-100 animate-in zoom-in duration-500'>
                    <div className='w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8'>
                        <Check className='w-12 h-12 text-green-600' />
                    </div>

                    <h2 className='text-4xl font-black text-gray-900 mb-4'>
                        {t('success.title')}
                    </h2>
                    <p className='text-gray-600 text-lg mb-10 leading-relaxed'>
                        {t('success.subtitle')}
                    </p>

                    <div className='grid grid-cols-1 gap-4 mb-10'>
                        <a
                            href={finalPublicLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className='flex items-center justify-center gap-3 bg-[#BE2A55] text-white py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-lg'
                        >
                            <FileSignature className='w-6 h-6' />
                            {t('success.view_quote')}
                        </a>

                        {!emailSent ? (
                            <button
                                onClick={() => sendEmailToClient(showMessage)}
                                disabled={isSendingEmail}
                                className='flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all'
                            >
                                {isSendingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className='w-5 h-5' />}
                                {t('success.send_email')}
                            </button>
                        ) : (
                            <div className='flex items-center justify-center gap-2 text-green-600 font-bold py-4'>
                                <Check className='w-5 h-5' /> {t('success.email_sent')}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={resetForm}
                        className='flex items-center justify-center gap-2 mx-auto text-gray-400 font-bold hover:text-gray-600 transition-colors'
                    >
                        <RefreshCcw className='w-4 h-4' />
                        {t('success.new_quote')}
                    </button>
                </div>
            </div>
        );
    }

    if (isCheckingAvailability) {
        return (
            <div className='min-h-[450px] flex items-center justify-center p-6 bg-white rounded-3xl'>
                <div className='text-center space-y-6 animate-in fade-in duration-500'>
                    <Loader2 className="w-16 h-16 text-[#BE2A55] animate-spin mx-auto" />
                    <div>
                        <h3 className="text-2xl font-black text-gray-900">{t('step2.check.availability')}</h3>
                        <p className="text-gray-500 font-medium italic">
                            {t('step2.check.analysis', { date: formData.eventDate ? formData.eventDate.split('-').reverse().join('/') : "..." })}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-2 font-sans text-gray-900'>
            <div id="custom-alert" className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-xl z-50 hidden"></div>
            <div className='max-w-4xl mx-auto'>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center">
                    {isCalculatorMode ? 'Bonjour Héloïse et Cédric !' : isPartnerMode ? 'Devis Partenaires' : 'Devis Express Photobooth'}
                </h1>

                <div className='bg-white rounded-[2.5rem] shadow-2xl p-4 sm:p-10 border border-gray-100'>
                    <ProgressBar />

                    <div className="mt-4">
                        {currentStep === 1 && (
                            isPartnerMode
                                // Si vous avez un composant Step1Partenaires, assurez-vous qu'il accepte aussi t, lang, etc.
                                ? <Step1Partenaires formData={formData} setFormData={setFormData} customColor={customColor} isCalculatorMode={isCalculatorMode} />
                                : <Step1Event formData={formData} setFormData={setFormData} customColor={customColor} lang={lang} setLang={setLang} t={t} />
                        )}
                        {currentStep === 2 && <Step2Config formData={formData} setFormData={setFormData} customColor={customColor} pricingData={pricingData} isPartnerClient={isPartnerClient} t={t} />}
                        {currentStep === 3 && <Step3Contact formData={formData} setFormData={setFormData} customColor={customColor} t={t} />}
                    </div>

                    <div className='flex justify-between mt-12 pt-8 border-t border-gray-100'>
                        {currentStep > 1 ? (
                            <button onClick={handlePrev} className='px-6 py-3 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2'>
                                <ChevronLeft className='w-5 h-5' /> {t('nav.prev')}
                            </button>
                        ) : <div />}

                        <button
                            onClick={handleNavigationNext}
                            disabled={!isStepValid() || isSubmitting}
                            className={`px-10 py-4 rounded-2xl font-black transition-all duration-300 flex items-center gap-3 shadow-lg ${isStepValid() ? 'text-white hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            style={isStepValid() ? { backgroundColor: '#BE2A55' } : {}}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> {t('nav.submitting')}</>
                            ) : (
                                <>
                                    <span>
                                        {currentStep === 3
                                            ? (isCalculatorMode ? t('nav.generate') : t('nav.receiving'))
                                            : t('nav.next')}
                                    </span>
                                    <ChevronRight className='w-6 h-6' />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}