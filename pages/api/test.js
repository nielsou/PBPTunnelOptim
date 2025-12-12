// pages/api/test.js

// L'API Key est toujours mise en dur temporairement (71591df9096c0cbef65ec2c164b56716)
const AXONAUT_API_KEY = process.env.AXONAUT_API_KEY; 

const TEST_PAYLOAD = {
    "name": "Ma Société de Test",
    "address_street": "10 rue des Tests",
    "employees": [
        {
            "firstname": "Jean",
            "email": "jean.dupont@test.com",
            "phoneNumber": "0534000000"
        }
    ]
};

// 🚩 CORRECTION DU DOMAINE ET DE L'ENDPOINT :
// L'URL de base n'est plus "api.axonaut.com" mais "axonaut.com"
// L'endpoint n'est plus "thirdparties" mais "companies"
const AXONAUT_URL = `https://axonaut.com/api/v2/companies`; 


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Méthode non autorisée. Seul POST est supporté." });
    }
    
    if (!AXONAUT_API_KEY) {
        return res.status(500).json({ error: "Erreur de Configuration: AXONAUT_API_KEY est NULL ou vide." });
    }
    
    console.log("URL Axonaut construite pour le test:", AXONAUT_URL);

    try {
        console.log("-> Envoi du POST de test à Axonaut...");

        const response = await fetch(AXONAUT_URL, {
            method: 'POST',
            // 🚩 CORRECTION DES HEADERS :
            headers: {
                'Content-Type': 'application/json',
                // Ajout du header 'userApiKey' pour l'authentification
                'userApiKey': AXONAUT_API_KEY 
            },
            body: JSON.stringify(TEST_PAYLOAD)
        });

        // La logique de lecture reste la même, elle va maintenant lire une réponse JSON
        const data = await response.json(); 

        if (response.ok) {
            console.log("<- Réponse réussie reçue d'Axonaut.");
            return res.status(200).json(
                { 
                    success: true, 
                    message: "Test POST vers Axonaut réussi.",
                    axonautResponse: data 
                }
            );
        } else {
            console.error("<- Erreur reçue d'Axonaut:", data);
            return res.status(response.status).json(
                { 
                    success: false, 
                    message: "Échec du POST vers Axonaut.",
                    axonautError: data 
                }
            );
        }

    } catch (error) {
        console.error("Erreur générale lors de l'exécution du test:", error);
        return res.status(500).json(
            { error: "Une erreur interne est survenue lors du test.", details: error.message }
        );
    }
}