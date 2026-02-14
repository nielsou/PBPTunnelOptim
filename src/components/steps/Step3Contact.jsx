import React from 'react';
import { User, Phone, Building2, CheckCircle2, ShieldCheck, Receipt } from 'lucide-react';
import { InputField } from '../ui/InputField';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';

export const Step3Contact = ({ formData, setFormData, t }) => {
    
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleBillingAddressSelect = (addr) => {
        setFormData(prev => ({
            ...prev,
            billingFullAddress: addr.fullAddress,
            billingLat: addr.lat,
            billingLng: addr.lng,
            billingStreet: addr.street, 
            billingZipCode: addr.postal,
            billingCity: addr.city,
            saveNewBillingAddress: true 
        }));
    };

    const switchToOtherAddress = () => {
        setFormData(prev => ({
            ...prev,
            billingSameAsEvent: false,
            billingFullAddress: '',
            newBillingAddressName: '',
            billingStreet: '',
            billingZipCode: '',
            billingCity: ''
        }));
    };

    return (
        <div className='space-y-8 animate-in fade-in slide-in-from-right-4 duration-500'>
            
            {/* 1. INFOS PERSONNELLES */}
            <div className='space-y-6'>
                <h3 className='text-lg font-black text-gray-900 flex items-center gap-2'>
                    <User className='w-5 h-5 text-[#BE2A55]' />
                    {t('step3.contact.title')}
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <InputField
                        label={t('step3.name')}
                        placeholder={t('step3.placeholder.name')}
                        value={formData.fullName}
                        onChange={e => handleChange('fullName', e.target.value)}
                        required
                    />
                    <InputField
                        label={t('step3.email')}
                        type="email"
                        placeholder={t('step3.placeholder.email')}
                        value={formData.email}
                        onChange={e => handleChange('email', e.target.value)}
                        required
                    />
                </div>

                <InputField
                    label={t('step3.phone')}
                    type="tel"
                    placeholder={t('step3.placeholder.phone')}
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    required
                />
            </div>

            {/* 2. OPTION RAPPEL */}
            <div className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                formData.wantsCallback 
                ? 'border-[#BE2A55] bg-pink-50/30' 
                : 'border-gray-100 bg-gray-50/50'
            }`}
            onClick={() => handleChange('wantsCallback', !formData.wantsCallback)}
            >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    formData.wantsCallback ? 'bg-[#BE2A55] text-white' : 'bg-white text-gray-400'
                }`}>
                    <Phone className="w-6 h-6" />
                </div>
                <div className='flex-1'>
                    <h4 className='font-bold text-gray-900'>{t('step3.callback.title')}</h4>
                    <p className='text-xs text-gray-500 font-medium'>{t('step3.callback.subtitle')}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    formData.wantsCallback ? 'bg-[#BE2A55] border-[#BE2A55]' : 'border-gray-300'
                }`}>
                    {formData.wantsCallback && <CheckCircle2 className='w-4 h-4 text-white' />}
                </div>
            </div>

            {/* 3. FACTURATION */}
            <div className='pt-8 border-t border-gray-100 space-y-6 animate-in slide-in-from-top-4'>
                <h3 className='text-lg font-black text-gray-900 flex items-center gap-2'>
                    <Receipt className='w-5 h-5 text-blue-600' />
                    {t('step3.billing.title')}
                </h3>

                {/* Champ Société : Visible UNIQUEMENT si Pro */}
                {formData.isPro && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <InputField
                            label={t('step3.company.name')}
                            placeholder={t('step3.placeholder.company')}
                            value={formData.companyName}
                            onChange={e => handleChange('companyName', e.target.value)}
                            required={true}
                        />
                    </div>
                )}

                {/* BLOC ADRESSE DE FACTURATION */}
                <div className='space-y-3'>
                    <label className='block text-sm font-semibold text-gray-800'>{t('step3.billing.label')}</label>
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* OPTION A : IDENTIQUE */}
                        <button 
                            onClick={() => handleChange('billingSameAsEvent', true)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                formData.billingSameAsEvent 
                                ? 'border-blue-600 bg-blue-50' 
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            <div className='flex items-center gap-3 mb-2'>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                    formData.billingSameAsEvent ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                                }`}>
                                    {formData.billingSameAsEvent && <CheckCircle2 className='w-3 h-3 text-white' />}
                                </div>
                                <span className='font-bold text-gray-900'>{t('step3.billing.btn_same')}</span>
                            </div>
                            <p className='text-xs text-gray-500 ml-8 line-clamp-2'>
                                {formData.deliveryFullAddress || t('step3.billing.undefined')}
                            </p>
                        </button>

                        {/* OPTION B : AUTRE ADRESSE */}
                        <button 
                            onClick={switchToOtherAddress}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                !formData.billingSameAsEvent 
                                ? 'border-blue-600 bg-blue-50' 
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            <div className='flex items-center gap-3 mb-2'>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                    !formData.billingSameAsEvent ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                                }`}>
                                    {!formData.billingSameAsEvent && <CheckCircle2 className='w-3 h-3 text-white' />}
                                </div>
                                <span className='font-bold text-gray-900'>{t('step3.billing.btn_other')}</span>
                            </div>
                            <p className='text-xs text-gray-500 ml-8'>
                                {t('step3.billing.sub_other')}
                            </p>
                        </button>
                    </div>

                    {/* CHAMPS SUPPLÉMENTAIRES */}
                    {!formData.billingSameAsEvent && (
                        <div className='animate-in fade-in slide-in-from-top-2 pt-4 bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4'>
                            
                            {/* 1. NOM DE L'ADRESSE (CORRIGÉ : Pas d'étoile dans le label, t() utilisé) */}
                            <InputField
                                label={t('step3.billing.addr_name')}
                                placeholder={t('step3.billing.addr_name_ph')}
                                value={formData.newBillingAddressName}
                                onChange={e => handleChange('newBillingAddressName', e.target.value)}
                                required={true}
                            />

                            {/* 2. RECHERCHE D'ADRESSE (CORRIGÉ : Pas d'étoile dans le label, t() utilisé) */}
                            <AddressAutocomplete
                                label={t('step3.billing.search')}
                                placeholder={t('step3.billing.search')}
                                required={true}
                                defaultValue={formData.billingFullAddress}
                                onAddressSelect={handleBillingAddressSelect}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* 4. RGPD / TRUST */}
            <div className='flex items-start gap-3 p-4 bg-green-50 rounded-2xl border border-green-100'>
                <ShieldCheck className='w-5 h-5 text-green-600 shrink-0 mt-0.5' />
                <p className='text-[11px] text-green-800 leading-relaxed font-medium'>
                    {t('step3.rgpd.notice')}
                </p>
            </div>
        </div>
    );
};