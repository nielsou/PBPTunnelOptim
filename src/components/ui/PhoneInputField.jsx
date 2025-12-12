import React, { useState, useEffect } from 'react';
import { COUNTRIES } from '../../constants';

// Fonction de masquage
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

// Fonction de validation
const isValid = (currentInputValue, selectedCountry) => {
    const enteredDigits = (currentInputValue.match(/\d/g) || []).length;
    return enteredDigits === selectedCountry.requiredDigits;
};


export const PhoneInputField = ({ value, onChange }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [inputValue, setInputValue] = useState('');

    // Synchronisation de la valeur initiale/externe
    useEffect(() => {
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


    const handleInputChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');

        const maskedValue = applyMask(rawValue, selectedCountry.mask);
        setInputValue(maskedValue);

        // Préparer la valeur complète pour le formulaire parent
        if (isValid(maskedValue, selectedCountry)) {
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

    // Déterminer l'état visuel pour le rendu
    const isCurrentValid = isValid(inputValue, selectedCountry);
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