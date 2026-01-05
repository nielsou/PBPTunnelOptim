// src/components/steps/Step1Partenaires.jsx

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { InputField } from '../ui/InputField';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';
import { getAxonautCompanyDetails } from '../../services/axonautService';

export const Step1Partenaires = ({ formData, setFormData, customColor }) => {
    const [clientNumber, setClientNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [clientData, setClientData] = useState(formData.savedClientData || null);
    const [error, setError] = useState('');
    const [selectedContactIndex, setSelectedContactIndex] = useState(0);
    const [isNewBillingAddress, setIsNewBillingAddress] = useState(false);
    const [isNewDeliveryAddress, setIsNewDeliveryAddress] = useState(false);

    const isNewContact = selectedContactIndex === 'new';

    // 📍 FONCTION DE GÉOCODAGE INVISIBLE
    const geocodeAddress = (addressText) => {
        if (!window.google || !window.google.maps) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: addressText, componentRestrictions: { country: 'FR' } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const { lat, lng } = results[0].geometry.location;
                setFormData(prev => ({
                    ...prev,
                    deliveryLat: lat(),
                    deliveryLng: lng()
                }));
                console.log(`📍 Géocodage réussi pour ${addressText} :`, lat(), lng());
            } else {
                console.error("Erreur de géocodage :", status);
                setFormData(prev => ({ ...prev, deliveryLat: null, deliveryLng: null }));
            }
        });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await getAxonautCompanyDetails(clientNumber);
            if (data && data.found) {
                setClientData(data);
                const defaultContact = data.contacts[0];
                setSelectedContactIndex(0);

                const defaultBillingObj = data.billingAddresses[0];
                const defaultDeliveryObj = data.deliveryAddresses[0];

                const firstAddress = data.deliveryAddresses[0];

                if (firstAddress) {
                    console.log("📍 Nom du lieu récupéré au chargement :", firstAddress.label);
                }
                setFormData(prev => ({
                    ...prev,
                    savedClientData: data,
                    isPro: !data.isB2C,
                    companyId: data.companyId,
                    companyName: data.name,
                    fullName: defaultContact?.fullName || '',
                    email: defaultContact?.email || '',
                    phone: defaultContact?.phone || '',
                    billingFullAddress: data.defaultBillingAddress,
                    billingAddressId: defaultBillingObj?.id || null, 
                    deliveryFullAddress: data.defaultDeliveryAddress,
                    newDeliveryAddressName: data.deliveryAddresses[0]?.label || '',
                    saveNewBillingAddress: false,
                    saveNewDeliveryAddress: false
                }));

                if (data.defaultDeliveryAddress) {
                    geocodeAddress(data.defaultDeliveryAddress);
                }
            }
        } catch (err) {
            setError("Numéro client introuvable ou erreur de connexion.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleContactDropdownChange = (e) => {
        const val = e.target.value;
        if (val === 'new') {
            setSelectedContactIndex('new');
            // MODIFICATION ICI : On ajoute isNewContact: true
            setFormData(prev => ({
                ...prev,
                fullName: '',
                email: '',
                phone: '',
                isNewContact: true
            }));
        } else {
            const index = parseInt(val, 10);
            setSelectedContactIndex(index);
            const contact = clientData.contacts[index];
            // MODIFICATION ICI : On remet isNewContact: false
            setFormData(prev => ({
                ...prev,
                fullName: contact.fullName,
                email: contact.email,
                phone: contact.phone,
                isNewContact: false
            }));
        }
    };

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
                setFormData(prev => ({
                    ...prev,
                    billingFullAddress: selectedAddr.address,
                    billingAddressId: selectedAddr.id,
                    saveNewBillingAddress: false
                }));
            }
        } else if (type === 'delivery') {
            setIsNewDeliveryAddress(isNew);
            if (isNew) {
                setFormData(prev => ({ ...prev, deliveryFullAddress: '', deliveryLat: null, deliveryLng: null, saveNewDeliveryAddress: true, newDeliveryAddressName: '' }));
            } else {
                const selectedAddr = clientData.deliveryAddresses[selectedIndex];
                console.log("📍 Adresse de livraison sélectionnée :", selectedAddr.label, selectedAddr.address);

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

    if (!clientData) {
        return (
            <div className='space-y-6'>
                <h2 className='text-3xl font-extrabold text-gray-900 mb-2' style={{ color: customColor }}>Espace Partenaires</h2>
                <div className='bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm'>
                    <form onSubmit={handleSearch} className='flex gap-3'>
                        <input type="text" value={clientNumber} onChange={(e) => setClientNumber(e.target.value)} placeholder="Numéro client" className="flex-1 px-4 py-3 rounded-xl border border-gray-300 font-bold" />
                        <button type="submit" disabled={isLoading || !clientNumber} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center">
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                        </button>
                    </form>
                    {error && <p className='mt-3 text-red-600 font-bold'>⚠️ {error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            {/* EN-TETE AVEC ID COMPANY */}
            <div className='flex justify-between items-center border-b pb-4 mb-4' style={{ borderColor: customColor }}>
                <div>
                    <h2 className='text-2xl font-extrabold text-gray-900'>{clientData.name}</h2>
                    <p className='text-sm text-gray-500'>Numéro client : {clientData.companyId}</p>
                </div>
                <button onClick={() => setClientData(null)} className='text-sm text-gray-500 underline'>Changer de compte</button>
            </div>

            {/* CONTACT */}
            <div className='bg-green-50 p-4 rounded-xl border border-green-200'>
                <label className='block text-lg font-bold text-gray-900 mb-3'>Contact Responsable</label>
                <select className='w-full p-3 mb-4 border border-gray-300 rounded-xl bg-white font-medium' onChange={handleContactDropdownChange} value={selectedContactIndex}>
                    {clientData.contacts.map((contact, i) => (
                        <option key={`contact-${i}`} value={i}>👤 {contact.fullName}</option>
                    ))}
                    <option value="new">➕ Nouveau contact</option>
                </select>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!isNewContact ? 'opacity-90' : ''}`}>
                    <InputField label="Nom et Prénom" value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} required />
                    <InputField label="Email" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required />
                    <div className="md:col-span-2">
                        <InputField
                            label="Téléphone"
                            value={formData.phone}
                            onChange={e => setFormData(p => ({ ...p, phone: e.target.value.replace(/[^0-9+]/g, '') }))}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* FACTURATION */}
            <div className='bg-indigo-50 p-4 rounded-xl border border-indigo-200'>
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
                    <div className='space-y-3 bg-white p-4 rounded-lg border border-indigo-100 shadow-inner'>
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
                        <button onClick={() => setIsNewBillingAddress(false)} className='text-sm text-blue-600 underline'>Annuler</button>
                    </div>
                )}
            </div>

            {/* LIVRAISON */}
            <div className='bg-gray-50 p-4 rounded-xl border border-gray-200'>
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
                    <div className='space-y-3 bg-white p-4 rounded-lg border border-gray-200 shadow-inner'>
                        <InputField
                            label="Nom du lieu"
                            placeholder="Hotel, salon, restaurant, particulier..."
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
                        <button onClick={() => setIsNewDeliveryAddress(false)} className='text-sm text-blue-600 underline'>Annuler</button>
                    </div>
                )}
            </div>
        </div>
    );
};