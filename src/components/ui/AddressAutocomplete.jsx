// src/components/ui/AddressAutocomplete.jsx

import React, { useEffect, useRef } from 'react';

export const AddressAutocomplete = ({ label, onAddressSelect, defaultValue, required = false }) => {
  const inputRef = useRef(null);
  const autoCompleteRef = useRef(null); 

  useEffect(() => {
    let isMounted = true;

    const initAutocomplete = async () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        try {
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
        // On demande 'address_components' pour avoir le détail précis
        fields: ["address_components", "formatted_address", "geometry"] 
      });

      autoCompleteRef.current.addListener("place_changed", () => {
        if (!isMounted) return;

        const place = autoCompleteRef.current.getPlace();
        if (!place.formatted_address) return;

        let city = '';
        let postal = '';
        let streetNumber = '';
        let route = '';

        // 🧹 EXTRACTION INTELLIGENTE GOOGLE
        if (place.address_components) {
          place.address_components.forEach(c => {
            if (c.types.includes('locality')) city = c.long_name;
            if (c.types.includes('postal_code')) postal = c.long_name;
            if (c.types.includes('street_number')) streetNumber = c.long_name;
            if (c.types.includes('route')) route = c.long_name;
          });
        }
        
        // Construction de la rue propre (Ex: "3 Rue Victor Carmignac")
        const cleanStreet = `${streetNumber} ${route}`.trim();

        const lat = place.geometry ? place.geometry.location.lat() : null;
        const lng = place.geometry ? place.geometry.location.lng() : null;

        const result = {
          fullAddress: place.formatted_address, // Pour l'affichage
          street: cleanStreet || place.formatted_address.split(',')[0], // Pour Axonaut (Rue seule)
          city: city,
          postal: postal,
          lat: lat,
          lng: lng
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