// src/constants.js

// Constantes Axonaut
export const AXONAUT_THEMES_MAPPING = {
    0: 310470,      // 0% d'acompte
    0.3: 242890,    // 30% d'acompte
    1: 310524       // 100% d'acompte
};
export const TVA_RATE = 1.20; // 20%
export const TVA_RATE_DECIMAL = 20.0; // Pour le payload Axonaut

// Coordonnées de Paris (Île Saint-Louis, base Photobooth Paris)
export const PARIS_LAT = 48.8517;
export const PARIS_LNG = 2.3570;


// ======================================================================
// PRIX & LOGIQUE DÉGRESSIVITÉ
// ======================================================================

// --- Modèles ECO (Prix plancher fixe) ---
export const PRICING_STRATEGY = {
    'numerique': {
        name: 'CineBooth Digital',
        priceHT: 287.5,
        floorPriceHT: 10.00,
        delivery: 50,
        animation_hour: 45
    },
    '150': {
        name: 'CineBooth 150',
        priceHT: 329.17,
        floorPriceHT: 39.00,
        delivery: 50,
        animation_hour: 45
    },
    '300': {
        name: 'CineBooth 300',
        priceHT: 370.83,
        floorPriceHT: 68.00,
        delivery: 50,
        animation_hour: 45
    },
    'illimite': {
        name: 'StarBooth Pro',
        priceHT: 412.50,
        floorPriceHT: 57.00,
        delivery: 70,
        animation_hour: 45
    },
    'Signature': {
        name: 'Signature',
        priceHT: 495.83,
        floorPriceHT: 79.00,
        delivery: 110,
        animation_hour: 45
    },
    '360': {
        name: 'Videobooth 360',
        priceHT: 715,
        floorPriceHT: 129.75,
        delivery: 0,
        animation_hour: 90,
        speaker: 50
    },
};

export const OPTION_FONDIA_HT = 80;
export const OPTION_RGPD_HT = 80;

// Options Impressions
export const OPTION_IMPRESSION_BASE_HT = 100;
export const OPTION_IMPRESSION_PLANCHER_HT = 100;

// Option Template (coût Pro)
export const TEMPLATE_TOOL_PRO_PRICE_HT = 25;

// Tarifs négociés
export const COMPANY_SPECIFIC_PRICING = {
    "29821892": { // FUGA FAMILY
        template: 0
    },
    "36829130": { // MAMA SHELTER
        'Signature': {
            priceHT: 440,
            floorPriceHT: 440,
        },
        template: 0    
    },
    "24606699": { // LE MARCOUNET
        template: 0
    },
    "29441860": {  // LE NIDA
        template: 0
    },
    "24977719": { // FOOD SOCIETY
        template: 0
    }
};

// ======================================================================
// VALEURS FIXES AXONAUT & DIVERS
// ======================================================================

// Valeurs Fixes pour Axonaut
export const AXONAUT_API_BASE_URL = 'https://axonaut.com/api/v2';
// Cible l'API Route interne (elle est relative au domaine actuel)
export const THIRD_PARTY_PROXY_URL = '/api/create-thirdparty';

// Valeurs Fixes pour Axonaut
export const AXONAUT_FIXED_DEFAULTS = {
    commercial: 'contact@photobooth-paris.fr',
    acomptePct: 1, // 100%
    nombreMachine: 1,
};

// URL Zapier (Webhook pour le suivi)
// export const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/22419571/ufzj95x/';
export const N8N_PROXY_URL = '/api/webhook-n8n';

// Couleurs UI
export const customColor = '#BE2A55';

// ======================================================================
// CONFIGURATION ZAPIER (FLAGS)
// ======================================================================
// Mettez à 'true' pour activer l'envoi à cette étape, 'false' pour désactiver.
export const ENABLE_WEBHOOK_STEP_1 = true; // Evenement
export const ENABLE_WEBHOOK_STEP_2 = true; // Choix de la borne
export const ENABLE_WEBHOOK_STEP_3 = true; // Info perso
export const ENABLE_WEBHOOK_STEP_4 = true; // Devis