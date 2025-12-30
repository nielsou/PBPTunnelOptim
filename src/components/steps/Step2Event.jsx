// src/components/steps/Step2Event.jsx
import React, { useState } from 'react'; // Ajout de useState
import { MapPin, Calendar, Info, Mail, Phone, Clock } from 'lucide-react';
import { InputField } from '../ui/InputField';

export const Step2Event = ({ formData, setFormData, customColor }) => {
    const [dateError, setDateError] = useState(''); // État pour stocker le message d'erreur
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Calcul de l'écart en jours
    const getDaysDiff = (selectedDate) => {
        if (!selectedDate) return null;
        const start = new Date(todayStr);
        const end = new Date(selectedDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    const daysDiff = getDaysDiff(formData.eventDate);
    const isToday = formData.eventDate === todayStr;
    const isLastMinute = daysDiff > 0 && daysDiff <= 3;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Nouvelle fonction pour gérer la saisie de la date avec message d'erreur
    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        
        if (selectedDate && selectedDate < todayStr) {
            setDateError("La date de l'événement ne peut pas être dans le passé.");
            handleChange('eventDate', ''); // On vide la date pour bloquer l'étape
        } else {
            setDateError(''); // On efface l'erreur
            handleChange('eventDate', selectedDate);
        }
    };

    return (
        <div className='space-y-6'>
            <h2 className='text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2' style={{ color: customColor, borderColor: customColor }}>
                Date & Lieu de l'événement
            </h2>

            <div className='p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center text-blue-800 shadow-sm'>
                <MapPin className='w-5 h-5 mr-3 text-blue-600' />
                <div className='flex flex-col'>
                    <span className='text-xs font-bold uppercase tracking-wider text-blue-400'>Lieu de l'événement</span>
                    <span className='text-sm font-medium'>{formData.deliveryFullAddress || 'Adresse non renseignée'}</span>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <InputField
                        label="Date de l'événement"
                        type='date'
                        value={formData.eventDate}
                        onChange={handleDateChange} // Utilise la nouvelle fonction de contrôle
                        required
                        min={todayStr}
                    />
                    {/* Message d'erreur visuel */}
                    {dateError && (
                        <p className="text-red-500 text-xs font-bold mt-1 animate-pulse italic">
                            ⚠️ {dateError}
                        </p>
                    )}
                </div>
                <InputField
                    label="Durée (jours)"
                    type='number'
                    value={formData.eventDuration}
                    onChange={e => handleChange('eventDuration', Math.max(1, parseInt(e.target.value) || 1))}
                    required
                />
            </div>

            {/* --- ENCART JOUR MÊME (BLOQUANT) --- */}
            {isToday && (
                <div className='animate-in fade-in slide-in-from-top-2 p-6 bg-red-50 border-2 border-red-200 rounded-2xl'>
                    <div className='flex items-start space-x-3'>
                        <Clock className='w-6 h-6 text-red-600 mt-1' />
                        <div>
                            <h3 className='font-bold text-red-900 text-lg'>Réservation pour aujourd'hui ?</h3>
                            <p className='text-red-800 mb-4'>
                                Pour une installation immédiate, veuillez nous contacter directement par téléphone ou par email :
                            </p>
                            <div className='flex flex-col sm:flex-row gap-4'>
                                <a href="tel:0142865424" className='flex items-center justify-center px-4 py-2 bg-white border border-red-300 rounded-lg text-red-700 font-bold hover:bg-red-100 transition-colors'>
                                    <Phone className='w-4 h-4 mr-2' /> 01 42 86 54 24
                                </a>
                                <a href="mailto:contact@photobooth-paris.fr" className='flex items-center justify-center px-4 py-2 bg-white border border-red-300 rounded-lg text-red-700 font-bold hover:bg-red-100 transition-colors'>
                                    <Mail className='w-4 h-4 mr-2' /> contact@photobooth-paris.fr
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ENCART DERNIÈRE MINUTE (RASSURANT) --- */}
            {isLastMinute && (
                <div className='animate-in fade-in slide-in-from-top-2 p-6 bg-[#F3E8FF] border-2 border-purple-200 rounded-2xl'>
                    <div className='flex items-start space-x-3 text-purple-900'>
                        <div className='bg-purple-500 p-1 rounded-full text-white mt-1'>
                            <Info className='w-5 h-5' />
                        </div>
                        <div>
                            <h3 className='font-bold text-lg'>🚀 Expertise dernière minute</h3>
                            <p className='text-sm leading-relaxed mb-3'>
                                Nous sommes habitués à gérer les réservations urgentes avec professionnalisme. Si ce modèle n'est pas disponible, nous trouverons une solution adaptée.
                            </p>
                            <p className='text-sm leading-relaxed mb-3'>
                                <strong>Gain de temps :</strong> nous vous envoyons un email dès le règlement de votre réservation pour que vous puissiez paramétrer votre template dans notre outil en ligne sans perdre une seconde.
                            </p>
                            <p className='text-xs italic opacity-80'>
                                Dans le cas exceptionnel (très rare) où nous ne pourrions pas satisfaire votre demande, nous procédons à un remboursement intégral et immédiat.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className='bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-500 italic text-center mt-4'>
                Le choix du modèle de borne se fera à l'étape suivante.
            </div>
        </div>
    );
};