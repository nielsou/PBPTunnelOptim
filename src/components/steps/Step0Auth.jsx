import React, { useState } from 'react';
import { Search, Loader2, Check } from 'lucide-react';
import { getAxonautCompanyDetails } from '../../services/axonautService';

export const Step0Auth = ({ formData, setFormData, isCalculatorMode, t }) => {
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#BE2A55] mb-12 text-center">
                Bonjour Héloïse et Cédric !
            </h1>

            <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-xl rounded-3xl p-8">
                <h2 className="text-2xl font-black text-[#BE2A55] mb-6">
                    {isCalculatorMode ? "Entrez le numéro de votre client" : "Entrez le numéro de votre partenaire"}
                </h2>

                <div className="bg-[#f0f5fa] p-2 rounded-2xl border border-blue-100 flex items-center">
                    <form onSubmit={handleSearch} className="flex w-full gap-2">
                        <input 
                            type="text" 
                            value={clientNumber} 
                            onChange={(e) => setClientNumber(e.target.value)} 
                            placeholder="Numéro client" 
                            className="flex-1 bg-white px-6 py-4 rounded-xl border border-gray-200 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        <button 
                            type="button" 
                            onClick={handleSearch}
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