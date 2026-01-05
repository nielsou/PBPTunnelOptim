// src/components/steps/Step4Recap.jsx

import React from 'react';
import { Check, ChevronLeft, Loader2 } from 'lucide-react';
import { pushToDataLayer } from '../../services/gtmService';

// Fonction utilitaire pour formater les totaux calculés (TVA, Total final)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(amount);
};

// Helper pour afficher proprement l'adresse
const getAddressSummary = (fullAddressString) => {
    if (!fullAddressString || typeof fullAddressString !== 'string') return "Adresse non spécifiée.";
    return fullAddressString;
};

export const Step4Recap = ({ formData, customColor, pricingData, handleSubmit, handleEditRequest, showMessage, isSubmitting }) => {

    // Sécurité : Si les données de prix ne sont pas encore prêtes
    if (!pricingData || typeof pricingData.totalHT === 'undefined' || !pricingData.details) {
        return (
            <div className='flex flex-col items-center justify-center py-12 space-y-4'>
                <Loader2 className='w-8 h-8 animate-spin text-gray-400' />
                <span className='text-gray-500 font-medium'>Calcul du devis en cours...</span>
            </div>
        );
    }

    const { details, totalHT, displayTTC, priceSuffix } = pricingData;
    const TVA_RATE = 1.20; // 20%

    // Calculs des totaux finaux
    const finalTotalTTC = totalHT * TVA_RATE;
    const tvaAmount = finalTotalTTC - totalHT;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-extrabold text-gray-900 border-b pb-4" style={{ color: customColor, borderColor: customColor }}>
                4. Récapitulatif et Validation
            </h2>

            <p className='text-lg text-gray-600'>
                Veuillez vérifier l'exactitude des informations ci-dessous avant de valider votre demande.
            </p>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>

                {/* BLOC 1 : INFORMATIONS CLIENT */}
                <div className='bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm'>
                    <h3 className='text-xl font-bold mb-6 text-gray-900 flex items-center'>
                        Vos coordonnées
                    </h3>
                    <div className='space-y-4 text-gray-700 text-sm'>
                        <div className='flex justify-between border-b border-gray-200 pb-2'>
                            <span className='font-semibold'>Contact</span>
                            <span>{formData.fullName}</span>
                        </div>
                        <div className='flex justify-between border-b border-gray-200 pb-2'>
                            <span className='font-semibold'>Email</span>
                            <span>{formData.email}</span>
                        </div>
                        <div className='flex justify-between border-b border-gray-200 pb-2'>
                            <span className='font-semibold'>Téléphone</span>
                            <span>{formData.phone}</span>
                        </div>

                        {formData.isPro && (
                            <>
                                <div className='flex justify-between border-b border-gray-200 pb-2'>
                                    <span className='font-semibold'>Société</span>
                                    <span>{formData.companyName || 'Non spécifié'}</span>
                                </div>
                                <div className='border-b border-gray-200 pb-2'>
                                    <p className='font-semibold mb-1'>Adresse de facturation</p>
                                    <p className='text-right text-gray-600'>{getAddressSummary(formData.billingFullAddress)}</p>
                                </div>
                            </>
                        )}

                        <div className='pt-2'>
                            <p className='font-semibold mb-1'>Lieu de l'événement</p>
                            <p className='text-right text-gray-600'>{getAddressSummary(formData.deliveryFullAddress)}</p>
                        </div>
                        <div className='flex justify-between pt-2'>
                            <span className='font-semibold'>Date & Durée</span>
                            <span>{new Date(formData.eventDate).toLocaleDateString('fr-FR')} ({formData.eventDuration} jours)</span>
                        </div>
                    </div>
                </div>

                {/* BLOC 2 : DÉTAILS DU PRIX (DYNAMIQUE) */}
                <div className='bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-between'>
                    <div>
                        <h3 className='text-xl font-bold mb-6 text-gray-900'>
                            Détails du Devis <span className='text-sm font-normal text-gray-500'>({priceSuffix})</span>
                        </h3>

                        {/* Liste dynamique basée sur 'details' provenant du hook */}
                        <div className='space-y-4 mb-6'>
                            {details.map((item, index) => (
                                <div key={index} className='flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0'>
                                    <span className='text-gray-700 font-medium'>{item.label}</span>
                                    {/* On utilise displayPrice comme demandé */}
                                    <span className='text-gray-900 font-bold whitespace-nowrap'>{item.displayPrice}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section Totaux */}
                    <div className='bg-gray-50 -mx-8 -mb-8 p-8 rounded-b-2xl border-t border-gray-100'>
                        {/* Affichage PRO (HT + TVA + TTC) */}
                        {!displayTTC ? (
                            <div className='space-y-2'>
                                <div className='flex justify-between items-center text-gray-600'>
                                    <span>Total HT</span>
                                    <span className='font-semibold'>{formatCurrency(totalHT)}</span>
                                </div>
                                <div className='flex justify-between items-center text-gray-600'>
                                    <span>TVA (20%)</span>
                                    <span className='font-semibold'>{formatCurrency(tvaAmount)}</span>
                                </div>
                                <div className='flex justify-between items-center text-xl font-extrabold text-gray-900 pt-3 border-t border-gray-200 mt-2'>
                                    <span>Total TTC</span>
                                    <span>{formatCurrency(finalTotalTTC)}</span>
                                </div>
                            </div>
                        ) : (
                            /* Affichage PARTICULIER (Total TTC direct) */
                            <div className='flex justify-between items-center text-xl font-extrabold text-gray-900'>
                                <span>Total TTC</span>
                                <span>{formatCurrency(finalTotalTTC)}</span>
                            </div>
                        )}

                        <p className='text-xs text-center text-gray-400 mt-4 italic'>
                            Acompte de 100% demandé à la commande
                        </p>
                    </div>
                </div>
            </div>

            {/* BOUTONS D'ACTION */}
            <div className='flex flex-col md:flex-row justify-between items-center gap-4 mt-8'>
                <button
                    onClick={handleEditRequest}
                    disabled={isSubmitting}
                    className={`w-full md:w-auto px-6 py-4 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center space-x-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <ChevronLeft className='w-5 h-5' />
                    <span>Modifier</span>
                </button>

                <button
                    onClick={() => {
                        pushToDataLayer({
                            'event': 'quote_validation',
                            'total_ht': pricingData.totalHT
                        });
                        handleSubmit(showMessage);
                    }}

                    disabled={isSubmitting}
                    className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all transform flex items-center justify-center space-x-3 
                    ${isSubmitting
                            ? 'bg-gray-400 cursor-wait'
                            : 'bg-green-600 hover:bg-green-700 hover:scale-[1.02] hover:shadow-xl'
                        }`}
                    style={!isSubmitting ? { backgroundColor: customColor } : {}}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className='w-6 h-6 animate-spin' />
                            <span>Finalisation...</span>
                        </>
                    ) : (
                        <>
                            <Check className='w-6 h-6' />
                            <span>Je valide ma demande</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};