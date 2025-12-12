// src/hooks/useQuoteLogic.js

import { useState, useEffect, useMemo } from 'react';
import { nanoid } from 'nanoid';
import { 
    TVA_RATE, PARIS_LAT, PARIS_LNG, ZAPIER_WEBHOOK_URL, AXONAUT_THEMES_MAPPING, 
    AXONAUT_FIXED_DEFAULTS, BASE_PRICE_PRO_HT, PLANCHER_PRICE_PRO_HT_USER_FIX,
    ECO_MODELS_PRICING, DELIVERY_BASE_ECO_HT, DELIVERY_BASE_ILLIMITE_HT, 
    SETUP_PRICE_HT, PRO_DELIVERY_BASE_HT, PRO_ANIMATION_HOUR_PRICE_HT, 
    PRO_IMPRESSION_BASE_HT, PRO_IMPRESSION_PLANCHER_HT, PRO_OPTION_FONDIA_HT, 
    PRO_OPTION_RGPD_HT, TEMPLATE_TOOL_PRO_PRICE_HT, P360_BASE_PRICE_HT, 
    P360_DELIVERY_PRICE_HT, P360_FLOOR_PRICE_HT,
    // 🚩 MODIFICATION ICI : On utilise une seule constante pour l'URL de base du proxy
    THIRD_PARTY_PROXY_URL, AXONAUT_API_BASE_URL 
} from '../constants'; 


// ======================================================================
// FONCTIONS UTILITAIRES (Fonctions de 1er niveau, hors du Hook)
// ======================================================================

/**
 * Calcul de la distance à vol d'oiseau (Haversine) en km entre deux points.
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
}

/**
 * Génère le corps JSON pour la création d'un tiers (société ou particulier) dans Axonaut.
 */
function generateAxonautThirdPartyBody(formData) {
    const isPro = formData.isPro;
    const [firstName, ...lastNameParts] = formData.fullName.split(' ').filter(Boolean);
    const lastName = lastNameParts.join(' ') || (firstName || '');
    const phoneDigits = formData.phone ? formData.phone.replace(/\D/g, '') : '';
    // Tentative de formater le numéro de téléphone pour le champ 'cellphoneNumber' (10 chiffres)
    const mobileNumber = phoneDigits.length >= 10 ? phoneDigits.slice(-10).match(/.{1,2}/g).join(' ') : phoneDigits;

    let thirdPartyBody = {
        name: isPro ? formData.companyName : formData.fullName,
        address_contact_name: formData.fullName,
        address_street: isPro ? (formData.billingFullAddress || formData.deliveryFullAddress) : formData.deliveryFullAddress,
        is_prospect: true,
        is_customer: false, 
        isB2C: !isPro,
        currency: "EUR",
        language: "fr",
        business_manager: AXONAUT_FIXED_DEFAULTS.commercial,
        categories: isPro ? ["B2B"] : ["B2C"],
        employees: [],
    };
    
    // Tentative d'extraction de la ville et du code postal (simplifié)
    const address = thirdPartyBody.address_street || '';
    const postalMatch = address.match(/(\d{5})\s+([A-Za-z\s]+)$/);
    if (postalMatch) {
        thirdPartyBody.address_zip_code = postalMatch[1];
        thirdPartyBody.address_city = postalMatch[2].trim();
    }
    thirdPartyBody.address_country = 'France';

    // Ajout de l'employé/contact
    if (formData.fullName && formData.email) {
        thirdPartyBody.employees.push({
            firstname: firstName,
            lastname: lastName,
            email: formData.email,
            cellphoneNumber: mobileNumber || undefined,
            is_billing_contact: true,
        });
    }

    // Le champ 'name' est obligatoire et doit être unique/pertinent.
    if (!thirdPartyBody.name) {
        thirdPartyBody.name = isPro ? `Société (${formData.fullName})` : formData.fullName;
    }
    
    // Assurer que l'adresse est renseignée pour éviter une erreur Axonaut
    if (!thirdPartyBody.address_street) {
        thirdPartyBody.address_street = 'Adresse non spécifiée';
        thirdPartyBody.address_zip_code = '94110';
        thirdPartyBody.address_city = 'Arcueil';
        thirdPartyBody.address_country = 'France';
    }

    return thirdPartyBody;
}


