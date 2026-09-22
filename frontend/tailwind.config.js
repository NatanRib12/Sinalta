/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grafite: '#14171C',
        papel: '#F5F2EC',
        sinal: '#FF5B2E',
        verde: '#1F6F5C',
        cinza: '#8C9096',
      },
    },
  },
  plugins: [],
}