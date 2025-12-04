import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Check, User, Calendar, Settings, DollarSign, Wand2, Truck } from 'lucide-react';

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
      // Ajout de l'attribut required pour le support HTML5, bien que la validation soit JS
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
// const customColorDark = '#9f2347'; // Une teinte plus sombre pour le hover


/**
 * Composant de champ de saisie téléphonique avec sélection de pays, masquage et validation en temps réel.
 * La valeur retournée à l'onChange est le numéro complet (+code pays) ou une chaîne vide.
 * @param {object} props - Les propriétés du composant.
 * @param {string} props.value - La valeur complète du numéro de téléphone (incluant le code pays).
 * @param {function} props.onChange - Callback appelé lorsque le numéro complet change.
 */
const PhoneInputField = ({ value, onChange }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // France par défaut
    const [inputValue, setInputValue] = useState(''); // Le numéro masqué sans le code pays

    // Synchronisation de la valeur initiale/externe
    useEffect(() => {
        // Si la valeur externe est définie et commence par le code pays actuel
        if (value && value.startsWith(selectedCountry.code)) {
            const rawDigits = value.substring(selectedCountry.code.length).replace(/\D/g, '');
            setInputValue(applyMask(rawDigits, selectedCountry.mask));
        } else if (!value) {
            setInputValue('');
        }
    }, [value, selectedCountry]);

    // Ouvre/ferme le menu déroulant lors d'un clic extérieur
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
        
        // 1. Appliquer le masquage
        const maskedValue = applyMask(rawValue, selectedCountry.mask);
        setInputValue(maskedValue);

        // 2. Préparer la valeur complète pour le formulaire parent
        if (isValid(maskedValue)) {
            const fullNumber = selectedCountry.code + rawValue;
            onChange(fullNumber);
        } else {
            // Passer la valeur raw pour permettre à l'étape parent de faire une validation simple sur la longueur
            onChange(selectedCountry.code + rawValue);
        }
    };

    const handleSelectCountry = (country) => {
        setSelectedCountry(country);
        setIsDropdownOpen(false);
        // Réinitialiser le champ et notifier le parent.
        setInputValue('');
        onChange('');
    };

    // Déterminer l'état visuel pour le rendu
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
            if(remaining > 0) {
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


export default function PhotoboothQuoteForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Contact
    fullName: '',
    email: '',
    phone: '', // Stocke le numéro complet (+code pays)
    isPro: false,
    companyName: '',
    billingStreet: '',
    billingPostal: '',
    billingCity: '',

    // Événement
    deliveryStreet: '',
    deliveryPostal: '',
    deliveryCity: '',
    eventDate: '',
    eventDuration: 1, 
    needType: 'pro', // Défini à 'pro' pour tester la correction

    // Éco
    ecoModel: '', // 'numerique', '150', '300', 'illimite'
    // ecoTransport: 'pickup', 'delivery_nosetup', 'delivery_withsetup'
    ecoTransport: 'pickup', 
    
    // Pro
    proAnimationHours: 'none',
    proFondIA: false,
    proRGPD: false,
    proDelivery: true, // Obligatoire pour Pro
    proImpressions: 1, // 1 impression (inclus)
    
    // Options communes (ECO & PRO)
    templateTool: false, // Outil template
  });

  const totalSteps = 4;
  const TVA_RATE = 1.20; 
  const PRIX_PLANCHER_RATIO = 0.15; // Ratio par défaut pour la dégressivité
  
  // Constantes de prix spécifiques au StarBooth Signature (480€ HT)
  const BASE_PRICE_PRO_HT = 480; 
  const PLANCHER_PRICE_PRO_HT_USER_FIX = 79; // Le prix plancher corrigé par l'utilisateur pour le 480€ HT

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
   * Utilise useMemo pour ne recalculer que lorsque les données pertinentes changent.
   * @returns {object} { totalHT: number, totalServicesHT: number, baseDayPriceHT: number, details: Array, displayTTC: boolean }
   */
  const calculatePrice = useMemo(() => {
    
    // Déclarations des prix et TVA
    const displayTTC = !formData.isPro;
    const priceTransformer = (priceHT) => (displayTTC ? (priceHT * TVA_RATE) : priceHT);
    const suffix = displayTTC ? '€ TTC' : '€ HT';

    let dailyServicesHT = 0; // Coût des services récurrents par jour (pour la dégressivité)
    let oneTimeCostsHT = 0;   // Coûts uniques (Options, livraison fixe)
    let details = [];
    let totalServicesBeforeFormula = 0; // Pour l'affichage de l'économie
    let totalServicesHT_Degressed = 0; // Le résultat final dégressif des services

    const duration = formData.eventDuration;
    const NbJours = duration;

    // --- 1. Détermination et Collecte des coûts de base (Prix de la prestation par jour) ---
    if (formData.needType === 'eco') {
      const ecoModels = {
        numerique: { name: 'CineBooth Numérique', priceHT: 245 },
        150: { name: 'CineBooth 150', priceHT: 329 },
        300: { name: 'CineBooth 300', priceHT: 370 },
        illimite: { name: 'StarBooth Pro Illimité', priceHT: 412 },
      };

      if (formData.ecoModel) {
        const model = ecoModels[formData.ecoModel];
        dailyServicesHT += model.priceHT;
        details.push({ 
            label: model.name, 
            priceHT: model.priceHT, 
            daily: true, // Marqueur pour les services récurrents
            displayPrice: `${priceTransformer(model.priceHT).toFixed(0)}${suffix}` 
        });
      }
      
      // Transport ECO et Mise en service (Coûts uniques)
      const baseDeliveryPriceHT = formData.ecoModel === 'illimite' ? 70 : 50;
      const setupPriceHT = 20;

      if (formData.ecoTransport === 'delivery_nosetup') {
        oneTimeCostsHT += baseDeliveryPriceHT;
        details.push({ 
            label: 'Livraison Standard (Installation par vos soins)', 
            priceHT: baseDeliveryPriceHT, 
            daily: false,
            displayPrice: `${priceTransformer(baseDeliveryPriceHT).toFixed(0)}${suffix}`
        });
      } else if (formData.ecoTransport === 'delivery_withsetup') {
        const totalDeliveryHT = baseDeliveryPriceHT + setupPriceHT;
        oneTimeCostsHT += totalDeliveryHT;
        details.push({ 
            label: 'Livraison + Mise en service par le livreur', 
            priceHT: totalDeliveryHT, 
            daily: false,
            displayPrice: `${priceTransformer(totalDeliveryHT).toFixed(0)}${suffix}`
        });
      } else if (formData.ecoTransport === 'pickup') {
        details.push({ label: 'Retrait (Arcueil)', priceHT: 0, daily: false, displayPrice: 'Gratuit' });
      }

    } else if (formData.needType === 'pro') {
      // Prix de base journalier du StarBooth Signature (480 EUR HT)
      dailyServicesHT += BASE_PRICE_PRO_HT;
      details.push({ 
        label: 'StarBooth Signature (base journalière)', 
        priceHT: BASE_PRICE_PRO_HT, 
        daily: true,
        displayPrice: `${priceTransformer(BASE_PRICE_PRO_HT).toFixed(0)}${suffix}`
      });
      
      // Détermination du prix de la livraison/installation PRO (Coût unique)
      const proDeliveryBasePriceHT = 110;
      let proDeliveryPriceHT = proDeliveryBasePriceHT;
      
      const animationHours = parseInt(formData.proAnimationHours);
      const isShortAnimation = animationHours > 0 && animationHours <= 3;

      if (isShortAnimation) {
          proDeliveryPriceHT = proDeliveryBasePriceHT / 2; // 55€ HT
      }
      
      oneTimeCostsHT += proDeliveryPriceHT;
      details.push({ 
        label: 'Logistique/Installation par Technicien Certifié', 
        priceHT: proDeliveryPriceHT, 
        daily: false,
        displayPrice: `${priceTransformer(proDeliveryPriceHT).toFixed(0)}${suffix}`
      });


      // Options PRO (par jour) - Ajoutées aux services récurrents
      if (formData.proAnimationHours !== 'none') {
        const animationPriceHT = animationHours * 45;
        dailyServicesHT += animationPriceHT;
        
        const animationDescription = isShortAnimation 
            ? `Animation ${animationHours}h (Réalisée par le Technicien)` 
            : `Animation ${animationHours}h (Animatrice dédiée)`;
            
        details.push({ 
            label: animationDescription, 
            priceHT: animationPriceHT, 
            daily: true,
            displayPrice: `+${priceTransformer(animationPriceHT).toFixed(0)}${suffix}` 
        });
      }

      if (formData.proFondIA) {
        const fondIAPriceHT = 50;
        dailyServicesHT += fondIAPriceHT;
        details.push({ 
            label: 'Fond IA (personnalisé)', 
            priceHT: fondIAPriceHT, 
            daily: true,
            displayPrice: `+${priceTransformer(fondIAPriceHT).toFixed(0)}${suffix}` 
        });
      }

      if (formData.proRGPD) {
        const rgpdPriceHT = 50;
        dailyServicesHT += rgpdPriceHT;
        details.push({ 
            label: 'Conformité RGPD', 
            priceHT: rgpdPriceHT, 
            daily: true,
            displayPrice: `+${priceTransformer(rgpdPriceHT).toFixed(0)}${suffix}` 
        });
      }

      // Impressions (Formule de dégressivité spécifique - Coût unique)
      if (formData.proImpressions > 1) {
        const NbPrint = formData.proImpressions;
        const NbJoursTotalOption = NbJours * (NbPrint - 1);
        
        const PrixBaseImpression = 80;
        const PrixPlancherImpression = 50;
        
        // Formule d'impression: TRUNC((80-50)*10*(1-0,9^N) + 50*N)
        const impressionPriceHT = Math.trunc(
            (PrixBaseImpression - PrixPlancherImpression) * 10 * (1 - Math.pow(0.9, NbJoursTotalOption)) + 
            PrixPlancherImpression * NbJoursTotalOption
        );
        
        oneTimeCostsHT += impressionPriceHT; 
        
        details.push({
          label: `${NbPrint} impressions par cliché (Total ${NbJours}j)`,
          priceHT: impressionPriceHT,
          daily: false, 
          displayPrice: `+${priceTransformer(impressionPriceHT).toFixed(0)}${suffix}`,
        });
      }
      
    } else if (formData.needType === '360') {
      const basePriceHT = 715;
      const deliveryPriceHT = 150;
      dailyServicesHT += basePriceHT + deliveryPriceHT; // Total journalier est de 865€ HT

      details.push({ label: 'Photobooth 360 (base journalière)', priceHT: basePriceHT, daily: true, displayPrice: `${priceTransformer(basePriceHT).toFixed(0)}${suffix}` });
      details.push({ label: 'Livraison 360 (incluse)', priceHT: deliveryPriceHT, daily: true, displayPrice: `+${priceTransformer(deliveryPriceHT).toFixed(0)}${suffix}` });
    }

    // --- 2. Application de l'Outil Template (Coût unique, seulement ECO & PRO) ---
    if (formData.templateTool && (formData.needType === 'eco' || formData.needType === 'pro')) {
        let templatePriceHT = formData.isPro ? 60 : 0;
        let templateDisplay = formData.isPro ? `${priceTransformer(templatePriceHT).toFixed(0)}${suffix}` : 'Gratuit (Offert)';
        
        oneTimeCostsHT += templatePriceHT;
        details.push({ label: 'Outil Template Professionnel', priceHT: templatePriceHT, daily: false, displayPrice: templateDisplay });
    }


    // --- 3. Calcul du coût total de la prestation récurrente après dégressivité ---
    totalServicesBeforeFormula = dailyServicesHT * duration;

    if (formData.needType === 'pro') {
        // --- LOGIQUE CORRIGÉE POUR LE STARBOOTH SIGNATURE (BASE 480€) ---
        const PBaseJour_Only = BASE_PRICE_PRO_HT; // 480
        const PPlancherJour_Only = PLANCHER_PRICE_PRO_HT_USER_FIX; // 79 (Correction de l'utilisateur)

        // A. Calcul de la partie dégressive pour la base 480€
        // TRUNC((PBase - PPlancher)*10*(1 - 0.9^N) + PPlancher*N)
        const baseDegressivePart = (PBaseJour_Only - PPlancherJour_Only) * 10 * (1 - Math.pow(0.9, duration)) ; 
        const basePlancherPart = PPlancherJour_Only * duration;
        const totalBaseDegressive = baseDegressivePart + basePlancherPart; // 1323.71 HT pour 3 jours.
        
        const totalBaseDegressedHT = Math.trunc(totalBaseDegressive); 

        // B. Coût total des options journalières (Animation, Fond IA, RGPD) - NON dégressives
        const dailyOptionsHT = dailyServicesHT - BASE_PRICE_PRO_HT;
        const totalDailyOptionsHT = dailyOptionsHT * duration; 
        
        totalServicesHT_Degressed = totalBaseDegressedHT + totalDailyOptionsHT;

    } else if (formData.needType === 'eco' || formData.needType === '360') {
        // --- LOGIQUE DEGRESSIVE STANDARD (Appliquée à l'ensemble du coût journalier) ---
        if (duration <= 1 || dailyServicesHT === 0) {
            totalServicesHT_Degressed = dailyServicesHT;
        } else {
            const prixPlancherJour = dailyServicesHT * PRIX_PLANCHER_RATIO;
            const prixBaseJour = dailyServicesHT;
            
            // TRUNC((PrixBase - PrixPlancherJour)*10*(1 - 0.9^NbJours) + PrixPlancherJour*NbJours)
            const totalHTCalc = (
                (prixBaseJour - prixPlancherJour) * 10 * (1 - Math.pow(0.9, NbJours)) +
                prixPlancherJour * NbJours
            );
            totalServicesHT_Degressed = Math.trunc(totalHTCalc);
        }
    }


    // Total HT final
    const totalHT = totalServicesHT_Degressed + oneTimeCostsHT;

    return { 
        totalHT: totalHT, 
        totalServicesHT: totalServicesHT_Degressed, // Coût dégressif des services
        oneTimeCostsHT: oneTimeCostsHT, // Coûts uniques
        baseDayPriceHT: dailyServicesHT, // Coût des services pour 1 jour (avant dégressivité)
        totalServicesBeforeFormula: totalServicesBeforeFormula, // Coût sans dégressivité
        details: details, 
        displayTTC: displayTTC,
        priceSuffix: displayTTC ? 'TTC' : 'HT'
    };
  }, [formData, TVA_RATE, PRIX_PLANCHER_RATIO, BASE_PRICE_PRO_HT, PLANCHER_PRICE_PRO_HT_USER_FIX]); 

  const handleNext = () => {
    if (isStepValid() && currentStep < totalSteps) {
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

  const handleSubmit = () => {
    const pricing = calculatePrice;
    const finalPrice = pricing.displayTTC ? (pricing.totalHT * TVA_RATE).toFixed(2) : pricing.totalHT.toFixed(2);
    const priceSuffix = pricing.displayTTC ? 'TTC' : 'HT';
    
    showMessage(`Devis envoyé à ${formData.email}!\nTotal: ${finalPrice}€ ${priceSuffix}`);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        // Validation simple: le nom, l'email et le numéro de téléphone doivent être présents et suffisants
        if (!formData.fullName || !formData.email || !formData.phone || formData.phone.replace(/\D/g, '').length < 9)
          return false;
        if (
          formData.isPro &&
          (!formData.companyName ||
            !formData.billingStreet ||
            !formData.billingPostal ||
            !formData.billingCity)
        )
          return false;
        return true;
      case 2:
        return (
          formData.deliveryStreet &&
          formData.deliveryPostal &&
          formData.deliveryCity &&
          formData.eventDate &&
          formData.needType &&
          formData.eventDuration >= 1
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
        {/* NOUVEAU: Utilisation du composant PhoneInputField amélioré */}
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
                // Réinitialiser les options spécifiques si on passe de Pro à Particulier ou vice-versa
                needType: '',
                ecoModel: '',
                ecoTransport: 'pickup', // Réinitialiser à Retrait
                proAnimationHours: 'none',
                proFondIA: false,
                proRGPD: false,
                proImpressions: 1,
                templateTool: false, // Réinitialiser l'option template aussi
            });
            // Retourner à l'étape 2 si on change de statut pour reconfigurer le besoin
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
            <label className='block text-sm font-semibold text-gray-800 mb-2'>
              Adresse de facturation <span className='text-red-500'>*</span>
            </label>
            
            {/* Conversion des inputs manuels en InputField pour éviter la perte de focus */}
            <InputField
                isAddressField={true}
                value={formData.billingStreet}
                onChange={e => setFormData({ ...formData, billingStreet: e.target.value })}
                placeholder='Rue et numéro'
                required
            />
            <div className='grid grid-cols-2 gap-3 mt-3'>
              <InputField
                isAddressField={true}
                value={formData.billingPostal}
                onChange={e => setFormData({ ...formData, billingPostal: e.target.value })}
                placeholder='Code postal'
                required
              />
              <InputField
                isAddressField={true}
                value={formData.billingCity}
                onChange={e => setFormData({ ...formData, billingCity: e.target.value })}
                placeholder='Ville'
                required
              />
            </div>
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
        <label className='block text-sm font-semibold text-gray-800 mb-2'>
          Adresse de livraison <span className='text-red-500'>*</span>
        </label>
        {/* Conversion des inputs manuels en InputField pour éviter la perte de focus */}
        <InputField
            isAddressField={true}
            value={formData.deliveryStreet}
            onChange={e => setFormData({ ...formData, deliveryStreet: e.target.value })}
            placeholder='Rue et numéro'
            required
        />
        <div className='grid grid-cols-2 gap-3 mt-3'>
          <InputField
            isAddressField={true}
            value={formData.deliveryPostal}
            onChange={e => setFormData({ ...formData, deliveryPostal: e.target.value })}
            placeholder='Code postal'
            required
          />
          <InputField
            isAddressField={true}
            value={formData.deliveryCity}
            onChange={e => setFormData({ ...formData, deliveryCity: e.target.value })}
            placeholder='Ville'
            required
          />
        </div>
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
            className={`p-6 border-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
              formData.needType === 'eco'
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
            className={`p-6 border-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
              formData.needType === 'pro'
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
            onClick={() => setFormData({ ...formData, needType: '360', templateTool: false })} // Désactive l'outil template pour 360
            className={`p-6 border-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
              formData.needType === '360'
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
    
    // Récupérer le suffixe de prix (HT ou TTC)
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
                        <Wand2 className='w-4 h-4'/>
                        <span>Outil Template (Personnalisation Avancée)</span>
                    </label>
                    <span className='text-base font-bold text-indigo-600'>{displayPrice}</span>
                </div>
                {/* Description du template */}
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
        { id: 'illimite', name: 'StarBooth Pro - Illimité', priceHT: 412, desc: "L'ultra haut de gamme m'iniaturisé. Impressions illimitées. Parfait pour les grands événements." },
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
                  className={`w-full p-4 border-2 rounded-xl transition-all text-left flex flex-col ${
                    formData.ecoModel === model.id
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
                    className={`w-full p-4 border-2 rounded-xl transition-all text-left flex justify-between items-center ${
                    formData.ecoTransport === 'pickup'
                        ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-100'
                        : 'border-gray-300 bg-white hover:border-blue-400 shadow-sm'
                    }`}
                >
                    <span className='font-medium text-gray-800 flex items-center'><Truck className='w-4 h-4 mr-2'/> Retrait à Arcueil (94)</span>
                    <span className='text-xl font-extrabold text-green-600'>Gratuit</span>
                </button>
                
                {/* Livraison Standard (Mise en service par vos soins) */}
                <button
                    type='button'
                    onClick={() => setFormData({ ...formData, ecoTransport: 'delivery_nosetup' })}
                    className={`w-full p-4 border-2 rounded-xl transition-all text-left flex flex-col ${
                    formData.ecoTransport === 'delivery_nosetup'
                        ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-100'
                        : 'border-gray-300 bg-white hover:border-blue-400 shadow-sm'
                    }`}
                >
                    <div className='flex justify-between items-center w-full'>
                        <span className='font-medium text-gray-800 flex items-center'><Truck className='w-4 h-4 mr-2'/> Livraison Standard (Mise en service par vos soins)</span>
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
                    className={`w-full p-4 border-2 rounded-xl transition-all text-left flex justify-between items-center ${
                    formData.ecoTransport === 'delivery_withsetup'
                        ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-100'
                        : 'border-gray-300 bg-white hover:border-blue-400 shadow-sm'
                    }`}
                >
                    <span className='font-medium text-gray-800 flex items-center'><Truck className='w-4 h-4 mr-2'/> Livraison + Mise en service par le livreur</span>
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
      
      const impressionPriceHT_Base = 80;
      const impressionPriceDisplay_Base = priceSuffix === 'TTC' ? `+${(impressionPriceHT_Base * TVA_RATE).toFixed(0)}€ TTC` : `+${impressionPriceHT_Base}€ HT`;
      
      const animationPriceHT = 45;
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
            Configuration - StarBooth Signature (Prix en {priceSuffix}) 
          </h2>

          <div className='bg-blue-600 text-white p-4 rounded-xl shadow-xl'>
            <p className='text-xl font-bold'>
              Base StarBooth Signature / Jour : <span className='float-right'>{basePriceDisplay}</span>
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
              <div className='text-6xl mb-4 animate-pulse'>📸🎥</div>
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
              Livraison le <span className='font-bold'>{new Date(formData.eventDate).toLocaleDateString('fr-FR')}</span> pour une durée de <span className='font-bold text-blue-600'>{formData.eventDuration} jour(s)</span> à : {formData.deliveryCity} ({formData.deliveryPostal})
            </p>
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
                        <DollarSign className='w-5 h-5 mr-2'/>
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
      <div id="custom-alert"></div> {/* Élément pour l'alerte personnalisée */}
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
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 transform ring-2 ${
                            step <= currentStep
                                ? 'text-white scale-100 shadow-md'
                                : 'bg-gray-200 text-gray-600 ring-gray-300 scale-95'
                            }`}
                            style={step <= currentStep ? { backgroundColor: customColor, borderColor: customColor, boxShadow: `0 4px 6px -1px ${customColor}33, 0 2px 4px -2px ${customColor}33` } : {}}
                        >
                            {step < currentStep ? <Check className='w-6 h-6' /> : <Icon className='w-6 h-6' />}
                        </div>
                        <span className={`mt-2 text-sm font-medium transition-colors ${
                            step <= currentStep ? 'font-bold' : 'text-gray-500'
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
            )})}
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
                className={`px-8 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 shadow-md ${
                  isStepValid()
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