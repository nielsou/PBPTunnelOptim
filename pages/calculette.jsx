import React from 'react';
import { SALES_REPS } from '../src/constants';

// /calculette sans slug : simple sélecteur du commercial → /calculette/<slug>
export default function CalculettePage() {
    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6 font-sans text-gray-900'>
            <div className='bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100 text-center'>
                <h1 className='text-3xl font-extrabold mb-8'>Qui fait le devis ?</h1>
                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    {Object.entries(SALES_REPS).map(([slug, rep]) => (
                        <a
                            key={slug}
                            href={`/calculette/${slug}`}
                            className='px-10 py-4 rounded-2xl font-black text-white bg-[#BE2A55] shadow-lg hover:scale-105 transition-all'
                        >
                            {rep.name}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
