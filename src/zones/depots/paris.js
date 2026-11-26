// src/zones/depots/paris.js
// Dépôt de Paris (Arcueil). Pays : src/zones/countries/fr.js
// Reprend les valeurs de src/constants.js, qui restent la source pour Paris
// (Axonaut, calculette et partenaires s'en servent aussi).

import {
    PARIS_LAT, PARIS_LNG,
    DELIVERY_FREE_RADIUS_KM, DELIVERY_TRIPS, DELIVERY_COST_PER_KM_HT,
    PRICING_STRATEGY, SEASONAL_SURCHARGE,
    OPTION_FONDIA_HT, OPTION_RGPD_HT,
    OPTION_IMPRESSION_BASE_HT, OPTION_IMPRESSION_PLANCHER_HT,
    TEMPLATE_TOOL_PRO_PRICE_HT,
} from '../../constants';

const paris = {
    id: 'paris',
    country: 'fr',
    name: 'Paris',

    // Point de départ du calcul de distance (centre de Paris)
    origin: { lat: PARIS_LAT, lng: PARIS_LNG },
    delivery: {
        freeRadiusKm: DELIVERY_FREE_RADIUS_KM,
        trips: DELIVERY_TRIPS,
        costPerKmHT: DELIVERY_COST_PER_KM_HT,
        maxKm: 150,               // au-delà, on ne livre plus (retrait au dépôt proposé)
    },
    // Retrait au dépôt (null = pas de retrait possible)
    pickup: {
        place: 'Arcueil (94)',    // affiché dans le tunnel
        shortPlace: 'Arcueil',    // affiché dans le récapitulatif
        // Proposé à tout événement en France hors zone de livraison, quelle que soit la distance (rare, mais ça arrive)
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

    contact: {
        phone: '01 42 86 54 24',
        phoneHref: 'tel:0142865424',
        email: 'contact@photobooth-paris.fr',
    },
};

export default paris;
