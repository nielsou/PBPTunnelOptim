// Exemple pour un environnement Vercel ou Node.js (api/create-checkout-session.js)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { amount, customer_email, metadata } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        payment_intent_data: {
          description: `Acompte Devis ${metadata.quote_number}`,
          metadata: metadata, // On remet les métadonnées aussi sur le paiement pour les retrouver facilement
        },
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Acompte Devis ${metadata.quote_number}`,
                description: 'Réservation de votre photobooth',
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: customer_email,
        metadata: metadata,
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/`,
      });

      res.status(200).json({ url: session.url });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}