/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Couleurs du design system CRM Expert
      colors: {
        // Couleurs principales
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#c9a227', // Couleur principale
          600: '#b8922c',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // Neutres personnalisés
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#1a1a1a', // Noir principal
          950: '#0a0a0a',
        },
        // Statuts expertise
        expertise: {
          nouveau: '#3b82f6',      // blue-500
          'en-cours': '#c9a227',   // gold-500
          'pre-rapport': '#f59e0b', // amber-500
          termine: '#22c55e',       // green-500
          archive: '#6b7280',       // gray-500
        },
        // Garanties construction
        garantie: {
          gpa: '#22c55e',          // vert
          biennale: '#f59e0b',     // orange
          decennale: '#ef4444',    // rouge
        }
      },
      // Typographie
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      // Espacements personnalisés
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Border radius cohérents
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      // Ombres personnalisées
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'gold': '0 4px 14px 0 rgba(201, 162, 39, 0.25)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 40px rgba(0, 0, 0, 0.1)',
      },
      // Animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      // Transitions
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      // Z-index cohérents
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Backdrop blur
      backdropBlur: {
        xs: '2px',
      },
      // Aspect ratios
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
      },
    },
  },
  plugins: [
    // Plugin pour les formulaires
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    // Plugin pour la typographie
    require('@tailwindcss/typography'),
    // Note: line-clamp est maintenant intégré dans Tailwind v3.3+
    // Plugin personnalisé pour les utilitaires CRM Expert
    function({ addUtilities, addComponents, theme }) {
      // Utilitaires personnalisés
      addUtilities({
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme('colors.neutral.100'),
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme('colors.neutral.300'),
            borderRadius: '3px',
            '&:hover': {
              background: theme('colors.neutral.400'),
            },
          },
        },
      });

      // Composants réutilisables
      addComponents({
        // Carte standard
        '.card': {
          backgroundColor: 'white',
          borderRadius: theme('borderRadius.xl'),
          border: `1px solid ${theme('colors.neutral.200')}`,
          padding: theme('spacing.6'),
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: theme('boxShadow.card-hover'),
          },
        },
        // Badge
        '.badge': {
          display: 'inline-flex',
          alignItems: 'center',
          padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.full'),
          backgroundColor: theme('colors.neutral.100'),
          color: theme('colors.neutral.700'),
        },
        '.badge-gold': {
          backgroundColor: theme('colors.gold.100'),
          color: theme('colors.gold.700'),
        },
        '.badge-success': {
          backgroundColor: theme('colors.green.100'),
          color: theme('colors.green.700'),
        },
        '.badge-error': {
          backgroundColor: theme('colors.red.100'),
          color: theme('colors.red.700'),
        },
        '.badge-warning': {
          backgroundColor: theme('colors.amber.100'),
          color: theme('colors.amber.700'),
        },
        // Bouton primaire
        '.btn-primary': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          backgroundColor: theme('colors.gold.500'),
          color: 'white',
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.xl'),
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: theme('colors.gold.600'),
            boxShadow: theme('boxShadow.gold'),
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        // Input standard
        '.input': {
          width: '100%',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          border: `1px solid ${theme('colors.neutral.200')}`,
          borderRadius: theme('borderRadius.xl'),
          fontSize: theme('fontSize.sm'),
          transition: 'all 0.2s ease',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.gold.500'),
            boxShadow: `0 0 0 3px ${theme('colors.gold.100')}`,
          },
        },
      });
    },
  ],
};
