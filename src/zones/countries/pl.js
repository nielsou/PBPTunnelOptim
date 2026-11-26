// src/zones/countries/pl.js
// Règles communes à tous les dépôts en Pologne (Cracovie, puis Varsovie…).

const pl = {
    code: 'pl',
    lang: 'pl',
    // Où arrivent les demandes : region 'PL' → variable Vercel N8N_WEBHOOK_URL_PL
    // → workflow n8n « TunnelOptim PL » → Google Sheet « Prod_Polska », onglet TZapOptim
    // (ID 1I1c-ML3Ol-Clvo0oIsp_b_T3_aSynl0zXaQzsGgy1bY). Routage : pages/api/webhook-n8n.js
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
