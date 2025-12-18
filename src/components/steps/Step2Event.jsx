// src/components/steps/Step2Event.jsx

import React from 'react';
import { MapPin } from 'lucide-react';
import { InputField } from '../ui/InputField';

export const Step2Event = ({ formData, setFormData, customColor }) => {

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className='space-y-6'>
            <h2
                className='text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2'
                style={{ color: customColor, borderColor: customColor }}
            >
                Date & Lieu de l'événement
            </h2>

            {/* Rappel visuel de l'adresse choisie à l'étape 1 */}
            <div className='p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center text-blue-800 shadow-sm'>
                <MapPin className='w-5 h-5 mr-3 text-blue-600' />
                <div className='flex flex-col'>
                    <span className='text-xs font-bold uppercase tracking-wider text-blue-400'>Lieu de l'événement</span>
                    <span className='text-sm font-medium'>{formData.deliveryFullAddress || 'Adresse non renseignée'}</span>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InputField
                    label="Date de l'événement"
                    type='date'
                    value={formData.eventDate}
                    onChange={e => handleChange('eventDate', e.target.value)}
                    required
                />
                <InputField
                    label="Durée (jours)"
                    type='number'
                    value={formData.eventDuration}
                    onChange={e =>
                        handleChange('eventDuration', Math.max(1, parseInt(e.target.value) || 1))
                    }
                    required
                />
            </div>
            
            <div className='bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-500 italic text-center mt-4'>
                Le choix du modèle de borne se fera à l'étape suivante.
            </div>
        </div>
    );
};