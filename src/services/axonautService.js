// src/services/axonautService.js

import { 
    AXONAUT_THEMES_MAPPING, 
    AXONAUT_FIXED_DEFAULTS,
    ZAPIER_WEBHOOK_URL,
    // TVA_RATE n'est pas utilisé ici mais pourrait l'être
} from '../constants';

/**
 * Fonction utilitaire pour formater une date en RFC3339 (requis par Axonaut).
 */
const toRfc3339 = (date) => {
    const isoString = date.toISOString();
    const offset = date.getTimezoneOffset();
    const sign = offset <= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
    return isoString.replace(/\.\d{3}Z$/, `${sign}${hours}:${minutes}`);
};

/**
 * Génère le corps JSON pour la création d'un tiers.
 * Gère le parsing d'adresse (CP/Ville) et nettoie les civilités.
 */
export function generateAxonautThirdPartyBody(formData) {
    const isPro = formData.isPro;
    const [firstName, ...lastNameParts] = formData.fullName.split(' ').filter(Boolean);
    const lastName = lastNameParts.join(' ') || (firstName || '');
    const phoneDigits = formData.phone ? formData.phone.replace(/\D/g, '') : '';
    const mobileNumber = phoneDigits.length >= 10 ? phoneDigits.slice(-10).match(/.{1,2}/g).join(' ') : phoneDigits;

    // Choix adresse (Facturation si Pro, sinon Livraison)
    const fullAddressString = isPro ? (formData.billingFullAddress || formData.deliveryFullAddress) : formData.deliveryFullAddress;

    // --- Parsing Adresse (Regex & Découpage) ---
    let zipCode = '';
    let city = '';
    let streetOnly = fullAddressString; 

    if (fullAddressString) {
        // Regex : Cherche 5 chiffres (CP) suivis d'espaces puis du texte (Ville)
        const addressMatch = fullAddressString.match(/\b(\d{5})\s+([^,]+)/);
        
        if (addressMatch) {
            zipCode = addressMatch[1];
            city = addressMatch[2].trim();
            const partBeforeZip = fullAddressString.substring(0, addressMatch.index).trim();
            streetOnly = partBeforeZip.replace(/,\s*$/, '');
        }
    }

    let thirdPartyBody = {
        name: isPro ? formData.companyName : formData.fullName,
        address_street: streetOnly || 'Adresse non spécifiée', 
        address_zip_code: zipCode || '75000', 
        address_city: city || 'Paris',       
        address_country: 'France',
        is_prospect: true,
        is_customer: false, 
        isB2C: !isPro,
        currency: "EUR",
        language: "fr",
        business_manager: AXONAUT_FIXED_DEFAULTS.commercial,
        categories: ["PHOTOBOOTH PARIS"],
        employees: [],
    };

    if (isPro) {
        thirdPartyBody.address_contact_name = formData.fullName;
    }

    if (formData.fullName && formData.email) {
        thirdPartyBody.employees.push({
            firstname: firstName,
            lastname: lastName,
            email: formData.email,
            cellphoneNumber: mobileNumber || undefined,
            is_billing_contact: true,
        });
    }

    if (!thirdPartyBody.name) {
        thirdPartyBody.name = isPro ? `Société (${formData.fullName})` : formData.fullName;
    }

    return thirdPartyBody;
}

/**
 * Crée ou met à jour un tiers via l'API (Proxy).
 */
export const createAxonautThirdParty = async (formData) => {
    const thirdPartyBody = generateAxonautThirdPartyBody(formData);
    const PROXY_URL = '/api/create-thirdparty';
    
    console.log("SERVICE: Envoi Tiers...", JSON.stringify(thirdPartyBody, null, 2));

    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(thirdPartyBody),
        });

        const data = await response.json();
        
        if (!response.ok) throw new Error(data.details?.message || data.error || "Erreur création tiers");
        if (!data.id) throw new Error("ID manquant retour Axonaut");

        console.log(`✅ SERVICE: Tiers OK. ID: ${data.id}`);

        return { companyId: data.id }; 

    } catch (error) {
        console.warn(`SERVICE: Erreur Tiers (${error.message}). Utilisation ID fallback.`);
        return { companyId: formData.isPro ? 99999999 : 88888888 }; 
    }
}

