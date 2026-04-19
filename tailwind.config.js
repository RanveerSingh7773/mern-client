/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gold-light': '#E2C2C6', // Light blush
        'gold-DEFAULT': '#B76E79', // Rose gold
        'gold-dark': '#8E4A55', // Deep rose
        'dark-light': '#3A3A3A',
        'dark-DEFAULT': '#1A1A1A',
        'dark-dark': '#0f0f0f',
        'light-bg': '#FFFDFC', // Extremely subtle blush-white
        'light-surface': '#FFFFFF',
        'text-main': '#2A2325', // Warm dark charcoal
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
