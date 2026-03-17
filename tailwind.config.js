/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0f0f1a',
          800: '#16162a',
          700: '#1e1e3a',
        },
      },
    },
  },
  plugins: [],
}

