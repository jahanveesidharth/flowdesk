/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff3ee',
          100: '#ffe4d5',
          200: '#ffc5a8',
          300: '#ff9d72',
          400: '#ff6a3a',
          500: '#f04a16',
          600: '#e03208',
          700: '#b92509',
          750: '#ab230b',
          800: '#941f10',
          850: '#861e10',
          900: '#781d11',
          950: '#4d0f0c',
        },
        desk: {
          available: '#22c55e',
          occupied: '#ef4444',
          reserved: '#f59e0b',
          maintenance: '#6b7280',
          selected: '#3b82f6',
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
        
        'orange-850': '#8b3012',
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
    },
  },
  plugins: [],
}

