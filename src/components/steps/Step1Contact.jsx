// src/components/steps/Step1Contact.jsx

import React from 'react';
import { InputField } from '../ui/InputField';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';

export const Step1Contact = ({ formData, setFormData, customColor, currentStep, setCurrentStep }) => {

    // Gestion adresse facturation
    const handleBillingAddressSelect = (addr) => {
        setFormData(prev => ({
            ...prev,
            billingFullAddress: addr.fullAddress,
            billingStreet: addr.street,
            billingLat: addr.lat,
            billingLng: addr.lng,
            billingZipCode: addr.postal,
            billingCity: addr.city,
            saveNewBillingAddress: true
        }));
    };

    // Gestion adresse livraison
    const handleDeliveryAddressSelect = (addr) => {
        setFormData(prev => ({
            ...prev,
            deliveryFullAddress: addr.fullAddress,
            deliveryLat: addr.lat,
            deliveryLng: addr.lng,
            deliveryStreet: addr.street, 
            deliveryZipCode: addr.postal,
            deliveryCity: addr.city,
            saveNewDeliveryAddress: true 
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

            {/* --- BLOC IDENTITÉ --- */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='md:col-span-2'>
                    <InputField
                        label="Nom et Prénom"
                        value={formData.fullName}
                        onChange={e => handleChange('fullName', e.target.value)}
                        placeholder='Jean Dupont'
                        required
                    />
                </div>
                <InputField
                    label="Email"
                    type='email'
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder='jean@exemple.fr'
                    required
                />
                <InputField
                    label="Téléphone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value.replace(/[^0-9+]/g, ''))}
                    placeholder="06 00 00 00 00"
                    required
                />
            </div>

            {/* --- TOGGLE PRO --- */}
            <div className='flex items-center space-x-3 bg-blue-50 p-4 rounded-xl border border-blue-200 mt-4'>
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
                        }));
                    }}
                    className='w-5 h-5 text-blue-600 rounded-lg cursor-pointer border-gray-300'
                />
                <label htmlFor='isPro' className='text-sm font-medium text-gray-800 cursor-pointer select-none'>
                    Je suis un professionnel (Société, Agence...)
                </label>
            </div>

            {/* Champ Nom Société (Reste conditionné au statut Pro) */}
            {formData.isPro && (
                <div className='animate-in slide-in-from-top-2'>
                    <InputField
                        label="Nom de la société"
                        value={formData.companyName}
                        onChange={e => handleChange('companyName', e.target.value)}
                        placeholder='Ma Société SAS'
                        required
                    />
                </div>
            )}

            {/* --- BLOC ADRESSES --- */}
            <div className='bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-5 mt-4'>
                <h3 className='font-bold text-gray-700 uppercase text-sm tracking-wider border-b border-gray-200 pb-2 mb-4'>
                    Localisation & Facturation
                </h3>

                {/* 1. Adresse de Livraison (Lieu de l'événement) */}
                <div className='space-y-3'>
                    {/* AJOUT : Champ Nom du lieu (Toujours visible) */}
                    <InputField
                        label="Nom du lieu"
                        placeholder="Hotel, salon, restaurant, particulier..."
                        value={formData.newDeliveryAddressName || ''}
                        onChange={e => handleChange('newDeliveryAddressName', e.target.value)}
                    />

                    {/* Libellé "Adresse complète" comme sur Step1Partenaires */}
                    <AddressAutocomplete
                        label="Adresse complète"
                        required
                        defaultValue={formData.deliveryFullAddress || ''}
                        onAddressSelect={handleDeliveryAddressSelect}
                    />
                </div>

                {/* 2. Checkbox "Facturation identique" */}
                <div className='flex items-center space-x-3 pt-2 bg-white p-3 rounded-lg border border-gray-200'>
                    <input
                        type='checkbox'
                        id='deliverySameAsBilling'
                        checked={formData.deliverySameAsBilling}
                        onChange={e => handleChange('deliverySameAsBilling', e.target.checked)}
                        className='w-5 h-5 text-blue-600 rounded-md cursor-pointer border-gray-300 focus:ring-blue-500'
                    />
                    <label htmlFor='deliverySameAsBilling' className='text-sm font-medium text-gray-700 cursor-pointer select-none'>
                        L'adresse de facturation est identique au lieu de l'événement
                    </label>
                </div>

                {/* 3. Adresse de Facturation (Si différente) */}
                {!formData.deliverySameAsBilling && (
                    <div className='animate-in slide-in-from-top-2 pt-2 space-y-3 border-t border-gray-200 mt-2'>
                        <p className='text-sm text-blue-600 font-semibold pt-2'>Détails Facturation</p>

                        {/* AJOUT : Champ Nom de l'adresse (Toujours visible si le bloc est ouvert) */}
                        <InputField
                            label="Nom de l'adresse de facturation"
                            placeholder="ex: Bureau, Siège..."
                            value={formData.newBillingAddressName || ''}
                            onChange={e => handleChange('newBillingAddressName', e.target.value)}
                        />

                        {/* Libellé "Adresse complète" comme sur Step1Partenaires */}
                        <AddressAutocomplete
                            label="Adresse complète"
                            required
                            defaultValue={formData.billingFullAddress || ''}
                            onAddressSelect={handleBillingAddressSelect}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};