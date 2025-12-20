// src/components/steps/Step3Config.jsx

import React, { useEffect, useRef } from 'react';
import { Wand2, Truck, Video, Zap, Gem, Ban, Music } from 'lucide-react';
import { TVA_RATE } from '../../constants';

export const Step3Config = ({ formData, setFormData, customColor, pricingData }) => {

    const configSectionRef = useRef(null);

    // On laisse le chargement global, mais on ne sécurise pas l'accès aux clés unitaires plus bas
    if (!pricingData || !pricingData.unitaryPrices) {
        return <div className='text-center py-10 text-gray-500'>Chargement des configurations...</div>;
    }

    const { priceSuffix, unitaryPrices } = pricingData;

    // Fonction de formatage (TTC ou HT selon le mode Pro)
    // Pas de fallback ici non plus sur le priceHT
    const priceTransformer = (priceHT) => (priceSuffix === 'TTC' ? (priceHT * TVA_RATE) : priceHT);
    const formatPrice = (p) => `${priceTransformer(p).toFixed(0)}€ ${priceSuffix}`;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Auto-scroll vers la config quand on choisit un modèle
    useEffect(() => {
        if (formData.model && configSectionRef.current) {
            configSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [formData.model]);

    // --- LOGIQUE TEMPLATE ---
    const isPro = formData.isPro;
    // Utilisation directe sans sécurité
    const templatePrice = unitaryPrices.template;
    const isFreeTemplate = !isPro || (isPro && templatePrice === 0);

    useEffect(() => {
        if (isFreeTemplate && !formData.templateTool) {
            setFormData(prev => ({ ...prev, templateTool: true }));
        }
    }, [isFreeTemplate, formData.templateTool, setFormData]);

    // --- LOGIQUE D'AFFICHAGE ---
    const isTechnicalCompact = ['numerique', '150', '300', 'illimite'].includes(formData.model);
    const isStarbooth = formData.model === 'illimite';
    const isSignature = formData.model === 'Signature';
    const is360 = formData.model === '360';

    // DÉTECTION MULTI-JOURS
    const isMultiDay = formData.eventDuration > 1;

    // --- SÉLECTION DU MODÈLE ---
    const handleModelSelect = (modelId) => {
        // Sécurité : empêche la sélection du 360 si multijours
        if (modelId === '360' && isMultiDay) return;

        const isNewSignature = modelId === 'Signature';
        const isNew360 = modelId === '360';

        setFormData(prev => ({
            ...prev,
            model: modelId,
            // Si c'est Signature ou 360, la livraison est forcée à true
            delivery: (isNewSignature || isNew360) ? true : prev.delivery,
            // Reset des options
            proAnimationHours: 'none',
            proFondIA: false,
            proRGPD: false
        }));
    };

    // --- COMPOSANT UI : OPTION TEMPLATE ---
    const TemplateOption = () => {
        const displayPrice = isFreeTemplate ? 'Inclus (Offert)' : `+${formatPrice(templatePrice)}`;

        return (
            <div className={`flex flex-col space-y-2 p-4 rounded-xl border shadow-sm transition-colors ${isFreeTemplate ? 'bg-gray-100 border-gray-300 opacity-80' : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
                }`}>
                <div className='flex items-center space-x-3'>
                    <input
                        type='checkbox'
                        id='templateTool'
                        checked={isFreeTemplate ? true : formData.templateTool}
                        disabled={isFreeTemplate}
                        onChange={(e) => !isFreeTemplate && handleChange('templateTool', e.target.checked)}
                        className={`w-5 h-5 rounded-md border-gray-400 ${isFreeTemplate ? 'text-gray-500 cursor-not-allowed bg-gray-200' : 'text-indigo-600 focus:ring-indigo-500 cursor-pointer'
                            }`}
                    />
                    <label
                        htmlFor='templateTool'
                        className={`flex-1 text-sm font-semibold flex items-center space-x-2 ${isFreeTemplate ? 'text-gray-600 cursor-not-allowed' : 'text-gray-800 cursor-pointer'
                            }`}
                    >
                        <Wand2 className='w-4 h-4 mr-2' />
                        <span>Outil Template - Personnalisez votre cadre photo en ligne</span>
                    </label>
                    <span className={`text-base font-bold ${isFreeTemplate ? 'text-green-600' : 'text-indigo-600'}`}>
                        {displayPrice}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className='space-y-10 animate-in fade-in duration-500'>

            <h2 className='text-3xl font-extrabold text-gray-900 border-b pb-4 text-center md:text-left' style={{ color: customColor, borderColor: customColor }}>
                Choisissez votre expérience
            </h2>

            {/* --- 1. PRESTATIONS ÉCONOMIQUES --- */}
            <div>
                <h3 className='text-xl font-bold text-gray-700 mb-4 flex items-center'>
                    <Zap className='w-6 h-6 mr-2 text-yellow-500' />
                    Prestations Économiques
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {[
                        { id: 'numerique', name: 'CineBooth Numérique', desc: '100% Digital, pas d\'impression' },
                        { id: '150', name: 'CineBooth 150', desc: '150 tirages inclus' },
                        { id: '300', name: 'CineBooth 300', desc: '300 tirages inclus' },
                    ].map(item => (
                        <button
                            key={item.id}
                            type='button'
                            onClick={() => handleModelSelect(item.id)}
                            className={`p-4 border-2 rounded-xl transition-all text-left flex flex-col justify-between hover:shadow-md ${formData.model === item.id
                                ? 'border-yellow-500 bg-yellow-50 shadow-md ring-1 ring-yellow-200'
                                : 'border-gray-200 bg-white hover:border-yellow-300'
                                }`}
                        >
                            <div>
                                <h4 className='font-bold text-gray-800 mb-1'>{item.name}</h4>
                                <p className='text-xs text-gray-500 mb-3'>{item.desc}</p>
                            </div>
                            <div className='text-right'>
                                {/* Accès direct sans sécurité */}
                                <span className='text-lg font-extrabold text-gray-900'>{formatPrice(unitaryPrices[item.id])}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- 2. PRESTATIONS PROFESSIONNELLES --- */}
            <div>
                <h3 className='text-xl font-bold text-gray-700 mb-4 flex items-center'>
                    <Gem className='w-6 h-6 mr-2 text-blue-600' />
                    Prestations Professionnelles
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

                    {/* STARBOOTH PRO */}
                    <button
                        type='button'
                        onClick={() => handleModelSelect('illimite')}
                        className={`p-5 border-2 rounded-xl transition-all text-left flex flex-col hover:shadow-lg ${formData.model === 'illimite'
                            ? 'border-blue-600 bg-blue-50 shadow-lg ring-1 ring-blue-200'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                    >
                        <div className='flex justify-between items-start w-full mb-2'>
                            <div>
                                <h4 className='font-bold text-gray-900 text-lg flex items-center'>Starbooth Pro</h4>
                                <span className='inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 mt-1'>
                                    Impressions Illimitées
                                </span>
                            </div>
                            <span className='text-xl font-extrabold text-blue-700'>{formatPrice(unitaryPrices['illimite'])}</span>
                        </div>
                        <p className='text-sm text-gray-600 mt-2'>
                            La puissance d'une borne pro dans un format compact. Capteur 4K, rapidité d'impression extrême.
                        </p>
                    </button>

                    {/* SIGNATURE */}
                    <button
                        type='button'
                        onClick={() => handleModelSelect('Signature')}
                        className={`p-5 border-2 rounded-xl transition-all text-left flex flex-col hover:shadow-lg ${formData.model === 'Signature'
                            ? 'border-purple-600 bg-purple-50 shadow-lg ring-1 ring-purple-200'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                            }`}
                    >
                        <div className='flex justify-between items-start w-full mb-2'>
                            <div>
                                <h4 className='font-bold text-gray-900 text-lg flex items-center'>Signature</h4>
                                <span className='inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 mt-1'>
                                    Haut de Gamme
                                </span>
                            </div>
                            <span className='text-xl font-extrabold text-purple-700'>{formatPrice(unitaryPrices['Signature'])}</span>
                        </div>
                        <p className='text-sm text-gray-600 mt-2'>
                            L'élégance ultime. Borne miroir, Reflex Canon, qualité studio. <br />
                            <span className='font-semibold text-purple-600'>Livraison & Installation incluses.</span>
                        </p>
                    </button>
                </div>
            </div>

            {/* --- 3. PRESTATION EXPÉRIENTIELLE --- */}
            <div>
                <h3 className='text-xl font-bold text-gray-700 mb-4 flex items-center'>
                    <Video className='w-6 h-6 mr-2 text-pink-500' />
                    Prestation Expérientielle
                </h3>

                {isMultiDay ? (
                    // 🔒 AFFICHAGE INDISPONIBLE SI MULTIJOURS
                    <div className='w-full md:w-2/3 p-6 border-2 border-gray-200 bg-gray-100 rounded-xl flex items-center space-x-4 cursor-not-allowed opacity-80'>
                        <div className='bg-gray-300 p-3 rounded-full'>
                            <Ban className='w-6 h-6 text-gray-500' />
                        </div>
                        <div>
                            <h4 className='font-bold text-gray-600 text-lg'>Videobooth 360°</h4>
                            <p className='text-sm text-gray-500 font-medium'>
                                Videobooth non disponible pour plusieurs jours de location.
                            </p>
                        </div>
                    </div>
                ) : (
                    // ✅ AFFICHAGE NORMAL
                    <button
                        type='button'
                        onClick={() => handleModelSelect('360')}
                        className={`w-full md:w-2/3 p-5 border-2 rounded-xl transition-all text-left flex flex-col hover:shadow-lg ${formData.model === '360'
                            ? 'border-pink-500 bg-pink-50 shadow-lg ring-1 ring-pink-200'
                            : 'border-gray-200 bg-white hover:border-pink-300'
                            }`}
                    >
                        <div className='flex justify-between items-center w-full mb-2'>
                            <h4 className='font-bold text-gray-900 text-lg flex items-center'>Photobooth 360°</h4>
                            <span className='text-xl font-extrabold text-pink-600'>{formatPrice(unitaryPrices['360'])}</span>
                        </div>
                        <p className='text-sm text-gray-600'>
                            Créez le buzz avec des vidéos slow-motion à 360°. Plateforme immersive pour 4-5 personnes.
                            <br /><span className='text-pink-600 font-semibold'>Animateur, Livraison & Partage illimité inclus.</span>
                        </p>
                    </button>
                )}
            </div>


            {/* --- SECTION CONFIGURATION (DYNAMIQUE) --- */}
            <div ref={configSectionRef} className='pt-8 border-t border-gray-200'>

                {/* 1. CONFIGURATION TYPE "COMPACTE" (CineBooth + Starbooth Pro) */}
                {isTechnicalCompact && (
                    <div className='animate-in slide-in-from-top-4 space-y-6'>
                        <h3 className='text-xl font-bold text-gray-800'>Options de configuration</h3>

                        <TemplateOption />

                        {/* Choix Livraison / Retrait */}
                        <div>
                            <label className='block text-lg font-bold text-gray-900 mb-4'>Transport & Mise en service <span className='text-red-500'>*</span></label>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <button
                                    type='button'
                                    onClick={() => handleChange('delivery', false)}
                                    className={`p-4 border-2 rounded-xl transition-all text-left flex flex-col justify-center ${formData.delivery === false
                                        ? 'border-green-600 bg-green-50 shadow-md ring-1 ring-green-100'
                                        : 'border-gray-300 bg-white hover:border-green-400'
                                        }`}
                                >
                                    <span className='font-bold text-gray-800 flex items-center mb-1'><Truck className='w-4 h-4 mr-2' /> Retrait à Arcueil (94)</span>
                                    <span className='text-lg font-extrabold text-green-600'>Gratuit</span>
                                    <p className='text-xs text-gray-500 mt-1'>Vous récupérez et rapportez la borne.</p>
                                </button>

                                <button
                                    type='button'
                                    onClick={() => handleChange('delivery', true)}
                                    className={`p-4 border-2 rounded-xl transition-all text-left flex flex-col justify-center ${formData.delivery === true
                                        ? 'border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-100'
                                        : 'border-gray-300 bg-white hover:border-blue-400'
                                        }`}
                                >
                                    <div className='flex justify-between items-center w-full'>
                                        <span className='font-bold text-gray-800 flex items-center'><Truck className='w-4 h-4 mr-2' /> Livraison & Installation</span>
                                        <span className='text-lg font-extrabold text-blue-600'>
                                            {formatPrice(unitaryPrices.livraison)}
                                        </span>
                                    </div>
                                    <p className='text-xs text-blue-700 mt-1 font-medium'>
                                        Installation clé en main par nos soins.
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* OPTIONS PREMIUM (Uniquement pour Starbooth Pro) */}
                        {isStarbooth && (
                            <div className='mt-6 pt-6 border-t border-gray-100'>
                                <h4 className='text-lg font-bold text-gray-800 mb-4'>Options Premium Starbooth</h4>

                                {/* Animation (Seulement si livraison activée) */}
                                {formData.delivery === true && (
                                    <div className='mb-4'>
                                        <label className='block text-sm font-semibold text-gray-800 mb-3'>Heures d'animation ({formatPrice(45)} / h)</label>

                                        {/* 🔒 BLOCAGE ANIMATION SI MULTIJOURS */}
                                        {isMultiDay ? (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 italic flex items-center">
                                                <Ban className="w-4 h-4 mr-2" />
                                                Animation non disponible pour plusieurs jours de location, nous écrire un email.
                                            </div>
                                        ) : (
                                            <select
                                                value={formData.proAnimationHours}
                                                onChange={e => handleChange('proAnimationHours', e.target.value)}
                                                className='w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-4 focus:ring-blue-200 text-gray-900'
                                            >
                                                <option value='none'>Sans animateur (Installation simple)</option>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                                                    <option key={h} value={h}>{h}h d'animation (Animatrice dédiée)</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}

                                <div className='space-y-3'>
                                    <div className='flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50'>
                                        <input type='checkbox' id="proFondIA" checked={formData.proFondIA} onChange={(e) => handleChange('proFondIA', e.target.checked)} className='w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer' />
                                        <label htmlFor="proFondIA" className='flex-1 text-sm font-semibold text-gray-800 cursor-pointer'>Fond IA (personnalisé)</label>
                                        <span className='font-bold text-blue-600'>+{formatPrice(unitaryPrices.ia)}</span>
                                    </div>
                                    {formData.isPro && (
                                        <div className='flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50'>
                                            <input type='checkbox' id="proRGPD" checked={formData.proRGPD} onChange={(e) => handleChange('proRGPD', e.target.checked)} className='w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer' />
                                            <label htmlFor="proRGPD" className='flex-1 text-sm font-semibold text-gray-800 cursor-pointer'>Option RGPD : récupérez en toute transparence les contacts de vos prospects</label>
                                            <span className='font-bold text-blue-600'>+{formatPrice(unitaryPrices.rgpd)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. CONFIGURATION TYPE "SIGNATURE" */}
                {isSignature && (
                    <div className='animate-in slide-in-from-top-4 space-y-6'>
                        <div className='bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-xl'>
                            <p className='text-sm text-purple-900'>
                                <strong>Excellent choix !</strong> La borne Signature inclut la livraison, l'installation et la reprise par un technicien certifié.
                            </p>
                        </div>

                        <div>
                            <label className='block text-lg font-bold text-gray-900 mb-4'>Transport & Mise en service</label>
                            <button
                                type='button'
                                disabled
                                className='w-full p-4 border-2 border-purple-600 bg-purple-50 rounded-xl shadow-md ring-1 ring-purple-100 flex flex-col justify-center cursor-default opacity-100'
                            >
                                <div className='flex justify-between items-center w-full'>
                                    <span className='font-bold text-purple-900 flex items-center'>
                                        <Truck className='w-5 h-5 mr-2' /> Livraison & Installation (Technicien certifié)
                                    </span>
                                    <span className='text-lg font-extrabold text-purple-700'>{formatPrice(unitaryPrices.livraison)}</span>
                                </div>
                                <p className='text-xs text-purple-800 mt-1 font-medium text-left'>
                                    Prestation haut de gamme : transport et mise en service obligatoire.
                                </p>
                            </button>
                        </div>

                        <h3 className='text-xl font-bold text-gray-800'>Personnalisation de votre expérience</h3>

                        {/* Animation */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-800 mb-3'>Heures d'animation ({formatPrice(45)} / h)</label>

                            {isMultiDay ? (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 italic flex items-center">
                                    <Ban className="w-4 h-4 mr-2" />
                                    Animation non disponible pour plusieurs jours de location, nous écrire un email.
                                </div>
                            ) : (
                                <select
                                    value={formData.proAnimationHours}
                                    onChange={e => handleChange('proAnimationHours', e.target.value)}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-4 focus:ring-purple-200 text-gray-900'
                                >
                                    <option value='none'>Non-souhaité (Installation par technicien uniquement)</option>
                                    {[1, 2, 3].map(h => <option key={h} value={h}>{h}h d'animation (Réalisée par notre technicien-livreur)</option>)}
                                    {[4, 5, 6, 7, 8].map(h => <option key={h} value={h}>{h}h d'animation (Animatrice dédiée)</option>)}
                                </select>
                            )}
                        </div>

                        <div className='space-y-3'>
                            <TemplateOption />
                            <div className='flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50'>
                                <input type='checkbox' id="proFondIA-sig" checked={formData.proFondIA} onChange={(e) => handleChange('proFondIA', e.target.checked)} className='w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer' />
                                <label htmlFor="proFondIA-sig" className='flex-1 text-sm font-semibold text-gray-800 cursor-pointer'>Fond IA (personnalisé)</label>
                                <span className='font-bold text-purple-600'>+{formatPrice(unitaryPrices.ia)}</span>
                            </div>
                            {formData.isPro && (
                                <div className='flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50'>
                                    <input type='checkbox' id="proRGPD-sig" checked={formData.proRGPD} onChange={(e) => handleChange('proRGPD', e.target.checked)} className='w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer' />
                                    <label htmlFor="proRGPD-sig" className='flex-1 text-sm font-semibold text-gray-800 cursor-pointer'>Option RGPD : récupérez en toute transparence les contacts de vos prospects</label>
                                    <span className='font-bold text-purple-600'>+{formatPrice(unitaryPrices.rgpd)}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className='block text-sm font-semibold text-gray-800 mb-3'>Impressions par cliché</label>
                            <select value={formData.proImpressions} onChange={e => handleChange('proImpressions', parseInt(e.target.value))} className='w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm text-gray-900'>
                                <option value={1}>1 impression (inclus)</option>
                                <option value={2}>2 impressions ({formatPrice(unitaryPrices.impressionSup)} / j)</option>
                                <option value={3}>3 impressions ({formatPrice(unitaryPrices.impressionSup * 2)} / j)</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* 3. CONFIGURATION TYPE "360" */}
                {is360 && !isMultiDay && (
                    <div className='animate-in slide-in-from-top-4 space-y-6'>
                        <div className='bg-pink-50 border-l-4 border-pink-500 p-4 rounded-r-xl'>
                            <p className='text-sm text-pink-900'>
                                <strong>L'expérience ultime !</strong> Inclus : Livraison, Installation, 3h d'animation et Partage illimité.
                            </p>
                        </div>

                        <div>
                            <label className='block text-lg font-bold text-gray-900 mb-4'>Transport & Mise en service</label>
                            <button
                                type='button'
                                disabled
                                className='w-full p-4 border-2 border-pink-500 bg-pink-50 rounded-xl shadow-md ring-1 ring-pink-100 flex flex-col justify-center cursor-default opacity-100'
                            >
                                <div className='flex justify-between items-center w-full'>
                                    <span className='font-bold text-pink-900 flex items-center'>
                                        <Truck className='w-5 h-5 mr-2' /> Livraison & Installation 360°
                                    </span>
                                    <span className='text-lg font-extrabold text-pink-600'>{formatPrice(unitaryPrices.livraison)}</span>
                                </div>
                                <p className='text-xs text-pink-800 mt-1 font-medium text-left'>
                                    Logistique complexe et installation incluses dans votre forfait.
                                </p>
                            </button>
                        </div>

                        <h3 className='text-xl font-bold text-gray-800'>Durée de la prestation</h3>
                        <div>
                            <label className='block text-sm font-semibold text-gray-800 mb-3'>
                                Heures d'animation ({formatPrice(90)} par heure sup.)
                            </label>
                            <select
                                value={(formData.proAnimationHours === 'none' || !formData.proAnimationHours) ? 3 : formData.proAnimationHours}
                                onChange={e => handleChange('proAnimationHours', e.target.value)}
                                className='w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-4 focus:ring-pink-200 text-gray-900'
                            >
                                <option value={3}>3h d'animation (Inclus dans le forfait)</option>
                                {[4, 5, 6, 7, 8].map(h => {
                                    const supp = (h - 3) * 90;
                                    return <option key={h} value={h}>{h}h d'animation (+{formatPrice(supp)})</option>;
                                })}
                            </select>
                        </div>
                        <div className='space-y-3 pt-2'>
                            <div className='flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:bg-pink-50 transition-colors'>
                                <input
                                    type='checkbox'
                                    id="optionSpeaker"
                                    checked={formData.optionSpeaker}
                                    onChange={(e) => handleChange('optionSpeaker', e.target.checked)}
                                    className='w-5 h-5 text-pink-600 rounded focus:ring-pink-500 cursor-pointer'
                                />
                                <label htmlFor="optionSpeaker" className='flex-1 text-sm font-semibold text-gray-800 cursor-pointer flex items-center'>
                                    <Music className='w-4 h-4 mr-2 text-pink-500' />
                                    Option Enceinte & Musique (Ambiance garantie !)
                                </label>
                                <span className='font-bold text-pink-600'>{formatPrice(unitaryPrices.speaker)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};