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
export const ECO_MODELS_PRICING = {
    numerique: { 
        name: 'CineBooth Numérique', 
        priceHT: 245.83, 
        floorPriceHT: 10.00 
    },
    '150': { 
        name: 'CineBooth 150 impressions', 
        priceHT: 329.17, 
        floorPriceHT: 39.00 
    },
    '300': { 
        name: 'CineBooth 300 impressions', 
        priceHT: 370.83, 
        floorPriceHT: 68.00 
    },
    illimite: { 
        name: 'StarBooth Pro Illimité', 
        priceHT: 425.83, 
        floorPriceHT: 57.00 
    },
};

// --- Modèle PRO (Signature) ---
export const BASE_PRICE_PRO_HT = 480;
export const PLANCHER_PRICE_PRO_HT_USER_FIX = 79.00; // Prix plancher fixe pour la dégressivité Signature

// --- Modèle 360 ---
export const P360_BASE_PRICE_HT = 715;
export const P360_DELIVERY_PRICE_HT = 150;
export const P360_FLOOR_PRICE_HT = 129.75; // Prix plancher fixe pour le 360 (15% du total 865€ HT)


// --- Coûts Uniques (Logistique/Options) ---
// Livraison ECO
export const DELIVERY_BASE_ECO_HT = 50;
export const DELIVERY_BASE_ILLIMITE_HT = 70;
export const SETUP_PRICE_HT = 20;

// Livraison PRO (Signature)
export const PRO_DELIVERY_BASE_HT = 110;

// Options PRO
export const PRO_ANIMATION_HOUR_PRICE_HT = 45; // Prix HT par heure
export const PRO_OPTION_FONDIA_HT = 50;
export const PRO_OPTION_RGPD_HT = 50;

// Options Impressions
export const PRO_IMPRESSION_BASE_HT = 80;
export const PRO_IMPRESSION_PLANCHER_HT = 50;

// Option Template (coût Pro)
export const TEMPLATE_TOOL_PRO_PRICE_HT = 60;


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
    // companyId: 38647018,
    acomptePct: 1, // 100%
    company_address_id: 36619044, // ID d'adresse de facturation
    nombreMachine: 1, 
};

// URL Zapier (Webhook pour le suivi)
export const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/22419571/ufzj95x/';

// Couleurs UI
export const customColor = '#BE2A55';

// Codes Pays ⬅️ FIX DU CRASH PhoneInputField.jsx
export const COUNTRIES = [
  { name: "France", code: "+33", flag: "🇫🇷", mask: "XX XX XX XX XX", requiredDigits: 10 },
  { name: "États-Unis", code: "+1", flag: "🇺🇸", mask: "(XXX) XXX-XXXX", requiredDigits: 10 },
  { name: "Royaume-Uni", code: "+44", flag: "🇬🇧", mask: "XXXX XXXXXX", requiredDigits: 10 },
  { name: "Allemagne", code: "+49", flag: "🇩🇪", mask: "XXXX XXXX XXXX", requiredDigits: 12 },
  { name: "Canada", code: "+1", flag: "🇨🇦", mask: "(XXX) XXX-XXXX", requiredDigits: 10 },
  { name: "Espagne", code: "+34", flag: "🇪🇸", mask: "XXX XXX XXX", requiredDigits: 9 },
  { name: "Belgique", code: "+32", flag: "🇧🇪", mask: "X XXX XX XX", requiredDigits: 9 },
];