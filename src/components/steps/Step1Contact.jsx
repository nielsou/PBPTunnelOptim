// src/components/steps/Step1Contact.jsx

import React from 'react';
import { User } from 'lucide-react';
import { InputField } from '../ui/InputField';
import { PhoneInputField } from '../ui/PhoneInputField';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';

export const Step1Contact = ({ formData, setFormData, customColor, currentStep, setCurrentStep }) => {
    
    const handleAddressSelect = (addr) => {
        setFormData(prev => ({
            ...prev,
            billingFullAddress: addr.fullAddress
        }));
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className='space-y-6'>
            <h2
                className='text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2'
                style={{ color: customColor, borderColor: customColor }}
            >
                Informations de contact
            </h2>

            <InputField
                label="Nom et Prénom"
                value={formData.fullName}
                onChange={e => handleChange('fullName', e.target.value)}
                placeholder='Jean Dupont'
                required
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InputField
                    label="Email"
                    type='email'
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder='jean@exemple.fr'
                    required
                />
                <PhoneInputField
                    value={formData.phone}
                    onChange={value => handleChange('phone', value)}
                />
            </div>

            <div className='flex items-center space-x-3 bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-inner'>
                <input
                    type='checkbox'
                    id='isPro'
                    checked={formData.isPro}
                    onChange={e => {
                        const isPro = e.target.checked;
                        setFormData(prev => ({
                            ...prev,
                            isPro: isPro,
                            needType: '',
                            model: '', 
                            delivery: '', 
                            proAnimationHours: 'none',
                            proFondIA: 0,
                            proRGPD: 0,
                            proImpressions: 1,
                            templateTool: 0,
                        }));
                        if (currentStep > 2) setCurrentStep(2);
                    }}
                    className='w-5 h-5 text-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer border-gray-400'
                />
                <label
                    htmlFor='isPro'
                    className='text-sm font-medium text-gray-800 cursor-pointer'
                >
                    Je suis un professionnel (Affichage des prix en HT)
                </label>
            </div>

            {formData.isPro && (
                <div className='space-y-4 bg-indigo-50 p-6 rounded-xl border border-indigo-200 shadow-md'>
                    <h3 className='text-xl font-bold text-gray-800'>Détails Professionnels</h3>
                    <InputField
                        label="Nom de la société"
                        value={formData.companyName}
                        onChange={e => handleChange('companyName', e.target.value)}
                        placeholder='Ma Société SAS'
                        required
                    />
                    <div>
                        <AddressAutocomplete
                            label="Adresse de facturation"
                            required
                            defaultValue={formData.billingFullAddress || ''}
                            onAddressSelect={handleAddressSelect}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};