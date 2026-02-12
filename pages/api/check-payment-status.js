export default async function handler(req, res) {
    // 1. Sécurité
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "URL manquante" });
        }

        // 2. On récupère le HTML de la page Axonaut
        const pageResponse = await fetch(url);
        const htmlText = await pageResponse.text();

        // 3. NOUVELLE LOGIQUE : On cherche la phrase de succès spécifique
        // Axonaut affiche "Ce devis a été payé en ligne." quand c'est fait.
        const successPhrase = "Ce devis a été payé en ligne";
        
        // On vérifie si le HTML contient cette phrase
        const isPaid = htmlText.includes(successPhrase);

        console.log(`🔍 Check status pour ${url} -> Payé ? ${isPaid ? "OUI" : "NON"}`);

        return res.status(200).json({ 
            success: true, 
            paid: isPaid 
        });

    } catch (error) {
        console.error("Erreur check status:", error);
        return res.status(500).json({ error: error.message });
    }
}