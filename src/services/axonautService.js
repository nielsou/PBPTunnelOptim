// src/services/axonautService.js

import {
    AXONAUT_THEMES_MAPPING,
    AXONAUT_FIXED_DEFAULTS,
    N8N_PROXY_URL,
    PRICING_STRATEGY
} from '../constants';

import { locales } from '../locales';



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

export function generateAxonautThirdPartyBody(formData, lang = 'fr') {
    const isPro = formData.isPro;
    const fullAddressString = formData.billingFullAddress || formData.deliveryFullAddress;
    const streetOnly = formData.billingStreet || formData.deliveryStreet;
    const zipCode = formData.billingZipCode || formData.deliveryZipCode;
    const city = formData.billingCity || formData.deliveryCity;

    const [firstName, ...lastNameParts] = formData.fullName.split(' ').filter(Boolean);
    const lastName = lastNameParts.join(' ') || firstName || '';

    let thirdPartyBody = {
        name: isPro ? formData.companyName : formData.fullName,
        address_street: streetOnly || 'Adresse non spécifiée',
        address_zip_code: zipCode || '',
        address_city: city || '',
        address_country: '',
        is_prospect: true,
        is_customer: false,
        isB2C: !isPro,
        currency: "EUR",
        language: lang,
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

export const createAxonautThirdParty = async (formData, lang) => {
    const thirdPartyBody = generateAxonautThirdPartyBody(formData, lang);
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
 * Traducteur interne pour le service
 */
const t = (key, lang, vars = {}) => {
    let text = locales[key]?.[lang] || locales[key]?.['fr'] || key;
    Object.entries(vars).forEach(([k, v]) => text = text.replace(`{${k}}`, v));
    return text;
};

export function generateAxonautQuotationBody(inputs, companyId, lang = 'fr') {
    const TVA_RATE_DEC = 20.0;
    const {
        nomBorne, prixMateriel, prixTemplate, prixLivraison, nombreMachine,
        supplementKilometrique, supplementLivraisonDifficile, supplementImpression,
        supplementAnimation, commercial, dateEvenement,
        adresseLivraisonComplete, nombreJours, templateInclus, livraisonIncluse,
        acomptePct, nombreTirages, heuresAnimations, distanceKm, optionFondIA, optionRGPD, optionSpeaker,
        company_address_id
    } = inputs;

    const formatDate = (dateValue) => {
        if (!dateValue) return "---";
        const date = new Date(dateValue);
        return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US');
    };

    const productsArray = [];
    const unitDay = t(nombreJours > 1 ? 'axonaut.label.days' : 'axonaut.label.day', lang);

    // --- 1. PRESTATION DE BASE ---
    let items = [];

    // Définition des noms stricts pour la comparaison
    const nameNum = PRICING_STRATEGY['numerique'].name;
    const name150 = PRICING_STRATEGY['150'].name;
    const name300 = PRICING_STRATEGY['300'].name;
    const namePro = PRICING_STRATEGY['illimite'].name;
    const nameSig = PRICING_STRATEGY['Signature'].name;
    const name360 = PRICING_STRATEGY['360'].name;

    // Logique CineBooth (Numérique, 150, 300)
    if (nomBorne === nameNum || nomBorne === name150 || nomBorne === name300) {
        items.push(
            t('axonaut.desc.cine_base', lang)
        );

        if (nomBorne === nameNum) {
            items.push(
                t('axonaut.desc.num_only', lang)
            );
        } else if (nomBorne === name150) {
            items.push(
                t('axonaut.desc.prints_150', lang),
                t('axonaut.desc.prints_1copy', lang)
            );
        } else if (nomBorne === name300) {
            items.push(
                t('axonaut.desc.prints_300', lang),
                t('axonaut.desc.prints_1copy', lang)
            );
        }

        items.push(
            t('axonaut.desc.mail_5g', lang),
            t('axonaut.desc.download', lang),
            t('axonaut.desc.support', lang)
        );
        if (!livraisonIncluse) items.push(t('axonaut.log.pickup', lang));
    }
    // Logique StarBooth Pro
    else if (nomBorne === namePro) {
        items.push(
            t('axonaut.desc.star_base', lang),
            t('axonaut.desc.unlimited', lang),
            t('axonaut.desc.sig_multi', lang, { n: nombreTirages }),
            t('axonaut.desc.mail_5g', lang),
            t('axonaut.desc.download', lang),
            t('axonaut.desc.support', lang)
        );
        if (!livraisonIncluse) items.push(t('axonaut.log.pickup', lang));
    }
    // Logique Signature
    else if (nomBorne === nameSig) {
        items.push(
            t('axonaut.desc.sig_base', lang),
            t('axonaut.desc.unlimited', lang),
            t('axonaut.desc.sig_multi', lang, { n: nombreTirages }),
            t('axonaut.desc.mail_5g', lang),
            t('axonaut.desc.download', lang),
            t('axonaut.desc.support', lang)
        );
    }
    // Logique Photobooth 360
    else if (nomBorne === name360) {
        items.push(
            t('axonaut.desc.360_base', lang),
            t('axonaut.desc.360_details', lang),
            t('axonaut.desc.mail_5g', lang),
            t('axonaut.desc.download', lang),
            t('axonaut.desc.360_opt', lang),
            t('axonaut.desc.360_anim', lang)
        );
    }

    const descriptionPrestation = `
        <ul>${items.map(i => `<li><p>${i}</p></li>`).join('')}</ul>
        <p>
            <strong>${t('axonaut.label.date', lang)}</strong> : ${formatDate(dateEvenement)}<br />
            <strong>${t('axonaut.label.duration', lang)}</strong> : ${nombreJours} ${unitDay}<br />
            <strong>${t('axonaut.label.location', lang)}</strong> : ${adresseLivraisonComplete}
        </p>`;

    productsArray.push({
        "product_code": "P-BASE",
        "name": `${lang === 'fr' ? 'Prestation' : 'Service'} ${nomBorne}`,
        "price": Math.round(100 * prixMateriel / (nombreMachine * nombreJours)) / 100,
        "tax_rate": TVA_RATE_DEC,
        "quantity": nombreMachine * nombreJours,
        "description": descriptionPrestation
    });

    // --- 2. LOGISTIQUE ---
    const totalSupplementLivraison = supplementKilometrique + supplementLivraisonDifficile;
    const prixLogistiqueTotal = (livraisonIncluse ? prixLivraison : 0) + totalSupplementLivraison;

    if (livraisonIncluse || totalSupplementLivraison > 0) {
        let descLog = "<ul>";
        if (livraisonIncluse) {
            if (nomBorne === PRICING_STRATEGY['Signature'].name) descLog += `<li><p>${t('axonaut.log.sig_setup', lang)}</p></li>`;
            else if (nomBorne === name360) descLog += `<li><p>${t('axonaut.log.360_setup', lang)}</p></li>`;
            else descLog += `<li><p>${t('axonaut.log.std_setup', lang)}</p></li>`;
        }
        if (supplementKilometrique > 0) descLog += `<li><p>${t('axonaut.log.km', lang, { km: Math.round(distanceKm) })}</p></li>`;
        if (supplementLivraisonDifficile > 0) descLog += `<li><p>${t('axonaut.log.hard', lang)}</p></li>`;
        descLog += "</ul>";

        productsArray.push({
            "product_code": "P-LOGISTICS",
            "name": t('axonaut.log.title', lang),
            "price": Math.round(100 * prixLogistiqueTotal) / 100,
            "tax_rate": TVA_RATE_DEC,
            "quantity": 1,
            "description": descLog
        });
    }

    // --- 3. OPTIONS (TEMPLATE, IMPRESSION, ANIM, IA, RGPD, SPEAKER) ---
    if (templateInclus && nomBorne !== name360) {
        const tName = prixTemplate > 0 ? t('axonaut.opt.template', lang) : `${t('axonaut.opt.template', lang)} ${t('axonaut.opt.template_free', lang)}`;
        const tDesc = `<ul><li><p>${t('axonaut.opt.template_desc1', lang)}</p></li><li><p>${t('axonaut.opt.template_desc2', lang)}</p></li><li><p>${t('axonaut.opt.template_desc3', lang)}</p></li></ul><p><em>${t('axonaut.opt.template_warn', lang)}</em></p>`;
        productsArray.push({ "product_code": "P-TEMPLATE", "name": tName, "price": Math.round(100 * prixTemplate) / 100, "tax_rate": TVA_RATE_DEC, "quantity": 1, "description": tDesc });
    }

    if (supplementImpression > 0) {
        productsArray.push({ "product_code": "P-PRINT-SUP", "name": t('axonaut.opt.print_sup', lang), "price": Math.round(100 * supplementImpression / (nombreMachine * nombreJours * (nombreTirages - 1))) / 100, "tax_rate": TVA_RATE_DEC, "quantity": nombreMachine * nombreJours * (nombreTirages - 1), "description": t('axonaut.desc.sig_multi', lang, { n: nombreTirages }) });
    }

    if (supplementAnimation > 0) {
        productsArray.push({ "product_code": "P-ANIMATION", "name": t('axonaut.opt.anim', lang, { h: heuresAnimations }), "price": Math.round(100 * supplementAnimation) / 100, "tax_rate": TVA_RATE_DEC, "quantity": 1, "description": "" });
    }

    if (optionFondIA > 0) {
        productsArray.push({ "product_code": "P-IA", "name": t('axonaut.opt.ia', lang), "price": Math.round(100 * optionFondIA) / 100, "tax_rate": TVA_RATE_DEC, "quantity": 1, "description": `<ul><li><p>${t('axonaut.opt.ia_desc', lang)}</p></li></ul>` });
    }

    if (optionRGPD > 0) {
        productsArray.push({ "product_code": "P-RGPD", "name": t('axonaut.opt.rgpd', lang), "price": Math.round(100 * optionRGPD) / 100, "tax_rate": TVA_RATE_DEC, "quantity": 1, "description": `<ul><li><p>${t('axonaut.opt.rgpd_desc', lang)}</p></li></ul>` });
    }

    if (optionSpeaker > 0) {
        productsArray.push({ "product_code": "P-SPEAKER", "name": t('axonaut.opt.speaker', lang), "price": Math.round(100 * optionSpeaker) / 100, "tax_rate": TVA_RATE_DEC, "quantity": 1, "description": "" });
    }

    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(now.getDate() + 14);

    return {
        "company_id": companyId,
        "company_address_id": company_address_id,
        "theme_id": AXONAUT_THEMES_MAPPING[acomptePct],
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

export const createAxonautEvent = async (quotationId, companyId, customerEmail, formFillerEmail, publicLink, lang = 'fr') => {
    const PROXY_EVENT_URL = '/api/create-event';

    const emailContent = `${t('axonaut.email.greeting', lang)}\n\n${t('axonaut.email.body', lang)}\n${publicLink}\n\n${t('axonaut.email.footer', lang)}`;

    const eventBody = {
        company_id: companyId,
        employee_email: formFillerEmail,
        date: toRfc3339(new Date()),
        nature: 2,
        title: t('axonaut.email.subject', lang),
        content: emailContent,
        is_done: false,
        attachments: { quotations_ids: [quotationId] },
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

export const send_n8n_Webhook = async (payload) => {
    console.log("SERVICE: Envoi Webhook via Proxy...", payload);
    try {
        await fetch(N8N_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        console.log("✅ Webhook envoyé au proxy");
    } catch (error) {
        console.error('Erreur Proxy n8n', error);
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
        contact_name: addressData.contactName || "",
        address_street: addressData.street || "",
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
    const lastName = lastNameParts.join(' ') || '';

    const payload = {
        company_id: parseInt(companyId),
        firstname: firstName,
        lastname: lastName,
        email: formData.email,
        cellphone_number: formData.phone,
        // job: "Contact Photobooth (Mis à jour)"
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
                // job: "Contact Photobooth"
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