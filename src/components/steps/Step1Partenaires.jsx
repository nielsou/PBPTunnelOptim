import React, { useState } from 'react';
import { Search, MapPin, User, Loader2, ArrowRight } from 'lucide-react';
import { InputField } from '../ui/InputField';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';
import { PhoneInputField } from '../ui/PhoneInputField';
import { getAxonautCompanyDetails } from '../../services/axonautService';

export const Step1Partenaires = ({ formData, setFormData, customColor, handleNext }) => {
    const [clientNumber, setClientNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [clientData, setClientData] = useState(null);
    const [error, setError] = useState('');
    const [isNewAddress, setIsNewAddress] = useState(false);

    // 1. Recherche du client via l'API (simulée pour l'instant)
    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await getAxonautCompanyDetails(clientNumber);
            if (data && data.found) {
                setClientData(data);
                // Mise à jour du formData global
                setFormData(prev => ({
                    ...prev,
                    isPro: true, // Force le mode PRO
                    companyName: data.name,
                    billingFullAddress: data.billingAddress.fullAddress,
                    fullName: data.contacts[0]?.fullName || '',
                    email: data.contacts[0]?.email || '',
                    phone: data.contacts[0]?.phone || '',
                    // Par défaut, on met l'adresse de factu en livraison en attendant le choix
                    deliveryFullAddress: data.billingAddress.fullAddress 
                }));
            }
        } catch (err) {
            setError("Numéro client introuvable.");
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Gestion de la sélection d'adresse
    const handleAddressChange = (e) => {
        const val = e.target.value;
        if (val === 'new') {
            setIsNewAddress(true);
            setFormData(prev => ({ ...prev, deliveryFullAddress: '', deliveryLat: null, deliveryLng: null }));
        } else {
            setIsNewAddress(false);
            setFormData(prev => ({ ...prev, deliveryFullAddress: val }));
            // Note: Idéalement, il faudrait aussi récupérer lat/lng stockés côté back
        }
    };

    // Si pas encore identifié, on affiche le login
    if (!clientData) {
        return (
            <div className='space-y-6'>
                <h2 className='text-3xl font-extrabold text-gray-900 mb-2' style={{ color: customColor }}>
                    Espace Partenaires
                </h2>
                <p className='text-gray-600 mb-6'>Identifiez-vous pour accéder à vos tarifs et adresses.</p>
                
                <div className='bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm'>
                    <form onSubmit={handleSearch} className='flex gap-3'>
                        <input
                            type="text"
                            value={clientNumber}
                            onChange={(e) => setClientNumber(e.target.value)}
                            placeholder="Votre Numéro Client"
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold"
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !clientNumber}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5"/> : <Search className="w-5 h-5"/>}
                        </button>
                    </form>
                    {error && <p className='mt-3 text-red-600 font-bold flex items-center'>⚠️ {error}</p>}
                </div>
            </div>
        );
    }

    // Une fois identifié
    return (
        <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            <div className='flex justify-between items-center border-b pb-4 mb-4' style={{ borderColor: customColor }}>
                <div>
                    <h2 className='text-2xl font-extrabold text-gray-900'>{clientData.name}</h2>
                    <p className='text-sm text-gray-500'>Compte Partenaire</p>
                </div>
                <button onClick={() => setClientData(null)} className='text-sm text-gray-500 underline'>Changer</button>
            </div>

            {/* Infos Contact (pré-remplies mais modifiables) */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InputField label="Contact sur place" value={formData.fullName} onChange={e => setFormData(p => ({...p, fullName: e.target.value}))} />
                <PhoneInputField value={formData.phone} onChange={v => setFormData(p => ({...p, phone: v}))} />
            </div>

            {/* Choix Adresse Livraison */}
            <div className='bg-gray-50 p-4 rounded-xl border border-gray-200'>
                <label className='block text-lg font-bold text-gray-900 mb-3'>Lieu de l'événement</label>
                
                {!isNewAddress ? (
                    <div className='space-y-3'>
                        <select 
                            className='w-full p-3 border border-gray-300 rounded-xl bg-white font-medium'
                            onChange={handleAddressChange}
                            defaultValue={clientData.billingAddress.fullAddress}
                        >
                            {clientData.savedAddresses.map((addr, i) => (
                                <option key={i} value={addr.address}>{addr.label} - {addr.address}</option>
                            ))}
                            <option value="new">📍 + Ajouter une nouvelle adresse</option>
                        </select>
                    </div>
                ) : (
                    <div className='space-y-2'>
                        <AddressAutocomplete 
                            label="Nouvelle adresse" 
                            required 
                            onAddressSelect={addr => setFormData(p => ({...p, deliveryFullAddress: addr.fullAddress, deliveryLat: addr.lat, deliveryLng: addr.lng}))}
                        />
                        <button onClick={() => setIsNewAddress(false)} className='text-sm text-blue-600 underline'>Annuler</button>
                    </div>
                )}
            </div>
        </div>
    );
};