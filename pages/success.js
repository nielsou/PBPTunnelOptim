// pages/success.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import confetti from 'canvas-confetti';
import { Check, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;

  // Effet de Confettis
  useEffect(() => {
    if (!router.isReady) return;

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
  }, [router.isReady]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <Head>
        <title>Paiement Confirmé - Photobooth Paris</title>
      </Head>

      <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center animate-in zoom-in duration-500 border border-white/50">

        {/* Icône Succès */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-in bounce-in duration-1000">
          <Check className="w-12 h-12 text-green-600 stroke-[3]" />
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
          C'est dans la boîte !
        </h1>

        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          Merci ! Votre acompte a bien été reçu.<br />
          Votre borne est officiellement <span className="font-bold text-[#BE2A55]">réservée</span>.
        </p>

        {/* Le message unique (Design & Logistique) */}
        <div className="bg-gray-50 rounded-[2rem] p-8 text-left mb-8 border border-gray-100 flex gap-5 items-center shadow-sm">
          <div className="bg-white p-3 rounded-2xl shadow-sm text-3xl shrink-0">
            🚀
          </div>
          <div>
            <p className="text-gray-600 font-medium leading-relaxed">
              Surveillez votre boîte mail ! D'ici quelques heures, vous recevrez vos liens pour créer votre template et choisir vos créneaux de livraison.
            </p>
          </div>
        </div>

        {/* Message de fermeture */}
        <div className="flex flex-col items-center gap-4 mt-10">
          <p className="text-gray-400 font-medium text-sm italic">
            ✨ Tout est en ordre, vous pouvez fermer cette page.
          </p>

          <Link href="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-[#BE2A55] font-bold transition-colors text-xs uppercase tracking-widest mt-2">
            <ArrowRight className="w-3 h-3 rotate-180" />
            Retour à l'accueil
          </Link>
        </div>

        {session_id && (
          <p className="mt-8 text-[10px] text-gray-200 font-mono">
            Transaction ID: {session_id.slice(-8)}
          </p>
        )}
      </div>
    </div>
  );
}