import React from 'react';
import { Loader2 } from 'lucide-react';

export const Step5Payment = ({ t, handleStripePayment, isCalculatorMode }) => {
    return (
        <div className="flex items-center justify-center min-h-[50vh] py-4 px-4 font-sans bg-transparent">
            <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 border border-gray-100 max-w-5xl w-full text-center animate-in zoom-in duration-500">

                <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">
                    {t('success.title')}
                </h2>

                <div className="space-y-8">
                    {/* BLOC 1 : PAIEMENT */}
                    <div className="max-w-2xl mx-auto p-6 bg-pink-50 rounded-3xl border-2 border-[#BE2A55] shadow-sm">
                        <h3 className="font-black text-[#BE2A55] text-xl mb-2">
                            {t('success.step1.title')}
                        </h3>
                        <p className="text-gray-700 text-base leading-snug mb-5 max-w-lg mx-auto">
                            {t('success.step1.desc').replace(/\*\*/g, '')}
                        </p>

                        <button
                            onClick={handleStripePayment}
                            className="w-full max-w-sm py-3 bg-[#BE2A55] text-white rounded-xl font-black text-lg shadow-md hover:scale-[1.02] active:scale-95 transition-all mx-auto block mb-3"
                        >
                            {t('success.step1.button')}
                        </button>

                        <p className="text-[11px] text-[#9d2246] font-bold italic opacity-90">
                            {t('success.footer.disclaimer')}
                        </p>
                    </div>

                    {/* BLOC 2 : ET APRÈS ? */}
                    <div>
                        <h3 className="font-black text-gray-900 text-xl mb-6">
                            {t('success.step2.title')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((num) => {
                                const emojis = { 1: '🚚', 2: '🎨', 3: '💳' };
                                return (
                                    <div key={num} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300">
                                        <div className="text-3xl mb-2">{emojis[num]}</div>
                                        <div className="mb-2">
                                            <span className="font-black text-gray-900 text-base leading-tight">
                                                {t(`success.step2.item${num}.title`)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 leading-snug font-medium text-sm">
                                            {t(`success.step2.item${num}.text`)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};