/**
 * Crée un tiers (société/particulier) dans Axonaut en passant par l'API Route interne Vercel/Next.js.
 */
const createAxonautThirdParty = async (formData) => {
    const thirdPartyBody = generateAxonautThirdPartyBody(formData);
    
    // 🚩 MODIFICATION ICI : On utilise l'URL de la route Next.js spécifique pour la création de tiers
    const PROXY_URL = '/api/create-thirdparty';
    
    console.log("JSON TIERS PRÊT POUR AXONAUT (À ENVOYER VIA PROXY):", JSON.stringify(thirdPartyBody, null, 2));

    const fallbackId = formData.isPro ? 99999999 : 88888888;
    
    // Vérification de la configuration du proxy (mise à jour pour la nouvelle structure)
    if (PROXY_URL.includes('votre-domaine-proxy.com')) {
        console.warn(`⚠️ ALERTE PROXY: L'URL du proxy interne n'est pas configurée. Retour de l'ID de test: ${fallbackId}. Vérifiez la présence du fichier pages/api/create-thirdparty.js.`);
        return fallbackId;
    }

    try {
        const response = await fetch(PROXY_URL, { // ⬅️ Appel à l'API Route interne
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(thirdPartyBody),
        });

        const data = await response.json();
        
        // 1. Gérer les erreurs de transport ou du proxy (4xx/5xx)
        if (!response.ok) {
            console.error("Erreur Proxy/Axonaut. Statut HTTP:", response.status, data);
            
            // Si l'erreur contient un message d'Axonaut, on le remonte
            const errorMessage = data.details?.message || data.error || `Échec de la création du tiers. Statut: ${response.status}`;

            throw new Error(errorMessage);
        }

        // 2. Gérer les erreurs fonctionnelles d'Axonaut si le statut est 200/201 (rare, mais possible)
        if (!data.id) {
            console.error("ID Tiers manquant dans la réponse Axonaut:", data);
            // On vérifie si l'ID d'adresse est présent pour déduire que la création a réussi
            if (data.company_address_id) {
                // Si l'ID principal est manquant mais l'adresse est là, on lance une alerte mais on continue
                console.warn("L'ID principal de la société est manquant, mais l'adresse est présente. Tentative de continuer...");
            } else {
                 throw new Error(data.error || data.message || "Axonaut n'a pas retourné l'ID du tiers créé.");
            }
        }

        const companyId = data.id; 
        // 🚩 Récupération de l'ID d'adresse pour la création du devis
        const companyAddressId = data.company_address_id || null; 

        console.log(`✅ Tiers Axonaut créé avec succès via Proxy. ID: ${companyId}. Address ID: ${companyAddressId}`);
        // 🚩 Retourne l'ID de la compagnie ET l'ID d'adresse
        return { companyId, companyAddressId }; 

    } catch (error) {
        console.warn(`Erreur irrécupérable lors de la création du tiers. Retour de l'ID de test: ${fallbackId}. Détails: ${error.message}`);
        // Retourne un ID bidon en cas d'échec pour que le devis puisse continuer à être généré dans le log
        return { companyId: fallbackId, companyAddressId: 36619044 }; // Utilisation de l'ID d'adresse logué précédemment
    }
}


/**
 * Génère le corps JSON complet pour la création d'un devis Axonaut.
 * companyId est maintenant un paramètre.
 */
