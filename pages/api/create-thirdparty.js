// pages/api/create-thirdparty.js

// 🚨 CORRECTION 1 & 2 : Utiliser le bon domaine et l'endpoint /companies
const AXONAUT_API_BASE_URL = 'https://axonaut.com/api/v2';

// La clé DOIT être chargée par Next.js à partir du fichier .env.local
const AXONAUT_API_KEY = process.env.AXONAUT_API_KEY; 

export default async function handler(req, res) {
  
  // 1. Autoriser uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Seul POST est supporté.' });
  }

  // 2. Vérification de la clé API
  if (!AXONAUT_API_KEY) {
    console.error("AXONAUT_API_KEY n'est pas définie. Échec de la configuration du proxy.");
    return res.status(500).json({ error: "Erreur de configuration du serveur : Clé API Axonaut manquante." });
  }
  
  const thirdPartyBody = req.body;
  // 🚩 Correction de l'endpoint : utilisation de /companies
  const url = `${AXONAUT_API_BASE_URL}/companies`; 
  
  try {
    // 3. Appel au serveur Axonaut
    const axonautResponse = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // 🚨 CORRECTION 3 : La clé doit être transmise via le Header 'userApiKey'
        'userApiKey': AXONAUT_API_KEY, 
      },
      body: JSON.stringify(thirdPartyBody),
    });

    const data = await axonautResponse.json();
    
    // 4. Gérer les statuts de réponse non 2xx d'Axonaut
    if (!axonautResponse.ok) {
        console.error("Erreur Axonaut (API Route):", axonautResponse.status, data);
        // Transmettre l'erreur Axonaut directement au frontend avec le statut correct
        return res.status(axonautResponse.status).json({ 
            error: data.message || "Échec de la création du tiers Axonaut.",
            details: data 
        });
    }

    // 5. Succès (Tiers créé)
    // Code 201 (Created) est plus précis que 200 (OK) pour la création.
    return res.status(201).json(data); 

  } catch (error) {
    // Si Axonaut plante ou si le fetch échoue côté serveur (DNS, réseau, timeout)
    console.error('Erreur réseau interne ou échec du fetch (Proxy):', error);
    return res.status(500).json({ error: `Erreur interne du proxy : ${error.message}` });
  }
}