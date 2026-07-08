/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carrot: {
          DEFAULT: '#FF751F',
          light: '#FF8F4D',
          dark: '#E05F0F',
        },
        berry: {
          DEFAULT: '#9C27B0',
          light: '#BA68C8',
          dark: '#7B1FA2',
        },
        mint: {
          DEFAULT: '#4ADE80',
          light: '#86EFAC',
          dark: '#22C55E',
        },
        sunny: {
          DEFAULT: '#FFEB3B',
          light: '#FFF176',
          dark: '#FBC02D',
        },
        skyblue: {
          DEFAULT: '#38BDF8',
          light: '#7DD3FC',
          dark: '#0284C7',
        },
        lavender: {
          DEFAULT: '#C084FC',
          light: '#D8B4FE',
          dark: '#A855F7',
        },
        softpink: {
          DEFAULT: '#F472B6',
          light: '#FBCFE8',
          dark: '#EC4899',
        }
      },
      animation: {
        'hop-bounce': 'hop 0.6s ease-in-out infinite',
        'shimmer-glow': 'shimmer 2s linear infinite',
        'sparkle-spin': 'spin 12s linear infinite',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'wiggle': 'wiggle 0.3s ease-in-out infinite',
      },
      keyframes: {
        hop: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
      boxShadow: {
        'carrot': '0 0 15px rgba(255, 117, 31, 0.4)',
        'berry': '0 0 15px rgba(156, 39, 176, 0.4)',
        'mint': '0 0 15px rgba(74, 222, 128, 0.4)',
        'skyblue': '0 0 15px rgba(56, 189, 248, 0.4)',
      }
    },
  },
  plugins: [],
}
