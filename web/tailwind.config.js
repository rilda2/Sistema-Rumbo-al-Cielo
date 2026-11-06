/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta suave y elegante basada en el color de muestra #CE9172 (terracota suave / beige durazno cálido)
        blue: {
          50: '#fdfaf7',  // Beige lino / crema muy suave
          100: '#f8ece2', // Crema durazno suave
          200: '#f1d8c7', // Almendra / arena cálida
          300: '#e7c0a7', // Durazno beige suave
          400: '#dba98b', // Terracota claro suave
          500: '#ce9172', // COLOR EXACTO DE MUESTRA (#CE9172)
          600: '#bb7a5a', // Terracota suave / arcilla cálida (botones primarios)
          700: '#9f6345', // Terracota tostado elegante (degradados navbar y modales)
          800: '#835036', // Ámbar tostado suave (textos de contraste)
          900: '#683d29', // Café cálido profundo
          950: '#3d2114',
        },
        indigo: {
          50: '#fcf9f6',  // Lino claro
          100: '#f5eee6', // Crema tostada
          200: '#eadacf', // Arena suave
          300: '#dcc3b3', // Almendra tostada
          400: '#caab97', // Caramelo suave
          500: '#b59079', // Toffee suave
          600: '#9e7760', // Nogal cálido elegante (contraste en degradados)
          700: '#83604b', // Café caramelo tostado profundo
          800: '#6a4d3b', // Café tostado
          900: '#543c2e',
          950: '#2f2017',
        },
        brand: {
          50: '#fdfaf7',
          100: '#f8ece2',
          200: '#f1d8c7',
          300: '#e7c0a7',
          400: '#dba98b',
          500: '#ce9172',
          600: '#bb7a5a',
          700: '#9f6345',
          800: '#835036',
          900: '#683d29',
          950: '#3d2114',
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
