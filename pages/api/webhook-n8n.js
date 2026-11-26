// pages/api/webhook-n8n.js
// Proxy vers n8n : chaque région a son propre webhook n8n, donc son propre Google Sheet.
//  - France : le payload de Paris n'a pas de champ `region` → webhook historique (Sheet Photobooth Paris).
//  - Autres régions (champ `region` envoyé par le tunnel, ex. "PL") : webhook défini dans les variables
//    d'environnement Vercel, N8N_WEBHOOK_URL_<REGION> (ex. N8N_WEBHOOK_URL_PL).
//    Tant qu'il n'est pas défini, la demande n'est PAS transmise (jamais vers le Sheet français).
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const N8N_URL = 'https://photoboothparis.app.n8n.cloud/webhook/bf8eec42-0e63-4a4b-ba32-2a1064217938';
    const N8N_URL_TEST = 'https://photoboothparis.app.n8n.cloud/webhook-test/bf8eec42-0e63-4a4b-ba32-2a1064217938';

    const region = req.body?.region;
    let targetUrl = N8N_URL;

    if (region && region !== 'FR') {
        const regionUrl = /^[A-Z]{2}$/.test(region) ? process.env[`N8N_WEBHOOK_URL_${region}`] : null;
        if (!regionUrl) {
            console.error(`Proxy n8n : aucun webhook pour la région "${region}" (variable N8N_WEBHOOK_URL_${region} absente). Demande non transmise.`);
            return res.status(503).json({ error: `Webhook n8n non configuré pour la région ${region}` });
        }
        targetUrl = regionUrl;
    }

    try {
        const n8nResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        // Pas besoin d'attendre une réponse complexe de n8n, un 200 suffit
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erreur Proxy n8n:', error);
        return res.status(500).json({ error: 'Erreur lors de l\'envoi à n8n' });
    }
}
