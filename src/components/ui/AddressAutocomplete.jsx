import React, { useEffect, useRef, useState } from 'react';

export const AddressAutocomplete = ({ label, onAddressSelect, defaultValue, required = false, placeholder = "Entrez une adresse..." }) => {
  const [inputValue, setInputValue] = useState(defaultValue || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const serviceRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    const initService = async () => {
      try {
        // Tenter la méthode moderne
        if (window.google?.maps?.importLibrary) {
          await window.google.maps.importLibrary("places");
        }

        // Si la librairie est déjà là ou chargée via importLibrary
        if (window.google?.maps?.places) {
          serviceRef.current = new window.google.maps.places.AutocompleteService();
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        }
      } catch (e) {
        console.error("Erreur chargement Places Library", e);
      }
    };
    initService();
  }, []);

  const fetchPredictions = (input) => {
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

    // --- LOGIQUE DE DEBOUNCE ---
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchPredictions(value);
    }, 200); // Attendre 300ms après la dernière frappe
  };

  // src/components/ui/AddressAutocomplete.jsx

  const handleSelectPlace = async (prediction) => {
    setInputValue(prediction.description);
    setShowDropdown(false);

    const { Place } = await window.google.maps.importLibrary("places");
    const placeDetails = new Place({ id: prediction.place_id });

    await placeDetails.fetchFields({
      fields: ["addressComponents", "formattedAddress", "location"]
    });

    const components = placeDetails.addressComponents;

    const getComp = (type) => {
      const found = components.find(c => c.types.includes(type));
      return found?.longText || "";
    };

    const result = {
      fullAddress: placeDetails.formattedAddress,
      street: `${getComp('street_number')} ${getComp('route')}`.trim(),
      city: getComp('locality'),
      postal: getComp('postal_code'),
      lat: placeDetails.location.lat(),
      lng: placeDetails.location.lng()
    };

    console.log("✅ Objet final (Test extraction):", result);

    sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    onAddressSelect(result);
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
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition text-gray-900"
        required={required}
      />

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-xl max-h-60 overflow-auto">
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