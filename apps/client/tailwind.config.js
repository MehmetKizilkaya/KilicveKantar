/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Kılıç ve Kantar oyun renkleri
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        stone: {
          850: '#1c1917',
          950: '#0c0a09',
        },
        game: {
          bg: '#0f0e0d',
          surface: '#1a1815',
          border: '#2d2926',
          accent: '#c9a227',
          danger: '#dc2626',
          success: '#16a34a',
          info: '#2563eb',
          text: '#e7e0d4',
          muted: '#9c8f7a',
        },
      },
      fontFamily: {
        game: ['Georgia', 'serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'parchment': "url('/textures/parchment.png')",
      },
    },
  },
  plugins: [],
};
