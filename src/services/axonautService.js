// src/services/axonautService.js

import {
    AXONAUT_THEMES_MAPPING,
    AXONAUT_FIXED_DEFAULTS,
    ZAPIER_WEBHOOK_URL,
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

export function generateAxonautThirdPartyBody(formData) {
    const isPro = formData.isPro;
    const fullAddressString = isPro ? (formData.billingFullAddress || formData.deliveryFullAddress) : formData.deliveryFullAddress;

    let zipCode = '';
    let city = '';
    let streetOnly = fullAddressString;

    if (fullAddressString) {
        const addressMatch = fullAddressString.match(/\b(\d{5})\s+([^,]+)/);
        if (addressMatch) {
            zipCode = addressMatch[1];
            city = addressMatch[2].trim();
            const partBeforeZip = fullAddressString.substring(0, addressMatch.index).trim();
            streetOnly = partBeforeZip.replace(/,\s*$/, '');
        }
    }

    const [firstName, ...lastNameParts] = formData.fullName.split(' ').filter(Boolean);
    const lastName = lastNameParts.join(' ') || firstName || '';

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
    };

    if (isPro) {
        thirdPartyBody.address_contact_name = formData.fullName;
    } else {
        thirdPartyBody.employees = [
            {
                firstname: firstName,
                lastname: lastName,
                email: formData.email,
                cellphoneNumber: formData.phone,
                is_billing_contact: true
            }
        ];
    }

    return thirdPartyBody;
}

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

