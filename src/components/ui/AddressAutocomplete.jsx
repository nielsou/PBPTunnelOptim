import React, { useEffect, useRef, useState } from 'react';

export const AddressAutocomplete = ({ label, onAddressSelect, defaultValue, required = false, placeholder = "Entrez une adresse..." }) => {
  const [inputValue, setInputValue] = useState(defaultValue || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // État visuel pour bloquer l'input tant que Google n'est pas prêt
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  const serviceRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    let attempts = 0; // Petit compteur pour le debug

    // 1. La fonction qui tente d'accrocher le wagon Google Maps
    const tryInitGoogle = () => {
      attempts++;

      // On vérifie si l'objet global injecté par WordPress est enfin là
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log(`✅ [Autocomplete] API Google Maps trouvée après ${attempts} tentative(s) !`);

        serviceRef.current = new window.google.maps.places.AutocompleteService();
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        setIsGoogleReady(true);
        return true; // C'est bon, on a réussi !
      }

      // Log affiché tant que ça rate
      console.log(`⏳ [Autocomplete] En attente du script Google du parent... (tentative ${attempts})`);
      return false;
    };

    console.log("🚀 [Autocomplete] Démarrage de l'initialisation...");

    // 2. On essaie une première fois au montage
    if (tryInitGoogle()) return;

    // 3. Si ça rate (WordPress est lent), on harcèle toutes les 200ms
    const intervalId = setInterval(() => {
      if (tryInitGoogle()) {
        clearInterval(intervalId); // On arrête de chercher dès qu'on le trouve
      }
    }, 200);

    // Sécurité : on nettoie l'intervalle si on quitte la page
    return () => clearInterval(intervalId);
  }, []);

  const fetchPredictions = (input) => {
    // Sécurité absolue : si le service n'est pas là, on coupe tout.
    if (!input || input.length < 3 || !serviceRef.current) {
      setSuggestions([]);
      return;
    }

    serviceRef.current.getPredictions({
      input,
      sessionToken: sessionTokenRef.current,
      componentRestrictions: { country: "fr" },
      types: ["address"]
    }, (predictions) => {
      setSuggestions(predictions || []);
      setShowDropdown(true);
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchPredictions(value);
    }, 200);
  };

  const handleSelectPlace = (prediction) => {
    setInputValue(prediction.description);
    setShowDropdown(false);

    // Utilisation du Geocoder classique (plus robuste avec les vieilles versions de WP)
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status === "OK" && results[0]) {
        const addr = results[0];
        const getComp = (type) => addr.address_components.find(c => c.types.includes(type))?.long_name || "";

        const result = {
          fullAddress: addr.formatted_address,
          street: `${getComp('street_number')} ${getComp('route')}`.trim(),
          city: getComp('locality'),
          postal: getComp('postal_code'),
          lat: addr.geometry.location.lat(),
          lng: addr.geometry.location.lng()
        };

        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        onAddressSelect(result);
      }
    });
  };

  return (
    <div className="mb-4 relative">
      <label className='block text-sm font-semibold text-gray-800 mb-2'>
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        // Indication visuelle si ça mouline
        placeholder={isGoogleReady ? placeholder : "Connexion à Google Maps en cours..."}
        className={`w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition text-gray-900 ${!isGoogleReady ? 'bg-gray-100 cursor-wait opacity-70' : ''}`}
        required={required}
        disabled={!isGoogleReady} // On empêche de taper dans le vide
      />

      {/* Le z-[100] force l'affichage par dessus les autres éléments de ton interface */}
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-[100] w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-xl max-h-60 overflow-auto">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onClick={() => handleSelectPlace(s)}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b last:border-none"
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};