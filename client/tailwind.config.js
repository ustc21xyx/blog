/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        anime: {
          pink: {
            50: '#fef7f7',
            100: '#fdedef',
            200: '#fbd9dc',
            300: '#f7b7bd',
            400: '#f28a95',
            500: '#ea5f71',
            600: '#d93851',
            700: '#b72b42',
            800: '#99253e',
            900: '#82223b',
          },
          purple: {
            50: '#faf8ff',
            100: '#f3efff',
            200: '#e9e2ff',
            300: '#d6c6ff',
            400: '#bc9eff',
            500: '#a071ff',
            600: '#8b49ff',
            700: '#7b2eff',
            800: '#6820e0',
            900: '#561bb8',
          },
          blue: {
            50: '#eff9ff',
            100: '#daf2ff',
            200: '#bee8ff',
            300: '#91dbff',
            400: '#5dc4ff',
            500: '#37a7ff',
            600: '#2188f5',
            700: '#1a6ee1',
            800: '#1c58b6',
            900: '#1e4b8f',
          },
          yellow: {
            50: '#fffbeb',
            100: '#fef3c7',
            300: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
          },
          green: {
            50: '#ecfdf5',
            100: '#d1fae5',
            300: '#6ee7b7',
            500: '#10b981',
            600: '#059669',
          },
          red: {
            50: '#fef2f2',
            100: '#fee2e2',
            300: '#fca5a5',
            500: '#ef4444',
            600: '#dc2626',
          },
        },
        dark: {
          bg: '#0a0a0f',
          card: '#1a1a2e',
          border: '#2d2d44',
        },
        kawaii: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        }
      },
      fontFamily: {
        'anime': ['Poppins', 'Noto Sans SC', 'sans-serif'],
        'heading': ['Nunito', 'Noto Sans SC', 'sans-serif'],
        'kawaii': ['"Comic Neue"', 'Poppins', 'Noto Sans SC', 'cursive'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'bounce-slow': 'bounce 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'heart-beat': 'heart-beat 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 5px #a071ff, 0 0 10px #a071ff, 0 0 15px #a071ff',
            filter: 'brightness(1)'
          },
          '100%': { 
            boxShadow: '0 0 10px #a071ff, 0 0 20px #a071ff, 0 0 30px #a071ff',
            filter: 'brightness(1.1)'
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        'heart-beat': {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1)' },
          '75%': { transform: 'scale(1.05)' },
        },
      },
      backgroundImage: {
        'gradient-anime': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-card': 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
        'gradient-kawaii': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-cherry': 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
      },
      boxShadow: {
        'anime': '0 10px 25px -3px rgba(160, 113, 255, 0.1), 0 4px 6px -2px rgba(160, 113, 255, 0.05)',
        'anime-lg': '0 25px 50px -12px rgba(160, 113, 255, 0.25)',
        'kawaii': '0 4px 6px -1px rgba(244, 63, 94, 0.1), 0 2px 4px -1px rgba(244, 63, 94, 0.06)',
        'glow-pink': '0 0 20px rgba(244, 63, 94, 0.3)',
        'glow-purple': '0 0 20px rgba(160, 113, 255, 0.3)',
        'glow-blue': '0 0 20px rgba(55, 167, 255, 0.3)',
      },
      borderRadius: {
        'kawaii': '20px',
        'super': '2rem',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}