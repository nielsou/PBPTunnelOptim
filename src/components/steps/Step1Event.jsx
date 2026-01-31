import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Info, Mail, Phone, ChevronDown, Building2 } from 'lucide-react';
import { InputField } from '../ui/InputField';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';

export const Step1Event = ({ formData, setFormData, customColor }) => {
    const [dateError, setDateError] = useState('');
    const todayStr = new Date().toISOString().split('T')[0];
    
    const getDaysDiff = (selectedDate) => {
        if (!selectedDate) return null;
        const start = new Date(todayStr);
        const end = new Date(selectedDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    const daysDiff = getDaysDiff(formData.eventDate);
    const isToday = formData.eventDate === todayStr;
    const isLastMinute = daysDiff > 0 && daysDiff <= 3;

    const handleAddressSelect = (addr) => {
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

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        handleChange('eventDate', selectedDate);
        if (selectedDate && selectedDate < todayStr) {
            setDateError("La date de l'événement ne peut pas être dans le passé.");
        } else {
            setDateError('');
        }
    };

    const eventTypes = [
        { id: 'entreprise', label: "Soirée d'entreprise" },
        { id: 'mariage', label: "Mariage" },
        { id: 'anniversaire', label: "Anniversaire" },
        { id: 'privee', label: "Soirée privée" },
        { id: 'autre', label: "Autre" }
    ];

    return (
        <div className='space-y-8 animate-in fade-in duration-500'>
            <h2 className='text-3xl font-extrabold text-gray-900 border-b pb-2' style={{ color: customColor, borderColor: customColor }}>
                Votre Événement
            </h2>

            {/* 1. TYPE D'ÉVÉNEMENT (D'ABORD) */}
            <div className='space-y-3'>
                <label className='block text-sm font-bold text-gray-700'>Quel type d'événement organisez-vous ? *</label>
                <div className="relative group">
                    <select
                        value={formData.eventType}
                        onChange={(e) => handleChange('eventType', e.target.value)}
                        className="w-full appearance-none bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-900 font-bold py-4 px-5 rounded-2xl transition-all cursor-pointer focus:ring-4 focus:ring-blue-100 outline-none"
                    >
                        <option value="" disabled>Sélectionnez le type d'événement...</option>
                        {eventTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                        <ChevronDown className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* 2. CASE SOCIÉTÉ (ENSUITE) */}
            <div className='flex items-center space-x-3 bg-blue-50 p-5 rounded-2xl border border-blue-200 shadow-sm'>
                <input
                    type='checkbox'
                    id='isPro'
                    checked={formData.isPro}
                    onChange={e => handleChange('isPro', e.target.checked)}
                    className='w-6 h-6 text-blue-600 rounded-lg cursor-pointer border-gray-300'
                />
                <label htmlFor='isPro' className='flex items-center gap-2 text-sm font-bold text-blue-900 cursor-pointer select-none'>
                    <Building2 className="w-5 h-5" /> Je suis une société (prix HT et accès aux options pro)
                </label>
            </div>

            <div className='bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <InputField
                            label="Date de l'événement"
                            type='date'
                            value={formData.eventDate}
                            onChange={handleDateChange}
                            required
                            min={todayStr}
                        />
                        {dateError && <p className="text-red-500 text-xs font-bold mt-1 animate-pulse italic">⚠️ {dateError}</p>}
                    </div>
                    <InputField
                        label="Durée (jours)"
                        type='number'
                        value={formData.eventDuration}
                        onChange={e => handleChange('eventDuration', Math.max(1, parseInt(e.target.value) || 1))}
                        required
                    />
                </div>

                <div className='space-y-4'>
                    {/* 3. NOM DU LIEU (OBLIGATOIRE) */}
                    <InputField
                        label="Nom du lieu (Hôtel, Restaurant, Particulier...) *"
                        placeholder="Ex: Pavillon Royal"
                        value={formData.newDeliveryAddressName}
                        onChange={e => handleChange('newDeliveryAddressName', e.target.value)}
                        required
                    />
                    <AddressAutocomplete
                        label="Adresse complète du lieu"
                        required
                        defaultValue={formData.deliveryFullAddress}
                        onAddressSelect={handleAddressSelect}
                    />
                    {formData.deliveryFullAddress && !formData.deliveryLat && (
                        <p className='text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg'>
                            ⚠️ Veuillez sélectionner l'adresse dans la liste suggérée pour calculer les frais de livraison.
                        </p>
                    )}
                </div>
            </div>

            {/* ALERTES DATE */}
            {isToday && (
                <div className='animate-in fade-in slide-in-from-top-2 p-6 bg-red-50 border-2 border-red-200 rounded-2xl'>
                    <div className='flex items-start space-x-3 text-red-900'>
                        <Clock className='w-6 h-6 mt-1' />
                        <div>
                            <h3 className='font-bold text-lg'>Réservation pour aujourd'hui ?</h3>
                            <p className='mb-4'>Veuillez nous contacter directement :</p>
                            <div className='flex flex-col sm:flex-row gap-4'>
                                <a href="tel:0142865424" className='flex items-center justify-center px-4 py-2 bg-white border border-red-300 rounded-lg font-bold'>
                                    <Phone className='w-4 h-4 mr-2' /> 01 42 86 54 24
                                </a>
                                <a href="mailto:contact@photobooth-paris.fr" className='flex items-center justify-center px-4 py-2 bg-white border border-red-300 rounded-lg font-bold'>
                                    <Mail className='w-4 h-4 mr-2' /> contact@photobooth-paris.fr
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isLastMinute && (
                <div className='p-6 bg-[#F3E8FF] border-2 border-purple-200 rounded-2xl flex items-start space-x-3 text-purple-900'>
                    <Info className='w-6 h-6 mt-1 text-purple-600' />
                    <div>
                        <h3 className='font-bold text-lg'>Expertise dernière minute</h3>
                        <p className='text-sm leading-relaxed'>Nous gérons les urgences avec professionnalisme. En cas d'indisponibilité, nous vous proposerons un surclassement adapté.</p>
                    </div>
                </div>
            )}
        </div>
    );
};