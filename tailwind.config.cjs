// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        unlock: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-180deg)' }
        },
        'particle-1': {
          '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
          '100%': { transform: 'translate(-150%, -150%) scale(2)', opacity: 0 }
        },
        'particle-2': {
          '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
          '100%': { transform: 'translate(50%, -150%) scale(2)', opacity: 0 }
        },
        'particle-3': {
          '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
          '100%': { transform: 'translate(150%, 50%) scale(2)', opacity: 0 }
        },
        'particle-4': {
          '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
          '100%': { transform: 'translate(-100%, 100%) scale(2)', opacity: 0 }
        },
        'particle-5': {
          '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
          '100%': { transform: 'translate(0%, 150%) scale(2)', opacity: 0 }
        },
        'ripple-1': {
          '0%': { transform: 'scale(0.8)', opacity: 1 },
          '100%': { transform: 'scale(1.5)', opacity: 0 }
        },
        'ripple-2': {
          '0%': { transform: 'scale(0.8)', opacity: 0.8 },
          '50%': { opacity: 0.5 },
          '100%': { transform: 'scale(2)', opacity: 0 }
        },
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '50%': { opacity: 0.5 },
          '100%': { transform: 'scale(1.3)', opacity: 0 }
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)'
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)'
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)'
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)'
          }
        },
        'pulse-slow': {
          '0%, 100%': {
            opacity: 1
          },
          '50%': {
            opacity: 0.5
          }
        },
        'bounce-slow': {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          }
        },
        'slide-up': {
          '0%': {
            transform: 'translateY(20px)',
            opacity: 0
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: 1
          }
        },
        'rotate-y-6': {
          '0%': {
            transform: 'rotateY(0deg)'
          },
          '100%': {
            transform: 'rotateY(6deg)'
          }
        },
        'bg-pulse': {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        },
      },
      animation: {
        'unlock': 'unlock 1s ease-in-out forwards',
        'particle-1': 'particle-1 1s ease-out forwards',
        'particle-2': 'particle-2 1s ease-out forwards 0.1s',
        'particle-3': 'particle-3 1s ease-out forwards 0.2s',
        'particle-4': 'particle-4 1s ease-out forwards 0.1s',
        'particle-5': 'particle-5 1s ease-out forwards 0.2s',
        'ripple-1': 'ripple-1 1s ease-out forwards',
        'ripple-2': 'ripple-2 1.5s ease-out forwards 0.2s',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'blob': 'blob 7s infinite',
        'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce-slow 1.5s infinite',
        'slide-up': 'slide-up 1s ease-out forwards',
        'rotate-y-6': 'rotate-y-6 1s ease-out forwards',
        'bg-pulse': 'bg-pulse 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear'
      },
      transitionDelay: {
        '2000': '2000ms',
        '4000': '4000ms',
      }
    },
  },
  plugins: [],
}