function generateAxonautQuotationBody(inputs, companyId, companyAddressId) {
    
    // --- CONSTANTES ENCAPSULÉES ---
    const TVA_RATE_DEC = 20.0;
    const themesMapping = AXONAUT_THEMES_MAPPING;
    
    // Valeurs fournies par l'utilisateur:
    const {
        nomBorne, prixMateriel, prixTemplate, prixLivraison, nombreMachine,
        supplementKilometrique, supplementLivraisonDifficile, supplementImpression,
        supplementAnimation, commercial, dateEvenement, 
        adresseLivraisonComplete, nombreJours, templateInclus, livraisonIncluse,
        acomptePct, nombreTirages, heuresAnimations, distanceKm
    } = inputs;
    // 🚩 Suppression de company_address_id des inputs car il vient du hook

    // --- FONCTIONS UTILITAIRES ENCAPSULÉES ---
    const formatDate = (dateValue) => {
        if (!dateValue) return "Date non définie";
        const date = new Date(dateValue);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const toRfc3339 = (date) => {
        const isoString = date.toISOString();
        const offset = date.getTimezoneOffset();
        const sign = offset <= 0 ? '+' : '-';
        const hours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
        const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
        const offsetString = `${sign}${hours}:${minutes}`;
        return isoString.replace(/\.\d{3}Z$/, offsetString);
    };
    // --- FIN DE L'ENCAPSULATION ---


    // --- 1. Préparation des Lignes de Produits (Logique de description et prix) ---
    const productsArray = [];

    // Construction de la ligne livraison selon livraisonIncluse
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

        /* ▸ TEXTE 2 — CineBooth 150 (livraison OU retrait) */
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


        /* ▸ TEXTE 3 — CineBooth 300 (livraison OU retrait) */
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

        /* ▸ TEXTE 4 — StarBooth Pro (livraison OU retrait) */
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


        /* ▸ TEXTE 5 — Signature (livraison obligatoire) */
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


        /* ▸ TEXTE 6 — Photobooth 360 (livraison + présence obligatoire) */
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

    // Ligne 1: Prestation principale avec description enrichie
    productsArray.push({
        "product_code": "P-BASE",
        "name": `Prestation ${nomBorne}`,
        "price": Math.round(100 * prixMateriel / (nombreMachine * nombreJours)) / 100,
        "tax_rate": TVA_RATE_DEC,
        "quantity": nombreMachine * nombreJours,
        "description": descriptionPrestation,
        "chapter": ""
    });

    // Ligne 2: Logistique & Livraison
    const totalSupplementLivraison = supplementKilometrique + supplementLivraisonDifficile;
    const prixLogistiqueTotal = (livraisonIncluse ? prixLivraison : 0) + totalSupplementLivraison;

    // On crée P-LOGISTICS si : livraison incluse OU s'il y a des suppléments
    if (livraisonIncluse || totalSupplementLivraison > 0) {
        let descHtml = "<ul>";

        // Livraison de base
        if (livraisonIncluse) {
            if (nomBorne === "Signature") {
                descHtml += "<li><p>Livraison, installation et reprise par un technicien certifié</p></li>";
            } else if (nomBorne === "Photobooth 360") {
                descHtml += "<li><p>Livraison, installation et reprise</p></li>";
            } else {
                descHtml += "<li><p>Livraison et reprise par nos soins</p></li>";
            }
        } else {
            // Si livraison exclue mais suppléments présents
            descHtml += "<li><p>Frais Logistique</p></li>"; 
        }

        // Supplément kilométrique
        if (supplementKilometrique > 0) {
            // Affichage arrondi du KM
            descHtml += `<li><p>Supplément kilométrique : ${Math.round(distanceKm)} km km depuis Paris centre</p></li>`;
        }

        // Livraison difficile
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

    // Ligne 3: Template (TOUJOURS présent, OFFERT si prix = 0)
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

    // Ligne 4: Supplément Impression (si applicable)
    if (supplementImpression > 0) {
        productsArray.push({
            "product_code": "P-PRINT-SUP",
            "name": `[Option] Supplément Impression Multiple`,
            // Attention: prixMateriel * nombreJours est la base de l'option impression dans le formulaire original
            "price": Math.round(100 * supplementImpression / (nombreMachine * nombreJours * (nombreTirages - 1))) / 100,
            "tax_rate": TVA_RATE_DEC,
            "quantity": nombreMachine * nombreJours * (nombreTirages - 1),
            "description": `Possibilité d'imprimer chaque photo en ${nombreTirages} exemplaires`,
            "chapter": ""
        });
    }

    // Ligne 5: Supplément Animation (si applicable)
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


    // --- 2. Conversion des Dates au format RFC3339 ---
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(now.getDate() + 14);

    const rfcDate = toRfc3339(now);
    const rfcExpiryDate = toRfc3339(expiryDate);
    
    // --- 3. Construction du Body JSON ---
    const quotationBody = {
        "company_id": companyId, // ⬅️ Utilisation du companyId dynamique
        "theme_id": themesMapping[acomptePct],
        "company_address_id": companyAddressId, // ⬅️ Utilisation du companyAddressId dynamique
        "business_manager": commercial,
        "online_payment": true,
        "date": rfcDate,
        "expiry_date": rfcExpiryDate,
        "products": productsArray
    };

    return quotationBody;
}


/**
 * Envoie le devis généré à l'API Axonaut (via un backend sécurisé).
 * 🚩 NOUVELLE FONCTION RÉELLE : appelle le proxy Next.js /api/create-quote
 */
const sendAxonautQuotation = async (quotationBody) => {
    // 🚩 URL de la nouvelle route Next.js
    const PROXY_URL = '/api/create-quote'; 

    const jsonString = JSON.stringify(quotationBody, null, 2); 
    console.log("JSON DEVIS FINAL PRÊT POUR AXONAUT (À ENVOYER VIA PROXY):\n", jsonString);

    try {
        const response = await fetch(PROXY_URL, { 
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(quotationBody),
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Erreur Proxy/Axonaut lors de la création du devis. Statut HTTP:", response.status, data);
            
            const errorMessage = data.details?.message || data.error || `Échec de la création du devis. Statut: ${response.status}`;

            throw new Error(errorMessage);
        }

        // On s'attend à recevoir l'objet devis créé (avec un ID de devis)
        if (!data.id) {
            console.error("ID Devis manquant dans la réponse Axonaut:", data);
            throw new Error(data.error || data.message || "Axonaut n'a pas retourné l'ID du devis créé.");
        }
        
        console.log(`✅ Devis Axonaut créé avec succès via Proxy. ID Devis: ${data.id}, NUMBER: ${data.number}`);
        // Retourne les données du devis (incluant l'ID)
        return data; 

    } catch (error) {
            throw new Error(`Erreur lors de l'envoi du devis: ${error.message}`);
    }
}


/**
 * Fonction d'envoi du webhook Zapier
 */
const sendWebhook = async (step, finalSubmit = false, dataToTrack, pricing, quoteId) => {
    const basePayload = {
        quote_id: quoteId,
        step_completed: step,
        status: finalSubmit ? 'Devis Confirmé (Final)' : `Étape ${step} Complétée`,
        timestamp: new Date().toISOString(),
        ...dataToTrack, 
    };

    // Conditionnellement ajouter les données de prix uniquement si c'est la soumission finale
    const finalPayload = finalSubmit ? {
        ...basePayload,
        total_ht: pricing.totalHT.toFixed(2),
        total_ttc: (pricing.totalHT * TVA_RATE).toFixed(2),
    } : basePayload;

    try {
        await fetch(ZAPIER_WEBHOOK_URL, { method: 'POST', body: JSON.stringify(finalPayload) });
    } catch (error) {
        console.error('Erreur réseau lors de l\'envoi du webhook à Zapier:', error);
    }
};

// ======================================================================
// LOGIQUE DE BASE DU HOOK useQuoteLogic (Export Principal)
// ======================================================================

export const useQuoteLogic = () => {
    const [quoteId] = useState(() => nanoid(10));
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', isPro: false, companyName: '', billingFullAddress: '',
        deliveryFullAddress: '', deliveryLat: null, deliveryLng: null, eventDate: '', eventDuration: 1, needType: 'pro',
        ecoModel: '', ecoTransport: 'pickup', proAnimationHours: 'none', proFondIA: false, proRGPD: false, proDelivery: true, proImpressions: 1, templateTool: false,
    });
    
    // --- CALCUL DE PRIX (calculatePrice) ---
    const calculatePrice = useMemo(() => {
        
        // Calcul de la distance
        const distanceKm = (formData.deliveryLat && formData.deliveryLng) 
            ? calculateHaversineDistance(PARIS_LAT, PARIS_LNG, formData.deliveryLat, formData.deliveryLng) 
            : 0;

        // Exemple simple de supplément kilométrique (1€ HT par km au-delà de 50km)
        const supplementKm = distanceKm > 50 ? Math.round(distanceKm - 50) : 0;
        
        // --- Déclarations/Initialisation des variables de prix ---
        const displayTTC = !formData.isPro;
        const priceTransformer = (priceHT) => (displayTTC ? (priceHT * TVA_RATE) : priceHT);
        const suffix = displayTTC ? '€ TTC' : '€ HT';

        let dailyServicesHT = 0; 
        let oneTimeCostsHT = 0;   
        let details = [];
        let totalServicesBeforeFormula = 0; 
        let totalServicesHT_Degressed = 0;
        let nomBorne = '';
        let baseDayPriceHT = 0; 
        let prixLivraisonHT = 0;
        let supplementImpressionHT = 0;
        let supplementAnimationHT = 0;
        let prixTemplateHT = 0;
        
        const duration = formData.eventDuration;
        const NbJours = duration;
        
        // --- LOGIQUE COMPLÈTE DE CALCUL DES PRIX ---
        
        // --- 1. Détermination et Collecte des coûts de base (Prix de la prestation par jour) ---
        if (formData.needType === 'eco') {
            
            if (formData.ecoModel) {
                // Utilisation de la nouvelle constante ECO_MODELS_PRICING
                const model = ECO_MODELS_PRICING[formData.ecoModel];
                nomBorne = model.name;
                baseDayPriceHT += model.priceHT;
                dailyServicesHT += model.priceHT;
                
                // Transport ECO et Mise en service (Coûts uniques)
                const baseDeliveryPriceHT = formData.ecoModel === 'illimite' ? DELIVERY_BASE_ILLIMITE_HT : DELIVERY_BASE_ECO_HT;
                const setupPriceHT = SETUP_PRICE_HT; // 20€ HT

                if (formData.ecoTransport === 'delivery_nosetup') {
                    prixLivraisonHT = baseDeliveryPriceHT;
                    oneTimeCostsHT += prixLivraisonHT;
                } else if (formData.ecoTransport === 'delivery_withsetup') {
                    prixLivraisonHT = baseDeliveryPriceHT + setupPriceHT;
                    oneTimeCostsHT += prixLivraisonHT;
                }
                
                details.push({
                    label: model.name,
                    priceHT: model.priceHT,
                    daily: true, 
                    displayPrice: `${priceTransformer(model.priceHT).toFixed(0)}${suffix}`
                });
                
                if (prixLivraisonHT > 0) {
                     details.push({
                        label: formData.ecoTransport === 'delivery_withsetup' ? 'Livraison + Mise en service' : 'Livraison Standard',
                        priceHT: prixLivraisonHT,
                        daily: false,
                        displayPrice: `${priceTransformer(prixLivraisonHT).toFixed(0)}${suffix}`
                    });
                } else if (formData.ecoTransport === 'pickup') {
                    details.push({ label: 'Retrait (Arcueil)', priceHT: 0, daily: false, displayPrice: 'Gratuit' });
                }
            }

        } else if (formData.needType === 'pro') {
            nomBorne = 'Signature';
            // Utilisation des constantes PRO
            baseDayPriceHT += BASE_PRICE_PRO_HT;
            dailyServicesHT += BASE_PRICE_PRO_HT;

            details.push({
                label: 'Signature (base journalière)',
                priceHT: BASE_PRICE_PRO_HT,
                daily: true,
                displayPrice: `${priceTransformer(BASE_PRICE_PRO_HT).toFixed(0)}${suffix}`
            });

            // Détermination du prix de la livraison/installation PRO (Coût unique)
            const proDeliveryBasePriceHT = PRO_DELIVERY_BASE_HT; // 110€
            const animationHours = parseInt(formData.proAnimationHours);
            const isShortAnimation = animationHours > 0 && animationHours <= 3;
            prixLivraisonHT = isShortAnimation ? proDeliveryBasePriceHT / 2 : proDeliveryBasePriceHT;
            oneTimeCostsHT += prixLivraisonHT;

            details.push({
                label: 'Logistique/Installation par Technicien Certifié',
                priceHT: prixLivraisonHT,
                daily: false,
                displayPrice: `${priceTransformer(prixLivraisonHT).toFixed(0)}${suffix}`
            });


            // Options PRO (par jour) - Ajoutées aux services récurrents
            if (formData.proAnimationHours !== 'none') {
                supplementAnimationHT = animationHours * PRO_ANIMATION_HOUR_PRICE_HT; // 45€/heure
                dailyServicesHT += supplementAnimationHT;

                const animationDescription = isShortAnimation
                ? `Animation ${animationHours}h (Réalisée par le Technicien)`
                : `Animation ${animationHours}h (Animatrice dédiée)`;

                details.push({
                    label: animationDescription,
                    priceHT: supplementAnimationHT,
                    daily: true,
                    displayPrice: `+${priceTransformer(supplementAnimationHT).toFixed(0)}${suffix}`
                });
            }

            // Impressions (Formule de dégressivité spécifique - Coût unique)
            if (formData.proImpressions > 1) {
                const NbPrint = formData.proImpressions;
                const NbJoursTotalOption = NbJours * (NbPrint - 1);

                const PrixBaseImpression = PRO_IMPRESSION_BASE_HT; // 80€
                const PrixPlancherImpression = PRO_IMPRESSION_PLANCHER_HT; // 50€

                supplementImpressionHT = Math.trunc(
                    (PrixBaseImpression - PrixPlancherImpression) * 10 * (1 - Math.pow(0.9, NbJoursTotalOption)) +
                    PrixPlancherImpression * NbJoursTotalOption
                );

                oneTimeCostsHT += supplementImpressionHT;

                details.push({
                    label: `${NbPrint} impressions par cliché (Total ${NbJours}j)`,
                    priceHT: supplementImpressionHT,
                    daily: false,
                    displayPrice: `+${priceTransformer(supplementImpressionHT).toFixed(0)}${suffix}`,
                });
            }
            // Fond IA / RGPD (Coût journalier)
            if (formData.proFondIA) {
                const fondIAPriceHT = PRO_OPTION_FONDIA_HT; // 50€
                dailyServicesHT += fondIAPriceHT;
                details.push({ label: 'Fond IA (personnalisé)', priceHT: fondIAPriceHT, daily: true, displayPrice: `+${priceTransformer(fondIAPriceHT).toFixed(0)}${suffix}` });
            }

            if (formData.proRGPD) {
                const rgpdPriceHT = PRO_OPTION_RGPD_HT; // 50€
                dailyServicesHT += rgpdPriceHT;
                details.push({ label: 'Conformité RGPD', priceHT: rgpdPriceHT, daily: true, displayPrice: `+${priceTransformer(rgpdPriceHT).toFixed(0)}${suffix}` });
            }


        } else if (formData.needType === '360') {
            nomBorne = 'Photobooth 360';
            const basePriceHT = P360_BASE_PRICE_HT; // 715€
            const deliveryPriceHT = P360_DELIVERY_PRICE_HT; // 150€
            
            baseDayPriceHT = basePriceHT;
            prixLivraisonHT = deliveryPriceHT; 
            // NOTE: Le modèle 360 intègre la livraison dans la dégressivité journalière
            dailyServicesHT += basePriceHT + deliveryPriceHT;

            details.push({ label: 'Photobooth 360 (base journalière)', priceHT: basePriceHT, daily: true, displayPrice: `${priceTransformer(basePriceHT).toFixed(0)}${suffix}` });
            details.push({ label: 'Livraison 360 (incluse)', priceHT: deliveryPriceHT, daily: true, displayPrice: `+${priceTransformer(deliveryPriceHT).toFixed(0)}${suffix}` });
        }
        
        // --- Supplément Kilométrique ---
        if (supplementKm > 0) {
            oneTimeCostsHT += supplementKm;
            details.push({ 
                label: `Supplément Kilométrique (${Math.round(distanceKm)} km)`, 
                priceHT: supplementKm, 
                daily: false, 
                displayPrice: `+${priceTransformer(supplementKm).toFixed(0)}${suffix}` 
            });
        }
        
        // --- 2. Application de l'Outil Template (Coût unique, seulement ECO & PRO) ---
        if (formData.templateTool && (formData.needType === 'eco' || formData.needType === 'pro')) {
            // Utilisation de la constante TEMPLATE_TOOL_PRO_PRICE_HT
            prixTemplateHT = formData.isPro ? TEMPLATE_TOOL_PRO_PRICE_HT : 0; // 60€ HT pour les Pros, Gratuit pour les Parts
            oneTimeCostsHT += prixTemplateHT;
            let templateDisplay = formData.isPro ? `${priceTransformer(prixTemplateHT).toFixed(0)}${suffix}` : 'Gratuit (Offert)';
            details.push({ label: 'Outil Template Professionnel', priceHT: prixTemplateHT, daily: false, displayPrice: templateDisplay });
        }


        // --- 3. Calcul du coût total de la prestation récurrente après dégressivité ---
        totalServicesBeforeFormula = dailyServicesHT * duration;

        if (formData.needType === 'pro') {
            const PBaseJour_Only = BASE_PRICE_PRO_HT;
            const PPlancherJour_Only = PLANCHER_PRICE_PRO_HT_USER_FIX;

            const baseDegressivePart = (PBaseJour_Only - PPlancherJour_Only) * 10 * (1 - Math.pow(0.9, duration));
            const basePlancherPart = PPlancherJour_Only * duration;
            const totalBaseDegressive = baseDegressivePart + basePlancherPart;

            const totalBaseDegressedHT = Math.trunc(totalBaseDegressive);

            const dailyOptionsHT = dailyServicesHT - BASE_PRICE_PRO_HT;
            const totalDailyOptionsHT = dailyOptionsHT * duration;

            totalServicesHT_Degressed = totalBaseDegressedHT + totalDailyOptionsHT;

        } else if (formData.needType === 'eco' || formData.needType === '360') {
            if (duration <= 1 || dailyServicesHT === 0) {
                totalServicesHT_Degressed = dailyServicesHT;
            } else {
                
                // ⬅️ NOUVELLE LOGIQUE DÉGRESSIVITÉ ECO / 360: Utilise le prix plancher fixe
                const is360 = formData.needType === '360';
                const modelKey = is360 ? '360' : formData.ecoModel;
                
                let PBaseJour_Only = dailyServicesHT; // Services quotidiens totaux
                let PPlancherJour_Only = 0;

                if (is360) {
                    // Pour le 360, on utilise le prix total journalier (base + livraison) et le plancher fixe
                    PBaseJour_Only = P360_BASE_PRICE_HT + P360_DELIVERY_PRICE_HT; 
                    PPlancherJour_Only = P360_FLOOR_PRICE_HT; // Utilisation du prix plancher fixe
                } else if (modelKey) {
                    // Pour ECO, on utilise le prix de la machine uniquement
                    PBaseJour_Only = ECO_MODELS_PRICING[modelKey].priceHT; 
                    PPlancherJour_Only = ECO_MODELS_PRICING[modelKey].floorPriceHT;
                }
                
                const baseDegressivePart = (PBaseJour_Only - PPlancherJour_Only) * 10 * (1 - Math.pow(0.9, NbJours));
                const basePlancherPart = PPlancherJour_Only * NbJours;
                const totalBaseDegressive = baseDegressivePart + basePlancherPart;
                totalServicesHT_Degressed = Math.round(totalBaseDegressive*100)/100;
            }
        }
        
        // Total HT final
        const totalHT = totalServicesHT_Degressed + oneTimeCostsHT;
        
        // Données structurées pour l'envoi Axonaut
        const axonautData = {
            nomBorne, prixMateriel: totalServicesHT_Degressed, prixTemplate: prixTemplateHT, prixLivraison: prixLivraisonHT, 
            nombreMachine: 1, supplementKilometrique: supplementKm, supplementLivraisonDifficile: 0, 
            supplementImpression: supplementImpressionHT, supplementAnimation: supplementAnimationHT, 
            nombreTirages: formData.proImpressions, heuresAnimations: parseInt(formData.proAnimationHours) || 0, distanceKm: Math.round(distanceKm), 
        };

        return {
            totalHT, totalServicesHT: totalServicesHT_Degressed, oneTimeCostsHT, baseDayPriceHT,
            totalServicesBeforeFormula, details, displayTTC, priceSuffix: displayTTC ? 'TTC' : 'HT',
            axonautData, quoteId,
        };
    }, [formData]);


    const isStepValid = () => { 
        switch (currentStep) {
            case 1:
                if (!formData.fullName || !formData.email || !formData.phone || formData.phone.replace(/\D/g, '').length < 9)
                    return false;
                if (formData.isPro && (!formData.companyName || !formData.billingFullAddress))
                    return false;
                return true;
            case 2:
                return (
                    formData.deliveryFullAddress && formData.eventDate &&
                    formData.needType && formData.eventDuration >= 1 &&
                    formData.deliveryLat !== null // Vérification du géocodage
                );
            case 3:
                if (formData.needType === 'eco') {
                    return formData.ecoModel && formData.ecoTransport;
                }
                return true;
            default:
                return true;
        }
    };
    
    // --- GESTION DES ACTIONS ---
    const handleNext = () => {
        if (isStepValid() && currentStep < 4) {
            
            let dataToTrack;
            
            // Logique de filtrage pour n'envoyer que les champs remplis ou pertinents à l'étape
            if (currentStep === 1) {
                // Étape 1: Contact. Omet TOUS les champs des étapes futures (2, 3).
                const { 
                    deliveryFullAddress, deliveryLat, deliveryLng, eventDate, eventDuration, 
                    needType,
                    ecoModel, ecoTransport, proAnimationHours, proFondIA, proRGPD, 
                    proDelivery, proImpressions, templateTool, 
                    ...step1Data 
                } = formData;
                dataToTrack = step1Data;
            } else if (currentStep === 2) {
                // Étape 2: Événement. Omet uniquement les options de configuration de l'Étape 3.
                const { 
                    ecoModel, ecoTransport, proAnimationHours, proFondIA, proRGPD, 
                    proDelivery, proImpressions, templateTool, 
                    ...step2Data 
                } = formData;
                dataToTrack = step2Data;
            } else {
                // Étape 3: Configuration et au-delà. On envoie le formulaire complet.
                dataToTrack = formData;
            }


            sendWebhook(currentStep, false, dataToTrack, calculatePrice, quoteId);
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const handleSubmit = async (showMessage) => {
        const pricing = calculatePrice;

        try {
            // ⬅️ ÉTAPE 1: CRÉATION DU TIERS (Company/Particulier) via Proxy ou Fallback
            // 🚩 MODIFICATION ICI : newCompanyData contient { companyId, companyAddressId }
            const { companyId, companyAddressId } = await createAxonautThirdParty(formData);
            
            // ⬅️ ÉTAPE 2: PRÉPARATION DU PAYLOAD DE DEVIS
            const inputsForAxonaut = {
                ...pricing.axonautData, 
                ...AXONAUT_FIXED_DEFAULTS, 
                dateEvenement: formData.eventDate,
                adresseLivraisonComplete: formData.deliveryFullAddress,
                nombreJours: formData.eventDuration,
                templateInclus: formData.templateTool,
                livraisonIncluse: formData.ecoTransport !== 'pickup',
                // 🚩 SUPPRESSION de company_address_id ici car il est passé directement à generateAxonautQuotationBody
            };

            // ⬅️ ÉTAPE 3: GÉNÉRATION DU CORPS DU DEVIS AVEC LES NOUVEAUX IDs
            // 🚩 MODIFICATION ICI : Ajout de companyAddressId en paramètre
            const axonautBody = generateAxonautQuotationBody(inputsForAxonaut, companyId, companyAddressId);
            
            // ⬅️ ÉTAPE 4: ENVOI DU DEVIS (via le proxy réel)
            // 🚩 MODIFICATION ICI : On stocke la réponse du devis créé
            const quoteResponse = await sendAxonautQuotation(axonautBody); 

            // 🚩 On utilise l'ID du devis créé dans le webhook si disponible
            const finalQuoteId = quoteResponse.id || quoteId; 

            const finalPrice = pricing.displayTTC ? (pricing.totalHT * TVA_RATE).toFixed(2) : pricing.totalHT.toFixed(2);
            
            sendWebhook(currentStep, true, formData, pricing, finalQuoteId);

            showMessage(`Devis envoyé à ${formData.email}!\nTotal: ${finalPrice}€ ${pricing.priceSuffix}. (Axonaut ID: ${quoteResponse.id})`);
            
        } catch (error) {
            showMessage(`Erreur lors de la confirmation du devis: ${error.message}`);
        }
    };

    return {
        formData,
        setFormData,
        currentStep,
        setCurrentStep,
        calculatePrice,
        isStepValid,
        handleSubmit,
        handleNext,
        handlePrev,
        totalSteps: 4,
    };
};