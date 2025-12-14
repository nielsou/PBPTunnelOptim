// src/components/steps/Step4Recap.jsx

import React from 'react';
import { Check, ChevronLeft, Loader2 } from 'lucide-react'; // Ajout Loader2

// ... (Garder les helpers formatPrice, DetailLinePrice, DetailLineTVA, getAddressSummary inchangés) ...
const formatPrice = (price) => new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
}).format(price);

const DetailLinePrice = ({ label, priceHT, isTotal = false, isTTCDisplay = false }) => {
    const TVA_RATE_LOCAL = 1.20; 
    let priceToDisplay = priceHT;
    if (isTTCDisplay && !isTotal) { 
        priceToDisplay = priceHT * TVA_RATE_LOCAL;
    }
    const finalPriceToDisplay = isTotal ? priceHT : priceToDisplay; 
    return (
        <div className={`flex justify-between items-center py-2 ${isTotal ? 'border-t-2 border-dashed border-gray-400 font-bold text-lg pt-4' : 'border-b border-gray-100'}`}>
            <span className={isTotal ? 'text-gray-900' : 'text-gray-600'}>{label}</span>
            <span className={isTotal ? 'text-gray-900' : 'text-gray-800'}>
                {formatPrice(finalPriceToDisplay)}
            </span>
        </div>
    );
};

const DetailLineTVA = ({ label, totalHT }) => {
    const TVA_RATE_LOCAL = 1.20; 
    const tvaAmount = totalHT * (TVA_RATE_LOCAL - 1);
    return (
        <div className={`flex justify-between items-center py-2 border-b border-gray-100`}>
            <span className={'text-gray-600'}>{label}</span>
            <span className={'text-gray-800'}>{formatPrice(tvaAmount)}</span>
        </div>
    );
};

const getAddressSummary = (fullAddressString) => {
    if (!fullAddressString || typeof fullAddressString !== 'string') return "Adresse non spécifiée."; 
    return fullAddressString;
};

