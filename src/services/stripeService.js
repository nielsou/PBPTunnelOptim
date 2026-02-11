// src/services/stripeService.js

/**
 * Génère une session Stripe Checkout pour l'acompte de 10%
 * @param {Object} pricingData - Les données de prix (totalHT, etc.)
 * @param {Object} formData - Les infos client (email)
 * @param {string} quoteNumber - Le numéro du devis Axonaut
 */
export const redirectToStripeCheckout = async (pricingData, formData, quoteNumber) => {
    const STRIPE_PROXY_URL = '/api/create-checkout-session';

    // Calcul de l'acompte (10% du Total TTC)
    const totalTTC = pricingData.totalHT * 1.20;
    const depositAmount = Math.round((totalTTC * 0.10) * 100); // Stripe attend des centimes

    try {
        const response = await fetch(STRIPE_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: depositAmount,
                currency: 'eur',
                customer_email: formData.email,
                metadata: {
                    quote_number: quoteNumber,
                    client_name: formData.fullName,
                    company_name: formData.isPro ? formData.companyName : 'Particulier'
                }
            }),
        });

        const session = await response.json();

        if (!response.ok) throw new Error(session.error || "Erreur Stripe");

        // Redirection vers la page de paiement sécurisée de Stripe
        if (session.url) {
            window.location.href = session.url;
        }

    } catch (error) {
        console.error("STRIPE_SERVICE: Erreur redirection", error);
        throw error;
    }
};