// pages/api/create-thirdparty.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const AXONAUT_API_KEY = process.env.AXONAUT_API_KEY; 
    const BASE_URL = 'https://axonaut.com/api/v2';
    
    const headers = {
        'Content-Type': 'application/json',
        'userApiKey': AXONAUT_API_KEY
    };

    const companyData = req.body; 

    try {
        // --- LOG : Données reçues du Frontend ---
        console.log("📥 [API Route] Données reçues (Payload):", JSON.stringify(companyData, null, 2));

        // --- 1. RECHERCHE EMAIL (Anti-doublon) ---
        const contactEmail = companyData.employees?.[0]?.email;
        let existingCompanyId = null;

        if (contactEmail) {
            console.log(`🔍 [Axonaut] Recherche doublon pour l'email : ${contactEmail}`);
            const searchResponse = await fetch(`${BASE_URL}/employees?email=${encodeURIComponent(contactEmail)}`, {
                method: 'GET',
                headers: headers
            });

            if (searchResponse.ok) {
                const employees = await searchResponse.json();
                if (employees && employees.length > 0) {
                    existingCompanyId = employees[0].company_id;
                    console.log(`✅ [Axonaut] Société existante trouvée (ID: ${existingCompanyId})`);
                }
            }
        }

        // --- 2. ACTION (PATCH ou POST) ---
        let axonautResponse;
        
        if (existingCompanyId) {
            console.log(`🔄 [Axonaut] Envoi PATCH vers /companies/${existingCompanyId}`);
            axonautResponse = await fetch(`${BASE_URL}/companies/${existingCompanyId}`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify(companyData)
            });
        } else {
            console.log(`➕ [Axonaut] Envoi POST vers /companies`);
            axonautResponse = await fetch(`${BASE_URL}/companies`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(companyData)
            });
        }

        if (!axonautResponse.ok) {
            const errorText = await axonautResponse.text();
            console.error(`❌ [Axonaut] Erreur API (${axonautResponse.status}):`, errorText);
            throw new Error(errorText || `Erreur Axonaut ${axonautResponse.status}`);
        }

        const finalData = await axonautResponse.json();

        // --- LOG : Réponse complète d'Axonaut ---
        // C'est ici que tu verras tout le JSON retourné par Axonaut dans tes logs serveur
        console.log("📤 [Axonaut] Réponse complète (Full JSON):", JSON.stringify(finalData, null, 2));

        res.status(200).json(finalData);

    } catch (error) {
        console.error('❌ [API Route] Erreur fatale:', error.message);
        res.status(500).json({ 
            error: "Erreur lors de la synchronisation Axonaut", 
            details: error.message 
        });
    }
}