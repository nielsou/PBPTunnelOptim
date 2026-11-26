// src/zones/countries/pl.js
// Règles communes à tous les dépôts en Pologne (Cracovie, puis Varsovie…).

const pl = {
    code: 'pl',
    lang: 'pl',
    region: 'PL',
    brand: 'Flash Society',
    intlLocale: 'pl-PL',

    currency: { code: 'PLN', symbol: 'zł', spaceBefore: true },
    vatRate: 1.23,                // TVA polonaise 23 %

    addressCountry: 'pl',
    defaultCountry: 'Polska',

    companyIdField: 'nip',
    showEInvoiceNotice: false,

    // Pas de devis ni de paiement tant que la facturation polonaise n'est pas tranchée
    endAction: 'lead',
};

export default pl;
