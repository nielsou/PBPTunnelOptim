// src/components/steps/Step2Config.jsx
import React, { useEffect, useRef } from 'react';
import { Truck, Video, Zap, Gem, Ban, Music, RefreshCcw, Star, Check, Printer } from 'lucide-react';
import { TVA_RATE, PRICING_STRATEGY } from '../../constants';

const HIDE_PRICE = true

/**
 * Composant générique pour une carte de modèle de borne
 */
const ModelCard = ({
    id,
    isSelected,
    onSelect,
    image,
    name,
    desc,
    badge,
    tagline,
    hoverColor = "blue",
    icon: Icon,
    isUnlimited = false,
    priceContent,
    extraInfo,
    hidePrice = false,
    t
}) => {
    const borderClasses = {
        yellow: 'hover:border-yellow-400',
        blue: 'hover:border-blue-500',
        purple: 'hover:border-purple-500',
        pink: 'hover:border-pink-500'
    };

    return (
        <button
            onClick={() => onSelect(id)}
            className={`group text-left bg-white border-2 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-2xl w-full max-w-sm mx-auto flex flex-col ${isSelected ? 'border-[#BE2A55] shadow-lg' : `border-gray-100 ${borderClasses[hoverColor] || borderClasses.blue}`
                }`}
        >
            <div className='relative h-52 w-full overflow-hidden bg-gray-100'>
                <img src={image} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500' alt={name} />

                {badge && (
                    <div className={`absolute top-4 right-4 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg ${hoverColor === 'yellow' ? 'bg-yellow-400' : 'bg-white/90'}`}>
                        {badge}
                    </div>
                )}

                {isUnlimited && (
                    <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-md shadow-sm border border-pink-100 px-3 py-1.5 rounded-full flex items-center gap-2'>
                        <Printer className='w-3 h-3 text-pink-600' />
                        <span className='text-[10px] font-black text-pink-600 uppercase tracking-widest'>{t('step2.badge.unlimited')}</span>
                    </div>
                )}

                {tagline && (
                    <div className='absolute bottom-4 right-4 bg-white/90 backdrop-blur shadow-xl px-3 py-1 rounded-full flex items-center gap-2'>
                        {Icon && <Icon className={`w-3 h-3 ${hoverColor === 'yellow' ? 'text-blue-600' : `text-${hoverColor}-600`} fill-current`} />}
                        <span className='text-[10px] font-black text-gray-900 uppercase tracking-widest'>{tagline}</span>
                    </div>
                )}
            </div>

            <div className='p-6 flex-1 flex flex-col w-full'>
                <h4 className='font-black text-gray-900 text-2xl'>{name}</h4>
                {hoverColor === 'yellow' && <p className='text-[10px] text-yellow-600 font-black uppercase tracking-widest mt-1 mb-2'>{t('step2.model.digital.tagline')}</p>}
                <p className='text-xs text-gray-500 mb-6 flex-1 mt-2'>{desc}</p>

                {/* Condition sur le flag hidePrice pour afficher ou non l'estimation budgétaire */}
                {!hidePrice && (
                    <div className='flex flex-col border-t border-gray-50 pt-4'>
                        {priceContent}
                        {extraInfo}
                    </div>
                )}
            </div>
        </button>
    );
};

