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
                Détails de l'événement
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

            <div>
                <label className='block text-lg font-bold text-gray-900 mb-4'>
                    Type de besoin <span className='text-red-500'>*</span>
                </label>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <button
                        type='button'
                        onClick={() => handleChange('needType', 'eco')}
                        className={`p-6 border-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${formData.needType === 'eco'
                            ? 'border-blue-600 bg-blue-50 shadow-xl ring-4 ring-blue-100'
                            : 'border-gray-200 bg-white hover:border-blue-300 shadow-md'
                            }`}
                    >
                        <div className='text-5xl mb-3'>💰</div>
                        <h3 className='font-bold text-lg text-gray-900 mb-1'>Nos bornes compactes</h3>
                        <p className='text-sm text-gray-600'>
                            Un petit concentré de technologies, dans un espace réduit !
                        </p>
                    </button>

                    <button
                        type='button'
                        onClick={() => handleChange('needType', 'pro')}
                        className={`p-6 border-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${formData.needType === 'pro'
                            ? 'border-blue-600 bg-blue-50 shadow-xl ring-4 ring-blue-100'
                            : 'border-gray-200 bg-white hover:border-blue-300 shadow-md'
                            }`}
                    >
                        <div className='text-5xl mb-3'>⭐</div>
                        <h3 className='font-bold text-lg text-gray-900 mb-1'>Notre borne premium</h3>
                        <p className='text-sm text-gray-600'>
                            Machine haut de gamme avec service, qui en impose par sa prestance !
                        </p>
                    </button>

                    <button
                        type='button'
                        onClick={() => handleChange('needType', '360')}
                        className={`p-6 border-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${formData.needType === '360'
                            ? 'border-blue-600 bg-blue-50 shadow-xl ring-4 ring-blue-100'
                            : 'border-gray-200 bg-white hover:border-blue-300 shadow-md'
                            }`}
                    >
                        <div className='text-5xl mb-3'>🎥</div>
                        <h3 className='font-bold text-lg text-gray-900 mb-1'>Photobooth 360</h3>
                        <p className='text-sm text-gray-600'>Expérience immersive à 360°</p>
                    </button>
                </div>
            </div>
        </div>
    );
};