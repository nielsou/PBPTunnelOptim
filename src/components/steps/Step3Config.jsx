// src/components/steps/Step3Config.jsx

import React, { useEffect } from 'react';
import { Settings, Wand2, Truck, Check } from 'lucide-react';
import { TVA_RATE, BASE_PRICE_PRO_HT, PLANCHER_PRICE_PRO_HT_USER_FIX, P360_EXTRA_ANIMATION_HOUR_PRICE_HT, TEMPLATE_TOOL_PRO_PRICE_HT } from '../../constants';

export const Step3Config = ({ formData, setFormData, customColor, pricingData }) => {

    if (!pricingData || typeof pricingData.priceSuffix === 'undefined') {
        return <div className='text-center py-10 text-gray-500'>Chargement des configurations...</div>;
    }

    // Récupération des données et des prix unitaires dynamiques
    const { priceSuffix, unitaryPrices } = pricingData;

    const priceTransformer = (priceHT) => (priceSuffix === 'TTC' ? (priceHT * TVA_RATE) : priceHT);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // --- LOGIQUE TEMPLATE (GRATUITÉ & AUTOMATISATION) ---
    const isPro = formData.isPro;
    // On récupère le prix dynamique s'il existe, sinon le prix standard
    const templatePrice = unitaryPrices ? unitaryPrices.template : TEMPLATE_TOOL_PRO_PRICE_HT;
    
    // L'option est gratuite si : c'est un Particulier OU le prix Pro négocié est 0
    const isFreeTemplate = !isPro || (isPro && templatePrice === 0);

    // Effet : Si gratuit, on force la case cochée automatiquement
    useEffect(() => {
        if (isFreeTemplate && !formData.templateTool) {
            setFormData(prev => ({ ...prev, templateTool: true }));
        }
    }, [isFreeTemplate, formData.templateTool, setFormData]);

    const TemplateOption = () => {
        const displayPrice = isFreeTemplate
            ? 'Inclus (Offert)'
            : `+${priceTransformer(templatePrice).toFixed(0)}€ ${priceSuffix}`;

        return (
            <div className={`flex flex-col space-y-2 p-4 rounded-xl border shadow-sm transition-colors ${
                isFreeTemplate ? 'bg-gray-100 border-gray-300 opacity-80' : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
            }`}>
                <div className='flex items-center space-x-3'>
                    <input
                        type='checkbox'
                        id='templateTool'
                        // Si gratuit, on force à true et on désactive le clic
                        checked={isFreeTemplate ? true : formData.templateTool}
                        disabled={isFreeTemplate}
                        onChange={(e) => !isFreeTemplate && handleChange('templateTool', e.target.checked)}
                        className={`w-5 h-5 rounded-md border-gray-400 ${
                            isFreeTemplate ? 'text-gray-500 cursor-not-allowed bg-gray-200' : 'text-indigo-600 focus:ring-indigo-500 cursor-pointer'
                        }`}
                    />
                    <label 
                        htmlFor='templateTool' 
                        className={`flex-1 text-sm font-semibold flex items-center space-x-2 ${
                            isFreeTemplate ? 'text-gray-600 cursor-not-allowed' : 'text-gray-800 cursor-pointer'
                        }`}
                    >
                        <Wand2 className='w-4 h-4 mr-2' />
                        <span>Outil Template (Personnalisation Avancée)</span>
                    </label>
                    <span className={`text-base font-bold ${isFreeTemplate ? 'text-green-600' : 'text-indigo-600'}`}>
                        {displayPrice}
                    </span>
                </div>
                <p className='text-xs text-gray-600 pl-8'>
                    Créez votre propre arrière-plan, ajoutez votre logo et personnalisez les couleurs.
                </p>
            </div>
        );
    };

    // --- BLOC ÉCO ---
    if (formData.needType === 'eco') {
        const ecoModels = [
            { id: 'numerique', name: 'CineBooth Numérique', priceHT: 245, desc: 'Envoi numérique des photos et vidéos.' },
            { id: '150', name: 'CineBooth 150 impressions', priceHT: 329, desc: '150 impressions incluses.' },
            { id: '300', name: 'CineBooth 300 impressions', priceHT: 370, desc: '300 impressions incluses.' },
            { 
                id: 'illimite', 
                name: 'StarBooth Pro - Illimité', 
                // ✅ PRIX DYNAMIQUE : Utilise le tarif négocié ou le défaut (425.83)
                priceHT: unitaryPrices?.illimite ?? 425.83, 
                desc: "Impressions illimitées." 
            },
        ];

        const currentModel = ecoModels.find(m => m.id === formData.model);
        const baseDeliveryPriceHT = currentModel ? (currentModel.id === 'illimite' ? 70 : 50) : 0;
        const setupPriceHT = 20;
        const deliveryNosetupDisplay = `${priceTransformer(baseDeliveryPriceHT).toFixed(0)}€ ${priceSuffix}`;
        const deliveryWithSetupDisplay = `${priceTransformer(baseDeliveryPriceHT + setupPriceHT).toFixed(0)}€ ${priceSuffix}`;

        return (
            <div className='space-y-8'>
                <h2 className='text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2' style={{ color: customColor, borderColor: customColor }}>
                    Configuration - Formule Économique (Prix en {priceSuffix})
                </h2>

                <div>
                    <label className='block text-lg font-bold text-gray-900 mb-4'>Modèle <span className='text-red-500'>*</span></label>
                    <div className='space-y-3'>
                        {ecoModels.map(item => (
                            <button
                                key={item.id}
                                type='button'
                                onClick={() => handleChange('model', item.id)}
                                className={`w-full p-4 border-2 rounded-xl transition-all text-left flex flex-col ${formData.model === item.id
                                    ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-100'
                                    : 'border-gray-300 bg-white hover:border-blue-400 shadow-sm'
                                    }`}
                            >
                                <div className='flex justify-between items-center w-full'>
                                    <span className='font-medium text-gray-800'>{item.name}</span>
                                    <span className='text-xl font-extrabold text-blue-600'>
                                        {priceTransformer(item.priceHT).toFixed(0)}€ {priceSuffix}
                                    </span>
                                </div>
                                <p className='text-xs text-gray-500 mt-1 w-full'>{item.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className='block text-lg font-bold text-gray-900 mb-4'>Options</label>
                    <div className='space-y-3'>
                        <TemplateOption />
                    </div>
                </div>

                {formData.model && (
                    <div>
                        <label className='block text-lg font-bold text-gray-900 mb-4'>Transport & Mise en service <span className='text-red-500'>*</span></label>
                        <div className='space-y-3'>
                            <button
                                type='button'
                                onClick={() => handleChange('delivery', 'pickup')}
                                className={`w-full p-4 border-2 rounded-xl transition-all text-left flex justify-between items-center ${formData.delivery === 'pickup'
                                    ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-100'
                                    : 'border-gray-300 bg-white hover:border-blue-400 shadow-sm'
                                    }`}
                            >
                                <span className='font-medium text-gray-800 flex items-center'><Truck className='w-4 h-4 mr-2' /> Retrait à Arcueil (94)</span>
                                <span className='text-xl font-extrabold text-green-600'>Gratuit</span>
                            </button>

                            <button
                                type='button'
                                onClick={() => handleChange('delivery', 'delivery_nosetup')}
                                className={`w-full p-4 border-2 rounded-xl transition-all text-left flex flex-col ${formData.delivery === 'delivery_nosetup'
                                    ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-100'
                                    : 'border-gray-300 bg-white hover:border-blue-400 shadow-sm'
                                    }`}
                            >
                                <div className='flex justify-between items-center w-full'>
                                    <span className='font-medium text-gray-800 flex items-center'><Truck className='w-4 h-4 mr-2' /> Livraison Standard</span>
                                    <span className='text-xl font-extrabold text-blue-600'>{deliveryNosetupDisplay}</span>
                                </div>
                                <p className='text-xs text-blue-700 mt-2 font-semibold'>* Le Photobooth est <span className='font-extrabold'>Plug and Play</span> : il suffit de le brancher.</p>
                            </button>

                            <button
                                type='button'
                                onClick={() => handleChange('delivery', 'delivery_withsetup')}
                                className={`w-full p-4 border-2 rounded-xl transition-all text-left flex justify-between items-center ${formData.delivery === 'delivery_withsetup'
                                    ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-100'
                                    : 'border-gray-300 bg-white hover:border-blue-400 shadow-sm'
                                    }`}
                            >
                                <span className='font-medium text-gray-800 flex items-center'><Truck className='w-4 h-4 mr-2' /> Livraison + Mise en service</span>
                                <span className='text-xl font-extrabold text-blue-600'>{deliveryWithSetupDisplay}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- BLOC PRO (Signature) ---
    if (formData.needType === 'pro') {
        // ✅ PRIX DYNAMIQUE : Utilise le tarif négocié ou le défaut (480)
        const BASE_PRICE_PRO_HT_LOCAL = unitaryPrices?.signature ?? 480;

        const basePriceDisplay = priceSuffix === 'TTC' ? `${(BASE_PRICE_PRO_HT_LOCAL * TVA_RATE).toFixed(0)}€ TTC` : `${BASE_PRICE_PRO_HT_LOCAL}€ HT`;
        const optionPriceHT = 50;
        const optionPriceDisplay = priceSuffix === 'TTC' ? `+${(optionPriceHT * TVA_RATE).toFixed(0)}€ TTC` : `+${optionPriceHT}€ HT`;

        const proDeliveryBasePriceHT = 110;
        const animationHours = parseInt(formData.proAnimationHours);
        const isShortAnimation = animationHours > 0 && animationHours <= 3;
        const proDeliveryPriceHT = isShortAnimation ? proDeliveryBasePriceHT / 2 : proDeliveryBasePriceHT;
        const proDeliveryPriceDisplay = priceSuffix === 'TTC' ? `+${(proDeliveryPriceHT * TVA_RATE).toFixed(0)}€ TTC` : `+${proDeliveryPriceHT}€ HT`;

        return (
            <div className='space-y-6'>
                <h2 className='text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2' style={{ color: customColor, borderColor: customColor }}>Configuration - Signature (Prix en {priceSuffix})</h2>
                <div className='bg-blue-600 text-white p-4 rounded-xl shadow-xl'>
                    <p className='text-xl font-bold'>Base Signature / Jour : <span className='float-right'>{basePriceDisplay}</span></p>
                    <p className='text-sm mt-1 font-medium'>Tarif journalier dégressif.</p>
                </div>

                {/* Sélecteur Classique 45€/h */}
                <div>
                    <label className='block text-sm font-semibold text-gray-800 mb-3'>Heures d'animation ({priceTransformer(45).toFixed(0)}€ {priceSuffix} par heure)</label>
                    <select
                        value={formData.proAnimationHours}
                        onChange={e => handleChange('proAnimationHours', e.target.value)}
                        className='w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-150 ease-in-out text-gray-900'
                    >
                        <option value='none'>Non-souhaité (Inclus dans le prix de base)</option>
                        {[1, 2, 3].map(h => <option key={h} value={h}>{h}h d'animation (Réalisée par notre technicien-livreur partenaire.)</option>)}
                        {[4, 5, 6, 7, 8].map(h => <option key={h} value={h}>{h}h d'animation (Animatrice dédiée)</option>)}
                    </select>
                    <p className='mt-2 text-sm text-blue-700 italic'>
                        {isShortAnimation ? `* Avantage Logistique : Coût de Logistique divisé par deux (${proDeliveryPriceHT}€ HT) car réalisé par le Technicien.` : (formData.proAnimationHours !== 'none' ? `* Coût Logistique normal (${proDeliveryBasePriceHT}€ HT).` : '* Pas d\'animation souhaitée pour l\'instant.')}
                    </p>
                </div>

                <div className='space-y-3'>
                    <TemplateOption />
                    {[
                        { id: 'proFondIA', label: 'Fond IA (personnalisé)', priceDisplay: optionPriceDisplay, checked: formData.proFondIA, onChange: (e) => handleChange('proFondIA', e.target.checked) },
                        { id: 'proRGPD', label: 'Option RGPD & Sécurité des données', priceDisplay: optionPriceDisplay, checked: formData.proRGPD, onChange: (e) => handleChange('proRGPD', e.target.checked) },
                    ].map((option) => (
                        <div key={option.id} className='flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm transition-colors hover:bg-gray-100'>
                            <input type='checkbox' id={option.id} checked={option.checked} onChange={option.onChange} className='w-5 h-5 text-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 cursor-pointer border-gray-400' />
                            <label htmlFor={option.id} className='flex-1 text-sm font-semibold text-gray-800 cursor-pointer'>{option.label}</label>
                            <span className='text-base font-bold text-blue-600'>{option.priceDisplay}</span>
                        </div>
                    ))}
                    <div className='flex items-center space-x-3 bg-green-50 p-4 rounded-xl border border-green-300 shadow-md opacity-90'>
                        <Check className='w-5 h-5 text-green-700' />
                        <label htmlFor='proDelivery' className='flex-1 text-sm font-semibold text-gray-800'>Livraison / Installation / Désinstallation</label>
                        <span className='text-base font-bold text-green-700'>{proDeliveryPriceDisplay}</span>
                    </div>
                </div>
                <div>
                    <label className='block text-sm font-semibold text-gray-800 mb-3'>Nombre d'impressions par cliché</label>
                    <select value={formData.proImpressions} onChange={e => handleChange('proImpressions', parseInt(e.target.value))} className='w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-150 ease-in-out text-gray-900'>
                        <option value={1}>1 impression (inclus)</option>
                        <option value={2}>2 impressions (en supplément)</option>
                        <option value={3}>3 impressions (en supplément)</option>
                    </select>
                </div>
            </div>
        );
    }

    // --- BLOC 360 ---
    if (formData.needType === '360') {
        const basePriceHT = 715;
        const deliveryPriceHT = 150;

        const totalDailyHT = basePriceHT + deliveryPriceHT;
        const dailyTotalDisplay = `${priceTransformer(totalDailyHT).toFixed(0)}€ ${priceSuffix}`;

        const basePriceDisplay = priceSuffix === 'TTC' ? `${(basePriceHT * TVA_RATE).toFixed(0)}€ TTC` : `${basePriceHT}€ HT`;
        const deliveryPriceDisplay = priceSuffix === 'TTC' ? `${(deliveryPriceHT * TVA_RATE).toFixed(0)}€ TTC` : `${deliveryPriceHT}€ HT`;

        const extraHourPriceHT = P360_EXTRA_ANIMATION_HOUR_PRICE_HT;

        const currentAnim360 = (formData.proAnimationHours === 'none' || !formData.proAnimationHours) ? 3 : parseInt(formData.proAnimationHours);

        return (
            <div className='space-y-6'>
                <h2 className='text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2' style={{ color: customColor, borderColor: customColor }}>Configuration - Photobooth 360 (Prix en {priceSuffix})</h2>
                <div className='bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl border-4 border-purple-500 shadow-2xl'>
                    <div className='text-center'>
                        <div className='text-6xl mb-4'>📸🎥</div>
                        <h3 className='text-3xl font-extrabold text-purple-900 mb-6'>Forfait 360° Tout Inclus</h3>
                        <div className='space-y-3 text-left max-w-sm mx-auto'>
                            <div className='flex justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200'>
                                <span className='font-medium text-gray-700'>Photobooth 360 (Base)</span>
                                <span className='font-bold text-purple-600'>{basePriceDisplay}</span>
                            </div>
                            <div className='flex justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200'>
                                <span className='font-medium text-gray-700'>Livraison & Installation</span>
                                <span className='font-bold text-purple-600'>{deliveryPriceDisplay}</span>
                            </div>
                            <div className='flex justify-between p-4 bg-purple-600 text-white rounded-xl shadow-lg border-2 border-purple-800 mt-5'>
                                <span className='font-extrabold text-xl'>Total par jour ({priceSuffix})</span>
                                <span className='font-extrabold text-3xl'>{dailyTotalDisplay}</span>
                            </div>
                        </div>
                        <p className='text-sm text-purple-700 mt-4 italic'>L'animation et l'opérateur sont inclus pour toute la durée.</p>
                    </div>
                </div>

                <div>
                    <label className='block text-sm font-semibold text-gray-800 mb-3'>
                        Heures d'animation ({priceTransformer(extraHourPriceHT).toFixed(0)}€ {priceSuffix} par heure sup.)
                    </label>
                    <select
                        value={currentAnim360}
                        onChange={e => handleChange('proAnimationHours', e.target.value)}
                        className='w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-150 ease-in-out text-gray-900'
                    >
                        <option value={3}>3h d'animation (Inclus)</option>
                        {[4, 5, 6, 7, 8].map(h => {
                            const supp = (h - 3) * extraHourPriceHT;
                            const disp = priceSuffix === 'TTC' ? `${(supp * TVA_RATE).toFixed(0)}€ TTC` : `${supp}€ HT`;
                            return <option key={h} value={h}>{h}h d'animation (+{disp})</option>;
                        })}
                    </select>
                </div>
            </div>
        );
    }

    return null;
};