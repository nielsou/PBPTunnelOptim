import React from 'react';

export const InputField = ({ label, type = 'text', value, onChange, onBlur, placeholder, required = false }) => (
  <div>
    <label className='block text-sm font-semibold text-gray-800 mb-2'>
      {label} {required && <span className='text-red-500'>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className='w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition duration-150 ease-in-out text-gray-900 placeholder-gray-400'
      placeholder={placeholder}
      required={required}
    />
  </div>
);