// src/zones/countries/fr.js
// Règles communes à tous les dépôts en France : marque, devise, TVA, facturation.

import { TVA_RATE } from '../../constants';

const fr = {
    code: 'fr',
    lang: 'fr',                   // langue utilisée pour les liens de test ?depot=…
    // Où arrivent les demandes : Paris → webhook n8n historique (URL dans pages/api/webhook-n8n.js)
    // → workflow n8n « TunnelOptim » → Google Sheet « Photobooth Paris - Prod », onglet TZapOptim.
    // Une nouvelle région (ex. 'IT') = un workflow n8n + un Sheet + la variable Vercel N8N_WEBHOOK_URL_IT.
    region: 'FR',
    brand: 'Photobooth Paris',
    intlLocale: 'fr-FR',

    currency: { code: 'EUR', symbol: '€', spaceBefore: false },
    vatRate: TVA_RATE,            // 1.20

    addressCountry: 'fr',         // code pays Google pour la recherche d'adresse
    defaultCountry: 'France',     // pays enregistré pour l'adresse

    companyIdField: 'siren',      // 'siren' (France) | 'nip' (Pologne)
    showEInvoiceNotice: true,     // avertissement facturation électronique française

    // Fin du tunnel : 'axonaut' = devis Axonaut + acompte Stripe ; 'lead' = demande envoyée, sans devis ni paiement
    endAction: 'axonaut',
};

export default fr;
