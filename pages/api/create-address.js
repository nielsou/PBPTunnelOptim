// pages/api/create-address.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const AXONAUT_API_KEY = process.env.AXONAUT_API_KEY; 
    // On utilise l'URL fournie par Axonaut
    const AXONAUT_URL = 'https://axonaut.com/api/v2/addresses';
    
    try {
        const response = await fetch(AXONAUT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'userApiKey': AXONAUT_API_KEY
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Erreur Axonaut Creation Adresse:', data);
            return res.status(response.status).json({ error: data.message || 'Erreur lors de la création de l\'adresse' });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error('Erreur Serveur:', error);
        return res.status(500).json({ error: 'Erreur interne serveur' });
    }
}