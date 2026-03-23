/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base
        bg:          '#0A0F1E',
        surface:     '#111827',
        'surface-2': '#1F2937',
        border:      '#1F2937',
        // Text
        'text-primary':   '#F9FAFB',
        'text-secondary': '#9CA3AF',
        // Primary accent = focus blue
        accent:      '#1B4FD8',
        'accent-dim':'rgba(27,79,216,0.1)',
        // Cognitive domain palette
        focus:  { DEFAULT: '#1B4FD8', light: '#93C5FD' },
        memory: { DEFAULT: '#16A34A', light: '#86EFAC' },
        logic:  { DEFAULT: '#CA8A04', light: '#FDE68A' },
        visual: { DEFAULT: '#0284C7', light: '#7DD3FC' },
        'math-red': { DEFAULT: '#DC2626', light: '#FCA5A5' },
      },
    },
  },
  plugins: [],
}
