// src/components/steps/Step5SalesTeam.jsx
import React from 'react';
import { Check, ExternalLink, ArrowLeft, RefreshCw } from 'lucide-react';

export const Step5SalesTeam = ({ formData, onReset, onBack }) => {
    return (
        <div className="text-center py-16 animate-in zoom-in duration-500 font-sans">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Check className="w-12 h-12 text-blue-600 stroke-[3]" />
            </div>
            
            <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">
                Devis généré avec succès !
            </h2>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Le devis est prêt dans Axonaut (aucun email n'a été envoyé au client).
            </p>
            
            {/* BOUTONS D'ACTION */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4">
                <button
                    onClick={onBack}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Retour
                </button>

                <button
                    onClick={onReset}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all"
                >
                    <RefreshCw className="w-5 h-5" />
                    Nouveau devis
                </button>

                <a
                    href={`https://axonaut.com/business/company/show/${formData.companyId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:scale-105 transition-all"
                >
                    <ExternalLink className="w-5 h-5" />
                    Ouvrir Axonaut
                </a>
            </div>
        </div>
    );
};