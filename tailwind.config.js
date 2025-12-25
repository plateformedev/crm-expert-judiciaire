/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Couleurs du design system CRM Expert - Charte graphique professionnelle juridique
      colors: {
        // Couleur primaire - Bleu professionnel/juridique
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',  // Bleu principal
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A5F',  // Bleu nuit (header)
          950: '#172554',
        },
        // Accent - Or discret pour highlights financiers
        accent: {
          50: '#FDF8E8',
          100: '#F5E6B3',
          200: '#E8D48A',
          300: '#D4B85C',
          400: '#C9A227',
          500: '#B8860B',  // DarkGoldenrod - sophistiqué
          600: '#9A7209',
          700: '#7A5A07',
          800: '#5C4305',
          900: '#3D2D03',
        },
        // Alias gold pour compatibilité ascendante
        gold: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A5F',
        },
        // Neutres - Gris élégants
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
        // Sémantiques
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#059669',  // Vert émeraude
          600: '#047857',
          700: '#065F46',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#D97706',  // Orange ambré
          600: '#B45309',
          700: '#92400E',
        },
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
        },
        info: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          500: '#0891B2',
          600: '#0E7490',
          700: '#155E75',
        },
        // Statuts expertise
        expertise: {
          nouveau: '#3B82F6',      // primary-500
          'en-cours': '#2563EB',   // primary-600
          'pre-rapport': '#D97706', // warning-500
          termine: '#059669',       // success-500
          archive: '#6B7280',       // neutral-500
        },
        // Garanties construction
        garantie: {
          gpa: '#059669',          // success-500
          biennale: '#D97706',     // warning-500
          decennale: '#DC2626',    // danger-500
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
        'primary': '0 4px 14px 0 rgba(59, 130, 246, 0.25)',  // Ombre bleu
        'gold': '0 4px 14px 0 rgba(59, 130, 246, 0.25)',     // Alias pour compatibilité
        'accent': '0 4px 14px 0 rgba(184, 134, 11, 0.25)',   // Ombre or discret
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
        '.badge-primary': {
          backgroundColor: theme('colors.primary.100'),
          color: theme('colors.primary.700'),
        },
        '.badge-gold': {
          backgroundColor: theme('colors.primary.100'),
          color: theme('colors.primary.700'),
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
          backgroundColor: theme('colors.primary.600'),
          color: 'white',
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.xl'),
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: theme('colors.primary.700'),
            boxShadow: theme('boxShadow.primary'),
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
            borderColor: theme('colors.primary.500'),
            boxShadow: `0 0 0 3px ${theme('colors.primary.100')}`,
          },
        },
      });
    },
  ],
};
