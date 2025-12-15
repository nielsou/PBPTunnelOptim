export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const AXONAUT_API_KEY = process.env.AXONAUT_API_KEY; // Votre clé API stockée dans .env
  const AXONAUT_URL = 'https://axonaut.com/api/v2/events';

  try {
    const response = await fetch(AXONAUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userApiKey': AXONAUT_API_KEY, // La clé est ajoutée ici, côté serveur
        'accept': 'application/json'
      },
      body: JSON.stringify(req.body), // On transfère le corps envoyé par le front
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur Axonaut API:', data);
      return res.status(response.status).json({ error: data.message || 'Erreur Axonaut' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erreur Serveur:', error);
    return res.status(500).json({ error: 'Erreur interne serveur' });
  }
}