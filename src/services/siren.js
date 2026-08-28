/**
 * Validation du numéro SIREN (9 chiffres) — facturation électronique.
 *
 * SIREN  = l'entreprise (9 chiffres, à vie).
 * SIRET  = un établissement (14 chiffres = SIREN + NIC).
 * La mention légalement obligatoire sur la facture est le SIREN du client
 * (art. 242 nonies A, annexe II du CGI).
 */

// Seule exception française connue à l'algorithme de Luhn : La Poste.
const LUHN_EXCEPTIONS = ['356000000'];

// Valeurs possibles renvoyées par l'autocomplete d'adresse pour la France.
const FRANCE_LABELS = ['france', 'fr', 'fra'];

/** Le pays fourni correspond-il à la France ? */
export const isFranceCountry = (country) =>
    typeof country === 'string' && FRANCE_LABELS.includes(country.trim().toLowerCase());

/**
 * Ne conserve que les chiffres.
 * Plafonné à 14 (et non 9) volontairement : si l'utilisateur colle un SIRET,
 * on veut qu'il VOIE sa saisie complète et reçoive une erreur explicite,
 * plutôt que de tronquer silencieusement aux 9 premiers chiffres.
 */
export const sanitizeSiren = (value) => String(value ?? '').replace(/\D/g, '').slice(0, 14);

/**
 * Clé de Luhn : en partant de la droite, on double un chiffre sur deux
 * (on retire 9 si le résultat dépasse 9). Le total doit être divisible par 10.
 */
const passesLuhn = (digits) => {
    let sum = 0;
    for (let i = 0; i < digits.length; i += 1) {
        const fromRight = digits.length - 1 - i; // 0 = chiffre de contrôle, jamais doublé
        let digit = Number(digits[i]);
        if (fromRight % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }
    return sum % 10 === 0;
};

/**
 * Le SIREN est-il exigé pour ce formulaire ?
 * Requis si le client est un pro ET que la facturation est en France.
 * Un pays encore inconnu est traité comme la France : c'est le marché par
 * défaut, et la contrainte se relâche dès qu'un pays étranger est choisi.
 */
export const isSirenRequired = (formData) => {
    if (!formData?.isPro) return false;
    const country = formData.billingSameAsEvent ? formData.deliveryCountry : formData.billingCountry;
    return !country || isFranceCountry(country);
};

/**
 * @returns {null|'required'|'siret'|'length'|'checksum'} null si la saisie est valide.
 */
export const getSirenError = (value, { required = false } = {}) => {
    const digits = String(value ?? '').replace(/\D/g, '');

    if (!digits) return required ? 'required' : null;
    if (digits.length === 14) return 'siret';
    if (digits.length !== 9) return 'length';
    if (LUHN_EXCEPTIONS.includes(digits)) return null;
    if (!passesLuhn(digits)) return 'checksum';

    return null;
};

/** Raccourci booléen, pratique pour la validation d'étape. */
export const isSirenValid = (value, options) => getSirenError(value, options) === null;

/**
 * N° de TVA intracommunautaire français, déduit du SIREN.
 * FR + clé sur 2 chiffres + SIREN, avec clé = (12 + 3 × (SIREN mod 97)) mod 97.
 * Retourne null si l'entrée n'est pas un SIREN français à 9 chiffres.
 */
export const buildFrenchVatNumber = (siren) => {
    const digits = String(siren ?? '').replace(/\D/g, '');
    if (digits.length !== 9) return null;

    const key = String((12 + 3 * (Number(digits) % 97)) % 97).padStart(2, '0');
    return `FR${key}${digits}`;
};