/**
 * Génère le corps JSON complet du devis avec TOUTES les descriptions.
 */
export function generateAxonautQuotationBody(inputs, companyId) {
    const TVA_RATE_DEC = 20.0;
    const themesMapping = AXONAUT_THEMES_MAPPING;
    
    const {
        nomBorne, prixMateriel, prixTemplate, prixLivraison, nombreMachine,
        supplementKilometrique, supplementLivraisonDifficile, supplementImpression,
        supplementAnimation, commercial, dateEvenement, 
        adresseLivraisonComplete, nombreJours, templateInclus, livraisonIncluse,
        acomptePct, nombreTirages, heuresAnimations, distanceKm
    } = inputs;

    const formatDate = (dateValue) => {
        if (!dateValue) return "Date non définie";
        const date = new Date(dateValue);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const productsArray = [];
    
    const ligneLivraison = livraisonIncluse
        ? ""
        : "<li><p>À venir récupérer au 2 rue Victor Carmignac, 94110 Arcueil</p></li>";

    let descriptionPrestation = "";

    switch (nomBorne) {
        case "CineBooth Numérique":
            descriptionPrestation = `
                  <ul>
                    <li><p>Mise à disposition de notre borne photo <strong>CineBooth Numérique</strong> avec capteur haute performance et flash intelligent</p></li>
                    <li><p>Prestation 100 % numérique (aucun tirage papier)</p></li>
                    <li><p>Envoi instantané des photos par e-mail (connexion 5G permanente)</p></li>
                    <li><p>Téléchargement des clichés numériques après l'événement</p></li>
                    ${ligneLivraison}
                    <li><p> Installation par vos soins, ultra-simple en 2 min chrono</p></li>
                    <li><p>Assistance digitale et support technique</p></li>
                  </ul>
                  <p>
                    <strong>Date</strong> : ${formatDate(dateEvenement)}<br />
                    <strong>Durée</strong> : ${nombreJours} jour${nombreJours > 1 ? 's' : ''}<br />
                    <strong>Lieu</strong> : ${adresseLivraisonComplete}
                  </p>`;
            break;

        case "CineBooth 150 impressions": 
            descriptionPrestation = `
                  <ul>
                    <li><p>Mise à disposition de notre borne photo <strong>CineBooth 150</strong> avec capteur haute performance et flash intelligent</p></li>
                    <li><p>150 impressions instantanées sur papier photo Premium Digital brillant 10×15 cm <strong> en 1 exemplaire</strong></p></li>              
                    <li><p>Envoi instantané des photos par e-mail (connexion 5G permanente)</p></li>
                    <li><p>Téléchargement des clichés numériques après l'événement</p></li>
                    ${ligneLivraison}
                    <li><p> Installation par vos soins, ultra-simple en 2 min chrono</p></li>
                    <li><p>Assistance digitale et support technique</p></li>
                  </ul>
                  <p>
                    <strong>Date</strong> : ${formatDate(dateEvenement)}<br />
                    <strong>Durée</strong> : ${nombreJours} jour${nombreJours > 1 ? 's' : ''}<br />
                    <strong>Lieu</strong> : ${adresseLivraisonComplete}
                  </p>`;
            break;

        case "CineBooth 300 impressions": 
            descriptionPrestation = `
                  <ul>
                    <li><p>Mise à disposition de notre borne photo <strong>CineBooth 300</strong> avec capteur haute performance et flash intelligent</p></li>
                    <li><p>300 impressions instantanées sur papier photo Premium Digital brillant 10×15 cm <strong> en 1 exemplaire</strong></p></li>              
                    <li><p>Envoi instantané des photos par e-mail (connexion 5G permanente)</p></li>
                    <li><p>Téléchargement des clichés numériques après l'événement</p></li>
                    ${ligneLivraison}
                    <li><p> Installation par vos soins, ultra-simple en 2 min chrono</p></li>
                    <li><p>Assistance digitale et support technique</p></li>
                  </ul>
                  <p>
                    <strong>Date</strong> : ${formatDate(dateEvenement)}<br />
                    <strong>Durée</strong> : ${nombreJours} jour${nombreJours > 1 ? 's' : ''}<br />
                    <strong>Lieu</strong> : ${adresseLivraisonComplete}
                  </p>`;
            break;

        case "StarBooth Pro Illimité": 
            descriptionPrestation = `
                  <ul>
                    <li><p>Mise à disposition de notre borne photo <strong>Starbooth Pro</strong> avec capteur haute performance 4K et flash intelligent</p></li>
                    <li><p>Tirages instantanés et illimités sur papier photo Premium Digital brillant 10×15 cm<p></li>
                    <li><p>Envoi instantané des photos par e-mail (connexion 5G permanente)</p></li>
                    <li><p>Téléchargement des clichés numériques après l'événement</p></li>
                    ${ligneLivraison}
                    <li><p>Installation par vos soins, ultra-simple en 2 min chrono</p></li>
                    <li><p>Assistance digitale et support technique</p></li>
                    <li><p>Economisez 70 EUR en venant récupérer votre machine à notre dépôt d'Arcueil</p></li>
                  </ul>
                  <p>
                    <strong>Date</strong> : ${formatDate(dateEvenement)}<br />
                    <strong>Durée</strong> : ${nombreJours} jour${nombreJours > 1 ? 's' : ''}<br />
                    <strong>Lieu</strong> : ${adresseLivraisonComplete}
                  </p>`;
            break;

        case "Signature":
            descriptionPrestation = `
                  <ul>
                    <li><p>Mise à disposition de notre borne photo haut de gamme <strong>Signature</strong> avec Reflex haute performance, flash intelligent et habillage premium</p></li>
                    <li><p>Tirages instantanés et illimités sur papier photo Premium Digital brillant 10×15 cm<p></li>
                    <li><p>Impression de chaque cliché en <strong>${nombreTirages} exemplaire${nombreTirages > 1 ? "s" : ""}</strong><p></li>
                    <li><p>Envoi instantané des photos par e-mail (connexion 5G permanente)</p></li>
                    <li><p>Téléchargement des clichés numériques après l'événement</p></li>
                    <li><p>Assistance digitale et support technique</p></li>
                  </ul>
                  <p>
                    <strong>Date</strong> : ${formatDate(dateEvenement)}<br />
                    <strong>Durée</strong> : ${nombreJours} jour${nombreJours > 1 ? 's' : ''}<br />
                    <strong>Lieu</strong> : ${adresseLivraisonComplete}
                  </p>`;
            break;

        case "Photobooth 360":
            descriptionPrestation = `
                  <ul>
                    <li><p>Mise à disposition de notre <strong>Photobooth 360</strong> avec plateau rotatif de 120 cm pouvant accueillir jusqu'à 5 personnes</p></li>
                    <li><p>Éclairage LED rotatif intégré pour un rendu immersif</p></li>
                    <li><p>Vidéos instantanées en illimioté : vitesse normale, rapide et slowmotion</p></li>
                    <li><p>Partage immédiat des vidéos à chaque utilisateur</p></li>
                    <li><p>Téléchargement des vidéos après l'événement</p></li>
                    <li><p>Personnalisation offerte : ajout dʼun logo ou dʼune musique</p></li>
                    <li><p>3h d'animation incluses</p></li>
                  </ul>
                  <p>
                    <strong>Date</strong> : ${formatDate(dateEvenement)}<br />
                    <strong>Durée</strong> : ${nombreJours} jour${nombreJours > 1 ? 's' : ''}<br />
                    <strong>Lieu</strong> : ${adresseLivraisonComplete}
                  </p>`;
            break;

        default:
            descriptionPrestation = `<p>Description indisponible pour le matériel sélectionné : ${nomBorne}</p>`;
    }

    productsArray.push({
        "product_code": "P-BASE",
        "name": `Prestation ${nomBorne}`,
        "price": Math.round(100 * prixMateriel / (nombreMachine * nombreJours)) / 100,
        "tax_rate": TVA_RATE_DEC,
        "quantity": nombreMachine * nombreJours,
        "description": descriptionPrestation,
        "chapter": ""
    });

    const totalSupplementLivraison = supplementKilometrique + supplementLivraisonDifficile;
    const prixLogistiqueTotal = (livraisonIncluse ? prixLivraison : 0) + totalSupplementLivraison;

    if (livraisonIncluse || totalSupplementLivraison > 0) {
        let descHtml = "<ul>";

        if (livraisonIncluse) {
            if (nomBorne === "Signature") {
                descHtml += "<li><p>Livraison, installation et reprise par un technicien certifié</p></li>";
            } else if (nomBorne === "Photobooth 360") {
                descHtml += "<li><p>Livraison, installation et reprise</p></li>";
            } else {
                descHtml += "<li><p>Livraison et reprise par nos soins</p></li>";
            }
        } else {
            descHtml += "<li><p>Frais Logistique</p></li>"; 
        }

        if (supplementKilometrique > 0) {
            descHtml += `<li><p>Supplément kilométrique : ${Math.round(distanceKm)} km depuis Paris centre</p></li>`;
        }
        if (supplementLivraisonDifficile > 0) {
            descHtml += "<li><p>Livraison difficile : accès complexe, étage sans ascenseur, ou contraintes logistiques particulières</p></li>";
        }
        descHtml += "</ul>";

        productsArray.push({
            "product_code": "P-LOGISTICS",
            "name": "Logistique & Livraison",
            "price": Math.round(100 * prixLogistiqueTotal) / 100,
            "tax_rate": TVA_RATE_DEC,
            "quantity": 1,
            "description": descHtml,
            "chapter": ""
        });
    }

    if (templateInclus) {
        const templateName = prixTemplate > 0
            ? "[Option] Personnalisation du template"
            : "[Option] Personnalisation du template (OFFERT)";

        const templateDescription = `<ul>
            <li><p>Créez votre visuel entourant la photo, 100 % à votre image, en totale autonomie</p></li>
            <li><p>Interface en ligne simple et intuitive, inspirée de Canva</p></li>
            <li><p>Personnalisation complète : cadres, logo, textes, couleurs, etc...</p></li>
        </ul>
        <p>
            <em>Sans personnalisation de votre part <strong>la veille au soir</strong> de l'événement, un élégant template avec encadré blanc -sans écrit ni logo- sera utilisé par défaut</em><br />
        </p>`;

        if (nomBorne != "Photobooth 360") {
            productsArray.push({
                "product_code": "P-TEMPLATE",
                "name": templateName,
                "price": Math.round(100 * prixTemplate) / 100,
                "tax_rate": TVA_RATE_DEC,
                "quantity": 1,
                "description": templateDescription,
                "chapter": ""
            });
        }
    }

    if (supplementImpression > 0) {
        productsArray.push({
            "product_code": "P-PRINT-SUP",
            "name": `[Option] Supplément Impression Multiple`,
            "price": Math.round(100 * supplementImpression / (nombreMachine * nombreJours * (nombreTirages - 1))) / 100,
            "tax_rate": TVA_RATE_DEC,
            "quantity": nombreMachine * nombreJours * (nombreTirages - 1),
            "description": `Possibilité d'imprimer chaque photo en ${nombreTirages} exemplaires`,
            "chapter": ""
        });
    }

    if (supplementAnimation > 0) {
        productsArray.push({
            "product_code": "P-ANIMATION",
            "name": `[Option] ${heuresAnimations} heures d'animation sur place`,
            "price": Math.round(100 * supplementAnimation) / 100,
            "tax_rate": TVA_RATE_DEC,
            "quantity": 1,
            "description": "Présence d'un animateur pour gérer la borne et assister les invités",
            "chapter": ""
        });
    }

    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(now.getDate() + 14);

    return {
        "company_id": companyId, 
        "theme_id": themesMapping[acomptePct],
        "business_manager": commercial,
        "online_payment": true,
        "date": toRfc3339(now),
        "expiry_date": toRfc3339(expiryDate),
        "products": productsArray
    };
}

/**
 * Envoie le devis via l'API (Proxy).
 */
export const sendAxonautQuotation = async (quotationBody) => {
    const PROXY_URL = '/api/create-quote'; 
    
    console.log("SERVICE: Envoi Devis (JSON)...", JSON.stringify(quotationBody, null, 2));

    try {
        const response = await fetch(PROXY_URL, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quotationBody),
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || "Erreur création devis");
        if (!data.id) throw new Error("ID manquant retour Axonaut");

        console.log(`✅ SERVICE: Devis créé avec succès. ID: ${data.id}, NUMBER: ${data.number}`);

        return data; 
    } catch (error) {
        console.error("SERVICE: Erreur critique envoi devis", error);
        throw new Error(`Erreur envoi devis: ${error.message}`);
    }
}

