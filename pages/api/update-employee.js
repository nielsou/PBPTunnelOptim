// pages/api/update-employee.js

export default async function handler(req, res) {
    // On accepte POST ou PATCH venant du front
    if (req.method !== 'POST' && req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { id } = req.query; // On récupère l'ID passé dans l'URL (?id=...)

    if (!id) {
        return res.status(400).json({ error: "L'ID de l'employé est requis." });
    }

    const AXONAUT_API_KEY = process.env.AXONAUT_API_KEY; 
    // Endpoint Axonaut pour la mise à jour
    const AXONAUT_URL = `https://axonaut.com/api/v2/employees/${id}`;
    
    try {
        console.log(`🔄 [API Route] Update Employé ${id}...`, JSON.stringify(req.body, null, 2));

        // Appel à l'API Axonaut en PATCH
        const response = await fetch(AXONAUT_URL, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'userApiKey': AXONAUT_API_KEY,
                'Accept': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ [API Route] Erreur Axonaut Update:', data);
            return res.status(response.status).json({ 
                error: data.message || data.details || "Erreur lors de la mise à jour du contact." 
            });
        }

        console.log(`✅ [API Route] Employé mis à jour avec succès. ID: ${data.id}`);
        return res.status(200).json(data);

    } catch (error) {
        console.error('❌ [API Route] Erreur Serveur:', error);
        return res.status(500).json({ error: 'Erreur interne lors de la mise à jour du contact.' });
    }
}