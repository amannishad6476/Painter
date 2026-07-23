/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff8f0',
          100: '#ffeedb',
          500: '#f97316', // Vibrant Amber/Orange
          600: '#ea580c',
          700: '#c2410c',
        },
        royal: {
          500: '#3b82f6',
          600: '#2563eb',
          800: '#1e40af',
          900: '#1e1b4b',
        },
        darkbg: '#0f172a',
        darkcard: '#1e293b'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
