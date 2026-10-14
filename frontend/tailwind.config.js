/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary, #0284c7)',
          'primary-dark': 'var(--brand-primary-dark, #0369a1)',
          secondary: 'var(--brand-secondary, #0f172a)',
          accent: 'var(--brand-accent, #f59e0b)',
          surface: 'var(--brand-surface, #ffffff)',
          'surface-dark': 'var(--brand-surface-dark, #090d16)',
        },
      },
      borderRadius: {
        brand: 'var(--brand-radius, 0.5rem)',
      },
      fontFamily: {
        brand: 'var(--brand-font, Inter, system-ui, sans-serif)',
      },
    },
  },
  plugins: [],
};
