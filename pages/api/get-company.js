// pages/api/get-company.js

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "L'ID de la société est requis." });
    }

    const AXONAUT_API_KEY = process.env.AXONAUT_API_KEY;
    // URL basée sur ta snippet
    const AXONAUT_URL = `https://axonaut.com/api/v2/companies/${id}`;

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
            console.error('Erreur Axonaut API:', data);
            // On renvoie une 404 si l'entreprise n'est pas trouvée
            return res.status(response.status).json({ 
                error: data.message || "Impossible de récupérer les informations de la société." 
            });
        }

        // On renvoie les données brutes d'Axonaut au frontend
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erreur Serveur:', error);
        return res.status(500).json({ error: 'Erreur interne lors de la récupération des données.' });
    }
}