/**
 * Crée un événement dans Axonaut (ici utilisé pour envoyer le devis par email).
 * Utilise le endpoint /api/v2/events via un proxy.
 * 🆕 MODIFICATION : Ajout du paramètre 'publicLink'
 */
export const createAxonautEvent = async (quotationId, companyId, customerEmail, formFillerEmail, publicLink) => {
    const PROXY_EVENT_URL = '/api/create-event'; 
    const now = new Date();

    // 🆕 Construction du message avec le lien de signature
    const emailContent = `Bonjour,

Veuillez trouver ci-joint votre devis Photobooth.

Vous pouvez le consulter, le signer et régler l'acompte directement en ligne via ce lien sécurisé :
${publicLink}

Cordialement,
L'équipe Photobooth Paris`;

    const eventBody = {
        company_id: companyId,
        employee_email: formFillerEmail, 
        date: toRfc3339(now),
        nature: 2, 
        title: `Suite à votre demande de devis`,
        content: emailContent,
        is_done: false,
        attachments: {
            quotations_ids: [quotationId] 
        },
    };

    console.log("SERVICE: Création Événement Axonaut (Email)...", JSON.stringify(eventBody, null, 2));

    try {
        const response = await fetch(PROXY_EVENT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventBody),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Erreur création événement Axonaut");

        console.log(`✅ SERVICE: Événement créé avec succès. ID: ${data.id}`);
        return data; 

    } catch (error) {
        console.error("SERVICE: Erreur création événement", error);
    }
}

