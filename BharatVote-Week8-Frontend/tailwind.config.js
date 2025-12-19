/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Swiss spa-inspired monochromatic palette
        slate: {
          25: '#fcfcfd',
          50: '#f8fafc',
          100: '#f1f5f9',
          150: '#e8f0f7',
          200: '#e2e8f0',
          250: '#dce4ef',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#020617',
        },
        // Premium accent colors
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
        'elegant': '0 4px 20px -2px rgb(0 0 0 / 0.08)',
        'premium': '0 8px 30px -4px rgb(0 0 0 / 0.12)',
      },
    },
  },
  plugins: [],
}


