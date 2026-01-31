import React from 'react';
import { InputField } from '../ui/InputField';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';
import { PhoneCall, User, Mail, Phone, Building2, ReceiptText } from 'lucide-react';

export const Step3Contact = ({ formData, setFormData, customColor }) => {
    
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className='space-y-8 animate-in fade-in duration-500'>
            <h2 className='text-3xl font-black text-gray-900 border-b pb-4' style={{ color: customColor, borderColor: customColor }}>
                3. Vos Coordonnées
            </h2>

            {/* --- SECTION IDENTITÉ --- */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='md:col-span-2'>
                    <InputField 
                        label="Prénom & Nom *" 
                        value={formData.fullName} 
                        onChange={e => handleChange('fullName', e.target.value)} 
                        placeholder="Jean Dupont"
                        required 
                    />
                </div>
                <InputField 
                    label="Adresse email *" 
                    type='email' 
                    value={formData.email} 
                    onChange={e => handleChange('email', e.target.value)} 
                    placeholder="jean@exemple.fr"
                    required 
                />
                <InputField 
                    label="Téléphone *" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => handleChange('phone', e.target.value.replace(/[^0-9+]/g, ''))} 
                    placeholder="06 12 34 56 78"
                    required 
                />
            </div>

            {/* --- OPTION RAPPEL CONSEILLER --- */}
            <div 
                onClick={() => handleChange('wantsCallback', !formData.wantsCallback)}
                className={`group cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    formData.wantsCallback 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                    : 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100'
                }`}
            >
                <div className='flex items-center gap-4'>
                    <div className={`p-3 rounded-xl ${formData.wantsCallback ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                        <PhoneCall className={`w-6 h-6 ${formData.wantsCallback ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                    <div>
                        <p className='font-black text-lg leading-tight'>Besoin d'aide ?</p>
                        <p className={`text-sm font-medium ${formData.wantsCallback ? 'text-blue-50' : 'text-blue-600'}`}>
                            J'aimerais être rappelé demain par un conseiller
                        </p>
                    </div>
                </div>
                <input 
                    type='checkbox' 
                    checked={formData.wantsCallback}
                    onChange={() => {}} // Géré par le onClick du parent
                    className='w-6 h-6 rounded-lg border-none pointer-events-none'
                />
            </div>

            {/* --- BLOC FACTURATION (CONDITIONNEL SI PRO) --- */}
            {formData.isPro && (
                <div className='bg-gray-50 p-8 rounded-[2.5rem] border border-gray-200 space-y-6 animate-in slide-in-from-top-4 duration-500'>
                    <div className='flex items-center gap-3 mb-2'>
                        <ReceiptText className='w-6 h-6 text-gray-400' />
                        <h3 className='text-xl font-black text-gray-900'>Détails de facturation</h3>
                    </div>

                    <InputField 
                        label="Nom de la société *" 
                        value={formData.companyName} 
                        onChange={e => handleChange('companyName', e.target.value)} 
                        placeholder="Ma Société SAS"
                        required 
                    />

                    <div className='flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm'>
                        <input 
                            type='checkbox' 
                            id='sameAddr' 
                            checked={formData.deliverySameAsBilling} 
                            onChange={e => handleChange('deliverySameAsBilling', e.target.checked)} 
                            className='w-5 h-5 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer' 
                        />
                        <label htmlFor='sameAddr' className='text-sm font-bold text-gray-700 cursor-pointer select-none'>
                            L'adresse de facturation est identique au lieu de l'événement
                        </label>
                    </div>

                    {!formData.deliverySameAsBilling && (
                        <div className='pt-2 animate-in fade-in zoom-in-95'>
                            <AddressAutocomplete 
                                label="Adresse de facturation complète *" 
                                onAddressSelect={addr => setFormData(p => ({
                                    ...p, 
                                    billingFullAddress: addr.fullAddress, 
                                    billingStreet: addr.street, 
                                    billingZipCode: addr.postal, 
                                    billingCity: addr.city
                                }))} 
                                required
                            />
                        </div>
                    )}
                </div>
            )}

            <div className='text-center'>
                <p className='text-xs text-gray-400 italic'>
                    * Champs obligatoires pour la génération du devis
                </p>
            </div>
        </div>
    );
};