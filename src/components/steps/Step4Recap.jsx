import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Loader2, CreditCard, Info } from 'lucide-react';
import { getStripePaymentUrl, checkPaymentStatus } from '../../services/axonautService';

// Fonction utilitaire pour formater les devises
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(amount);
};

const getAddressSummary = (fullAddressString) => {
    if (!fullAddressString || typeof fullAddressString !== 'string') return "Adresse non spécifiée.";
    return fullAddressString;
};

export const Step4Recap = ({ formData, customColor, pricingData, handleEditRequest, isSubmitting, onValidate, t }) => {

    const [loadingPayment, setLoadingPayment] = useState(false);
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
    const pollingInterval = useRef(null);

    // Nettoyage de sécurité si l'utilisateur quitte la page
    useEffect(() => {
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, []);

    const handlePaymentClick = async () => {
        setLoadingPayment(true);
        const result = await getStripePaymentUrl(formData.quotationUrl);

        if (result.success) {
            // 1. Ouvrir Stripe dans un nouvel onglet
            window.open(result.url, '_blank');
            setLoadingPayment(false);

            // 2. Activer l'overlay de vérification
            setIsCheckingPayment(true);

            // 3. Lancer la boucle de polling
            pollingInterval.current = setInterval(async () => {
                console.log("🔍 Vérification du paiement...");
                const status = await checkPaymentStatus(formData.quotationUrl);

                if (status.paid) {
                    console.log("✅ Paiement confirmé !");
                    clearInterval(pollingInterval.current);
                    setIsCheckingPayment(false);
                    onValidate(); // Déclenche le passage à la Step 5
                }
            }, 5000); // 5 secondes
        } else {
            setLoadingPayment(false);
            alert("Erreur lors de la récupération du lien de paiement.");
        }
    };

    if (!pricingData || typeof pricingData.totalHT === 'undefined' || !pricingData.details) {
        return (
            <div className='flex flex-col items-center justify-center py-12 space-y-4'>
                <Loader2 className='w-8 h-8 animate-spin text-gray-400' />
                <span className='text-gray-500 font-medium'>Calcul du devis en cours...</span>
            </div>
        );
    }

    const { details, totalHT, displayTTC, priceSuffix } = pricingData;
    const TVA_RATE = 1.20;
    const activeAcomptePct = formData.acomptePct !== undefined ? formData.acomptePct : 0.1;
    const finalTotalTTC = totalHT * TVA_RATE;
    const tvaAmount = finalTotalTTC - totalHT;

    // Calcul de l'acompte exact
    const depositAmount = finalTotalTTC * activeAcomptePct;
    const isFullPayment = activeAcomptePct === 1;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-extrabold text-gray-900 border-b pb-4" style={{ color: customColor, borderColor: customColor }}>
                Récapitulatif et Validation
            </h2>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>

                {/* BLOC 1 : INFO CLIENT */}
                <div className='bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm'>
                    <h3 className='text-xl font-bold mb-6 text-gray-900'>Vos coordonnées</h3>
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
                            <div className='flex justify-between border-b border-gray-200 pb-2'>
                                <span className='font-semibold'>Société</span>
                                <span>{formData.companyName}</span>
                            </div>
                        )}
                        <div className='pt-2'>
                            <p className='font-semibold mb-1'>Lieu de l'événement</p>
                            <p className='text-right text-gray-600'>{getAddressSummary(formData.deliveryFullAddress)}</p>
                        </div>
                        <div className='flex justify-between pt-2'>
                            <span className='font-semibold'>Date</span>
                            <span>{new Date(formData.eventDate).toLocaleDateString('fr-FR')} ({formData.eventDuration} jours)</span>
                        </div>
                    </div>
                </div>

                {/* BLOC 2 : PRIX ET ACOMPTE */}
                <div className='flex flex-col gap-6'>
                    <div className='bg-white p-8 rounded-2xl shadow-xl border border-gray-100'>
                        <h3 className='text-xl font-bold mb-6 text-gray-900'>
                            Votre commande <span className='text-sm font-normal text-gray-500'>({priceSuffix})</span>
                        </h3>

                        <div className='space-y-4 mb-6'>
                            {details.map((item, index) => (
                                <div key={index} className='flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0'>
                                    <span className='text-gray-700 font-medium'>{item.label}</span>
                                    <span className='text-gray-900 font-bold whitespace-nowrap'>{item.displayPrice}</span>
                                </div>
                            ))}
                        </div>

                        {/* Zone Total & Acompte */}
                        <div className='bg-gray-50 -mx-8 -mb-8 p-8 rounded-b-2xl border-t border-gray-100'>
                            <div className='flex justify-between items-center text-xl font-extrabold text-gray-900 mb-4'>
                                <span>Total TTC</span>
                                <span>{formatCurrency(finalTotalTTC)}</span>
                            </div>

                            {/* --- AJOUT : NOTIFICATION RÈGLEMENT TOTAL --- */}
                            {isFullPayment && (
                                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="bg-amber-100 p-1.5 rounded-lg mt-0.5">
                                        <Info className="w-4 h-4 text-amber-700" />
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-amber-800 font-medium">
                                        {t('step4.notice.full_payment')}
                                    </p>
                                </div>
                            )}

                            {/* --- BOUTON DE PAIEMENT --- */}
                            <button
                                onClick={handlePaymentClick}
                                // Ajoute isCheckingPayment ici
                                disabled={isSubmitting || loadingPayment || isCheckingPayment}
                                className="w-full text-left group relative bg-pink-50 border-2 border-[#BE2A55] rounded-xl p-4 shadow-sm hover:shadow-md hover:bg-pink-100 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {/* ... icône ... */}
                                <div className="text-center">
                                    <p className="text-[#BE2A55] font-bold text-sm uppercase tracking-wide mb-1 flex items-center justify-center gap-2">
                                        {isFullPayment ? "Règlement de la commande (100%)" : `Acompte à régler (${activeAcomptePct * 100}%)`}
                                    </p>
                                    <p className="text-3xl font-black text-[#BE2A55]">
                                        {formatCurrency(depositAmount)}
                                    </p>
                                    <p className="text-xs text-pink-700 mt-1 italic group-hover:underline">
                                        {loadingPayment ? "Chargement du paiement..." : (isFullPayment ? "Cliquez ici pour régler la totalité" : "Cliquez ici pour régler l'acompte")}
                                    </p>
                                </div>
                            </button>

                            {!isFullPayment && (
                                <p className="text-xs text-gray-400 text-center mt-3">
                                    Le solde sera dû 10 jours avant l'événement
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOC 3 : ET APRÈS ? */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-8">
                <h3 className="font-black text-gray-900 text-xl mb-6 text-center">
                    {t('success.step2.title')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((num) => {
                        const emojis = { 1: '🚚', 2: '🎨', 3: '💳' };
                        return (
                            <div key={num} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center text-center">
                                <div className="text-3xl mb-3">{emojis[num]}</div>
                                <div className="mb-2">
                                    <span className="font-black text-gray-900 text-base leading-tight">
                                        {t(`success.step2.item${num}.title`)}
                                    </span>
                                </div>
                                <p className="text-gray-600 leading-snug font-medium text-sm">
                                    {t(`success.step2.item${num}.text`)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* BOUTONS D'ACTION */}
            <div className='flex flex-col md:flex-row justify-between items-center gap-4 pt-4'>
                <button
                    onClick={handleEditRequest}
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-6 py-4 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center space-x-2"
                >
                    <ChevronLeft className='w-5 h-5' />
                    <span>Modifier</span>
                </button>

                <button
                    onClick={handlePaymentClick}
                    // On désactive si une action est déjà en cours
                    disabled={isSubmitting || loadingPayment || isCheckingPayment}
                    className="w-full md:w-auto px-10 py-4 bg-[#BE2A55] text-white rounded-xl font-black flex items-center justify-center gap-3 shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loadingPayment ? (
                        <Loader2 className='w-6 h-6 animate-spin' />
                    ) : (
                        <CreditCard className='w-6 h-6' />
                    )}
                    <span>
                        {loadingPayment
                            ? "Chargement Stripe..."
                            : (isFullPayment ? "Régler la commande" : "Payer l'acompte") // Texte dynamique ici
                        }
                    </span>
                </button>
            </div>
            {!isFullPayment && (
                <p className="text-xs text-gray-400 text-center mt-3">
                    Le solde sera dû 10 jours avant l'événement
                </p>
            )}
        </div>
    );
};