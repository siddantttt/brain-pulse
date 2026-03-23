/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#07090f',
        surface:  '#111111',
        'surface-2': '#181818',
        border:   '#1e1e1e',
        accent:   '#4f9eff',
        'accent-dim': 'rgba(79,158,255,0.08)',
      },
    },
  },
  plugins: [],
}
