/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fcfafc',
          100: '#f6f1f4',
          200: '#ebdbe4',
          300: '#dac0d2',
          400: '#c49ebc',
          500: '#aa7ca3',
          600: '#8c5f85',
          700: '#724b68',
          750: '#64415b',
          800: '#57394f',
          850: '#4b3144',
          900: '#3f2939',
          950: '#251821',
        },
        orange: {
          50: '#fcfafc',
          100: '#f6f1f4',
          200: '#ebdbe4',
          300: '#dac0d2',
          400: '#c49ebc',
          500: '#aa7ca3',
          600: '#8c5f85',
          700: '#724b68',
          750: '#64415b',
          800: '#57394f',
          850: '#4b3144',
          900: '#3f2939',
          950: '#251821',
        },
        blue: {
          50: '#fcfafc',
          100: '#f6f1f4',
          200: '#ebdbe4',
          300: '#dac0d2',
          400: '#c49ebc',
          500: '#aa7ca3',
          600: '#8c5f85',
          700: '#724b68',
          750: '#64415b',
          800: '#57394f',
          850: '#4b3144',
          900: '#3f2939',
          950: '#251821',
        },
        desk: {
          available: '#22c55e',
          occupied: '#ef4444',
          reserved: '#f59e0b',
          maintenance: '#6b7280',
          selected: '#724b68',
        },
        // Flat keys for custom extensions of standard Tailwind colors:
        'gray-150': '#eceef1',
        'gray-205': '#e2e5e9',
        'gray-250': '#dadde2',
        'gray-255': '#d5d9df',
        'gray-350': '#c1c6cf',
        'gray-405': '#9199a6',
        'gray-450': '#888f9c',
        'gray-550': '#5c6473',
        'gray-650': '#3f4856',
        'gray-655': '#3b4350',
        'gray-750': '#2b3544',
        'gray-805': '#1b2330',
        'gray-850': '#182030',
        'gray-855': '#141c2c',
        
        'green-150': '#cbfad9',
        'green-450': '#36d16f',
        
        'emerald-450': '#22c68d',
        
        'red-750': '#a91b1b',
        
        'orange-850': '#4b3144',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(10px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
      borderRadius: {
        'sm': '0.375rem',      // 6px (was 2px)
        'DEFAULT': '0.5rem',     // 8px (was 4px)
        'md': '0.75rem',       // 12px (was 6px)
        'lg': '1rem',          // 16px (was 8px)
        'xl': '1.375rem',      // 22px (was 12px)
        '2xl': '1.75rem',      // 28px (was 16px)
        '3xl': '2.5rem',       // 40px (was 24px)
      },
    },
  },
  plugins: [],
}

