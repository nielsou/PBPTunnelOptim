import React, { useEffect } from 'react';
import { Check, Mail, Truck, Palette, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Step5Payment = ({ t, formData }) => {
    // Effet de Confettis au chargement de l'étape
    useEffect(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center py-10 animate-in zoom-in duration-500 font-sans">
            {/* Icône Succès */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Check className="w-12 h-12 text-green-600 stroke-[3]" />
            </div>

            <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">
                C'est dans la boîte !
            </h2>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Merci ! Votre acompte a bien été reçu.<br />
                Votre borne est officiellement <span className="font-bold text-[#BE2A55]">réservée</span>.
            </p>

            {/* BLOC : ET APRÈS ? */}
            <div className="max-w-3xl mx-auto">
                <h3 className="font-black text-gray-900 text-xl mb-6">
                    {t('success.step2.title')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
                        <div className="text-3xl mb-3">🚚</div>
                        <span className="font-black text-gray-900 mb-2">{t('success.step2.item1.title')}</span>
                        <p className="text-gray-600 text-sm">{t('success.step2.item1.text')}</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
                        <div className="text-3xl mb-3">🎨</div>
                        <span className="font-black text-gray-900 mb-2">{t('success.step2.item2.title')}</span>
                        <p className="text-gray-600 text-sm">{t('success.step2.item2.text')}</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center">
                        <div className="text-3xl mb-3">💳</div>
                        <span className="font-black text-gray-900 mb-2">{t('success.step2.item3.title')}</span>
                        <p className="text-gray-600 text-sm">{t('success.step2.item3.text')}</p>
                    </div>
                </div>
            </div>

            <p className="mt-12 text-gray-400 font-medium text-sm italic">
                ✨ Tout est en ordre, vous pouvez fermer cette fenêtre.
            </p>
        </div>
    );
};