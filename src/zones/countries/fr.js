// src/zones/countries/fr.js
// Règles communes à tous les dépôts en France : marque, devise, TVA, facturation.

import { TVA_RATE } from '../../constants';

const fr = {
    code: 'fr',
    lang: 'fr',                   // langue utilisée pour les liens de test ?depot=…
    region: 'FR',                 // Sheet régional où arrivent les demandes
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
