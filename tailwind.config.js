/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}', // ⬅️ AJOUTÉ : Pour inclure tous les fichiers dans src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}