export function generateAxonautQuotationBody(inputs, companyId) {
    const TVA_RATE_DEC = 20.0;
    const themesMapping = AXONAUT_THEMES_MAPPING;

    const {
        nomBorne, prixMateriel, prixTemplate, prixLivraison, nombreMachine,
        supplementKilometrique, supplementLivraisonDifficile, supplementImpression,
        supplementAnimation, commercial, dateEvenement,
        adresseLivraisonComplete, nombreJours, templateInclus, livraisonIncluse,
        acomptePct, nombreTirages, heuresAnimations, distanceKm, optionFondIA, optionRGPD, optionSpeaker
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
    const ligneLivraison = livraisonIncluse ? "" : "<li><p>À venir récupérer au 2 rue Victor Carmignac, 94110 Arcueil</p></li>";
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
                descHtml += "<li><p>Livraison, installation et reprise par nos livreurs partenaires</p></li>";
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

    // 6. OPTION FOND IA
    if (optionFondIA > 0) {
        productsArray.push({
            "product_code": "P-IA",
            "name": "[Option] Fond IA Personnalisé",
            "price": Math.round(100 * optionFondIA) / 100,
            "tax_rate": TVA_RATE_DEC,
            "quantity": 1,
            "description": "<ul><li><p>Création de fonds sur mesure générés par Intelligence Artificielle</p></li><li><p>Intégration au logiciel de la borne</p></li></ul>",
            "chapter": ""
        });
    }

    // 7. OPTION RGPD
    if (optionRGPD > 0) {
        productsArray.push({
            "product_code": "P-RGPD",
            "name": "[Option] Pack Conformité & Collecte Data",
            "price": Math.round(100 * optionRGPD) / 100,
            "tax_rate": TVA_RATE_DEC,
            "quantity": 1,
            "description": "<ul><li><p>Mise en place de l'écran de consentement (Opt-in)</p></li><li><p>Récupération sécurisée et export des emails/données des utilisateurs</p></li></ul>",
            "chapter": ""
        });
    }

    // 8. OPTION ENCEINTE (NOUVEAU)
    if (optionSpeaker > 0) {
        productsArray.push({
            "product_code": "P-SPEAKER",
            "name": "[Option] Enceinte Bluetooth & Musique",
            "price": Math.round(100 * optionSpeaker) / 100,
            "tax_rate": TVA_RATE_DEC,
            "quantity": 1,
            "description": "<ul><li><p>Mise à disposition d'une enceinte puissante (type JBL PartyBox)</p></li><li><p>Playlist musicale énergisante pour l'animation 360°</p></li></ul>",
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

export const createAxonautEvent = async (quotationId, companyId, customerEmail, formFillerEmail, publicLink) => {
    const PROXY_EVENT_URL = '/api/create-event';
    const now = new Date();

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

export const sendZapierWebhook = async (payload) => {
    console.log("SERVICE: Envoi Webhook Zapier...", payload);
    try {
        await fetch(ZAPIER_WEBHOOK_URL, { method: 'POST', body: JSON.stringify(payload) });
    } catch (error) {
        console.error('Erreur Zapier', error);
    }
};

export const getAxonautCompanyDetails = async (companyId) => {
    console.log(`SERVICE: Recherche Partenaire ID ${companyId}...`);

    try {
        const companyRes = await fetch(`/api/get-company?id=${companyId}`);
        const companyData = await companyRes.json();
        if (!companyRes.ok) throw new Error(companyData.error || "Société introuvable");

        const addressesRes = await fetch(`/api/get-addresses?companyId=${companyId}`);
        const addressesData = await addressesRes.json();
        const rawAddresses = addressesRes.ok && Array.isArray(addressesData) ? addressesData : [];

        console.log("🔍 DEBUG - ADRESSES BRUTES RECUES DE L'API :", JSON.stringify(rawAddresses, null, 2));

        const formatAddr = (street, zip, city) => {
            if (!street && !city) return "";
            return `${street || ''}, ${zip || ''} ${city || ''}`.trim().replace(/^, /, '').replace(/, $/, '');
        };

        const mainAddressFull = formatAddr(companyData.address_street, companyData.address_zip_code, companyData.address_city);
        let billingAddresses = [];
        let deliveryAddresses = [];

        /*
        if (mainAddressFull) {
            const mainAddressObj = {
                label: companyData.name || "Facturation", 
                address: mainAddressFull
            }; billingAddresses.push(mainAddressObj);
        }
            */

        rawAddresses.forEach(addr => {
            const formatted = formatAddr(addr.address_street, addr.address_zip_code, addr.address_city);
            if (!formatted) return;

            const addrObj = {
                id: addr.id,
                label: addr.name || (addr.is_for_delivery ? "Lieu" : "Adresse"),
                address: formatted,
                zip: addr.address_zip_code,
                city: addr.address_city
            };

            if (addr.is_for_delivery === true) {
                if (!deliveryAddresses.some(a => a.address === formatted)) {
                    deliveryAddresses.push(addrObj);
                }
            }

            if (addr.is_for_invoice === true || addr.is_for_quotation === true) {
                if (!billingAddresses.some(a => a.address === formatted)) {
                    billingAddresses.push(addrObj);
                }
            }
        });

        if (billingAddresses.length === 0) {
            billingAddresses.push({
                label: "Adresse de facturation",
                address: mainAddressFull || "Adresse non renseignée"
            });
        }
        if (deliveryAddresses.length === 0) {
            deliveryAddresses.push({
                label: "Adresse de livraison",
                address: mainAddressFull || "Adresse non renseignée"
            });
        }

        const contacts = companyData.employees?.map(emp => {
            const parts = [emp.firstname, emp.lastname].filter(p => p && p !== 'null' && p.trim() !== '');
            const cleanName = parts.length > 0 ? parts.join(' ') : 'Sans nom';

            let rawPhone = emp.cellphone_number || emp.phone_number || '';
            let cleanPhoneDigits = rawPhone.replace(/\D/g, '');

            return {
                fullName: cleanName,
                email: emp.email || '',
                phone: cleanPhoneDigits
            };
        }) || [];

        if (contacts.length === 0) contacts.push({ fullName: '', email: '', phone: '' });

        return {
            found: true,
            companyId: companyData.id,
            name: companyData.name,
            isB2C: companyData.isB2C,
            billingAddresses: billingAddresses,
            deliveryAddresses: deliveryAddresses,
            contacts: contacts,
            defaultBillingAddress: billingAddresses[0].address,
            defaultDeliveryAddress: deliveryAddresses[0].address
        };

    } catch (error) {
        console.error("SERVICE: Erreur récupération partenaire", error);
        throw error;
    }
};

export const createAxonautAddress = async (companyId, addressData, type = 'delivery') => {
    console.log(`SERVICE: Création adresse ${type} pour société ${companyId}...`);

    const payload = {
        company_id: parseInt(companyId),
        name: addressData.name || (type === 'delivery' ? "Lieu Événement" : "Facturation"),
        address_street: addressData.fullAddress,
        address_zip_code: addressData.zip || "",
        address_city: addressData.city || "",
        address_country: "France",
        is_for_invoice: type === 'billing',
        is_for_quotation: type === 'billing',
        is_for_delivery: type === 'delivery'
    };

    const res = await fetch('/api/create-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur création adresse");
    return data;
};

/**
 * 🆕 Met à jour un contact (Employé) existant.
 */
export const updateAxonautEmployee = async (employeeId, companyId, formData) => {
    console.log(`SERVICE: Mise à jour employé ${employeeId} pour société ${companyId}...`);

    const [firstName, ...lastNameParts] = formData.fullName.split(' ').filter(Boolean);
    const lastName = lastNameParts.join(' ') || (firstName || '');

    const payload = {
        company_id: parseInt(companyId),
        firstname: firstName,
        lastname: lastName,
        email: formData.email,
        cellphone_number: formData.phone, // Numéro envoyé tel quel, comme demandé
        job: "Contact Photobooth (Mis à jour)"
    };

    try {
        // IMPORTANT : Vérifie que ton backend proxy gère bien cette route avec l'ID en paramètre
        const res = await fetch(`/api/update-employee?id=${employeeId}`, {
            method: 'POST', // Souvent POST ou PATCH selon ton proxy
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur mise à jour contact");

        console.log(`✅ SERVICE: Employé mis à jour. ID: ${data.id}`);
        return data;

    } catch (error) {
        console.error("SERVICE: Erreur mise à jour employé", error);
        throw error;
    }
};

/**
 * 🆕 INTELLIGENCE : Crée OU Met à jour un contact (Employé)
 * Vérifie d'abord si l'email existe dans la société.
 */
export const createAxonautEmployee = async (companyId, formData) => {
    console.log(`SERVICE: Vérification existence employé pour société ${companyId}...`);

    try {
        // 1. On récupère la liste actuelle des employés de la société
        const companyRes = await fetch(`/api/get-company?id=${companyId}`);
        let existingEmployeeId = null;

        if (companyRes.ok) {
            const companyData = await companyRes.json();
            const employees = companyData.employees || [];

            // Recherche par email (insensible à la casse)
            const found = employees.find(e =>
                e.email && e.email.toLowerCase() === formData.email.toLowerCase()
            );

            if (found) {
                console.log(`🔍 Contact trouvé (Email: ${found.email}, ID: ${found.id}). On met à jour.`);
                existingEmployeeId = found.id;
            }
        }

        // 2. Décision : Update ou Create
        if (existingEmployeeId) {
            return await updateAxonautEmployee(existingEmployeeId, companyId, formData);
        } else {
            console.log("🔍 Contact inconnu. Création...");

            // Logique de création standard
            const [firstName, ...lastNameParts] = formData.fullName.split(' ').filter(Boolean);
            const lastName = lastNameParts.join(' ') || (firstName || '');

            const payload = {
                company_id: parseInt(companyId),
                firstname: firstName,
                lastname: lastName,
                email: formData.email,
                cellphone_number: formData.phone,
                job: "Contact Photobooth"
            };

            const res = await fetch('/api/create-employee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur création contact");

            console.log(`✅ SERVICE: Employé créé avec succès. ID: ${data.id}`);
            return data;
        }

    } catch (error) {
        console.error("SERVICE: Erreur process employé (Check/Create)", error);
        // Fallback : on tente quand même la création si le check échoue pour ne pas bloquer
    }
};