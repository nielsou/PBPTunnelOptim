// src/components/steps/Step5SalesTeam.jsx
import React from 'react';
import { Check, ExternalLink } from 'lucide-react';

export const Step5SalesTeam = ({ formData }) => {
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
            
            <a
                href={`https://axonaut.com/business/company/show/${formData.companyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:scale-105 transition-all"
            >
                <ExternalLink className="w-5 h-5" />
                Ouvrir la fiche Axonaut
            </a>
        </div>
    );
};