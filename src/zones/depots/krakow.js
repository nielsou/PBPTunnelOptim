// src/zones/depots/krakow.js
// Dépôt de Cracovie (pilote Flash Society, novembre 2026). Pays : src/zones/countries/pl.js
// Sert toute adresse à moins de delivery.maxKm de Rynek Główny (s'il est le dépôt le plus proche).
//
// Prix fixés le 24/11/2026 après étude des concurrents de Cracovie :
//  - le marché local loue à l'heure avec assistant (2 h 650–900 zł, 4 h 950–1 200 zł, +150–250 zł/h) ;
//  - personne ne propose « toute la soirée » à Cracovie ; Snapio (Varsovie/Łódź) le fait à 1 381 zł HT ;
//  - une soirée de mariage complète coûte 1 650–2 000 zł chez les concurrents locaux.
//
// ⚠️ À COMPLÉTER avant mise en ligne : téléphone et e-mail polonais (contact.phone / contact.email).

const krakow = {
    id: 'krakow',
    country: 'pl',
    name: 'Kraków',

    // Rynek Główny (centre de Cracovie)
    origin: { lat: 50.0617, lng: 19.9373 },
    delivery: {
        freeRadiusKm: 30,         // concurrents : 20 à 40 km offerts autour de Cracovie
        trips: 4,
        costPerKmHT: 1,           // 4 trajets × 1 zł = 4 zł HT par km au-delà (concurrents ≈ 2 zł/km par aller-retour)
        maxKm: 150,               // au-delà, on ne livre plus depuis Cracovie
    },
    pickup: null,                 // pas de dépôt ouvert au public : livraison uniquement

    // Gamme en 3 paliers (CineBooth uniquement). Prix HT par événement (toute la soirée, sans limite d'heures),
    // livraison comprise dans la zone gratuite. Prix HT choisis pour tomber sur un brutto rond (particuliers).
    //  - Digital : prix d'appel « od 799 zł », même écart qu'à Paris avec le 150 (−20 %) ;
    //  - 150 : petits événements (étudiants, < 60 personnes), sous la barre des 1 000 zł ;
    //  - Unlimited : le produit à pousser (mariages), +711 zł brutto par rapport au 150.
    // floorPriceHT = prix plancher par jour supplémentaire (dégressivité, même ratio qu'à Paris).
    models: {
        numerique: {
            name: 'CineBooth Digital',
            priceHT: 649.59,      // 799 zł brutto
            floorPriceHT: 27,
            delivery: 0,
            animation_hour: 0,
        },
        '150': {
            name: 'CineBooth 150',
            priceHT: 812.20,      // 999 zł brutto
            floorPriceHT: 109,
            delivery: 0,
            animation_hour: 0,
        },
        illimite: {
            name: 'CineBooth Unlimited',
            priceHT: 1390,        // 1 710 zł brutto ; test Varsovie envisagé à 1 590 zł
            floorPriceHT: 224,
            delivery: 0,
            animation_hour: 0,
        },
    },

    // Borne en libre-service, le livreur ne reste pas : pas d'animation ni d'options payantes pour le pilote
    options: {
        aiBackgroundHT: null,
        rgpdHT: null,
        extraPrintHT: null,
        extraPrintFloorHT: null,
        animation: false,
        templateProHT: 0,         // template offert à tous
        digitalPropsValueHT: 80,
    },
    seasonalSurcharge: {},

    contact: {
        phone: null,              // À COMPLÉTER : ex. '+48 12 345 67 89'
        phoneHref: null,          // ex. 'tel:+48123456789'
        email: null,              // À COMPLÉTER : ex. 'krakow@flash-society.com'
    },
};

export default krakow;
