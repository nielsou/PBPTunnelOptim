// pages/api/create-employee.js

export default async function handler(req, res) {
    // 1. Vérification de la méthode
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const AXONAUT_API_KEY = process.env.AXONAUT_API_KEY; 
    const AXONAUT_URL = 'https://axonaut.com/api/v2/employees';
    
    try {
        console.log("➡️ [API Route] Création employé Axonaut...", JSON.stringify(req.body, null, 2));

        // 2. Appel à l'API Axonaut
        const response = await fetch(AXONAUT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'userApiKey': AXONAUT_API_KEY, // Authentification sécurisée serveur
                'Accept': 'application/json'
            },
            body: JSON.stringify(req.body) // On transmet le payload préparé par le service
        });

        const data = await response.json();

        // 3. Gestion des erreurs Axonaut
        if (!response.ok) {
            console.error('❌ [API Route] Erreur Axonaut (Employee):', data);
            // On renvoie l'erreur précise pour que le front puisse l'afficher ou la logger
            return res.status(response.status).json({ 
                error: data.message || data.details || "Erreur lors de la création du contact." 
            });
        }

        console.log(`✅ [API Route] Employé créé avec succès. ID: ${data.id}`);
        return res.status(200).json(data);

    } catch (error) {
        console.error('❌ [API Route] Erreur Serveur:', error);
        return res.status(500).json({ error: 'Erreur interne lors de la création du contact.' });
    }
}