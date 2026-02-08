import React from 'react';
import { User, Mail, Phone, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { InputField } from '../ui/InputField';

export const Step3Contact = ({ formData, setFormData, t }) => {
    
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className='space-y-8 animate-in fade-in slide-in-from-right-4 duration-500'>
            
            {/* INFOS PERSONNELLES */}
            <div className='space-y-6'>
                <h3 className='text-lg font-black text-gray-900 flex items-center gap-2'>
                    <User className='w-5 h-5 text-[#BE2A55]' />
                    {t('step3.contact.title')}
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <InputField
                        label={t('step3.name')}
                        placeholder="Jean Dupont"
                        value={formData.fullName}
                        onChange={e => handleChange('fullName', e.target.value)}
                        required
                    />
                    <InputField
                        label={t('step3.email')}
                        type="email"
                        placeholder="jean@exemple.com"
                        value={formData.email}
                        onChange={e => handleChange('email', e.target.value)}
                        required
                    />
                </div>

                <InputField
                    label={t('step3.phone')}
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    required
                />
            </div>

            {/* OPTION RAPPEL */}
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

            {/* FACTURATION SI PRO */}
            {formData.isPro && (
                <div className='pt-6 border-t border-gray-100 space-y-6 animate-in slide-in-from-top-4'>
                    <h3 className='text-lg font-black text-gray-900 flex items-center gap-2'>
                        <Building2 className='w-5 h-5 text-blue-600' />
                        {t('step3.billing.title')}
                    </h3>

                    <InputField
                        label={t('step3.company.name')}
                        placeholder="Ma Super Entreprise SAS"
                        value={formData.companyName}
                        onChange={e => handleChange('companyName', e.target.value)}
                        required={formData.isPro}
                    />

                    <div className='flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200'>
                        <input
                            type='checkbox'
                            id='sameAddress'
                            checked={formData.billingSameAsEvent}
                            onChange={e => handleChange('billingSameAsEvent', e.target.checked)}
                            className='w-5 h-5 text-[#BE2A55] rounded border-gray-300 focus:ring-[#BE2A55]'
                        />
                        <label htmlFor='sameAddress' className='text-sm font-bold text-gray-700 cursor-pointer select-none'>
                            {t('step3.same.addr')}
                        </label>
                    </div>
                </div>
            )}

            {/* RGPD / TRUST */}
            <div className='flex items-start gap-3 p-4 bg-green-50 rounded-2xl border border-green-100'>
                <ShieldCheck className='w-5 h-5 text-green-600 shrink-0 mt-0.5' />
                <p className='text-[11px] text-green-800 leading-relaxed font-medium'>
                    {t('step3.rgpd.notice')}
                </p>
            </div>
        </div>
    );
};