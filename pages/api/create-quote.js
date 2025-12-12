// pages/api/create-quote.js
// Cette route reçoit le JSON de devis et l'envoie à Axonaut

const AXONAUT_API_BASE_URL = 'https://axonaut.com/api/v2';
const AXONAUT_API_KEY = process.env.AXONAUT_API_KEY; 

export default async function handler(req, res) {
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Seul POST est supporté.' });
  }

  if (!AXONAUT_API_KEY) {
    return res.status(500).json({ error: "Erreur de configuration du serveur : Clé API Axonaut manquante." });
  }
  
  const quoteBody = req.body;
  // 🚩 Endpoint pour les devis (Quotes)
  const url = `${AXONAUT_API_BASE_URL}/quotations`; 
  
  try {
    // 1. Appel au serveur Axonaut pour créer le devis
    const axonautResponse = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Clé dans le header, comme pour la création de société
        'userApiKey': AXONAUT_API_KEY, 
      },
      body: JSON.stringify(quoteBody),
    });

    const data = await axonautResponse.json();
    
    // 2. Gérer les statuts de réponse (y compris les erreurs 4xx)
    if (!axonautResponse.ok) {
        console.error("Erreur Axonaut lors de la création du devis:", axonautResponse.status, data);
        return res.status(axonautResponse.status).json({ 
            error: data.message || "Échec de la création du devis Axonaut.",
            details: data 
        });
    }

    // 3. Succès (Devis créé)
    // Axonaut renvoie souvent l'ID du devis créé ici.
    console.log(`✅ Devis Axonaut créé. ID: ${data.id}`);
    return res.status(201).json(data); 

  } catch (error) {
    console.error('Erreur réseau interne ou échec du fetch (Proxy Devis):', error);
    return res.status(500).json({ error: `Erreur interne du proxy : ${error.message}` });
  }
}