// AJOUT prop : isSubmitting
export const Step4Recap = ({ formData, customColor, pricingData, handleSubmit, handleEditRequest, showMessage, isSubmitting }) => {
    
    // ... (Le début du composant reste identique pour les calculs) ...
    if (!pricingData || typeof pricingData.totalHT === 'undefined' || !pricingData.axonautData) {
        return <div className='text-center py-10 text-gray-500'>Calcul des prix en cours...</div>;
    }
    const TVA_RATE_LOCAL = 1.20; 
    const totalHT = pricingData.totalHT;
    const totalTTC = totalHT * TVA_RATE_LOCAL;
    const priceSuffix = pricingData.priceSuffix;
    const isTTCDisplay = pricingData.displayTTC;
    
    const { 
        nomBorne, prixMateriel: prixMaterielHT, prixTemplate: prixTemplateHT, 
        prixLivraison: prixLivraisonHT, supplementKilometrique: supplementKilometriqueHT, 
        supplementLivraisonDifficile: supplementLivraisonDifficileHT, supplementImpression: supplementImpressionHT, 
        supplementAnimation: supplementAnimationHT, distanceKm, nombreTirages, heuresAnimations
    } = pricingData.axonautData;

    // ... (Garder renderSupplements inchangé) ...
    const renderSupplements = () => {
        const supplements = [];
        const totalSupplementsHT = supplementKilometriqueHT + supplementLivraisonDifficileHT + supplementImpressionHT + supplementAnimationHT;

        if (supplementKilometriqueHT > 0) supplements.push(<DetailLinePrice key="kilo" label={`Supplément kilométrage (${Math.round(distanceKm)} km)`} priceHT={supplementKilometriqueHT} isTTCDisplay={isTTCDisplay} />);
        if (supplementLivraisonDifficileHT > 0) supplements.push(<DetailLinePrice key="diff" label="Supplément livraison (accès difficile)" priceHT={supplementLivraisonDifficileHT} isTTCDisplay={isTTCDisplay} />);
        if (supplementImpressionHT > 0) supplements.push(<DetailLinePrice key="imp" label={`Supplément impressions (${nombreTirages} ex.)`} priceHT={supplementImpressionHT} isTTCDisplay={isTTCDisplay} />);
        if (supplementAnimationHT > 0) supplements.push(<DetailLinePrice key="anim" label={`Supplément animation (${heuresAnimations}h)`} priceHT={supplementAnimationHT} isTTCDisplay={isTTCDisplay} />);
        if(!isTTCDisplay && totalSupplementsHT > 0) supplements.push(<div key="totalSuppHT" className="flex justify-between text-sm font-bold pt-2 border-t border-dashed mt-2 text-gray-700"><span>Total Coûts Uniques HT</span><span>{formatPrice(totalSupplementsHT)}</span></div>);
        return supplements;
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900" style={{ color: customColor }}>
                4. Récapitulatif et Validation
            </h2>

            <p className='text-lg text-gray-700'>
                Veuillez vérifier les informations ci-dessous avant de générer votre devis.
            </p>

            {/* ... (La grid des détails reste identique) ... */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div className='bg-gray-50 p-6 rounded-xl shadow-inner'>
                    <h3 className='text-xl font-semibold mb-4 text-gray-900'>Vos informations</h3>
                    <div className='space-y-3 text-gray-700 text-sm'>
                        <p><strong>Nom et Prénom:</strong> {formData.fullName}</p>
                        <p><strong>Email:</strong> {formData.email}</p>
                        <p><strong>Téléphone:</strong> {formData.phone}</p>
                        {formData.isPro && (<><p><strong>Nom de l'entreprise:</strong> {formData.companyName || 'Non spécifié'}</p><p><strong>Adresse de facturation:</strong> {getAddressSummary(formData.billingFullAddress)}</p></>)}
                        <p className='pt-2 border-t border-gray-200'><strong>Adresse de l'événement:</strong> {getAddressSummary(formData.deliveryFullAddress)}</p>
                        <p><strong>Date de l'événement:</strong> {new Date(formData.eventDate).toLocaleDateString('fr-FR')}</p>
                        <p><strong>Durée (Jours):</strong> {formData.eventDuration} jours</p>
                    </div>
                </div>

                <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-100'>
                    <h3 className='text-xl font-semibold mb-4 text-gray-900'>Détails du Devis ({priceSuffix})</h3>
                    <div className='divide-y divide-gray-100'>
                        <DetailLinePrice label={`Location : ${nomBorne}`} priceHT={prixMaterielHT} isTTCDisplay={isTTCDisplay} />
                        <DetailLinePrice label="Template Photo" priceHT={prixTemplateHT} isTTCDisplay={isTTCDisplay} />
                        <DetailLinePrice label="Logistique & Frais de base" priceHT={prixLivraisonHT} isTTCDisplay={isTTCDisplay} />
                        {renderSupplements()}
                        {!isTTCDisplay && <DetailLineTVA label="TVA (20%)" totalHT={totalHT} />}
                        <div className="text-right text-sm text-gray-500 mt-1 pt-3 border-t border-dashed">Total HT: {formatPrice(totalHT)}</div>
                        <DetailLinePrice label={`Total ${priceSuffix} (Acompte 100% encaissé)`} priceHT={totalTTC} isTotal={true} />
                    </div>
                </div>
            </div>

            <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mt-6'>
                <button
                    onClick={handleEditRequest}
                    disabled={isSubmitting} // Désactivé pendant l'envoi
                    className={`w-full md:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-800 hover:bg-gray-100 transition-colors flex items-center space-x-2 shadow-sm justify-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <ChevronLeft className='w-5 h-5' />
                    <span>Modifier les informations</span>
                </button>

                {/* MODIFICATION : Bouton avec état de chargement */}
                <button
                    onClick={() => handleSubmit(showMessage)} 
                    disabled={isSubmitting}
                    className={`w-full md:w-auto bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-xl shadow-xl transition-all duration-200 flex items-center justify-center space-x-3 
                    ${isSubmitting ? 'opacity-80 cursor-wait' : 'hover:bg-green-700 hover:scale-[1.01]'}`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className='w-6 h-6 animate-spin' />
                            <span>Génération du devis en cours...</span>
                        </>
                    ) : (
                        <>
                            <Check className='w-6 h-6' />
                            <span>Confirmer et recevoir le devis par email</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};