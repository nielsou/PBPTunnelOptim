// src/services/gtmService.js

export const pushToDataLayer = (eventData) => {
  if (typeof window !== 'undefined') {
    
    // 1. Tracking LOCAL (si on est directement sur l'URL vercel.app)
    if (window.dataLayer) {
      window.dataLayer.push(eventData);
    }

    // 2. Tracking CROSS-DOMAIN (Envoi du message au site parent photobooth-paris.fr)
    // On vérifie si window.parent existe et est différent de la fenêtre actuelle (donc on est dans une iframe)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        source: 'pbp_tunnel_iframe', // Une clé unique pour identifier vos messages
        payload: eventData
      }, '*'); // Idéalement remplacez '*' par 'https://www.photobooth-paris.fr' pour la sécurité
    }
  }
};