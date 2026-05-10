import plugin from 'tailwindcss/plugin';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          base: '#e0e5ec',
          text: '#4a5568',
          textDark: '#2d3748',
          textLight: '#a0aec0'
        },
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        }
      },
      boxShadow: {
        'neu-flat': '9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)',
        'neu-flat-sm': '4px 4px 8px rgba(163, 177, 198, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.5)',
        'neu-pressed': 'inset 6px 6px 10px 0 rgba(163, 177, 198, 0.7), inset -6px -6px 10px 0 rgba(255, 255, 255, 0.8)',
        'neu-pressed-sm': 'inset 4px 4px 8px rgba(163, 177, 198, 0.7), inset -4px -4px 8px rgba(255, 255, 255, 0.8)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [
    plugin(function({ addComponents, theme }) {
      addComponents({
        '.neu-flat': {
          backgroundColor: theme('colors.neu.base'),
          boxShadow: theme('boxShadow.neu-flat'),
          borderRadius: '1.5rem',
        },
        '.neu-flat-sm': {
          backgroundColor: theme('colors.neu.base'),
          boxShadow: theme('boxShadow.neu-flat-sm'),
          borderRadius: '1rem',
        },
        '.neu-pressed': {
          backgroundColor: theme('colors.neu.base'),
          boxShadow: theme('boxShadow.neu-pressed'),
          borderRadius: '1rem',
        },
        '.neu-button': {
          backgroundColor: theme('colors.neu.base'),
          boxShadow: theme('boxShadow.neu-flat'),
          borderRadius: '1rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme('boxShadow.neu-flat-sm'),
            transform: 'translateY(2px)',
          },
          '&:active, &.active': {
            boxShadow: theme('boxShadow.neu-pressed'),
            transform: 'translateY(4px)',
          }
        },
        '.neu-input': {
          backgroundColor: theme('colors.neu.base'),
          boxShadow: theme('boxShadow.neu-pressed'),
          borderRadius: '1rem',
          outline: 'none',
          color: theme('colors.neu.textDark'),
          padding: '0.75rem 1rem',
          '&::placeholder': {
            color: theme('colors.neu.textLight'),
          }
        }
      })
    })
  ],
}
