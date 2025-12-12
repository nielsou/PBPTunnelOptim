import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronRight, ChevronLeft, Check, User, Calendar, Settings, DollarSign, Wand2, Truck } from 'lucide-react';
import { nanoid } from 'nanoid';

// ======================================================================
// NOUVEAU BLOC : Fonctions utilitaires Haversine & Axonaut JSON
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
 * Génère le corps JSON complet pour la création d'un devis Axonaut.
 * @param {object} inputs L'objet contenant toutes les données nécessaires (form + prix).
 * @returns {object} Le corps de la requête JSON pour l'API Axonaut.
 */
function generateAxonautQuotationBody(inputs) {
    
    // --- CONSTANTES ENCAPSULÉES ---
    const TVA_RATE = 20.0;
    
    const themesMapping = {
        0: 310470,      // 0% d'acompte
        0.3: 242890,    // 30% d'acompte
        1: 310524       // 100% d'acompte
    };
    
    // Valeurs fournies par l'utilisateur:
    const {
        nomBorne, prixMateriel, prixTemplate, prixLivraison, nombreMachine,
        supplementKilometrique, supplementLivraisonDifficile, supplementImpression,
        supplementAnimation, commercial, dateEvenement, companyId,
        adresseLivraisonComplete, nombreJours, templateInclus, livraisonIncluse,
        company_address_id, acomptePct, nombreTirages, heuresAnimations, distanceKm
    } = inputs;

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
        case "CineBooth 150":
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
        case "CineBooth 300":
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
        case "StarBooth Pro":
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
        "tax_rate": TVA_RATE,
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
            descHtml += `<li><p>Supplément kilométrique : ${Math.round(distanceKm)} km depuis Paris centre</p></li>`;
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
            "tax_rate": TVA_RATE,
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
                "tax_rate": TVA_RATE,
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
            "price": Math.round(100 * supplementImpression / (nombreMachine * nombreJours * (nombreTirages - 1))) / 100,
            "tax_rate": TVA_RATE,
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
            "tax_rate": TVA_RATE,
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
    
    // Utiliser le thème 100% d'acompte (fixé à 1)
    const finalAcomptePct = acomptePct;

    // --- 3. Construction du Body JSON ---
    const quotationBody = {
        "company_id": companyId,
        "theme_id": themesMapping[finalAcomptePct],
        "company_address_id": company_address_id,
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
 * NOTE: Cette fonction doit appeler un backend sécurisé pour masquer la clé API.
 * @param {object} quotationBody Le JSON généré par generateAxonautQuotationBody.
 */
const sendAxonautQuotation = async (quotationBody) => {
    // Remplacer ceci par l'URL de votre endpoint sécurisé
    const AXONAUT_API_ENDPOINT = 'https://api.votre-backend.com/create-axonaut-quote'; 

    console.log("➡️ Tentative d'envoi à Axonaut via Backend/Proxy:", quotationBody);

    try {
        const response = await fetch(AXONAUT_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(quotationBody),
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Erreur de l'API Backend/Proxy Axonaut:", data);
            throw new Error(data.message || "Échec de la création du devis Axonaut.");
        }

        console.log("✅ Réponse Axonaut reçue:", data);
        return data; 

    } catch (error) {
        console.error("Erreur réseau/Backend lors de l'envoi du devis:", error);
        throw new Error(`Erreur lors de l'envoi du devis: ${error.message}`);
    }
}


// ======================================================================
// COMPOSANT AddressAutocomplete
// ======================================================================

const AddressAutocomplete = ({ label, onAddressSelect, defaultValue, required = false }) => {
  const inputRef = useRef(null);
  const autoCompleteRef = useRef(null); 

  useEffect(() => {
    let isMounted = true;

    const initAutocomplete = async () => {
      // S'assurer que la librairie est chargée
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        try {
          // Utilisation de la méthode importLibrary pour les API Google Maps
          await window.google.maps.importLibrary("places");
        } catch (e) {
          console.error("Google Maps API non chargée", e);
          return;
        }
      }

      if (!inputRef.current) return;

      autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "fr" },
        // Ajout de 'geometry' pour obtenir les coordonnées (lat/lng)
        fields: ["address_components", "formatted_address", "geometry"] 
      });

      // Écouter l'événement "place_changed"
      autoCompleteRef.current.addListener("place_changed", () => {
        if (!isMounted) return;

        const place = autoCompleteRef.current.getPlace();
        
        if (!place.formatted_address) {
            console.warn("Pas d'adresse formatée trouvée");
            return;
        }

        let city = '';
        let postal = '';

        if (place.address_components) {
          place.address_components.forEach(c => {
            if (c.types.includes('locality')) city = c.long_name;
            if (c.types.includes('postal_code')) postal = c.long_name;
          });
        }
        
        const lat = place.geometry ? place.geometry.location.lat() : null;
        const lng = place.geometry ? place.geometry.location.lng() : null;

        const result = {
          fullAddress: place.formatted_address,
          city: city,
          postal: postal,
          lat: lat, // NOUVEAU
          lng: lng  // NOUVEAU
        };
        
        if (onAddressSelect) {
            onAddressSelect(result);
        }
      });
    };

    initAutocomplete();

    return () => {
      isMounted = false;
      if (autoCompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(autoCompleteRef.current);
      }
    };
  }, [onAddressSelect]);

  return (
    <div className="mb-4">
      <label className='block text-sm font-semibold text-gray-800 mb-2'>
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
      
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultValue}
        placeholder="Entrez une adresse..."
        className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-150 ease-in-out text-gray-900 placeholder-gray-400"
        required={required}
      />
    </div>
  );
};

// ======================================================================
// AUTRES COMPOSANTS UTILITAIRES (INCHANGÉS)
// ======================================================================

// Constante pour les codes pays et masques de saisie
const COUNTRIES = [
  { name: "France", code: "+33", flag: "🇫🇷", mask: "XX XX XX XX XX", requiredDigits: 10 },
  { name: "États-Unis", code: "+1", flag: "🇺🇸", mask: "(XXX) XXX-XXXX", requiredDigits: 10 },
  { name: "Royaume-Uni", code: "+44", flag: "🇬🇧", mask: "XXXX XXXXXX", requiredDigits: 10 },
  { name: "Allemagne", code: "+49", flag: "🇩🇪", mask: "XXXX XXXX XXXX", requiredDigits: 12 },
  { name: "Canada", code: "+1", flag: "🇨🇦", mask: "(XXX) XXX-XXXX", requiredDigits: 10 },
  { name: "Espagne", code: "+34", flag: "🇪🇸", mask: "XXX XXX XXX", requiredDigits: 9 },
  { name: "Belgique", code: "+32", flag: "🇧🇪", mask: "X XXX XX XX", requiredDigits: 9 },
];

