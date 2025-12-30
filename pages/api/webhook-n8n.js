// Exemple de route Node.js / Next.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const N8N_URL = 'https://photoboothparis.app.n8n.cloud/webhook/c79fdefe-9611-4243-9916-a1ba98f707ce';
    const N8N_URL_TEST = 'https://photoboothparis.app.n8n.cloud/webhook-test/c79fdefe-9611-4243-9916-a1ba98f707ce';

    try {
        const n8nResponse = await fetch(N8N_URL, {
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