export const Step2Config = ({ formData, setFormData, customColor, pricingData, isPartnerClient, t }) => {
    const configSectionRef = useRef(null);

    useEffect(() => {
        if (formData.model && configSectionRef.current) {
            configSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [formData.model]);

    if (!pricingData || !pricingData.unitaryPrices) {
        return <div className='text-center py-10 text-gray-500'>{t('common.loading')}</div>;
    }

    const { priceSuffix, unitaryPrices } = pricingData;
    const priceTransformer = (priceHT) => (priceSuffix === 'TTC' ? (priceHT * TVA_RATE) : priceHT);

    const PriceDisplay = ({ modelId }) => {
        const modelData = PRICING_STRATEGY[modelId];
        if (!modelData) return null;
        const isPrestige = modelId === 'Signature' || modelId === '360';
        const totalBase = priceTransformer(modelData.priceHT + (isPrestige ? (modelData.delivery || 0) : 0));
        const min = Math.floor((totalBase * 0.9) / 5) * 5;
        const max = Math.ceil((totalBase * 1.125) / 5) * 5;

        return (
            <div className='flex flex-col'>
                <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2'>
                    {t('step2.budget.est')} {isPrestige && t('step2.delivery.incl')}
                </span>
                <div className='flex items-baseline text-gray-900'>
                    <span className='font-light text-lg mr-2'>{t('common.between')}</span>
                    <span className='text-3xl font-black'>{min}€</span>
                    <span className='font-light text-lg mx-2'>{t('common.and')}</span>
                    <span className='text-3xl font-black'>{max}€</span>
                    <span className='ml-2 text-xl font-bold'>{priceSuffix}</span>
                </div>
            </div>
        );
    };

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleModelSelect = (id) => {
        setFormData(prev => ({
            ...prev,
            model: id,
            delivery: (id === 'Signature' || id === '360') ? true : prev.delivery,
            proAnimationHours: id === '360' ? '3' : 'none',
            proFondIA: false,
            proRGPD: false
        }));
    };

    const isFreeTemplate = !formData.isPro || (formData.isPro && unitaryPrices.template === 0);
    const isStarbooth = formData.model === 'illimite';
    const isSignature = formData.model === 'Signature';
    const is360 = formData.model === '360';
    const isMultiDay = formData.eventDuration > 1;

    const machineImages = {
        numerique: '/images/machines/PAYSAGE_CineBooth_Digital-min.jpg',
        150: '/images/machines/PAYSAGE_CineBooth_2-min.png',
        illimite: '/images/machines/PAYSAGE_Starbooth_Pro-min.png',
        Signature: '/images/machines/PAYSAGE_Signature_Gala_6-min.png',
        360: '/images/machines/PAYSAGE_Videobooth_360_4-min.png'
    };

    return (
        <div className='space-y-12 animate-in fade-in duration-500'>
            {!formData.model ? (
                <div className='text-center'>
                    <h2 className='text-3xl font-black text-gray-900 mb-2'>{t('step2.header.title')}</h2>
                    <p className='text-gray-500'>{t('step2.header.desc')}</p>
                </div>
            ) : (
                <div className='flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-10'>
                    <div className='flex items-center gap-3'>
                        <div className='bg-green-100 p-2 rounded-full'><Check className='w-5 h-5 text-green-600' /></div>
                        <div>
                            <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>{t('step2.model.selection')}</span>
                            <h3 className='font-black text-gray-900 leading-tight'>{PRICING_STRATEGY[formData.model]?.name}</h3>
                        </div>
                    </div>
                    <button onClick={() => handleChange('model', '')} className='flex items-center text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl'>
                        <RefreshCcw className='w-4 h-4 mr-2' /> {t('step2.modify')}
                    </button>
                </div>
            )}

            {!formData.model && (
                <div className='space-y-12'>
                    {/* SECTION ESSENTIELLE */}
                    {!isPartnerClient && (
                        <section>
                            <h3 className='text-xl font-black text-gray-800 mb-6 flex items-center gap-3'><Zap className='text-yellow-600' /> {t('step2.collection.essential')}</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <ModelCard
                                    t={t}
                                    id="numerique" image={machineImages.numerique} hoverColor="yellow"
                                    name={t('step2.model.digital.name')} desc={t('step2.model.digital.desc')}
                                    badge={t('step2.badge.digital')} tagline={t('step2.badge.pro')} icon={Star}
                                    onSelect={handleModelSelect} priceContent={<PriceDisplay modelId="numerique" />}
                                    extraInfo={<><span className='text-[11px] text-gray-400 font-medium mt-1'>{t('step2.degressive')}</span><span className='text-[11px] text-gray-400 font-medium mt-1'>{t('step2.dynamic_pricing')}</span></>}
                                    hidePrice={HIDE_PRICE}
                                />
                                <ModelCard
                                    t={t}
                                    id="150" image={machineImages['150']} hoverColor="yellow"
                                    name={t('step2.model.150.name')} desc={t('step2.model.150.desc')}
                                    badge={t('step2.badge.150prints')} onSelect={handleModelSelect}
                                    priceContent={<PriceDisplay modelId="150" />}
                                    extraInfo={<><span className='text-[11px] text-gray-400 font-medium mt-1'>{t('step2.degressive')}</span><span className='text-[11px] text-gray-400 font-medium mt-1'>{t('step2.dynamic_pricing')}</span></>}
                                    hidePrice={HIDE_PRICE}
                                />
                            </div>
                        </section>
                    )}

                    {/* SECTION PRESTIGE */}
                    <section>
                        <h3 className='text-xl font-black text-gray-800 mb-6 flex items-center gap-3'><Gem className='text-blue-600' /> {t('step2.collection.prestige')}</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <ModelCard
                                t={t}
                                id="illimite" image={machineImages.illimite} hoverColor="blue" isUnlimited
                                name={t('step2.model.starbooth.name')} desc={t('step2.model.starbooth.desc')}
                                tagline={t('step2.badge.pro')} icon={Star} onSelect={handleModelSelect}
                                priceContent={<PriceDisplay modelId="illimite" />}
                                extraInfo={<><span className='text-[11px] text-gray-400 font-medium mt-1'>{t('step2.degressive')}</span><span className='text-[11px] text-gray-400 font-medium mt-1'>{t('step2.dynamic_pricing')}</span></>}
                                hidePrice={HIDE_PRICE}
                            />
                            <ModelCard
                                t={t}
                                id="Signature" image={machineImages.Signature} hoverColor="purple" isUnlimited
                                name={t('step2.model.signature.name')} desc={t('step2.model.signature.desc')}
                                tagline={t('step2.model.signature.badge')} icon={Star} onSelect={handleModelSelect}
                                priceContent={<PriceDisplay modelId="Signature" />}
                                extraInfo={<><span className='text-[11px] text-gray-400 font-medium mt-1'>{t('step2.degressive')}</span><span className='text-[11px] text-gray-400 font-medium mt-1'>{t('step2.dynamic_pricing')}</span></>}
                                hidePrice={HIDE_PRICE}
                            />
                        </div>
                    </section>

                    {/* SECTION IMMERSIVE */}
                    <section>
                        <h3 className='text-xl font-black text-gray-800 mb-6 flex items-center gap-3'><Video className='text-pink-600' /> {t('step2.collection.immersive')}</h3>
                        {isMultiDay ? (
                            <div className='p-6 border-2 border-gray-200 bg-gray-50 rounded-3xl flex items-center gap-4 opacity-70 grayscale'><Ban className='text-gray-400' /><p className='text-sm font-bold text-gray-500'>{t('step2.error.360_multiday')}</p></div>
                        ) : (
                            <ModelCard
                                t={t}
                                id="360" image={machineImages['360']} hoverColor="pink"
                                name={t('step2.model.360.name')} desc={t('step2.model.360.desc')}
                                tagline={t('step2.badge.immersion')} icon={Video} onSelect={handleModelSelect}
                                priceContent={<PriceDisplay modelId="360" />}
                                extraInfo={<><span className='text-[10px] font-bold text-gray-500 italic mt-1'>{t('step2.model.360.setup_anim_incl')}</span><span className='text-[11px] text-gray-400 font-medium mt-1'>{t('step2.dynamic_pricing')}</span></>}
                                hidePrice={HIDE_PRICE}
                            />
                        )}
                    </section>
                </div>
            )}

            {/* OPTIONS DE CONFIGURATION (S'AFFICHE APRÈS SÉLECTION) */}
            {formData.model && (
                <div ref={configSectionRef} className='space-y-10 pt-4 max-w-4xl mx-auto'>
                    {/* Logistique, Template, IA, Impressions, etc. (Code inchangé) */}
                    <div className='bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6'>
                        <h3 className='text-xl font-black text-gray-900'>{t('step2.logistics.title')}</h3>
                        {(isSignature || is360) ? (
                            <div className='bg-purple-50 border-2 border-purple-100 p-6 rounded-3xl flex items-center justify-between'>
                                <div className='flex gap-4'><Truck className='text-purple-600' /><div><p className='font-black text-gray-900'>{t('step2.logistics.pro_setup')}</p><p className='text-[10px] text-purple-700 font-black uppercase tracking-widest'>{t('step2.logistics.pro_badge')}</p></div></div>
                                <span className='font-black text-purple-700'>{priceTransformer(unitaryPrices.livraison).toFixed(0)}€</span>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <button onClick={() => handleChange('delivery', false)} className={`p-6 border-2 rounded-[2rem] ${!formData.delivery ? 'border-green-600 bg-green-50' : 'border-gray-50 bg-gray-50'}`}>
                                    <span className='font-black text-gray-800'>{t('step2.logistics.pickup')}</span><span className='block text-green-600 font-black text-sm'>{t('common.free')}</span>
                                </button>
                                <button onClick={() => handleChange('delivery', true)} className={`p-6 border-2 rounded-[2rem] ${formData.delivery ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50'}`}>
                                    <span className='font-black text-gray-800'>{t('step2.logistics.delivery')}</span><span className='block text-blue-600 font-black text-sm'>+{priceTransformer(unitaryPrices.livraison).toFixed(0)}€</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <div className={`p-6 rounded-[2rem] border-2 flex flex-col justify-between ${isFreeTemplate ? 'bg-gray-50 border-gray-200' : 'bg-indigo-50 border-indigo-100'}`}>
                            <div className='flex gap-5'>
                                <img src="/images/options/option_template.png" className='w-24 h-24 object-cover rounded-2xl' alt="Template" />
                                <div className='flex-1'>
                                    <div className='flex justify-between items-center mb-1'>
                                        <h4 className='font-black text-gray-900'>{t('step2.option.template.name')}</h4>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${isFreeTemplate ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>{isFreeTemplate ? t('common.included') : `+${priceTransformer(unitaryPrices.template).toFixed(0)}€`}</span>
                                    </div>
                                    <p className='text-xs text-gray-500'>{t('step2.option.template.desc')}</p>
                                </div>
                            </div>
                            <div className='flex justify-between items-center pt-4 border-t mt-4'>
                                <label className='text-sm font-bold text-gray-700'>{isFreeTemplate ? t('step2.option.included_label') : t('step2.option.template.activate')}</label>
                                <input type='checkbox' checked={isFreeTemplate ? true : formData.templateTool} disabled={isFreeTemplate} onChange={(e) => handleChange('templateTool', e.target.checked)} className='w-6 h-6 rounded-lg' />
                            </div>
                        </div>

                        {(isStarbooth || isSignature) && (
                            <div className='p-6 rounded-[2rem] border-2 border-gray-100 bg-white shadow-sm flex flex-col justify-between'>
                                <div className='flex gap-5'>
                                    <img src="/images/options/option_IA_avant_apres.webp" className='w-24 h-24 object-cover rounded-2xl' alt="IA" />
                                    <div className='flex-1'>
                                        <div className='flex justify-between items-center mb-1'>
                                            <h4 className='font-black text-gray-900'>{t('step2.option.ia.name')}</h4>
                                            <span className='text-[10px] font-black px-2 py-1 rounded-full bg-blue-100 text-blue-700'>+{priceTransformer(unitaryPrices.ia).toFixed(0)}€</span>
                                        </div>
                                        <p className='text-xs text-gray-500'>{t('step2.option.ia.desc')}</p>
                                    </div>
                                </div>
                                <div className='flex justify-between items-center pt-4 border-t mt-4'>
                                    <label className='text-sm font-bold text-gray-700'>{t('step2.option.ia.activate')}</label>
                                    <input type='checkbox' checked={formData.proFondIA} onChange={(e) => handleChange('proFondIA', e.target.checked)} className='w-6 h-6 text-blue-600 rounded-lg' />
                                </div>
                            </div>
                        )}
                    </div>

                    {(isStarbooth || isSignature) && (
                        <div className='bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6'>
                            <div className='flex gap-4'>
                                <div className='bg-white p-3 rounded-xl shadow-sm'><Printer className='text-indigo-600' /></div>
                                <div><h4 className='font-black text-gray-900'>{t('step2.option.prints.name')}</h4><p className='text-xs text-indigo-800 mt-1'>{t('step2.option.prints.desc')}</p></div>
                            </div>
                            <select value={formData.proImpressions} onChange={(e) => handleChange('proImpressions', parseInt(e.target.value))} className='w-full md:w-auto px-4 py-3 rounded-xl bg-white font-bold'>
                                <option value={1}>{t('step2.option.prints.1print')}</option>
                                {[2, 3, 4, 5].map(n => <option key={n} value={n}>{t('step2.option.prints.nprints', { n, p: priceTransformer(unitaryPrices.impressionSup * (n - 1)).toFixed(0), s: priceSuffix })}</option>)}
                            </select>
                        </div>
                    )}

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {formData.delivery && (
                            <div className='bg-gray-50 p-6 rounded-[2rem]'>
                                <label className='block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4'>{t('step2.option.anim.label')}</label>
                                {isMultiDay ? (
                                    <div className="p-4 bg-red-50 text-red-700 text-[11px] font-bold rounded-2xl flex items-center italic"><Ban className="w-4 h-4 mr-2" /> {t('step2.error.anim_multiday')}</div>
                                ) : (
                                    <select value={formData.proAnimationHours} onChange={e => handleChange('proAnimationHours', e.target.value)} className='w-full px-4 py-4 border-none rounded-2xl bg-white shadow-sm font-bold text-gray-900 text-sm'>
                                        {is360 ? (
                                            <><option value={3}>{t('step2.option.anim.360_3h')}</option>
                                                {[4, 5, 6, 7, 8].map(h => <option key={h} value={h}>{t('step2.option.anim.nh', { h, p: priceTransformer((h - 3) * 90).toFixed(0), s: priceSuffix })}</option>)}</>
                                        ) : (
                                            <><option value='none'>{t('step2.option.anim.none')}</option>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => <option key={h} value={h}>{t('step2.option.anim.nh', { h, p: priceTransformer(h * 45).toFixed(0), s: priceSuffix })}</option>)}</>
                                        )}
                                    </select>
                                )}
                            </div>
                        )}
                        {is360 ? (
                            <div className='flex items-center justify-between bg-pink-50 p-6 rounded-[2rem] border border-pink-100'>
                                <div><div className='flex items-center gap-3 mb-1'><Music className='text-pink-600' /><span className='font-bold text-sm'>{t('step2.option.speaker.name')}</span></div><p className='text-[10px] text-pink-800 ml-8 max-w-[200px]'>{t('step2.option.speaker.desc')}</p></div>
                                <div className='flex items-center gap-3'><span className='font-black text-pink-600 text-sm'>+{priceTransformer(unitaryPrices.speaker).toFixed(0)}€</span><input type='checkbox' checked={formData.optionSpeaker} onChange={(e) => handleChange('optionSpeaker', e.target.checked)} className='w-7 h-7 rounded-lg text-pink-600' /></div>
                            </div>
                        ) : (
                            formData.isPro && (
                                <div className='flex items-center justify-between bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100'>
                                    <div><div className='flex items-center gap-3 mb-1'><Star className='text-indigo-600 fill-current' /><span className='font-bold text-sm text-indigo-900'>{t('step2.option.rgpd.name')}</span></div><p className='text-[10px] text-indigo-800 ml-8 max-w-[200px]'>{t('step2.option.rgpd.desc')}</p></div>
                                    <div className='flex items-center gap-3'><span className='font-black text-indigo-600 text-sm'>+{priceTransformer(unitaryPrices.rgpd).toFixed(0)}€</span><input type='checkbox' checked={formData.proRGPD} onChange={(e) => handleChange('proRGPD', e.target.checked)} className='w-7 h-7 rounded-lg text-indigo-600' /></div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};