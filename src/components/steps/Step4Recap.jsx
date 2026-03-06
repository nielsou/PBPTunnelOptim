// src/components/steps/Step4Recap.jsx
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Loader2, CreditCard, Info, Check, Calculator, Percent } from 'lucide-react';
import { getStripePaymentUrl, checkPaymentStatus } from '../../services/axonautService';
import { COMPANY_SPECIFIC_PRICING } from '../../constants';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(amount);
};

export const Step4Recap = ({ formData, setFormData, customColor, pricingData, handleEditRequest, isSubmitting, onValidate, t, triggerWebhook, isPartnerMode, isCalculatorMode, handleSubmit, showMessage }) => {

    const getAddressSummary = (fullAddressString) => {
        if (!fullAddressString || typeof fullAddressString !== 'string') return t('step4.address_not_specified');
        return fullAddressString;
    };

    const [loadingPayment, setLoadingPayment] = useState(false);
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
    const [activeSource, setActiveSource] = useState(null);
    const pollingInterval = useRef(null);
    const pollingTimeout = useRef(null);



    // --- DÉBUT LOGIQUE CALCULETTE ---
    const TVA_RATE = 1.20;
    const baseTotalTTC = pricingData?.totalHT ? pricingData.totalHT * TVA_RATE : 0;

    const initialDiscount = formData.discountPercent || 0;
    const [discountPercent, setDiscountPercent] = useState(initialDiscount);
    const [finalPriceTTC, setFinalPriceTTC] = useState(baseTotalTTC * (1 - initialDiscount / 100));

    // Nouveaux états brouillons pour taper librement avant d'appliquer
    const [draftDiscount, setDraftDiscount] = useState(initialDiscount.toString());
    const [draftPrice, setDraftPrice] = useState((baseTotalTTC * (1 - initialDiscount / 100)).toFixed(2));
    const [inputMode, setInputMode] = useState('percent'); // Savoir quel champ a été modifié en dernier

    const isVipPartner = Object.keys(COMPANY_SPECIFIC_PRICING).includes(formData.companyId?.toString());
    const diffDays = Math.ceil((new Date(formData.eventDate) - new Date()) / (1000 * 60 * 60 * 24));
    const isUrgent = diffDays < 7;

    useEffect(() => {
        if (isCalculatorMode && setFormData) {
            if (isVipPartner) {
                setFormData(prev => ({ ...prev, acomptePct: 0 }));
            } else if (formData.acomptePct === undefined) {
                setFormData(prev => ({ ...prev, acomptePct: isUrgent ? 1 : 0.15 }));
            } else if (isUrgent && formData.acomptePct === 0.15) {
                setFormData(prev => ({ ...prev, acomptePct: 1 }));
            }
        }
    }, [isCalculatorMode, isVipPartner, isUrgent]); // eslint-disable-line react-hooks/exhaustive-deps

    // Fonction déclenchée par le bouton "Appliquer"
    const handleApplyDiscount = () => {
        let newDiscount = 0;
        let newPrice = baseTotalTTC;

        if (inputMode === 'percent') {
            let percent = parseFloat(draftDiscount);
            if (isNaN(percent)) percent = 0;
            percent = Math.max(0, Math.min(30, percent)); // Limite à 30%
            newDiscount = percent;
            newPrice = baseTotalTTC * (1 - percent / 100);
        } else {
            let price = parseFloat(draftPrice);
            if (isNaN(price)) price = baseTotalTTC;
            let percent = ((baseTotalTTC - price) / baseTotalTTC) * 100;
            percent = Math.max(0, Math.min(30, percent)); // Limite à 30%
            percent = Math.round(percent * 100) / 100;
            newDiscount = percent;
            newPrice = baseTotalTTC * (1 - percent / 100);
        }

        setDiscountPercent(newDiscount);
        setDraftDiscount(newDiscount.toString());
        setFinalPriceTTC(newPrice);
        setDraftPrice(newPrice.toFixed(2));

        if (setFormData) setFormData(prev => ({ ...prev, discountPercent: newDiscount }));
    };

    const handlePaymentTypeChange = (e) => {
        if (setFormData) setFormData(prev => ({ ...prev, acomptePct: parseFloat(e.target.value) }));
    };
    // --- FIN LOGIQUE CALCULETTE ---

    useEffect(() => {
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
            if (pollingTimeout.current) clearTimeout(pollingTimeout.current);
        };
    }, []);

    const handlePaymentClick = async (source) => {
        triggerWebhook(4, pricingData, null, false);
        setActiveSource(source);
        setLoadingPayment(true);

        const paymentWindow = window.open('', '_blank');

        if (!paymentWindow) {
            setLoadingPayment(false);
            alert("Votre navigateur a bloqué la page de paiement. Veuillez autoriser les pop-ups pour ce site.");
            return;
        }

        paymentWindow.document.write("<div style='font-family: sans-serif; text-align: center; margin-top: 20%; color: #BE2A55;'>Redirection vers le paiement sécurisé en cours...</div>");

        const result = await getStripePaymentUrl(formData.quotationUrl);

        if (result.success) {
            paymentWindow.location.href = result.url;
            setLoadingPayment(false);
            setIsCheckingPayment(true);

            pollingInterval.current = setInterval(async () => {
                const status = await checkPaymentStatus(formData.quotationUrl);
                if (status.paid) {
                    clearInterval(pollingInterval.current);
                    clearTimeout(pollingTimeout.current);
                    setIsCheckingPayment(false);
                    onValidate();
                }
            }, 5000);

            pollingTimeout.current = setTimeout(() => {
                if (pollingInterval.current) clearInterval(pollingInterval.current);
                setIsCheckingPayment(false);
                setActiveSource(null);
            }, 10000);

        } else {
            paymentWindow.close();
            setLoadingPayment(false);
            alert(t('step4.error.payment_link'));
        }
    };

    if (!pricingData || typeof pricingData.totalHT === 'undefined' || !pricingData.details) {
        return (
            <div className='flex flex-col items-center justify-center py-12 space-y-4'>
                <Loader2 className='w-8 h-8 animate-spin text-gray-400' />
                <span className='text-gray-500 font-medium'>{t('nav.calculating')}</span>
            </div>
        );
    }

    const { details, priceSuffix, axonautData } = pricingData;
    const activeAcomptePct = formData.acomptePct !== undefined ? formData.acomptePct : 0.15;

    // --- CALCUL DE L'ÉCONOMIE TOTALE (Lignes + Globale) ---
    const lineDiscountsHT = (axonautData?.remiseMateriel || 0) + (axonautData?.remiseImpression || 0);
    const lineDiscountsTTC = lineDiscountsHT * TVA_RATE;
    // ------------------------------------------------------

    // L'acompte se calcule sur le vrai prix final remisé
    const depositAmount = finalPriceTTC * activeAcomptePct;
    const isFullPayment = activeAcomptePct === 1;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-extrabold text-gray-900 border-b pb-4" style={{ color: customColor, borderColor: customColor }}>
                {t('step4.title')}
            </h2>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>

                {/* BLOC 1 : INFO CLIENT */}
                <div className='bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm'>
                    <h3 className='text-xl font-bold mb-6 text-gray-900'>{t('step4.client_details')}</h3>
                    <div className='space-y-4 text-gray-700 text-sm'>
                        <div className='flex justify-between border-b border-gray-200 pb-2'>
                            <span className='font-semibold'>{t('step4.label.contact')}</span>
                            <span>{formData.fullName}</span>
                        </div>
                        <div className='flex justify-between border-b border-gray-200 pb-2'>
                            <span className='font-semibold'>Email</span>
                            <span>{formData.email}</span>
                        </div>
                        <div className='flex justify-between border-b border-gray-200 pb-2'>
                            <span className='font-semibold'>{t('step3.phone')}</span>
                            <span>{formData.phone}</span>
                        </div>
                        {formData.isPro && (
                            <div className='flex justify-between border-b border-gray-200 pb-2'>
                                <span className='font-semibold'>{t('step4.label.company')}</span>
                                <span>{formData.companyName}</span>
                            </div>
                        )}
                        <div className='pt-2'>
                            <p className='font-semibold mb-1'>{t('step4.label.venue')}</p>
                            <p className='text-right text-gray-600'>{getAddressSummary(formData.deliveryFullAddress)}</p>
                        </div>
                        <div className='flex justify-between pt-2'>
                            <span className='font-semibold'>{t('step4.label.date')}</span>
                            <span>{new Date(formData.eventDate).toLocaleDateString('fr-FR')} ({formData.eventDuration} jours)</span>
                        </div>
                    </div>
                </div>

                {/* BLOC 2 : PRIX ET ACOMPTE */}
                <div className='flex flex-col gap-6'>
                    <div className='bg-white p-8 rounded-2xl shadow-xl border border-gray-100'>
                        <h3 className='text-xl font-bold mb-6 text-gray-900'>
                            {t('step4.order_title')} <span className='text-sm font-normal text-gray-500'>({priceSuffix})</span>
                        </h3>

                        <div className='space-y-4 mb-6'>
                            {details.map((item, index) => (
                                <div key={index} className='border-b border-gray-50 pb-3 last:border-0'>
                                    <div className='flex justify-between items-center text-sm'>
                                        <span className='text-gray-700 font-medium'>{item.label}</span>
                                        {item.originalDisplayPrice ? (
                                            <span className='line-through text-gray-400 font-medium whitespace-nowrap text-xs'>
                                                {item.originalDisplayPrice}
                                            </span>
                                        ) : (
                                            <span className='text-gray-900 font-bold whitespace-nowrap'>
                                                {item.displayPrice}
                                            </span>
                                        )}
                                    </div>

                                    {item.originalDisplayPrice && (
                                        <div className='flex justify-between items-center text-sm mt-1'>
                                            <span className='text-green-600 font-semibold text-xs flex items-center gap-1'>
                                                ↳ {t('step4.with_discount')}
                                            </span>
                                            <span className='text-gray-900 font-bold whitespace-nowrap'>
                                                {item.displayPrice}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className='bg-gray-50 -mx-8 -mb-8 p-8 rounded-b-2xl border-t border-gray-100'>

                            {/* ON AFFICHE LE PRIX DE BASE ICI */}
                            <div className={`flex justify-between items-center text-xl font-extrabold text-gray-900 ${lineDiscountsTTC > 0 ? 'mb-1' : 'mb-4'}`}>
                                <span>{t('step4.total_ttc')}</span>
                                <span>{formatCurrency(baseTotalTTC)}</span>
                            </div>

                            {lineDiscountsTTC > 0 && (
                                <div className='flex justify-between items-center text-sm font-bold text-green-600 mb-4 bg-green-50/50 px-3 py-1.5 rounded-lg -mx-3'>
                                    <span>{t('step4.total_discount')}</span>
                                    <span>-{formatCurrency(lineDiscountsTTC)}</span>
                                </div>
                            )}

                            {isCalculatorMode ? (
                                isUrgent && (
                                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="bg-amber-100 p-1.5 rounded-lg mt-0.5">
                                            <Info className="w-4 h-4 text-amber-700" />
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-amber-800 font-medium">
                                            Attention, l'événement a lieu dans moins de 7 jours. Le règlement intégral de la commande est fortement conseillé.
                                        </p>
                                    </div>
                                )
                            ) : (
                                isFullPayment && (
                                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="bg-amber-100 p-1.5 rounded-lg mt-0.5">
                                            <Info className="w-4 h-4 text-amber-700" />
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-amber-800 font-medium">
                                            {t('step4.notice.full_payment')}
                                        </p>
                                    </div>
                                )
                            )}

                            {!(isPartnerMode || isCalculatorMode) ? (
                                <button
                                    onClick={() => handlePaymentClick('block')}
                                    disabled={isSubmitting || loadingPayment || isCheckingPayment}
                                    className="w-full text-left group relative bg-pink-50 border-2 border-[#BE2A55] rounded-xl p-4 shadow-sm hover:shadow-md hover:bg-pink-100 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <div className="text-center">
                                        {(activeSource === 'block' && (loadingPayment || isCheckingPayment)) ? (
                                            <div className="flex flex-col items-center py-2 animate-pulse">
                                                <Loader2 className="w-8 h-8 animate-spin text-[#BE2A55] mb-2" />
                                                <p className="text-[#BE2A55] font-black text-sm uppercase tracking-wide">
                                                    {t('step4.checking_payment')}
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-[#BE2A55] font-bold text-sm uppercase tracking-wide mb-1 flex items-center justify-center gap-2">
                                                    {isFullPayment ? t('step4.payment.full_title') : t('step4.payment.deposit_title', { pct: activeAcomptePct * 100 })}
                                                </p>
                                                <p className="text-3xl font-black text-[#BE2A55]">{formatCurrency(depositAmount)}</p>
                                                <p className="text-xs text-pink-700 mt-1 italic group-hover:underline">
                                                    {isFullPayment ? t('step4.payment.full_click') : t('step4.payment.deposit_click')}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </button>
                            ) : (
                                <button
                                    onClick={async () => {
                                        try {
                                            if (isCalculatorMode) {
                                                await handleSubmit(showMessage, true);
                                                onValidate();
                                            } else if (isPartnerMode) {
                                                await handleSubmit(showMessage, false);
                                                onValidate();
                                            }
                                        } catch (error) {
                                            // HandleSubmit gère l'erreur
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    className="w-full mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-center hover:bg-blue-100 hover:border-blue-300 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <div className="flex flex-col items-center py-2 animate-pulse">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-800 mb-2" />
                                            <p className="text-blue-800 font-black text-sm uppercase tracking-wide">
                                                {t('nav.submitting')}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-blue-800 font-bold uppercase tracking-wide text-sm mb-1">
                                                {isCalculatorMode ? "Validation Interne" : "Paiement Partenaire"}
                                            </p>
                                            <p className="text-blue-600 text-xs mt-1 italic group-hover:underline">
                                                {isCalculatorMode ? "Cliquez ici pour générer le devis dans Axonaut (sans email)" : "Cliquez ici pour valider (règlement à 30 jours)"}
                                            </p>
                                        </>
                                    )}
                                </button>
                            )}

                            {!isFullPayment && (
                                <p className="text-xs text-gray-400 text-center mt-3">
                                    {t('step4.balance_notice')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ENCART : OPTIONS COMMERCIAUX --- */}
            {isCalculatorMode && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-8 mt-8 shadow-sm">
                    <h3 className="font-black text-blue-900 text-xl mb-6 flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-blue-600" /> Options Commerciaux
                    </h3>

                    {/* SOUS-BLOC 1 : REMISE ET APPLICATION */}
                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-blue-900">Remise (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={draftDiscount}
                                        onChange={(e) => {
                                            setDraftDiscount(e.target.value);
                                            setInputMode('percent');
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                                        className="w-full px-4 py-3 pr-10 rounded-xl border border-blue-200 focus:ring-4 focus:ring-blue-100 font-bold text-gray-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <Percent className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-blue-900">Total après remise (TTC)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={draftPrice}
                                        onChange={(e) => {
                                            setDraftPrice(e.target.value);
                                            setInputMode('price');
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                                        className="w-full px-4 py-3 pr-10 rounded-xl border border-blue-200 focus:ring-4 focus:ring-blue-100 font-bold text-gray-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="absolute right-4 top-3.5 font-bold text-gray-400 pointer-events-none">€</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleApplyDiscount}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" /> Appliquer la remise
                        </button>

                        {/* WARNING TICKET AXONAUT */}
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <Info className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-[12px] leading-relaxed text-red-800 font-bold">
                                ⚠️ Un ticket de support est en attente chez Axonaut : la remise globale n'est pas encore prise en compte sur le devis final généré.
                            </p>
                        </div>

                        {/* CHAMP COMMENTAIRE DYNAMIQUE */}
                        {discountPercent > 0 && (
                            <div className="space-y-2 mt-4 pt-4 border-t border-gray-100 animate-in fade-in">
                                <label className="text-sm font-bold text-blue-900">Commentaire de la remise (affiché sur le devis)</label>
                                <textarea
                                    value={formData.discountComment || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, discountComment: e.target.value }))}
                                    placeholder="Ex: Remise fidélité suite à nos échanges téléphoniques..."
                                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:ring-4 focus:ring-blue-100 font-medium text-gray-900 outline-none resize-none"
                                    rows="2"
                                />
                            </div>
                        )}
                    </div>

                    {/* SOUS-BLOC 2 : CONDITIONS DE RÈGLEMENT */}
                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-blue-900">Conditions de règlement</label>
                            <p className="text-xs text-gray-500 mb-2">Totalement indépendant du calcul de la remise ci-dessus.</p>
                            <select
                                value={formData.acomptePct !== undefined ? formData.acomptePct : (isUrgent ? 1 : 0.15)}
                                onChange={handlePaymentTypeChange}
                                disabled={isVipPartner}
                                className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:ring-4 focus:ring-blue-100 font-bold text-gray-900 outline-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value={1}>Paiement 100% à la commande</option>
                                <option value={0}>Paiement à 30 jours (0%)</option>
                                {!isUrgent && <option value={0.15}>Acompte 15% (Standard)</option>}
                            </select>
                        </div>
                    </div>

                </div>
            )}

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
                    <span>{t('step4.edit')}</span>
                </button>

                <button
                    onClick={async () => {
                        try {
                            if (isCalculatorMode) {
                                await handleSubmit(showMessage, true);
                                onValidate();
                            } else if (isPartnerMode) {
                                await handleSubmit(showMessage, false);
                                onValidate();
                            } else {
                                handlePaymentClick('main');
                            }
                        } catch (error) {
                            // Erreur gérée dans handleSubmit
                        }
                    }}
                    disabled={isSubmitting || loadingPayment || isCheckingPayment}
                    className="w-full md:w-auto px-10 py-4 bg-[#BE2A55] text-white rounded-xl font-black flex items-center justify-center gap-3 shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting || (activeSource === 'main' && (loadingPayment || isCheckingPayment)) ? (
                        <>
                            <Loader2 className='w-6 h-6 animate-spin' />
                            <span>{(isPartnerMode || isCalculatorMode) ? t('nav.submitting') : t('step4.checking_payment')}</span>
                        </>
                    ) : (
                        <>
                            <Check className='w-6 h-6' />
                            <span>{isCalculatorMode ? "Générer le devis" : isPartnerMode ? "Valider la commande" : (isFullPayment ? t('step4.payment.btn_full') : t('step4.payment.btn_deposit'))}</span>
                        </>
                    )}
                </button>
            </div>
            {!isFullPayment && (
                <p className="text-xs text-gray-400 text-center mt-3">
                    {t('step4.balance_notice')}
                </p>
            )}
        </div>
    );
};