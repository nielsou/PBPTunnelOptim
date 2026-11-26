// src/zones/depots/warsaw.js
// Dépôt de Varsovie (pilote Flash Society). Pays : src/zones/countries/pl.js
// Sert toute adresse à moins de delivery.maxKm du centre (s'il est le dépôt le plus proche).
//
// Test de prix décidé le 13/11/2026 : l'Unlimited à 1 590 zł HT à Varsovie contre 1 390 zł HT à Cracovie,
// on garde celui qui convertit le mieux. Digital et 150 au même prix qu'à Cracovie pour ne tester que l'Unlimited.
// Concurrence directe à Varsovie : Snapio, « bez limitu czasu » en libre-service à 1 381 zł HT (≈ 1 699 zł brutto).
//
// ⚠️ À COMPLÉTER avant mise en ligne : téléphone et e-mail polonais (contact.phone / contact.email).

const warsaw = {
    id: 'warsaw',
    country: 'pl',
    name: 'Warszawa',

    // Centre de Varsovie (Pałac Kultury i Nauki)
    origin: { lat: 52.2318, lng: 21.0060 },
    delivery: {
        freeRadiusKm: 30,         // même règle qu'à Cracovie
        trips: 4,
        costPerKmHT: 1,           // 4 trajets × 1 zł = 4 zł HT par km au-delà
        maxKm: 150,
    },
    pickup: null,                 // livraison uniquement

    models: {
        numerique: {
            name: 'CineBooth Digital',
            priceHT: 649.59,      // 799 zł brutto (comme Cracovie)
            floorPriceHT: 27,
            delivery: 0,
            animation_hour: 0,
        },
        '150': {
            name: 'CineBooth 150',
            priceHT: 812.20,      // 999 zł brutto (comme Cracovie)
            floorPriceHT: 109,
            delivery: 0,
            animation_hour: 0,
        },
        illimite: {
            name: 'CineBooth Unlimited',
            priceHT: 1590,        // 1 956 zł brutto — test de prix (Cracovie : 1 390 zł HT)
            floorPriceHT: 256,    // même ratio que Cracovie (224 / 1 390)
            delivery: 0,
            animation_hour: 0,
        },
    },

    options: {
        aiBackgroundHT: null,
        rgpdHT: null,
        extraPrintHT: null,
        extraPrintFloorHT: null,
        animation: false,
        templateProHT: 0,
        digitalPropsValueHT: 80,
    },
    seasonalSurcharge: {},

    contact: {
        phone: null,              // À COMPLÉTER
        phoneHref: null,
        email: null,              // À COMPLÉTER : ex. 'warszawa@flash-society.com'
    },
};

export default warsaw;
