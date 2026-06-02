/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // California DMV-inspired palette
        dmv: {
          blue: '#0b3d6b',
          lightblue: '#1761a0',
          gold: '#fdb913',
          gray: '#f4f6f8',
        },
      },
    },
  },
  plugins: [],
}