// Composant stable défini en dehors du corps principal pour éviter la perte de focus.
const InputField = ({ label, type = 'text', value, onChange, placeholder, required = false, isAddressField = false }) => (
  <div>
    {!isAddressField && (
      <label className='block text-sm font-semibold text-gray-800 mb-2'>
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      className='w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-150 ease-in-out text-gray-900 placeholder-gray-400'
      placeholder={placeholder}
      required={required}
    />
  </div>
);

// Fonction de base pour l'alerte (remplace window.alert)
const showMessage = (message) => {
  const alertElement = document.getElementById('custom-alert');
  if (alertElement) {
    alertElement.textContent = message;
    alertElement.style.display = 'block';
    setTimeout(() => {
      alertElement.style.display = 'none';
    }, 5000);
  } else {
    console.warn("Alerte UI non initialisée.");
  }
};

// Définition de la couleur d'accentuation personnalisée #BE2A55
const customColor = '#BE2A55';

/**
 * Composant de champ de saisie téléphonique avec sélection de pays, masquage et validation en temps réel.
 */
const PhoneInputField = ({ value, onChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [inputValue, setInputValue] = useState('');

  // ... (Logique complète de PhoneInputField inchangée, elle est reprise du code précédent) ...
  useEffect(() => {
    if (value && value.startsWith(selectedCountry.code)) {
      const rawDigits = value.substring(selectedCountry.code.length).replace(/\D/g, '');
      setInputValue(applyMask(rawDigits, selectedCountry.mask));
    } else if (!value) {
      setInputValue('');
    }
  }, [value, selectedCountry]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isDropdownOpen && !event.target.closest('#phone-input-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownOpen]);

  const applyMask = (digits, mask) => {
    let formatted = '';
    let digitIndex = 0;
    for (let i = 0; i < mask.length; i++) {
      if (digitIndex >= digits.length) break;
      const maskChar = mask[i];
      if (maskChar === 'X') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += maskChar;
      }
    }
    return formatted;
  };

  const isValid = (currentInputValue) => {
    const enteredDigits = (currentInputValue.match(/\d/g) || []).length;
    return enteredDigits === selectedCountry.requiredDigits;
  };

  const handleInputChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');

    const maskedValue = applyMask(rawValue, selectedCountry.mask);
    setInputValue(maskedValue);

    if (isValid(maskedValue)) {
      const fullNumber = selectedCountry.code + rawValue;
      onChange(fullNumber);
    } else {
      onChange(selectedCountry.code + rawValue);
    }
  };

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setInputValue('');
    onChange('');
  };

  const isCurrentValid = isValid(inputValue);
  let validationIcon = null;
  let validationClasses = 'border-gray-300 focus-within:ring-4 focus-within:ring-blue-200 focus-within:border-blue-500';
  let validationMessage = '';

  if (inputValue.length > 0) {
    if (isCurrentValid) {
      validationIcon = (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      );
      validationClasses = 'border-green-500 ring-4 ring-green-100';
    } else {
      validationIcon = (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      );
      validationClasses = 'border-red-500 ring-4 ring-red-100';
      const enteredDigits = (inputValue.match(/\d/g) || []).length;
      const remaining = selectedCountry.requiredDigits - enteredDigits;
      if (remaining > 0) {
        validationMessage = `Veuillez compléter le numéro (${remaining} chiffres restants)`;
      } else {
        validationMessage = `Numéro non valide pour ${selectedCountry.name}`;
      }
    }
  }


  return (
    <div className='relative'>
      <label className='block text-sm font-semibold text-gray-800 mb-2'>
        Téléphone Mobile <span className='text-red-500'>*</span>
      </label>

      <div id="phone-input-container" className={`flex rounded-xl shadow-sm overflow-hidden border ${validationClasses} transition-all duration-200`}
        style={{ transitionProperty: 'border-color, box-shadow, ring-color' }}>

        {/* Sélecteur de Code Pays */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="flex items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-150 border-r border-gray-300 focus:outline-none text-gray-700 rounded-l-xl"
            aria-expanded={isDropdownOpen}
          >
            <span className="text-xl mr-2">{selectedCountry.flag}</span>
            <span className="font-medium text-sm">{selectedCountry.code}</span>
            <svg className="w-4 h-4 ml-1 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          {/* Liste déroulante des pays */}
          {isDropdownOpen && (
            <div
              className="absolute z-50 top-full mt-1 left-0 w-64 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 max-h-60 overflow-y-auto"
            >
              {COUNTRIES.map(country => (
                <div
                  key={country.code}
                  onClick={() => handleSelectCountry(country)}
                  className={`flex items-center p-3 cursor-pointer hover:bg-indigo-50 transition-colors duration-100 ${country.code === selectedCountry.code ? 'bg-indigo-100 font-bold' : ''}`}
                >
                  <span className="text-xl mr-3">{country.flag}</span>
                  <span className="text-sm font-medium">{country.name} ({country.code})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Champ de saisie du numéro */}
        <input
          type="tel"
          value={inputValue}
          onChange={handleInputChange}
          className="block w-full px-4 py-3 border-0 focus:ring-0 text-gray-900 placeholder-gray-400 text-lg bg-white"
          placeholder={selectedCountry.mask.replace(/X/g, '0')}
          maxLength={selectedCountry.mask.length}
        />

        {/* Icône de validation */}
        <div className="w-10 flex items-center justify-center pr-3">
          {validationIcon}
        </div>
      </div>
      <p className='mt-2 text-sm h-5 text-red-500 font-medium'>
        {validationMessage}
      </p>
    </div>
  );
};


// 💡 AJOUT: URL du webhook Zapier
const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/22419571/ufzj95x/';

// ======================================================================
// COMPOSANT PRINCIPAL PhotoboothQuoteForm
// ======================================================================

export default function PhotoboothQuoteForm() {
    
    // Coordonnées du centre de Paris (Île Saint-Louis)
    const PARIS_LAT = 48.8517;
    const PARIS_LNG = 2.3570;

    const [quoteId] = useState(() => nanoid(10));
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Contact
        fullName: '',
        email: '',
        phone: '', // Stocke le numéro complet (+code pays)
        isPro: false,
        companyName: '',
        billingFullAddress: '',
        // Événement
        deliveryFullAddress: '',
        deliveryLat: null, // NOUVEAU: Latitude de livraison
        deliveryLng: null, // NOUVEAU: Longitude de livraison
        eventDate: '',
        eventDuration: 1,
        needType: 'pro',
        // Éco
        ecoModel: '', 
        ecoTransport: 'pickup',
        // Pro
        proAnimationHours: 'none',
        proFondIA: false,
        proRGPD: false,
        proDelivery: true, 
        proImpressions: 1, 
        // Options communes (ECO & PRO)
        templateTool: false,
    });

    const totalSteps = 4;
    const TVA_RATE = 1.20;
    const PRIX_PLANCHER_RATIO = 0.15;

    // Constantes de prix spécifiques au Signature (480€ HT)
    const BASE_PRICE_PRO_HT = 480;
    const PLANCHER_PRICE_PRO_HT_USER_FIX = 79; 

    const stepIcons = [User, Calendar, Settings, DollarSign];
    const stepTitles = ['Contact', 'Événement', 'Configuration', 'Devis'];

    // Fonction pour créer l'alerte simple au montage
    useEffect(() => {
        if (!document.getElementById('custom-alert')) {
            const div = document.createElement('div');
            div.id = 'custom-alert';
            div.className = 'fixed top-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-xl z-50 hidden transition-all duration-300';
            document.body.appendChild(div);
        }
    }, []);

    /**
     * Calcule le prix total (HT) et les détails de la ventilation.
     */
    const calculatePrice = useMemo(() => {

        // Calculer la distance ici (Haversine à vol d'oiseau)
        const distanceKm = (formData.deliveryLat && formData.deliveryLng) 
            ? calculateHaversineDistance(
                PARIS_LAT, 
                PARIS_LNG, 
                formData.deliveryLat, 
                formData.deliveryLng
              ) 
            : 0;

        // Exemple simple de supplément kilométrique (à ajuster si nécessaire)
        // Supposons 1€ HT par km au-delà de 50km
        const supplementKm = distanceKm > 50 ? Math.round(distanceKm - 50) : 0;
        
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
        
        // --- 1. Détermination et Collecte des coûts de base (Prix de la prestation par jour) ---
        if (formData.needType === 'eco') {
            const ecoModels = {
                numerique: { name: 'CineBooth Numérique', priceHT: 245 },
                150: { name: 'CineBooth 150 impressions', priceHT: 329 },
                300: { name: 'CineBooth 300 impressions', priceHT: 370 },
                illimite: { name: 'StarBooth Pro Illimité', priceHT: 412 },
            };

            if (formData.ecoModel) {
                const model = ecoModels[formData.ecoModel];
                nomBorne = model.name;
                baseDayPriceHT += model.priceHT;
                dailyServicesHT += model.priceHT;
                
                // Transport ECO et Mise en service (Coûts uniques)
                const baseDeliveryPriceHT = formData.ecoModel === 'illimite' ? 70 : 50;
                const setupPriceHT = 20;

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
            baseDayPriceHT += BASE_PRICE_PRO_HT;
            dailyServicesHT += BASE_PRICE_PRO_HT;

            details.push({
                label: 'Signature (base journalière)',
                priceHT: BASE_PRICE_PRO_HT,
                daily: true,
                displayPrice: `${priceTransformer(BASE_PRICE_PRO_HT).toFixed(0)}${suffix}`
            });

            // Détermination du prix de la livraison/installation PRO (Coût unique)
            const proDeliveryBasePriceHT = 110;
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
                supplementAnimationHT = animationHours * 45;
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

                const PrixBaseImpression = 80;
                const PrixPlancherImpression = 50;

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
                const fondIAPriceHT = 50;
                dailyServicesHT += fondIAPriceHT;
                details.push({ label: 'Fond IA (personnalisé)', priceHT: fondIAPriceHT, daily: true, displayPrice: `+${priceTransformer(fondIAPriceHT).toFixed(0)}${suffix}` });
            }

            if (formData.proRGPD) {
                const rgpdPriceHT = 50;
                dailyServicesHT += rgpdPriceHT;
                details.push({ label: 'Conformité RGPD', priceHT: rgpdPriceHT, daily: true, displayPrice: `+${priceTransformer(rgpdPriceHT).toFixed(0)}${suffix}` });
            }


        } else if (formData.needType === '360') {
            nomBorne = 'Photobooth 360';
            const basePriceHT = 715;
            const deliveryPriceHT = 150;
            baseDayPriceHT = basePriceHT;
            prixLivraisonHT = deliveryPriceHT; 
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
            prixTemplateHT = formData.isPro ? 60 : 0;
            oneTimeCostsHT += prixTemplateHT;
            let templateDisplay = formData.isPro ? `${priceTransformer(prixTemplateHT).toFixed(0)}${suffix}` : 'Gratuit (Offert)';
            details.push({ label: 'Outil Template Professionnel', priceHT: prixTemplateHT, daily: false, displayPrice: templateDisplay });
        }


        // --- 3. Calcul du coût total de la prestation récurrente après dégressivité ---
        totalServicesBeforeFormula = dailyServicesHT * duration;

        // Logique de dégressivité (inchangée)
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
                const prixPlancherJour = dailyServicesHT * PRIX_PLANCHER_RATIO;
                const prixBaseJour = dailyServicesHT;

                const totalHTCalc = (
                    (prixBaseJour - prixPlancherJour) * 10 * (1 - Math.pow(0.9, NbJours)) +
                    prixPlancherJour * NbJours
                );
                totalServicesHT_Degressed = Math.trunc(totalHTCalc);
            }
        }
        
        // Total HT final
        const totalHT = totalServicesHT_Degressed + oneTimeCostsHT;
        
        // Données structurées pour l'envoi Axonaut
        const axonautData = {
            nomBorne: nomBorne,
            prixMateriel: totalServicesHT_Degressed, 
            prixTemplate: prixTemplateHT, 
            prixLivraison: prixLivraisonHT, 
            nombreMachine: 1, 
            supplementKilometrique: supplementKm, 
            supplementLivraisonDifficile: 0, 
            supplementImpression: supplementImpressionHT, 
            supplementAnimation: supplementAnimationHT, 
            nombreTirages: formData.proImpressions,
            heuresAnimations: parseInt(formData.proAnimationHours) || 0,
            distanceKm: Math.round(distanceKm), 
        };


        return {
            totalHT: totalHT,
            totalServicesHT: totalServicesHT_Degressed,
            oneTimeCostsHT: oneTimeCostsHT,
            baseDayPriceHT: baseDayPriceHT,
            totalServicesBeforeFormula: totalServicesBeforeFormula,
            details: details,
            displayTTC: displayTTC,
            priceSuffix: displayTTC ? 'TTC' : 'HT',
            axonautData: axonautData 
        };
    }, [formData, PARIS_LAT, PARIS_LNG]); 


    // 💡 NOUVEAU: Fonction pour envoyer les données à Zapier
    const sendWebhook = async (step, finalSubmit = false) => {
        const pricing = calculatePrice; 

        const payload = {
            quote_id: quoteId,
            step_completed: step,
            status: finalSubmit ? 'Devis Confirmé (Final)' : `Étape ${step}/${totalSteps} Complétée`,
            timestamp: new Date().toISOString(),
            ...formData,

            total_ht: pricing.totalHT.toFixed(2),
            total_ttc: (pricing.totalHT * TVA_RATE).toFixed(2),
            price_suffix: pricing.priceSuffix,
            duration_days: formData.eventDuration,
            total_services_ht_degressed: pricing.totalServicesHT.toFixed(2),
            one_time_costs_ht: pricing.oneTimeCostsHT.toFixed(2),
            base_day_price_ht: pricing.baseDayPriceHT.toFixed(2),
        };

        try {
            const response = await fetch(ZAPIER_WEBHOOK_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error(`Webhook Zapier échoué pour l'étape ${step}:`, response.status, await response.text());
                showMessage(`Erreur lors de l'envoi du devis à Zapier (Étape ${step}). Veuillez vérifier la console.`);
            } else {
                console.log(`Webhook Zapier envoyé avec succès pour l'étape ${step}.`);
            }
        } catch (error) {
            console.error('Erreur réseau lors de l\'envoi du webhook à Zapier:', error);
            showMessage("Erreur réseau: Impossible de communiquer avec le service de devis.");
        }
    };

    const handleNext = () => {
        if (isStepValid() && currentStep < totalSteps) {
            sendWebhook(currentStep);
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleEditRequest = () => {
        setCurrentStep(1);
    };

    const handleSubmit = async () => {
        const pricing = calculatePrice;
        
        // 1. Préparer les données structurées pour la fonction Axonaut
        const inputsForAxonaut = {
            ...pricing.axonautData, 
            
            // Fixes/Par défaut (Basé sur vos instructions)
            commercial: 'contact@photobooth-paris.fr',
            companyId: 38647018, 
            acomptePct: 1, // Fixé à 1 (100%)
            company_address_id: 36619044, // Fixé à 15
            nombreMachine: 1, 

            // Données du formulaire
            dateEvenement: formData.eventDate,
            adresseLivraisonComplete: formData.deliveryFullAddress,
            nombreJours: formData.eventDuration,
            templateInclus: formData.templateTool,
            livraisonIncluse: formData.ecoTransport !== 'pickup',
        };

        try {
            // 2. Générer le payload JSON Axonaut
            const axonautBody = generateAxonautQuotationBody(inputsForAxonaut);
            
            // 3. Envoyer le payload à l'API (à implémenter sur votre backend sécurisé)
            // const apiResponse = await sendAxonautQuotation(axonautBody);
            
            // 4. Confirmation (Simulée pour le front-end)
            const finalPrice = pricing.displayTTC ? (pricing.totalHT * TVA_RATE).toFixed(2) : pricing.totalHT.toFixed(2);
            const priceSuffix = pricing.displayTTC ? 'TTC' : 'HT';
            
            console.log("JSON FINAL PRÊT POUR AXONAUT:", axonautBody);
            
            await sendWebhook(currentStep, true);

            showMessage(`Devis envoyé à ${formData.email}!\nTotal: ${finalPrice}€ ${priceSuffix}. (Axonaut JSON généré)`);
            
        } catch (error) {
            showMessage(`Erreur lors de la confirmation du devis: ${error.message}`);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                if (!formData.fullName || !formData.email || !formData.phone || formData.phone.replace(/\D/g, '').length < 9)
                    return false;
                if (
                    formData.isPro &&
                    (!formData.companyName ||
                        !formData.billingFullAddress)
                )
                    return false;
                return true;
            case 2:
                // Vérifie que l'adresse a été géocodée (lat/lng sont remplis)
                return (
                    formData.deliveryFullAddress &&
                    formData.eventDate &&
                    formData.needType &&
                    formData.eventDuration >= 1 &&
                    formData.deliveryLat !== null // NOUVEAU: Vérification du géocodage
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

    const pricingData = calculatePrice;
    const priceSuffix = pricingData.priceSuffix;

    // Étape 1: Contact
    const renderStep1 = () => (
        <div className='space-y-6'>
            <h2
                className='text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2'
                style={{ color: customColor, borderColor: customColor }}
            >
                Informations de contact
            </h2>

            <InputField
                label="Nom et Prénom"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                placeholder='Jean Dupont'
                required
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InputField
                    label="Email"
                    type='email'
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder='jean@exemple.fr'
                    required
                />
                <PhoneInputField
                    value={formData.phone}
                    onChange={fullNumber => setFormData({ ...formData, phone: fullNumber })}
                />
            </div>

            <div className='flex items-center space-x-3 bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-inner'>
                <input
                    type='checkbox'
                    id='isPro'
                    checked={formData.isPro}
                    // Reset options when switching status
                    onChange={e => {
                        const isPro = e.target.checked;
                        setFormData({
                            ...formData,
                            isPro: isPro,
                            needType: 'pro', // Remettre à PRO par défaut ou ECO si besoin
                            ecoModel: '',
                            ecoTransport: 'pickup', 
                            proAnimationHours: 'none',
                            proFondIA: false,
                            proRGPD: false,
                            proImpressions: 1,
                            templateTool: false, 
                        });
                        if (currentStep > 2) {
                            setCurrentStep(2);
                        }
                    }}
                    className='w-5 h-5 text-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer border-gray-400'
                />
                <label
                    htmlFor='isPro'
                    className='text-sm font-medium text-gray-800 cursor-pointer'
                >
                    Je suis un professionnel (Affichage des prix en HT)
                </label>
            </div>

            {formData.isPro && (
                <div className='space-y-4 bg-indigo-50 p-6 rounded-xl border border-indigo-200 shadow-md'>
                    <h3 className='text-xl font-bold text-gray-800'>Détails Professionnels</h3>
                    <InputField
                        label="Nom de la société"
                        value={formData.companyName}
                        onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder='Ma Société SAS'
                        required
                    />
                    <div>
                        <AddressAutocomplete
                            label="Adresse de facturation (Recherche automatique)"
                            required
                            defaultValue={formData.billingFullAddress || ''}
                            onAddressSelect={(addr) => setFormData(prev => ({
                                ...prev,
                                billingFullAddress: addr.fullAddress
                            }))}
                        />
                    </div>
                </div>
            )}
        </div>
    );

    // Étape 2: Événement
    const renderStep2 = () => (
        <div className='space-y-6'>
            <h2
                className='text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2'
                style={{ color: customColor, borderColor: customColor }}
            >
                Informations de l'événement
            </h2>

            <div>
                <AddressAutocomplete
                    label="Adresse de l'événement (Recherche automatique)"
                    required
                    defaultValue={formData.deliveryFullAddress || ''}
                    onAddressSelect={(addr) => setFormData(prev => ({
                        ...prev,
                        deliveryFullAddress: addr.fullAddress,
                        deliveryLat: addr.lat, // Stocker la latitude
                        deliveryLng: addr.lng  // Stocker la longitude
                    }))}
                />
                {/* Message d'avertissement si les coordonnées sont manquantes après la validation */}
                {isStepValid() && formData.deliveryLat === null && (
                    <p className="mt-2 text-sm text-red-500 font-medium">Veuillez sélectionner une adresse complète dans la liste suggérée.</p>
                )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InputField
                    label="Date de l'événement"
                    type='date'
                    value={formData.eventDate}
                    onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                    required
                />
                <InputField
                    label="Durée (jours)"
                    type='number'
                    value={formData.eventDuration}
                    onChange={e =>
                        setFormData({
                            ...formData,
                            eventDuration: Math.max(1, parseInt(e.target.value) || 1),
                        })
                    }
                    required
                />
            </div>

            <div>
                <label className='block text-lg font-bold text-gray-900 mb-4'>
                    Type de besoin <span className='text-red-500'>*</span>
                </label>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <button
                        type='button'
                        onClick={() => setFormData({ ...formData, needType: 'eco' })}
                        className={`p-6 border-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${formData.needType === 'eco'
                            ? 'border-blue-600 bg-blue-50 shadow-xl ring-4 ring-blue-100'
                            : 'border-gray-200 bg-white hover:border-blue-300 shadow-md'
                            }`}
                    >
                        <div className='text-5xl mb-3'>💰</div>
                        <h3 className='font-bold text-lg text-gray-900 mb-1'>Nos bornes compactes</h3>
                        <p className='text-sm text-gray-600'>
                            Un petit concentré de technologies, dans un espace réduit !
                        </p>
                    </button>

                    <button
                        type='button'
                        onClick={() => setFormData({ ...formData, needType: 'pro' })}
                        className={`p-6 border-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${formData.needType === 'pro'
                            ? 'border-blue-600 bg-blue-50 shadow-xl ring-4 ring-blue-100'
                            : 'border-gray-200 bg-white hover:border-blue-300 shadow-md'
                            }`}
                    >
                        <div className='text-5xl mb-3'>⭐</div>
                        <h3 className='font-bold text-lg text-gray-900 mb-1'>Notre borne premium</h3>
                        <p className='text-sm text-gray-600'>
                            Machine haut de gamme avec service, qui en impose par sa prestance !
                        </p>
                    </button>

                    <button
                        type='button'
                        onClick={() => setFormData({ ...formData, needType: '360', templateTool: false })}
                        className={`p-6 border-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${formData.needType === '360'
                            ? 'border-blue-600 bg-blue-50 shadow-xl ring-4 ring-blue-100'
                            : 'border-gray-200 bg-white hover:border-blue-300 shadow-md'
                            }`}
                    >
                        <div className='text-5xl mb-3'>🎥</div>
                        <h3 className='font-bold text-lg text-gray-900 mb-1'>Photobooth 360</h3>
                        <p className='text-sm text-gray-600'>Expérience immersive à 360°</p>
                    </button>
                </div>
            </div>
        </div>
    );

    // Étape 3: Configuration selon besoin
    const renderStep3 = () => {
        if (!formData.needType) return null;

        const { priceSuffix } = pricingData;
        const priceTransformer = (priceHT) => (priceSuffix === 'TTC' ? (priceHT * TVA_RATE) : priceHT);

        const TemplateOption = () => {
            const isPro = formData.isPro;
            const priceHT = 60;
            const displayPrice = isPro
                ? `+${priceTransformer(priceHT).toFixed(0)}€ ${priceSuffix}`
                : 'Gratuit (Offert)';

            return (
                <div className='flex flex-col space-y-2 bg-indigo-50 p-4 rounded-xl border border-indigo-200 shadow-sm transition-colors hover:bg-indigo-100'>
                    <div className='flex items-center space-x-3'>
                        <input
                            type='checkbox'
                            id='templateTool'
                            checked={formData.templateTool}
                            onChange={(e) => setFormData({ ...formData, templateTool: e.target.checked })}
                            className='w-5 h-5 text-indigo-600 rounded-md focus:ring-2 focus:ring-indigo-500 cursor-pointer border-gray-400'
                        />
                        <label
                            htmlFor='templateTool'
                            className='flex-1 text-sm font-semibold text-gray-800 cursor-pointer flex items-center space-x-2'
                        >
                            <Wand2 className='w-4 h-4 mr-2' />
                            <span>Outil Template (Personnalisation Avancée)</span>
                        </label>
                        <span className='text-base font-bold text-indigo-600'>{displayPrice}</span>
                    </div>
                    <p className='text-xs text-gray-600 pl-8'>
                        Créez votre propre arrière-plan, ajoutez votre logo et personnalisez les couleurs. Nécessite l'usage d'un ordinateur.
                    </p>
                </div>
            );
        };

        if (formData.needType === 'eco') {
            const ecoModels = [
                { id: 'numerique', name: 'CineBooth Numérique', priceHT: 245, desc: 'Envoi numérique des photos et vidéos. Pas d\'impression physique.' },
                { id: '150', name: 'CineBooth 150 impressions', priceHT: 329, desc: '150 impressions incluses, qualité professionnelle.' },
                { id: '300', name: 'CineBooth 300 impressions', priceHT: 370, desc: '300 impressions incluses, idéal pour les événements de taille moyenne.' },
                { id: 'illimite', name: 'StarBooth Pro - Illimité', priceHT: 412, desc: "L'ultra haut de gamme miniaturisé. Impressions illimitées. Parfait pour les grands événements." },
            ];

            const baseDeliveryPriceHT = formData.ecoModel === 'illimite' ? 70 : 50;
            const setupPriceHT = 20;
            const deliveryNosetupDisplay = `${priceTransformer(baseDeliveryPriceHT).toFixed(0)}€ ${priceSuffix}`;
            const deliveryWithSetupDisplay = `${priceTransformer(baseDeliveryPriceHT + setupPriceHT).toFixed(0)}€ ${priceSuffix}`;


            return (
                <div className='space-y-8'>
                    <h2
                        className='text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2'
                        style={{ color: customColor, borderColor: customColor }}
                    >
                        Configuration - Formule Économique (Prix en {priceSuffix})
                    </h2>

                    <div>
                        <label className='block text-lg font-bold text-gray-900 mb-4'>
                            Modèle <span className='text-red-500'>*</span>
                        </label>
                        <div className='space-y-3'>
                            {ecoModels.map(model => (
                                <button
                                    key={model.id}
                                    type='button'
                                    onClick={() =>
                                        setFormData({ ...formData, ecoModel: model.id })
                                    }
                                    className={`w-full p-4 border-2 rounded-xl transition-all text-left flex flex-col ${formData.ecoModel === model.id
                                        ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-100'
                                        : 'border-gray-300 bg-white hover:border-blue-400 shadow-sm'
                                        }`}
                                >
                                    <div className='flex justify-between items-center w-full'>
                                        <span className='font-medium text-gray-800'>{model.name}</span>
                                        <span className='text-xl font-extrabold text-blue-600'>
                                            {priceTransformer(model.priceHT).toFixed(0)}€ {priceSuffix}
                                        </span>
                                    </div>
                                    <p className='text-xs text-gray-500 mt-1 w-full'>{model.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className='block text-lg font-bold text-gray-900 mb-4'>
                            Options
                        </label>
                        <div className='space-y-3'>
                            {/* Outil Template pour ECO et PREMIUM */}
                            <TemplateOption />
                        </div>
                    </div>

                    <div>
                        <label className='block text-lg font-bold text-gray-900 mb-4'>
                            Transport & Mise en service <span className='text-red-500'>*</span>
                        </label>
                        <div className='space-y-3'>
                            {/* Retrait */}
                            <button
                                type='button'
                                onClick={() => setFormData({ ...formData, ecoTransport: 'pickup' })}
                                className={`w-full p-4 border-2 rounded-xl transition-all text-left flex justify-between items-center ${formData.ecoTransport === 'pickup'
                                    ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-100'
                                    : 'border-gray-300 bg-white hover:border-blue-400 shadow-sm'
                                    }`}
                            >
                                <span className='font-medium text-gray-800 flex items-center'><Truck className='w-4 h-4 mr-2' /> Retrait à Arcueil (94)</span>
                                <span className='text-xl font-extrabold text-green-600'>Gratuit</span>
                            </button>

                            {/* Livraison Standard (Mise en service par vos soins) */}
                            <button
                                type='button'
                                onClick={() => setFormData({ ...formData, ecoTransport: 'delivery_nosetup' })}
                                className={`w-full p-4 border-2 rounded-xl transition-all text-left flex flex-col ${formData.ecoTransport === 'delivery_nosetup'
                                    ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-100'
                                    : 'border-gray-300 bg-white hover:border-blue-400 shadow-sm'
                                    }`}
                            >
                                <div className='flex justify-between items-center w-full'>
                                    <span className='font-medium text-gray-800 flex items-center'><Truck className='w-4 h-4 mr-2' /> Livraison Standard (Mise en service par vos soins)</span>
                                    <span className='text-xl font-extrabold text-blue-600'>{deliveryNosetupDisplay}</span>
                                </div>
                                <p className='text-xs text-blue-700 mt-2 font-semibold'>
                                    * Le Photobooth est <span className='font-extrabold'>Plug and Play</span> : il suffit de le brancher et il démarre en 2 minutes chrono !
                                </p>
                            </button>

                            {/* Livraison + Mise en service par le livreur */}
                            <button
                                type='button'
                                onClick={() => setFormData({ ...formData, ecoTransport: 'delivery_withsetup' })}
                                className={`w-full p-4 border-2 rounded-xl transition-all text-left flex justify-between items-center ${formData.ecoTransport === 'delivery_withsetup'
                                    ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-100'
                                    : 'border-gray-300 bg-white hover:border-blue-400 shadow-sm'
                                    }`}
                            >
                                <span className='font-medium text-gray-800 flex items-center'><Truck className='w-4 h-4 mr-2' /> Livraison + Mise en service par le livreur</span>
                                <span className='text-xl font-extrabold text-blue-600'>{deliveryWithSetupDisplay}</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (formData.needType === 'pro') {
            const basePriceHT = BASE_PRICE_PRO_HT; // 480
            const basePriceDisplay = priceSuffix === 'TTC' ? `${(basePriceHT * TVA_RATE).toFixed(0)}€ TTC` : `${basePriceHT}€ HT`;
            const optionPriceHT = 50;
            const optionPriceDisplay = priceSuffix === 'TTC' ? `+${(optionPriceHT * TVA_RATE).toFixed(0)}€ TTC` : `+${optionPriceHT}€ HT`;

            const proDeliveryBasePriceHT = 110;

            // Nouvelle logique de prix de livraison basé sur l'animation
            const animationHours = parseInt(formData.proAnimationHours);
            const isShortAnimation = animationHours > 0 && animationHours <= 3;
            const proDeliveryPriceHT = isShortAnimation ? proDeliveryBasePriceHT / 2 : proDeliveryBasePriceHT;
            const proDeliveryPriceDisplay = priceSuffix === 'TTC' ? `+${(proDeliveryPriceHT * TVA_RATE).toFixed(0)}€ TTC` : `+${proDeliveryPriceHT}€ HT`;

            return (
                <div className='space-y-6'>
                    <h2
                        className='text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2'
                        style={{ color: customColor, borderColor: customColor }}
                    >
                        Configuration - Signature (Prix en {priceSuffix})
                    </h2>

                    <div className='bg-blue-600 text-white p-4 rounded-xl shadow-xl'>
                        <p className='text-xl font-bold'>
                            Base Signature / Jour : <span className='float-right'>{basePriceDisplay}</span>
                        </p>
                        <p className='text-sm mt-1 font-medium'>
                            Prix plancher journalier pour la dégressivité: {PLANCHER_PRICE_PRO_HT_USER_FIX}€ HT (Valeur corrigée).
                        </p>
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-gray-800 mb-3'>
                            Heures d'animation ({priceTransformer(45).toFixed(0)}€ {priceSuffix} par heure)
                        </label>
                        <select
                            value={formData.proAnimationHours}
                            onChange={e =>
                                setFormData({ ...formData, proAnimationHours: e.target.value })
                            }
                            className='w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-150 ease-in-out text-gray-900'
                        >
                            <option value='none'>Non-souhaité (Inclus dans le prix de base)</option>
                            {[1, 2, 3].map(h => (
                                <option key={h} value={h}>
                                    {h}h d'animation (Réalisé par le Technicien - Logistique réduite !)
                                </option>
                            ))}
                            {[4, 5, 6, 7, 8].map(h => (
                                <option key={h} value={h}>
                                    {h}h d'animation (Réalisé par une Animatrice dédiée)
                                </option>
                            ))}
                        </select>
                        <p className='mt-2 text-sm text-blue-700 italic'>
                            {isShortAnimation
                                ? `* Avantage Logistique : Pour 1h à 3h, l'animation est réalisée par le technicien, le coût de Logistique est divisé par deux (${proDeliveryPriceHT}€ HT au lieu de ${proDeliveryBasePriceHT}€ HT).`
                                : (formData.proAnimationHours !== 'none' ? `* Pour plus de 3h, une animatrice dédiée intervient (Coût Logistique normal: ${proDeliveryBasePriceHT}€ HT).` : '* Pas d\'animation souhaitée pour l\'instant.')
                            }
                        </p>
                    </div>

                    <div className='space-y-3'>
                        {/* Outil Template pour ECO et PREMIUM (PRO) */}
                        <TemplateOption />

                        {[
                            { id: 'proFondIA', label: 'Fond IA (Intelligence Aritificielle)', priceDisplay: optionPriceDisplay, checked: formData.proFondIA, onChange: (e) => setFormData({ ...formData, proFondIA: e.target.checked }) },
                            { id: 'proRGPD', label: 'Option RGPD & Sécurité des données', priceDisplay: optionPriceDisplay, checked: formData.proRGPD, onChange: (e) => setFormData({ ...formData, proRGPD: e.target.checked }) },
                        ].map((option) => (
                            <div key={option.id} className='flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm transition-colors hover:bg-gray-100'>
                                <input
                                    type='checkbox'
                                    id={option.id}
                                    checked={option.checked}
                                    onChange={option.onChange}
                                    className='w-5 h-5 text-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 cursor-pointer border-gray-400'
                                />
                                <label
                                    htmlFor={option.id}
                                    className='flex-1 text-sm font-semibold text-gray-800 cursor-pointer'
                                >
                                    {option.label}
                                </label>
                                <span className='text-base font-bold text-blue-600'>{option.priceDisplay}</span>
                            </div>
                        ))}


                        <div className='flex items-center space-x-3 bg-green-50 p-4 rounded-xl border border-green-300 shadow-md opacity-90'>
                            <Check className='w-5 h-5 text-green-700' />
                            <label
                                htmlFor='proDelivery'
                                className='flex-1 text-sm font-semibold text-gray-800'
                            >
                                Livraison / Installation / Désinstallation par Technicien Certifié
                            </label>
                            <span className='text-base font-bold text-green-700'>{proDeliveryPriceDisplay}</span>
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-gray-800 mb-3'>
                            Nombre d'impressions par cliché (Base 1 incluse. Supplément à partir de 2 impressions)
                        </label>
                        <select
                            value={formData.proImpressions}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    proImpressions: parseInt(e.target.value),
                                })
                            }
                            className='w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-150 ease-in-out text-gray-900'
                        >
                            <option value={1}>1 impression (inclus)</option>
                            <option value={2}>2 impressions (Calcul dégressif)</option>
                            <option value={3}>3 impressions (Calcul dégressif)</option>
                        </select>
                        <p className='mt-2 text-sm text-blue-700 italic'>
                            * Le coût des impressions supplémentaires est calculé selon une formule de dégressivité qui tient compte de la durée totale de location.
                        </p>
                    </div>
                </div>
            );
        }

        if (formData.needType === '360') {
            const { baseDayPriceHT } = pricingData;
            const dailyTotalDisplay = `${priceTransformer(baseDayPriceHT).toFixed(0)}€ ${priceSuffix}`;

            const basePriceHT = 715;
            const deliveryPriceHT = 150;

            const basePriceDisplay = priceSuffix === 'TTC' ? `${(basePriceHT * TVA_RATE).toFixed(0)}€ TTC` : `${basePriceHT}€ HT`;
            const deliveryPriceDisplay = priceSuffix === 'TTC' ? `${(deliveryPriceHT * TVA_RATE).toFixed(0)}€ TTC` : `${deliveryPriceHT}€ HT`;

            return (
                <div className='space-y-6'>
                    <h2
                        className='text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2'
                        style={{ color: customColor, borderColor: customColor }}
                    >
                        Configuration - Photobooth 360 (Prix en {priceSuffix})
                    </h2>

                    <div className='bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl border-4 border-purple-500 shadow-2xl'>
                        <div className='text-center'>
                            <div className='text-6xl mb-4'>📸🎥</div>
                            <h3 className='text-3xl font-extrabold text-purple-900 mb-6'>
                                Forfait 360° Tout Inclus
                            </h3>
                            <div className='space-y-3 text-left max-w-sm mx-auto'>
                                <div className='flex justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200'>
                                    <span className='font-medium text-gray-700'>Photobooth 360 (Base)</span>
                                    <span className='font-bold text-purple-600'>{basePriceDisplay}</span>
                                </div>
                                <div className='flex justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200'>
                                    <span className='font-medium text-gray-700'>Livraison & Installation</span>
                                    <span className='font-bold text-purple-600'>{deliveryPriceDisplay}</span>
                                </div>
                                <div className='flex justify-between p-4 bg-purple-600 text-white rounded-xl shadow-lg border-2 border-purple-800 mt-5'>
                                    <span className='font-extrabold text-xl'>Total par jour ({priceSuffix})</span>
                                    <span className='font-extrabold text-3xl'>
                                        {dailyTotalDisplay}
                                    </span>
                                </div>
                            </div>
                            <p className='text-sm text-purple-700 mt-4 italic'>
                                L'animation et l'opérateur sont inclus pour toute la durée.
                            </p>
                        </div>
                    </div>
                    <div className='bg-yellow-50 p-4 rounded-xl border border-yellow-300 text-yellow-800'>
                        <p className='font-semibold'>
                            Note: L'outil Template Professionnel n'est pas disponible pour la formule Photobooth 360.
                        </p>
                    </div>
                </div>
            );
        }

        return null;
    };

    // Étape 4: Récapitulatif
    const renderStep4 = () => {
        const pricing = pricingData;
        const totalHT = pricing.totalHT;
        const totalServicesHT_Degressed = pricing.totalServicesHT;
        const oneTimeCostsHT = pricing.oneTimeCostsHT;
        const baseDayPriceHT = pricing.baseDayPriceHT;
        const totalServicesBeforeFormula = pricing.totalServicesBeforeFormula;
        const displayTTC = pricing.displayTTC;
        const duration = formData.eventDuration;

        // Correction ici : TVA_RATE est utilisé pour le calcul final TTC
        const totalTTC = (totalHT * TVA_RATE);
        const tvaAmount = (totalTTC - totalHT);

        // Déterminer le prix final à afficher
        const finalPrice = displayTTC ? totalTTC.toFixed(2) : totalHT.toFixed(2);
        const priceSuffix = displayTTC ? 'TTC' : 'HT';

        // Calcul du coût des services seulement pour 1 jour
        const costOfServicesDay = baseDayPriceHT;

        // Calcul de l'économie réalisée (pour l'affichage)
        const economyApplied = (totalServicesBeforeFormula - totalServicesHT_Degressed);


        return (
            <div className='space-y-6'>
                <h2
                    className='text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2'
                    style={{ color: customColor, borderColor: customColor }}
                >
                    Récapitulatif de votre devis (Affichage en {priceSuffix})
                </h2>

                <div className='bg-gray-50 p-6 rounded-2xl shadow-inner space-y-6 border border-gray-200'>

                    <div className='pb-4 border-b border-gray-300'>
                        <h3 className='font-extrabold text-xl text-gray-800 mb-2'>Contact & Livraison</h3>
                        <p className='text-base text-gray-700 font-medium'>{formData.fullName} ({formData.isPro ? formData.companyName : 'Particulier'})</p>
                        <p className='text-sm text-gray-600'>
                            {formData.email} | {formData.phone}
                        </p>
                        <p className='text-sm text-gray-600 mt-1'>
                            Livraison le <span className='font-bold'>{new Date(formData.eventDate).toLocaleDateString('fr-FR')}</span> pour une durée de <span className='font-bold text-blue-600'>{formData.eventDuration} jour(s)</span> à : <span className='font-bold'>{formData.deliveryFullAddress}</span>            </p>
                    </div>

                    <div>
                        <h3 className='font-extrabold text-xl text-gray-800 mb-3'>Détail de la Prestation</h3>
                        <div className='space-y-2'>
                            {/* Location du matériel (Coûts récurrents par jour) */}
                            <div className='space-y-1 p-3 border-2 border-indigo-100 rounded-xl bg-white shadow-sm'>
                                <h4 className='font-bold text-indigo-700 text-lg'>Coûts récurrents (Soumis à dégressivité)</h4>
                                {pricing.details.filter(d => d.daily).map((item, index) => (
                                    <div key={index} className='flex justify-between text-sm py-1'>
                                        <span className='text-gray-700 font-medium ml-2'>- {item.label}</span>
                                        <span className={`font-semibold ${item.priceHT === 0 ? 'text-green-600' : 'text-indigo-600'}`}>
                                            {item.displayPrice}
                                        </span>
                                    </div>
                                ))}
                                <div className='flex justify-between text-base font-bold pt-2 border-t border-dashed mt-2 text-gray-800'>
                                    <span>Total Services / Jour (HT)</span>
                                    <span>{costOfServicesDay.toFixed(2)}€</span>
                                </div>
                            </div>

                            {/* Coûts uniques (Non soumis à la dégressivité principale) */}
                            {pricing.details.filter(d => !d.daily && !d.isHidden).length > 0 && (
                                <div className='space-y-1 p-3 border-2 border-green-100 rounded-xl bg-white shadow-sm'>
                                    <h4 className='font-bold text-green-700 text-lg'>Coûts uniques (Livraison, Options & Impressions Supplémentaires)</h4>
                                    {pricing.details.filter(d => !d.daily && !d.isHidden).map((item, index) => (
                                        <div key={index} className='flex justify-between text-sm py-1'>
                                            <span className='text-gray-700 font-medium ml-2'>- {item.label}</span>
                                            <span className={`font-semibold ${item.priceHT === 0 ? 'text-green-600' : 'text-green-600'}`}>
                                                {item.displayPrice}
                                            </span>
                                        </div>
                                    ))}
                                    <div className='flex justify-between text-base font-bold pt-2 border-t border-dashed mt-2 text-gray-800'>
                                        <span>Total Coûts Uniques (HT)</span>
                                        <span>{oneTimeCostsHT.toFixed(2)}€</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='pt-6 border-t-2 border-blue-200 space-y-4'>

                        {/* Affichage des prix de base et total dégressif */}
                        {duration > 1 && (
                            <div className='p-4 bg-blue-50 rounded-xl border border-blue-300 shadow-md'>
                                <h4 className='text-xl font-bold text-blue-800 mb-3 flex items-center'>
                                    <DollarSign className='w-5 h-5 mr-2' />
                                    Calcul Dégressif Location ({duration} jours)
                                </h4>

                                <div className='flex justify-between text-sm py-1'>
                                    <span className='text-gray-700'>Coût sans dégressivité ({duration} x {costOfServicesDay.toFixed(2)}€ HT)</span>
                                    <span className='font-semibold text-gray-800'>{totalServicesBeforeFormula.toFixed(2)}€ HT</span>
                                </div>

                                <div className='flex justify-between text-base font-bold text-green-700 pt-3 border-t border-dashed mt-3'>
                                    <span>Coût dégressif total de la location (HT)</span>
                                    <span>{totalServicesHT_Degressed.toFixed(2)}€ HT</span>
                                </div>

                                <div className='flex justify-between text-base font-bold text-red-600 pt-1'>
                                    <span>Économie appliquée (Dégressivité)</span>
                                    <span className='font-extrabold'>-{(economyApplied).toFixed(2)}€ HT</span>
                                </div>
                            </div>
                        )}

                        <div className='flex justify-between items-center'>
                            <span className='text-xl font-bold text-gray-800'>Total Hors Taxes (HT)</span>
                            <span className='text-4xl font-extrabold text-blue-600'>
                                {totalHT.toFixed(2)}€
                            </span>
                        </div>

                        <div className='flex justify-between items-center text-gray-600 border-t border-dashed pt-2'>
                            <span className='text-sm'>TVA (20%)</span>
                            <span className='text-base font-medium text-gray-800'>
                                {tvaAmount.toFixed(2)}€
                            </span>
                        </div>

                        <div className='flex justify-between items-center mt-3 p-3 bg-green-100 rounded-xl border-2 border-green-500'>
                            <span className='text-2xl font-extrabold text-green-800'>Total {priceSuffix}</span>
                            <span className='text-3xl font-extrabold text-green-700'>
                                {finalPrice}€
                            </span>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mt-6'>
                    <button
                        onClick={handleEditRequest}
                        className='w-full md:w-auto bg-gray-200 text-gray-800 py-4 px-6 rounded-xl font-bold text-lg shadow-md hover:bg-gray-300 transition-colors flex items-center justify-center space-x-3'
                    >
                        <ChevronLeft className='w-6 h-6' />
                        <span>Modifier votre demande</span>
                    </button>
                    <button
                        onClick={handleSubmit}
                        className='w-full md:w-auto bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-xl shadow-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-[1.01] flex items-center justify-center space-x-3'
                    >
                        <Check className='w-6 h-6' />
                        <span>Confirmer et recevoir le devis par email</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 font-sans'>
            <div id="custom-alert"></div>
            <div className='max-w-4xl mx-auto'>
                <h1
                    className='text-4xl font-extrabold text-gray-900 mb-10 text-center'
                    style={{ color: customColor }}
                >
                    Devis Express Photobooth
                </h1>

                {/* Barre de progression */}
                <div className='mb-10'>
                    <div className='flex items-center justify-between'>
                        {[1, 2, 3, 4].map(step => {
                            const Icon = stepIcons[step - 1];
                            return (
                                <React.Fragment key={step}>
                                    <div className='flex flex-col items-center flex-1'>
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 transform ring-2 ${step <= currentStep
                                                ? 'text-white scale-100 shadow-md'
                                                : 'bg-gray-200 text-gray-600 ring-gray-300 scale-95'
                                                }`}
                                            style={step <= currentStep ? { backgroundColor: customColor, borderColor: customColor, boxShadow: `0 4px 6px -1px ${customColor}33, 0 2px 4px -2px ${customColor}33` } : {}}
                                        >
                                            {step < currentStep ? <Check className='w-6 h-6' /> : <Icon className='w-6 h-6' />}
                                        </div>
                                        <span className={`mt-2 text-sm font-medium transition-colors ${step <= currentStep ? 'font-bold' : 'text-gray-500'
                                            }`}
                                            style={step <= currentStep ? { color: customColor } : {}}>
                                            {stepTitles[step - 1]}
                                        </span>
                                    </div>
                                    {step < 4 && (
                                        <div
                                            className={`flex-1 h-1 mx-[-1rem] transition-all duration-500`}
                                            style={step < currentStep ? { backgroundColor: customColor } : { backgroundColor: '#d1d5db' }}
                                        />
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>

                {/* Contenu du formulaire */}
                <div className='bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100'>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}

                    {/* Boutons de navigation */}
                    {currentStep < 4 && (
                        <div className='flex justify-between mt-10 pt-6 border-t border-gray-200'>
                            {currentStep > 1 ? (
                                <button
                                    onClick={handlePrev}
                                    className='px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-800 hover:bg-gray-100 transition-colors flex items-center space-x-2 shadow-sm'
                                >
                                    <ChevronLeft className='w-5 h-5' />
                                    <span>Précédent</span>
                                </button>
                            ) : (
                                <div />
                            )}
                            <button
                                onClick={handleNext}
                                disabled={!isStepValid()}
                                className={`px-8 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 shadow-md ${isStepValid()
                                    ? 'text-white hover:transform hover:scale-[1.02]'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                style={isStepValid() ? { backgroundColor: customColor, boxShadow: `0 4px 6px -1px ${customColor}55, 0 2px 4px -2px ${customColor}55` } : {}}
                            >
                                <span>{currentStep === 3 ? 'Voir le devis' : 'Suivant'}</span>
                                <ChevronRight className='w-5 h-5' />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}