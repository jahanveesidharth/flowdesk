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
          800: '#941f10',
          900: '#781d11',
        },
        desk: {
          available: '#22c55e',
          occupied: '#ef4444',
          reserved: '#f59e0b',
          maintenance: '#6b7280',
          selected: '#3b82f6',
        },
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

