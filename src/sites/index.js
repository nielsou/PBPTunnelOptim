// src/sites/index.js
// Un fichier de config par ville. Le site est choisi par l'URL : ?site=krakow
// Sans paramètre (ou valeur inconnue), c'est Paris. Les pages partenaires/calculette restent sur Paris.
// Ajouter une ville = créer src/sites/<ville>.js et l'enregistrer ci-dessous.

import paris from './paris';
import krakow from './krakow';

export const SITES = { paris, krakow };
export const DEFAULT_SITE = paris;

export const getSiteFromUrl = () => {
    if (typeof window === 'undefined') return DEFAULT_SITE;
    const path = window.location.pathname;
    if (path.includes('/partenaires') || path.includes('/calculette')) return DEFAULT_SITE;
    const id = (new URLSearchParams(window.location.search).get('site') || '').toLowerCase();
    return SITES[id] || DEFAULT_SITE;
};

// Montant arrondi avec le symbole de la devise du site : "354€" (Paris), "1390 zł" (Cracovie)
export const formatMoney = (site, amount) => {
    const { symbol, spaceBefore } = site.currency;
    return `${Number(amount).toFixed(0)}${spaceBefore ? ' ' : ''}${symbol}`;
};

// Montant avec centimes, au format local du site (récapitulatif)
export const formatMoneyExact = (site, amount) =>
    new Intl.NumberFormat(site.intlLocale, {
        style: 'currency',
        currency: site.currency.code,
        minimumFractionDigits: 2,
    }).format(amount);
