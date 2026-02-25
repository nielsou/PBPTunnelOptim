// src/components/steps/Step1AxonautDetails.jsx
import React, { useState, useEffect } from 'react';
import { InputField } from '../ui/InputField';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';
import { Calendar, Clock, Phone, Mail } from 'lucide-react';

export const Step1AxonautDetails = ({ formData, setFormData, customColor = '#BE2A55', t }) => {
    const clientData = formData.savedClientData;

    // --- ÉTATS LOCAUX POUR LES MENUS DÉROULANTS ---
    const [selectedContactIndex, setSelectedContactIndex] = useState(0);
    const [isNewBillingAddress, setIsNewBillingAddress] = useState(false);
    const [isNewDeliveryAddress, setIsNewDeliveryAddress] = useState(false);

    const isNewContact = selectedContactIndex === 'new';
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = formData.eventDate === todayStr;

    // --- GESTION DE LA DATE ---
    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        setFormData(prev => ({ ...prev, eventDate: selectedDate }));
    };

    // --- GESTION DU CONTACT ---
    const handleContactDropdownChange = (e) => {
        const val = e.target.value;
        if (val === 'new') {
            setSelectedContactIndex('new');
            setFormData(prev => ({ ...prev, fullName: '', email: '', phone: '', isNewContact: true }));
        } else {
            const index = parseInt(val, 10);
            setSelectedContactIndex(index);
            const contact = clientData.contacts[index];
            setFormData(prev => ({
                ...prev,
                fullName: contact.fullName,
                email: contact.email,
                phone: contact.phone,
                isNewContact: false
            }));
        }
    };

    // --- GÉOCODAGE INVISIBLE (Pour la livraison) ---
    const geocodeAddress = (addressText) => {
        if (!window.google || !window.google.maps) return;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: addressText, componentRestrictions: { country: 'FR' } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const { lat, lng } = results[0].geometry.location;
                setFormData(prev => ({ ...prev, deliveryLat: lat(), deliveryLng: lng() }));
            } else {
                setFormData(prev => ({ ...prev, deliveryLat: null, deliveryLng: null }));
            }
        });
    };

    useEffect(() => {
        if (formData.deliveryFullAddress && !formData.deliveryLat) {
            // Petite sécurité au cas où l'API Google met quelques millisecondes à charger
            if (window.google && window.google.maps) {
                geocodeAddress(formData.deliveryFullAddress);
            } else {
                const interval = setInterval(() => {
                    if (window.google && window.google.maps) {
                        geocodeAddress(formData.deliveryFullAddress);
                        clearInterval(interval);
                    }
                }, 500);
                return () => clearInterval(interval);
            }
        }
    }, [formData.deliveryFullAddress]);

    // --- GESTION DES ADRESSES ---
    const handleAddressDropdownChange = (e, type) => {
        const val = e.target.value;
        const isNew = val === 'new';
        const selectedIndex = e.target.selectedIndex;

        if (type === 'billing') {
            setIsNewBillingAddress(isNew);
            if (isNew) {
                setFormData(prev => ({ ...prev, billingFullAddress: '', billingAddressId: null, saveNewBillingAddress: true, newBillingAddressName: '' }));
            } else {
                const selectedAddr = clientData.billingAddresses[selectedIndex];
                setFormData(prev => ({ ...prev, billingFullAddress: selectedAddr.address, billingAddressId: selectedAddr.id, saveNewBillingAddress: false }));
            }
        } else if (type === 'delivery') {
            setIsNewDeliveryAddress(isNew);
            if (isNew) {
                setFormData(prev => ({ ...prev, deliveryFullAddress: '', deliveryLat: null, deliveryLng: null, saveNewDeliveryAddress: true, newDeliveryAddressName: '' }));
            } else {
                const selectedAddr = clientData.deliveryAddresses[selectedIndex];
                setFormData(prev => ({
                    ...prev,
                    deliveryFullAddress: selectedAddr.address,
                    deliveryAddressId: selectedAddr.id,
                    deliveryZipCode: selectedAddr.zip,
                    deliveryCity: selectedAddr.city,
                    newDeliveryAddressName: selectedAddr.label,
                    saveNewDeliveryAddress: false
                }));
                geocodeAddress(selectedAddr.address);
            }
        }
    };

    if (!clientData) return null; // Sécurité au cas où

    return (
        <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            {/* EN-TETE */}
            <div className='flex justify-between items-center border-b pb-4' style={{ borderColor: customColor }}>
                <div>
                    <h2 className='text-2xl font-extrabold text-gray-900'>{clientData.name}</h2>
                    <p className='text-sm text-gray-500'>Numéro client : {clientData.companyId}</p>
                </div>
            </div>

            {/* BLOC 1 : DATE & DURÉE (L'essentiel à saisir) */}
            <div className='bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm'>
                <h3 className='text-lg font-bold text-blue-900 mb-4 flex items-center gap-2'>
                    <Calendar className="w-5 h-5" /> {t ? t('step1.title') : "Informations de l'événement"}
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                        <InputField
                            label={t ? t('step1.date.label') : "Date de l'événement"}
                            type='date'
                            value={formData.eventDate}
                            onChange={handleDateChange}
                            required
                            min={todayStr}
                        />
                    </div>
                    <div>
                        <InputField
                            label={t ? t('step1.duration.label') : "Durée (jours)"}
                            type='number'
                            value={formData.eventDuration}
                            onChange={e => setFormData(prev => ({ ...prev, eventDuration: Math.max(1, parseInt(e.target.value) || 1) }))}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* ALERTE JOUR MÊME */}
            {isToday && (
                <div className='animate-in fade-in slide-in-from-top-2 p-6 bg-red-50 border-2 border-red-200 rounded-2xl'>
                    <div className='flex items-start space-x-3 text-red-900'>
                        <Clock className='w-6 h-6 mt-1' />
                        <div>
                            <h3 className='font-bold text-lg'>{t('step1.today.title')}</h3>
                            <p className='mb-4'>{t('step1.today.subtitle')}</p>
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

            {/* BLOC 2 : CONTACT */}
            <div className='bg-green-50 p-6 rounded-2xl border border-green-100'>
                <label className='block text-lg font-bold text-gray-900 mb-3'>Contact Responsable</label>
                <select className='w-full p-3 mb-4 border border-gray-300 rounded-xl bg-white font-medium' onChange={handleContactDropdownChange} value={selectedContactIndex}>
                    {clientData.contacts.map((contact, i) => (
                        <option key={`contact-${i}`} value={i}>👤 {contact.fullName}</option>
                    ))}
                    <option value="new">➕ Nouveau contact</option>
                </select>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!isNewContact ? 'opacity-70 pointer-events-none' : ''}`}>
                    <InputField label="Nom et Prénom" value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} required={isNewContact} />
                    <InputField label="Email" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required={isNewContact} />
                    <div className="md:col-span-2">
                        <InputField label="Téléphone" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value.replace(/[^0-9+]/g, '') }))} required={isNewContact} />
                    </div>
                </div>
            </div>

            {/* BLOC 3 : LIVRAISON */}
            <div className='bg-gray-50 p-6 rounded-2xl border border-gray-200'>
                <label className='block text-lg font-bold text-gray-900 mb-3'>Lieu de livraison (Événement)</label>
                {!isNewDeliveryAddress ? (
                    <select className='w-full p-3 border border-gray-300 rounded-xl bg-white font-medium' onChange={(e) => handleAddressDropdownChange(e, 'delivery')}>
                        {clientData.deliveryAddresses.map((addr, i) => (
                            <option key={`del-${i}`} value={addr.address}>
                                🚚 {addr.label} | {addr.address}
                            </option>))}
                        <option value="new">📍 + Ajouter un nouveau lieu</option>
                    </select>
                ) : (
                    <div className='space-y-3 bg-white p-4 rounded-lg border border-gray-200 shadow-inner mt-2'>
                        <InputField
                            label="Nom du lieu"
                            placeholder="Hotel, salon, restaurant..."
                            value={formData.newDeliveryAddressName || ''}
                            onChange={e => setFormData(p => ({ ...p, newDeliveryAddressName: e.target.value }))}
                        />
                        <AddressAutocomplete
                            label="Adresse complète"
                            required
                            onAddressSelect={addr => setFormData(p => ({
                                ...p,
                                deliveryFullAddress: addr.fullAddress,
                                deliveryLat: addr.lat,
                                deliveryLng: addr.lng,
                                deliveryZipCode: addr.postal,
                                deliveryCity: addr.city
                            }))}
                        />
                        <button onClick={() => setIsNewDeliveryAddress(false)} className='text-sm text-blue-600 underline font-medium'>Annuler l'ajout</button>
                    </div>
                )}
            </div>

            {/* BLOC 4 : FACTURATION */}
            <div className='bg-indigo-50 p-6 rounded-2xl border border-indigo-100'>
                <label className='block text-lg font-bold text-gray-900 mb-3'>Adresse de Facturation</label>
                {!isNewBillingAddress ? (
                    <select className='w-full p-3 border border-gray-300 rounded-xl bg-white font-medium' onChange={(e) => handleAddressDropdownChange(e, 'billing')}>
                        {clientData.billingAddresses.map((addr, i) => (
                            <option key={`bill-${i}`} value={addr.address}>
                                📄 {addr.label} | {addr.address}
                            </option>
                        ))}
                        <option value="new">📍 + Ajouter une nouvelle adresse</option>
                    </select>
                ) : (
                    <div className='space-y-3 bg-white p-4 rounded-lg border border-indigo-100 shadow-inner mt-2'>
                        <InputField
                            label="Nom de cette adresse"
                            placeholder="ex: Bureau, Siège..."
                            value={formData.newBillingAddressName || ''}
                            onChange={e => setFormData(p => ({ ...p, newBillingAddressName: e.target.value }))}
                        />
                        <AddressAutocomplete
                            label="Adresse complète"
                            required
                            onAddressSelect={addr => setFormData(p => ({
                                ...p,
                                billingFullAddress: addr.fullAddress,
                                billingZipCode: addr.postal,
                                billingCity: addr.city
                            }))}
                        />
                        <button onClick={() => setIsNewBillingAddress(false)} className='text-sm text-blue-600 underline font-medium'>Annuler l'ajout</button>
                    </div>
                )}
            </div>
        </div>
    );
};