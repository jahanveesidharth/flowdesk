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
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#0a0a0a',
          950: '#000000',
        },
        slate: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#0a0a0a',
          950: '#000000',
        },
        // Flat keys for custom extensions of standard Tailwind colors:
        'gray-150': '#ececec',
        'gray-205': '#e2e2e2',
        'gray-250': '#dadada',
        'gray-255': '#d5d5d5',
        'gray-350': '#c1c1c1',
        'gray-405': '#919191',
        'gray-450': '#888888',
        'gray-550': '#5c5c5c',
        'gray-650': '#3f3f3f',
        'gray-655': '#3b3b3b',
        'gray-750': '#262626',
        'gray-805': '#1a1a1a',
        'gray-850': '#0d0d0d',
        'gray-855': '#050505',
        
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

