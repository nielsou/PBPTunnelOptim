// src/components/steps/Step1Contact.jsx

import React from 'react';
import { User } from 'lucide-react';
import { InputField } from '../ui/InputField';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';

export const Step1Contact = ({ formData, setFormData, customColor, currentStep, setCurrentStep }) => {

    // Pour la facturation (si différente de la livraison)
    const handleBillingAddressSelect = (addr) => {
        setFormData(prev => ({
            ...prev,
            billingFullAddress: addr.fullAddress,
            billingLat: addr.lat,
            billingLng: addr.lng,
            billingZipCode: addr.postal,
            billingCity: addr.city
        }));
    };

    // Pour la livraison
    const handleDeliveryAddressSelect = (addr) => {
        setFormData(prev => ({
            ...prev,
            deliveryFullAddress: addr.fullAddress,
            deliveryLat: addr.lat,
            deliveryLng: addr.lng,
            deliveryZipCode: addr.postal,
            deliveryCity: addr.city,
            saveNewDeliveryAddress: true // Pour le mode Pro si activé
        }));
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className='space-y-6'>
            <h2 className='text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2' style={{ color: customColor, borderColor: customColor }}>
                Informations de contact
            </h2>

            <InputField label="Nom et Prénom" value={formData.fullName} onChange={e => handleChange('fullName', e.target.value)} placeholder='Jean Dupont' required />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InputField label="Email" type='email' value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder='jean@exemple.fr' required />
                <InputField
                    label="Téléphone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="06 00 00 00 00 ou +33..."
                    required
                />
            </div>

            {/* --- BLOC ADRESSES --- */}
            <div className='bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-4'>

                {/* 1. Adresse de Livraison (Toujours visible) */}
                <AddressAutocomplete
                    label="Lieu de l'événement (Livraison)"
                    required
                    defaultValue={formData.deliveryFullAddress || ''}
                    onAddressSelect={handleDeliveryAddressSelect}
                />

                {/* 2. Checkbox "Facturation identique" */}
                <div className='flex items-center space-x-3 pt-2'>
                    <input
                        type='checkbox'
                        id='deliverySameAsBilling'
                        checked={formData.deliverySameAsBilling}
                        onChange={e => handleChange('deliverySameAsBilling', e.target.checked)}
                        className='w-5 h-5 text-blue-600 rounded-md cursor-pointer border-gray-300 focus:ring-blue-500'
                    />
                    <label htmlFor='deliverySameAsBilling' className='text-sm font-medium text-gray-700 cursor-pointer select-none'>
                        L'adresse de facturation est identique à l'adresse de livraison
                    </label>
                </div>

                {/* 3. Adresse de Facturation (Conditionnelle) */}
                {!formData.deliverySameAsBilling && (
                    <div className='animate-in slide-in-from-top-2 pt-2'>
                        <AddressAutocomplete
                            label="Adresse de facturation"
                            required
                            defaultValue={formData.billingFullAddress || ''}
                            onAddressSelect={handleBillingAddressSelect}
                        />
                    </div>
                )}
            </div>

            {/* --- BLOC PRO (Toggle) --- */}
            <div className='flex items-center space-x-3 bg-blue-50 p-4 rounded-xl border border-blue-200'>
                <input
                    type='checkbox'
                    id='isPro'
                    checked={formData.isPro}
                    onChange={e => {
                        const isPro = e.target.checked;
                        setFormData(prev => ({
                            ...prev,
                            isPro: isPro,
                            companyName: isPro ? prev.companyName : '',
                            // On ne touche plus aux adresses ici, c'est géré au dessus
                        }));
                    }}
                    className='w-5 h-5 text-blue-600 rounded-lg cursor-pointer border-gray-300'
                />
                <label htmlFor='isPro' className='text-sm font-medium text-gray-800 cursor-pointer select-none'>
                    Je suis un professionnel (Affichage des prix en HT)
                </label>
            </div>

            {formData.isPro && (
                <div className='space-y-4 bg-indigo-50 p-6 rounded-xl border border-indigo-200 animate-in slide-in-from-top-2'>
                    <h3 className='text-xl font-bold text-gray-800'>Détails Société</h3>
                    <InputField label="Nom de la société" value={formData.companyName} onChange={e => handleChange('companyName', e.target.value)} placeholder='Ma Société SAS' required />
                </div>
            )}
        </div>
    );
};