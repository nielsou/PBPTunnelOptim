// src/zones/index.js
// Où on intervient et à quel prix.
//  - countries/<pays>.js : règles du pays (marque, devise, TVA, facturation)
//  - depots/<ville>.js   : un dépôt (position, zone de livraison, retrait, machines, prix)
//
// C'est l'adresse de l'événement qui choisit le dépôt : le plus proche dans son rayon de livraison.
// L'URL ne porte que la langue (?lang=pl, français par défaut).
// Pour les tests : ?depot=krakow (ou ?site=krakow) force un dépôt sans taper d'adresse.
// Ajouter une ville = créer depots/<ville>.js et l'enregistrer dans DEPOTS ci-dessous.

import fr from './countries/fr';
import pl from './countries/pl';
import paris from './depots/paris';
import krakow from './depots/krakow';
import warsaw from './depots/warsaw';

export const COUNTRIES = { fr, pl };
export const DEPOTS = { paris, krakow, warsaw };
export const DEFAULT_DEPOT_ID = 'paris';

// Dépôt affiché tant que l'adresse n'est pas saisie, selon la langue choisie
const DEFAULT_DEPOT_BY_LANG = { pl: 'krakow' };

// Pays où la recherche d'adresse est ouverte (ceux où on a au moins un dépôt)
export const ADDRESS_COUNTRIES = [...new Set(Object.values(DEPOTS).map(d => COUNTRIES[d.country].addressCountry))];

// Distance à vol d'oiseau (km)
export function haversineKm(origin, lat2, lon2) {
    const lat1 = origin.lat;
    const lon1 = origin.lng;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Config complète d'un dépôt = règles du pays + réglages du dépôt (objet `site` utilisé par le tunnel)
export function buildSite(depotId) {
    const depot = DEPOTS[depotId] || DEPOTS[DEFAULT_DEPOT_ID];
    const country = COUNTRIES[depot.country];
    return {
        ...country,
        ...depot,
        countryCode: country.code,
        delivery: { ...depot.delivery, allowPickup: !!depot.pickup },
        addressCountries: [country.addressCountry],
    };
}

// Dépôt forcé par l'URL : pages internes (calculette, partenaires) = Paris ; tests = ?depot= / ?site=
export function getForcedDepotFromUrl() {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    if (path.includes('/partenaires') || path.includes('/calculette')) return { id: DEFAULT_DEPOT_ID, internal: true };
    const params = new URLSearchParams(window.location.search);
    const id = (params.get('depot') || params.get('site') || '').toLowerCase();
    return DEPOTS[id] ? { id, internal: false } : null;
}

/**
 * Choisit le dépôt à partir de l'adresse de l'événement.
 * @returns {{ status: 'unknown'|'delivery'|'pickup_only'|'out_of_area', site, distanceKm, addressCountries }}
 *  - unknown     : pas encore d'adresse → dépôt par défaut selon la langue
 *  - delivery    : un dépôt livre cette adresse (le plus proche)
 *  - pickup_only : trop loin pour livrer, mais un dépôt du même pays propose le retrait (quelle que soit la distance)
 *  - out_of_area : trop loin pour livrer et aucun retrait possible dans ce pays → tunnel bloqué
 */
export function resolveZone({ lat, lng, countryCode, lang, forced }) {
    const hasAddress = lat != null && lng != null;

    // Dépôt imposé (pages internes, liens de test)
    if (forced) {
        const site = buildSite(forced.id);
        if (!hasAddress) return { status: 'unknown', site, distanceKm: null, addressCountries: site.addressCountries };
        const distanceKm = haversineKm(site.origin, lat, lng);
        // Calculette et partenaires : pas de limite, l'équipe commerciale décide
        const status = forced.internal || distanceKm <= site.delivery.maxKm ? 'delivery'
            : site.pickup ? 'pickup_only' : 'out_of_area';
        return { status, site, distanceKm, addressCountries: site.addressCountries };
    }

    if (!hasAddress) {
        const site = buildSite(DEFAULT_DEPOT_BY_LANG[lang] || DEFAULT_DEPOT_ID);
        return { status: 'unknown', site, distanceKm: null, addressCountries: ADDRESS_COUNTRIES };
    }

    // Seuls les dépôts du pays de l'adresse peuvent la servir.
    // Code pays absent (rare) : on prend le pays du dépôt le plus proche.
    const byDistance = Object.values(DEPOTS).sort((a, b) => haversineKm(a.origin, lat, lng) - haversineKm(b.origin, lat, lng));
    const cc = countryCode || COUNTRIES[byDistance[0].country].addressCountry;
    const ranked = Object.values(DEPOTS)
        .filter(d => COUNTRIES[d.country].addressCountry === cc)
        .map(d => ({ depot: d, distanceKm: haversineKm(d.origin, lat, lng) }))
        .sort((a, b) => a.distanceKm - b.distanceKm);

    const delivering = ranked.find(r => r.distanceKm <= r.depot.delivery.maxKm);
    if (delivering) {
        return { status: 'delivery', site: buildSite(delivering.depot.id), distanceKm: delivering.distanceKm, addressCountries: ADDRESS_COUNTRIES };
    }
    const pickup = ranked.find(r => r.depot.pickup);
    if (pickup) {
        return { status: 'pickup_only', site: buildSite(pickup.depot.id), distanceKm: pickup.distanceKm, addressCountries: ADDRESS_COUNTRIES };
    }
    const nearest = ranked[0] || { depot: DEPOTS[DEFAULT_DEPOT_ID], distanceKm: haversineKm(DEPOTS[DEFAULT_DEPOT_ID].origin, lat, lng) };
    return { status: 'out_of_area', site: buildSite(nearest.depot.id), distanceKm: nearest.distanceKm, addressCountries: ADDRESS_COUNTRIES };
}

// Montant arrondi avec le symbole de la devise : "354€" (Paris), "1390 zł" (Pologne)
export const formatMoney = (site, amount) => {
    const { symbol, spaceBefore } = site.currency;
    return `${Number(amount).toFixed(0)}${spaceBefore ? ' ' : ''}${symbol}`;
};

// Montant avec centimes, au format local (récapitulatif)
export const formatMoneyExact = (site, amount) =>
    new Intl.NumberFormat(site.intlLocale, {
        style: 'currency',
        currency: site.currency.code,
        minimumFractionDigits: 2,
    }).format(amount);
