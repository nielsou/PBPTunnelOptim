// pages/api/get-payment-link.js

export default async function handler(req, res) {
    // 1. Sécurité : On n'accepte que les requêtes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL manquante" });
        }

        console.log("🔍 Scraping demandé pour :", url);

        // 2. Récupérer le HTML de la page publique Axonaut
        const pageResponse = await fetch(url);
        const htmlText = await pageResponse.text();

        // 3. Regex pour trouver l'ID caché
        const regex = /paymentSubmit\/([A-Z0-9]+)/;
        const match = htmlText.match(regex);

        if (!match || !match[1]) {
            console.error("❌ ID de paiement introuvable dans le HTML");
            return res.status(500).json({ error: "Impossible de trouver le bouton de paiement sur le devis." });
        }

        const paymentId = match[1];
        console.log("✅ ID Trouvé :", paymentId);

        // 4. Appeler l'API interne d'Axonaut pour avoir le lien Stripe
        const axonautApiUrl = `https://axonaut.com/public/quotation/paymentSubmit/${paymentId}`;
        
        const stripeResponse = await fetch(axonautApiUrl, {
            method: 'POST',
        });

        // Axonaut renvoie l'URL Stripe en texte brut
        const stripeUrl = await stripeResponse.text();

        if (stripeUrl && stripeUrl.startsWith('http')) {
            console.log("✅ Lien Stripe récupéré :", stripeUrl);
            return res.status(200).json({ success: true, stripeUrl: stripeUrl });
        } else {
            console.error("❌ Réponse Axonaut invalide :", stripeUrl);
            return res.status(502).json({ error: "Axonaut n'a pas renvoyé de lien valide." });
        }

    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        return res.status(500).json({ error: error.message });
    }
}