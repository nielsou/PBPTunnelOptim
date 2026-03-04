// src/services/gtmService.js
export const pushToDataLayer = (eventData) => {
  if (typeof window !== 'undefined') {
    
    console.log("📊 [GTM Service] Tentative d'envoi d'événement :", eventData);

    // 1. Tracking LOCAL (si on est directement sur l'URL vercel.app)
    if (window.dataLayer) {
      window.dataLayer.push(eventData);
      console.log("✅ [GTM Service] Push réussi dans le dataLayer local.");
    } else {
      console.warn("⚠️ [GTM Service] window.dataLayer non trouvé localement.");
    }

    // 2. Tracking CROSS-DOMAIN (Envoi du message au site parent photobooth-paris.fr)
    if (window.parent && window.parent !== window) {
      console.log("🔗 [GTM Service] Iframe détectée. Envoi du message au parent (photobooth-paris.fr)...");
      
      window.parent.postMessage({
        source: 'pbp_tunnel_iframe',
        payload: eventData
      }, 'https://www.photobooth-paris.fr'); 

      console.log("🚀 [GTM Service] Message posté vers le parent avec le payload :", eventData);
    } else {
      console.log("🏠 [GTM Service] Pas d'iframe parente détectée ou domaine identique.");
    }
  }
};