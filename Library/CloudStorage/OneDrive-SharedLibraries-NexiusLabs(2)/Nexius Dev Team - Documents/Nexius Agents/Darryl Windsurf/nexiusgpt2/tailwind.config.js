const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,css}"
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        secondary: colors.gray,
        dark: '#1e1e1e',
        'dark-secondary': '#1f2937',
        'dark-tertiary': '#374151',
      },
      transitionProperty: {
        width: 'width',
      },
    },
  },
  plugins: [],
};