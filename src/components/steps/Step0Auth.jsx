// Dans src/components/steps/Step0Auth.jsx

import React, { useState } from 'react';
import { Search, Loader2, Check } from 'lucide-react';
import { getAxonautCompanyDetails } from '../../services/axonautService';

export const Step0Auth = ({ formData, setFormData, isCalculatorMode, t, lang, setLang }) => {
    const [clientNumber, setClientNumber] = useState(formData.companyId || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await getAxonautCompanyDetails(clientNumber);
            if (data && data.found) {
                const defaultContact = data.contacts[0];
                const defaultBillingObj = data.billingAddresses[0];

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
            }
        } catch (err) {
            setError("Numéro introuvable ou erreur de connexion.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in duration-500">

            {/* --- SÉLECTEUR DE LANGUE (Conservé) --- */}
            <div className="flex justify-center gap-3 mb-8">
                <button
                    onClick={() => setLang('fr')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all hover:scale-105 active:scale-95 shadow-sm ${lang === 'fr'
                        ? 'border-[#BE2A55] bg-pink-50'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-[#BE2A55]/50'
                        }`}
                >
                    <span className="text-xl">🇫🇷</span>
                    <span className="text-sm font-black">FR</span>
                </button>
                <button
                    onClick={() => setLang('en')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all hover:scale-105 active:scale-95 shadow-sm ${lang === 'en'
                        ? 'border-[#BE2A55] bg-pink-50'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-[#BE2A55]/50'
                        }`}
                >
                    <span className="text-xl">🇬🇧</span>
                    <span className="text-sm font-black">EN</span>
                </button>
            </div>

            {/* --- LE TITRE H1 QUI ÉTAIT ICI A ÉTÉ SUPPRIMÉ --- */}

            <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-xl rounded-3xl p-8">
                <h2 className="text-2xl font-black text-[#BE2A55] mb-6">
                    {/* Texte localisé pour le titre du cadre */}
                    {isCalculatorMode
                        ? t('step0.login.client_number')
                        : t('step0.login.partner_number')}
                </h2>

                <div className="bg-[#f0f5fa] p-2 rounded-2xl border border-blue-100 flex items-center">
                    <form onSubmit={handleSearch} className="flex w-full gap-2">
                        <input
                            type="text"
                            value={clientNumber}
                            onChange={(e) => setClientNumber(e.target.value)}
                            placeholder={t('step0.placeholder.client_id')}
                            className="flex-1 bg-white px-6 py-4 rounded-xl border border-gray-200 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !clientNumber}
                            className="px-8 py-4 bg-[#2563eb] hover:bg-blue-700 transition-colors text-white rounded-xl font-bold flex items-center justify-center"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
                {error && <p className='mt-4 text-red-500 font-bold text-center'>⚠️ {error}</p>}
                {formData.savedClientData && !error && (
                    <p className='mt-4 text-green-600 font-bold text-center flex items-center justify-center gap-2'>
                        <Check className="w-5 h-5" /> Client trouvé : {formData.savedClientData.name}
                    </p>
                )}
            </div>
        </div>
    );
};