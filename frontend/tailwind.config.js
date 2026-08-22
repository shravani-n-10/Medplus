/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        med: {
          bg: '#C8AD8D',         // Image 2: Warm Tan / Camel Beige
          bgLight: '#DFCCB7',    // Light Cream
          cardDark: '#2E1200',   // Image 1: Dark Bronze / Mocha
          cardTeal: '#4A1E00',   // Image 1: Deep Espresso
          header: '#1E0A00',     // Image 1: Near-Black Dark Chocolate
          copper: '#853E04',     // Image 1: Bright Amber Brown
          copperHover: '#A34C06',
          gold: '#C27803',
          goldHover: '#D98906',
          creamText: '#F5EBE0',
          darkText: '#1E0A00'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 2.5s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        }
      }
    }
  },
  plugins: []
};
