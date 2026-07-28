/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'mtex-red': '#ff0000',
        'mtex-darkblue': '#003399',
        'mtex-lightblue': '#33ccff',
      },
      fontFamily: {
        heading: ['Oswald', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};