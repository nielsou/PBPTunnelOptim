// src/components/steps/Step3Config.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Wand2, Truck, Video, Zap, Gem, Ban, Music, ChevronRight, RefreshCcw, Star, Check } from 'lucide-react';
import { TVA_RATE, PRICING_STRATEGY } from '../../constants';

export const Step3Config = ({ formData, setFormData, customColor, pricingData, isPartnerMode }) => {
    const configSectionRef = useRef(null);
    const [showCineBoothOptions, setShowCineBoothOptions] = useState(false);

    if (!pricingData || !pricingData.unitaryPrices) {
        return <div className='text-center py-10 text-gray-500'>Chargement des configurations...</div>;
    }

    const { priceSuffix, unitaryPrices } = pricingData;
    const priceTransformer = (priceHT) => (priceSuffix === 'TTC' ? (priceHT * TVA_RATE) : priceHT);
    const formatPricePerDay = (p) => `${priceTransformer(p).toFixed(0)}€ ${priceSuffix} / jour`;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Mapping des images
    const machineImages = {
        CineBooth: '/images/machines/PAYSAGE_CineBooth_2-min.png',
        illimite: '/images/machines/PAYSAGE_Starbooth_Pro-min.png',
        Signature: '/images/machines/PAYSAGE_Signature_Gala_6-min.png',
        '360': '/images/machines/PAYSAGE_Videobooth_360_4-min.png'
    };

    const isStarbooth = formData.model === 'illimite';
    const isSignature = formData.model === 'Signature';
    const is360 = formData.model === '360';
    const isMultiDay = formData.eventDuration > 1;

    const handleModelSelect = (id) => {
        const isNewSignature = id === 'Signature';
        const isNew360 = id === '360';

        setFormData(prev => ({
            ...prev,
            model: id,
            delivery: (isNewSignature || isNew360) ? true : prev.delivery,
            proAnimationHours: isNew360 ? '3' : 'none',
            proFondIA: false,
            proRGPD: false
        }));
        setShowCineBoothOptions(false);
    };

    useEffect(() => {
        if (formData.model && configSectionRef.current) {
            configSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [formData.model]);

    const isFreeTemplate = !formData.isPro || (formData.isPro && unitaryPrices.template === 0);

    return (
        <div className='space-y-12 animate-in fade-in duration-500'>

            {/* EN-TÊTE DYNAMIQUE */}
            {!formData.model ? (
                <div className='text-center'>
                    <h2 className='text-3xl font-black text-gray-900 mb-2'>Quelle expérience souhaitez-vous ?</h2>
                    <p className='text-gray-500'>Des bornes 100% conçues en France par notre équipe d'ingénieurs.</p>
                </div>
            ) : (
                <div className='flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-10 animate-in slide-in-from-top-2'>
                    <div className='flex items-center gap-3'>
                        <div className='bg-green-100 p-2 rounded-full'><Check className='w-5 h-5 text-green-600' /></div>
                        <div>
                            <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Modèle sélectionné</span>
                            <h3 className='font-black text-gray-900 leading-tight'>{PRICING_STRATEGY[formData.model].name}</h3>
                        </div>
                    </div>
                    <button
                        onClick={() => handleChange('model', '')}
                        className='flex items-center text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors'
                    >
                        <RefreshCcw className='w-4 h-4 mr-2' /> Modifier
                    </button>
                </div>
            )}

            {!formData.model && (
                <div className='space-y-12'>

                    {/* --- SECTION PRÊT-À-FÊTER (CINEBOOTH) --- */}
                    {!isPartnerClient && (
                        <section>
                            <h3 className='text-xl font-black text-gray-800 mb-6 flex items-center justify-center md:justify-start gap-3'>
                                <div className='bg-yellow-100 p-2 rounded-lg'><Zap className='w-5 h-5 text-yellow-600' /></div>
                                Collection "Prêt-à-Fêter"
                            </h3>

                            {!showCineBoothOptions ? (
                                // MODELE COMPACT : max-w-sm, h-56, p-6
                                <div className='group bg-white border-2 border-gray-100 rounded-[2.5rem] overflow-hidden hover:border-yellow-400 transition-all hover:shadow-2xl max-w-sm mx-auto'>
                                    <div className='h-56 overflow-hidden bg-gray-100'>
                                        <img src={machineImages.CineBooth} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500' alt="CineBooth" />
                                    </div>
                                    <div className='p-6'>
                                        <h4 className='font-black text-gray-900 text-2xl'>Nos offres CineBooths</h4>
                                        <p className='text-sm text-gray-500 mt-2 mb-6'>Le 1er prix de nos concurrents ? Une tablette et un rond lumlineux... Notre 1er prix ? Ecran HD, capteur Ultra HD, l'excellence du photobooth à la française. Choisissez ensuite votre pack (Digital, 150 ou 300 tirages).</p>

                                        {/* --- AJOUT : PRIX "À PARTIR DE" --- */}
                                        <div className='flex flex-col mb-6'>
                                            <span className='text-2xl font-black text-gray-900'>
                                                À partir de {formatPricePerDay(unitaryPrices['numerique'])}
                                            </span>
                                            <span className='text-[10px] font-bold text-gray-500 italic mt-1 leading-tight'>
                                                + {priceTransformer(unitaryPrices['deliv_numerique']).toFixed(0)}€ {priceSuffix} pour la livraison
                                            </span>
                                        </div>
                                        {/* ---------------------------------- */}

                                        <button
                                            onClick={() => setShowCineBoothOptions(true)}
                                            className='w-full py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all shadow-lg'
                                        >
                                            Choisir mon pack <ChevronRight className='w-5 h-5' />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 animate-in zoom-in-95 duration-300 max-w-4xl mx-auto'>
                                    {/* ... (Bloc options Cinebooth inchangé) ... */}
                                    {[
                                        { id: 'numerique', name: 'Pack Numérique', desc: '100% Digital' },
                                        { id: '150', name: 'Pack 150', desc: '150 tirages papier' },
                                        { id: '300', name: 'Pack 300', desc: '300 tirages papier' }
                                    ].map(pack => (
                                        <button key={pack.id} onClick={() => handleModelSelect(pack.id)} className='p-6 bg-white border-2 border-yellow-400 rounded-3xl text-left hover:shadow-xl transition-all group'>
                                            <h5 className='font-black text-gray-900 text-lg group-hover:text-yellow-600 transition-colors'>{pack.name}</h5>
                                            <p className='text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1 mb-4'>{pack.desc}</p>

                                            {/* Harmonisation du prix dans les sous-choix aussi (Optionnel mais recommandé) */}
                                            <div className='flex flex-col'>
                                                <p className='font-bold text-gray-900'>{formatPricePerDay(unitaryPrices[pack.id])}</p>
                                                <p className='text-[9px] text-gray-400 italic'>+ {priceTransformer(unitaryPrices[`deliv_${pack.id}`]).toFixed(0)}€ livr.</p>
                                            </div>
                                        </button>
                                    ))}
                                    <button onClick={() => setShowCineBoothOptions(false)} className='md:col-span-3 text-center text-sm font-bold text-gray-400 py-4 hover:text-gray-600 transition-colors'>
                                        <RefreshCcw className='w-4 h-4 inline mr-2' /> Retour au catalogue
                                    </button>
                                </div>
                            )}
                        </section>
                    )}
                    {/* --- SECTION PRESTIGE (STARBOOTH & SIGNATURE) --- */}
                    <section>
                        <h3 className='text-xl font-black text-gray-800 mb-6 flex items-center justify-center md:justify-start gap-3'>
                            <div className='bg-blue-100 p-2 rounded-lg'><Gem className='w-5 h-5 text-blue-600' /></div>
                            Prestige & Événementiel
                        </h3>

                        {/* Grille resserrée (max-w-4xl) */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
                            {[
                                { id: 'illimite', name: 'Starbooth Pro', badge: 'Best-Seller', color: 'blue', desc: "La performance professionnelle...miniaturisée ! Cette borne est dotée d'un capteur Sony 4K f/1.2, d'un flash LED adaptatif et d'une imprimante thermique poids lourd pour des impressions éclair en illimité. Idéale pour les endroits difficile d'accès et les soirées edgy." },
                                { id: 'Signature', name: 'Signature', badge: 'Luxe & Studio', color: 'purple', desc: "L'élégance ultime pour vos grands moments. La présence magnétique de cette borne est idéale pour créer l'effervescence autour d'une marque ou sublimer un lieu de réception. Offrez à vos invités les plaisirs d'une séance photo professionnelle." }
                            ].map(item => (
                                // MODELE COMPACT : max-w-sm, h-56, p-6
                                <div key={item.id} className={`group bg-white border-2 border-gray-100 rounded-[2.5rem] overflow-hidden hover:border-${item.color}-500 transition-all hover:shadow-2xl w-full max-w-sm mx-auto`}>
                                    <div className='relative h-56 overflow-hidden bg-gray-100'>
                                        <img src={machineImages[item.id]} alt={item.name} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700' />
                                        <div className='absolute bottom-4 right-4 bg-white/90 backdrop-blur shadow-xl px-3 py-1 rounded-full flex items-center gap-2'>
                                            <Star className={`w-3 h-3 text-${item.color}-600 fill-current`} />
                                            <span className='text-[10px] font-black text-gray-900 uppercase tracking-widest'>{item.badge}</span>
                                        </div>
                                    </div>

                                    <div className='p-6'>
                                        <h4 className='font-black text-gray-900 text-2xl mb-2'>{item.name}</h4>
                                        <p className='text-gray-500 text-xs mb-4 min-h-[32px]'>{item.desc}</p>

                                        <div className='flex flex-col gap-4'>
                                            <div className='flex flex-col'>
                                                <span className='text-2xl font-black text-gray-900'>
                                                    {formatPricePerDay(unitaryPrices[item.id])}
                                                </span>
                                                <span className='text-[10px] font-bold text-gray-500 italic mt-1 leading-tight'>
                                                    + {priceTransformer(unitaryPrices[`deliv_${item.id}`]).toFixed(0)}€ {priceSuffix} de livraison / installation.
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleModelSelect(item.id)}
                                                style={{ backgroundColor: customColor }}
                                                className='w-full py-3 text-white rounded-xl font-black shadow-md hover:brightness-110 transition-all text-center text-sm'
                                            >
                                                Réserver
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* --- SECTION EXPÉRIENTIELLE (360) --- */}
                    <section>
                        <h3 className='text-xl font-black text-gray-800 mb-6 flex items-center justify-center md:justify-start gap-3'>
                            <div className='bg-pink-100 p-2 rounded-lg'><Video className='w-5 h-5 text-pink-600' /></div>
                            Expérience Immersive
                        </h3>

                        {isMultiDay ? (
                            <div className='w-full max-w-sm mx-auto p-6 border-2 border-gray-200 bg-gray-50 rounded-3xl flex items-center gap-4 opacity-70 grayscale'>
                                <Ban className='w-8 h-8 text-gray-400' />
                                <p className='text-sm font-bold text-gray-500'>Le Videobooth 360° n'est pas disponible pour les locations de plusieurs jours.</p>
                            </div>
                        ) : (
                            // MODELE COMPACT : max-w-sm, h-56, p-6
                            <div className='group bg-white border-2 border-gray-100 rounded-[2.5rem] overflow-hidden hover:border-pink-500 transition-all hover:shadow-2xl w-full max-w-sm mx-auto'>

                                <div className='relative h-56 overflow-hidden bg-gray-100'>
                                    <img
                                        src={machineImages['360']}
                                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
                                        alt="Photobooth 360"
                                    />
                                    <div className='absolute bottom-4 right-4 bg-white/90 backdrop-blur shadow-xl px-3 py-1 rounded-full flex items-center gap-2'>
                                        <Video className='w-3 h-3 text-pink-600 fill-current' />
                                        <span className='text-[10px] font-black text-gray-900 uppercase tracking-widest'>Immersion</span>
                                    </div>
                                </div>

                                <div className='p-6'>
                                    <h4 className='font-black text-gray-900 text-2xl mb-2'>Vidéobooth 360°</h4>
                                    <p className='text-gray-500 text-xs mb-4 min-h-[32px]'>Vidéos slow-motion immersives pour 5 personnes. Effet waouh garanti.</p>

                                    <div className='flex flex-col gap-4'>
                                        <div className='flex flex-col'>
                                            <span className='text-2xl font-black text-gray-900'>
                                                {formatPricePerDay(unitaryPrices['360'])}
                                            </span>
                                            <span className='text-[10px] font-bold text-gray-500 italic mt-1 leading-tight'>
                                                + {priceTransformer(unitaryPrices['deliv_360']).toFixed(0)}€ {priceSuffix} pour la livraison et 3h d'animation
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleModelSelect('360')}
                                            className='w-full py-3 bg-pink-600 text-white rounded-xl font-black shadow-md hover:bg-pink-700 transition-all text-center text-sm'
                                        >
                                            Choisir 360°
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* --- OPTIONS DE CONFIGURATION --- */}
            {formData.model && (
                <div ref={configSectionRef} className='animate-in slide-in-from-bottom-8 duration-700 space-y-10 pt-4 max-w-4xl mx-auto'>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* Option Template */}
                        <div className={`group flex flex-col space-y-4 p-6 rounded-3xl border-2 transition-all ${isFreeTemplate ? 'bg-gray-50 border-gray-200' : 'bg-indigo-50 border-indigo-100 hover:border-indigo-300 shadow-sm'}`}>
                            <div className='flex items-start justify-between gap-4'>
                                <div className='flex-1'>
                                    <div className='flex items-center gap-2 mb-2'><Wand2 className='w-5 h-5 text-indigo-600' /><span className='font-bold text-gray-900'>Outil Template Pro</span></div>
                                    <p className='text-xs text-gray-600'>Personnalisez votre cadre photo avec logos et textes.</p>
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isFreeTemplate ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {isFreeTemplate ? 'Inclus' : `+${priceTransformer(unitaryPrices.template).toFixed(0)}€`}
                                </span>
                            </div>
                            <div className='flex items-center space-x-3 pt-2 border-t border-indigo-100/50'>
                                <input type='checkbox' checked={isFreeTemplate ? true : formData.templateTool} disabled={isFreeTemplate} onChange={(e) => handleChange('templateTool', e.target.checked)} className='w-6 h-6 rounded-lg text-indigo-600 cursor-pointer' />
                                <label className='text-sm font-bold text-gray-700 cursor-pointer'>{isFreeTemplate ? 'Option déjà incluse' : 'Activer la personnalisation'}</label>
                            </div>
                        </div>

                        {/* Option IA */}
                        {(isStarbooth || isSignature) && (
                            <div className='bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all'>
                                <div className='flex gap-4 items-start mb-4'>
                                    <img src="/images/options/option_IA_avant_apres.jpeg" className='w-28 h-28 object-cover rounded-2xl shadow-md' alt="IA" />
                                    <div><h4 className='font-black text-gray-900 leading-tight'>Fond Magique IA</h4><p className='text-[10px] text-gray-500 mt-2'>Décors uniques sans fond vert !</p></div>
                                </div>
                                <div className='flex items-center justify-between pt-4 border-t border-gray-50'>
                                    <div className='flex items-center gap-3'>
                                        <input type='checkbox' id="proFondIA" checked={formData.proFondIA} onChange={(e) => handleChange('proFondIA', e.target.checked)} className='w-6 h-6 text-blue-600 rounded-lg cursor-pointer' />
                                        <label htmlFor="proFondIA" className='text-sm font-bold text-gray-800 cursor-pointer'>Ajouter (+{priceTransformer(unitaryPrices.ia).toFixed(0)}€)</label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Transport */}
                    <div className='bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6'>
                        <h3 className='text-xl font-black text-gray-900'>Logistique & Mise en service</h3>
                        {(isSignature || is360) ? (
                            <div className='bg-purple-50 border-2 border-purple-100 p-6 rounded-3xl flex items-center justify-between'>
                                <div className='flex gap-4'><Truck className='w-6 h-6 text-purple-600' /><div><p className='font-black text-gray-900'>Livraison & Installation par technicien</p><p className='text-[10px] text-purple-700 font-black uppercase tracking-widest italic'>Inclus dans votre pack prestige</p></div></div>
                                <span className='font-black text-purple-700'>{priceTransformer(unitaryPrices.livraison).toFixed(0)}€</span>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <button onClick={() => handleChange('delivery', false)} className={`p-6 border-2 rounded-[2rem] transition-all text-left ${!formData.delivery ? 'border-green-600 bg-green-50' : 'border-gray-50 bg-gray-50'}`}>
                                    <span className='font-black text-gray-800'>Retrait à Arcueil (94)</span><span className='block text-green-600 font-black text-sm mt-1'>Gratuit</span>
                                </button>
                                <button onClick={() => handleChange('delivery', true)} className={`p-6 border-2 rounded-[2rem] transition-all text-left ${formData.delivery ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50'}`}>
                                    <span className='font-black text-gray-800'>Livraison & Installation</span><span className='block text-blue-600 font-black text-sm mt-1'>+{priceTransformer(unitaryPrices.livraison).toFixed(0)}€</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Services finaux */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {formData.delivery && (
                            <div className='bg-gray-50 p-6 rounded-[2rem]'>
                                <label className='block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4'>Animation sur place</label>
                                {isMultiDay ? (
                                    <div className="p-4 bg-red-50 text-red-700 text-[11px] font-bold rounded-2xl flex items-center italic"><Ban className="w-4 h-4 mr-2" /> Animation non disponible en multi-jours</div>
                                ) : (
                                    <select value={formData.proAnimationHours} onChange={e => handleChange('proAnimationHours', e.target.value)} className='w-full px-4 py-4 border-none rounded-2xl bg-white shadow-sm font-bold text-gray-900 text-sm'>
                                        {is360 ? (
                                            <>
                                                <option value={3}>3h d'animation (Inclus)</option>
                                                {[4, 5, 6, 7, 8].map(h => (
                                                    <option key={h} value={h}>
                                                        {h}h (+{priceTransformer((h - 3) * 90).toFixed(0)}€ {priceSuffix})
                                                    </option>
                                                ))}                                            </>
                                        ) : (
                                            <>
                                                <option value='none'>Sans animateur (Borne autonome)</option>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                                                    <option key={h} value={h}>
                                                        {h}h d'animation (+{priceTransformer(h * 45).toFixed(0)}€ {priceSuffix})
                                                    </option>
                                                ))}                                            </>
                                        )}
                                    </select>
                                )}
                            </div>
                        )}
                        {is360 ? (
                            <div className='flex items-center justify-between bg-pink-50 p-6 rounded-[2rem] border border-pink-100'>
                                <div>
                                    <div className='flex items-center gap-3 mb-1'>
                                        <Music className='w-5 h-5 text-pink-600' />
                                        <span className='font-bold text-sm'>Enceinte & Musique</span>
                                    </div>
                                    <p className='text-[10px] text-pink-800 ml-8 max-w-[200px] leading-tight'>
                                        Une ambiance musicale pour décomplexer vos invités et booster le fun !
                                    </p>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <span className='font-black text-pink-600 text-sm'>+{priceTransformer(unitaryPrices.speaker).toFixed(0)}€</span>
                                    <input type='checkbox' checked={formData.optionSpeaker} onChange={(e) => handleChange('optionSpeaker', e.target.checked)} className='w-7 h-7 rounded-lg text-pink-600' />
                                </div>
                            </div>
                        ) : (
                            formData.isPro && (
                                <div className='flex items-center justify-between bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100'>
                                    <div>
                                        <div className='flex items-center gap-3 mb-1'>
                                            <Star className='w-5 h-5 text-indigo-600 fill-current' />
                                            <span className='font-bold text-sm text-indigo-900'>Pack Marketing & Data</span>
                                        </div>
                                        <p className='text-[10px] text-indigo-800 ml-8 max-w-[200px] leading-tight'>
                                            Transformez vos invités en contacts qualifiés. Collecte d'emails certifiée RGPD pour vos campagnes et export CSV.
                                        </p>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <span className='font-black text-indigo-600 text-sm'>+{priceTransformer(unitaryPrices.rgpd).toFixed(0)}€</span>
                                        <input type='checkbox' checked={formData.proRGPD} onChange={(e) => handleChange('proRGPD', e.target.checked)} className='w-7 h-7 rounded-lg text-indigo-600' />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};