// src/sites/paris.js
// Config du site Paris (photobooth-paris.fr). Reprend les valeurs de src/constants.js,
// qui restent la source pour Paris (Axonaut, calculette et partenaires s'en servent aussi).

import {
    TVA_RATE,
    PARIS_LAT, PARIS_LNG,
    DELIVERY_FREE_RADIUS_KM, DELIVERY_TRIPS, DELIVERY_COST_PER_KM_HT,
    PRICING_STRATEGY, SEASONAL_SURCHARGE,
    OPTION_FONDIA_HT, OPTION_RGPD_HT,
    OPTION_IMPRESSION_BASE_HT, OPTION_IMPRESSION_PLANCHER_HT,
    TEMPLATE_TOOL_PRO_PRICE_HT,
} from '../constants';

const paris = {
    id: 'paris',
    region: 'FR',                 // Sheet régional où arrivent les demandes
    brand: 'Photobooth Paris',
    defaultLang: 'fr',
    intlLocale: 'fr-FR',

    currency: { code: 'EUR', symbol: '€', spaceBefore: false },
    vatRate: TVA_RATE,            // 1.20

    // Livraison : point de départ, zone gratuite, supplément au km
    origin: { lat: PARIS_LAT, lng: PARIS_LNG },
    delivery: {
        freeRadiusKm: DELIVERY_FREE_RADIUS_KM,
        trips: DELIVERY_TRIPS,
        costPerKmHT: DELIVERY_COST_PER_KM_HT,
        allowPickup: true,        // retrait au dépôt d'Arcueil
    },

    // Machines proposées (clé = id du modèle) et leurs prix
    models: PRICING_STRATEGY,

    options: {
        aiBackgroundHT: OPTION_FONDIA_HT,          // null = option non proposée
        rgpdHT: OPTION_RGPD_HT,
        extraPrintHT: OPTION_IMPRESSION_BASE_HT,
        extraPrintFloorHT: OPTION_IMPRESSION_PLANCHER_HT,
        animation: true,
        templateProHT: TEMPLATE_TOOL_PRO_PRICE_HT, // outil template pour les pros (gratuit pour les particuliers)
        digitalPropsValueHT: 20,                   // valeur barrée affichée pour les accessoires numériques offerts
    },
    seasonalSurcharge: SEASONAL_SURCHARGE,

    // Adresses
    addressCountries: ['fr'],
    defaultCountry: 'France',

    // Facturation
    companyIdField: 'siren',      // 'siren' (France) | 'nip' (Pologne)
    showEInvoiceNotice: true,

    contact: {
        phone: '01 42 86 54 24',
        phoneHref: 'tel:0142865424',
        email: 'contact@photobooth-paris.fr',
    },

    // Fin du tunnel : 'axonaut' = devis Axonaut + acompte Stripe ; 'lead' = demande envoyée, sans devis ni paiement
    endAction: 'axonaut',
};

export default paris;
