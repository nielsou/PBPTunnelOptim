export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { companyId } = req.query;

    if (!companyId) {
        return res.status(400).json({ error: "L'ID de la société (companyId) est requis." });
    }

    const AXONAUT_API_KEY = process.env.AXONAUT_API_KEY;
    const AXONAUT_URL = `https://axonaut.com/api/v2/companies/${companyId}/addresses`;

    try {
        const response = await fetch(AXONAUT_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'userApiKey': AXONAUT_API_KEY
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Erreur Axonaut API (Addresses):', data);
            return res.status(response.status).json({ 
                error: data.message || "Impossible de récupérer les adresses." 
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error('Erreur Serveur:', error);
        return res.status(500).json({ error: 'Erreur interne lors de la récupération des adresses.' });
    }
}