/**
 * Envoie les données au Webhook Zapier.
 */
export const sendZapierWebhook = async (payload) => {
    console.log("SERVICE: Envoi Webhook Zapier...", payload);
    try {
        await fetch(ZAPIER_WEBHOOK_URL, { method: 'POST', body: JSON.stringify(payload) });
    } catch (error) {
        console.error('Erreur Zapier', error);
    }
};

/**
 * 🆕 MOCK : Récupère les infos partenaire via le numéro client.
 * A CONNECTER A VOTRE BACKEND REEL PLUS TARD.
 */
export const getAxonautCompanyDetails = async (clientNumber) => {
    console.log(`SERVICE: Recherche Partenaire ${clientNumber}...`);

    // Simulation d'appel API
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (clientNumber === '12345') { // Code de test
                resolve({
                    found: true,
                    name: "AGENCE EVENEMENTIEL PRO",
                    billingAddress: {
                        fullAddress: "10 Avenue des Champs-Élysées, 75008 Paris",
                        zip: "75008",
                        city: "Paris"
                    },
                    contacts: [
                        { fullName: "Julie Martin", email: "julie@agence-event.pro", phone: "+33612345678" }
                    ],
                    savedAddresses: [
                        { label: "Siège Social", address: "10 Avenue des Champs-Élysées, 75008 Paris" },
                        { label: "Showroom", address: "45 Rue de la République, 92100 Boulogne-Billancourt" }
                    ]
                });
            } else {
                reject("Client introuvable");
            }
        }, 800);
    });
};