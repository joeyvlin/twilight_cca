import designSystem from './design-system.json';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: designSystem.colors.primary,
        accent: {
          red: designSystem.colors.accent.red,
          cyan: designSystem.colors.accent.cyan,
        },
        neutral: {
          ...designSystem.colors.neutral.gray,
          black: designSystem.colors.neutral.black,
          white: designSystem.colors.neutral.white,
        },
        success: designSystem.colors.semantic.success,
        error: designSystem.colors.semantic.error,
        warning: designSystem.colors.semantic.warning,
        info: designSystem.colors.semantic.info,
        background: designSystem.colors.background,
        text: designSystem.colors.text,
        border: designSystem.colors.border,
      },
      fontFamily: {
        sans: ['Poppins', ...designSystem.typography.fontFamily.sans],
        mono: ['JetBrains Mono', ...designSystem.typography.fontFamily.mono],
      },
      fontSize: designSystem.typography.fontSize,
      fontWeight: designSystem.typography.fontWeight,
      letterSpacing: designSystem.typography.letterSpacing,
      spacing: designSystem.spacing,
      borderRadius: designSystem.borderRadius,
      boxShadow: {
        ...designSystem.shadows,
        'glow-cyan': designSystem.shadows.glow.cyan,
        'glow-cyan-lg': designSystem.shadows.glow['cyan-lg'],
      },
      transitionDuration: designSystem.transitions.duration,
      transitionTimingFunction: designSystem.transitions.easing,
      screens: designSystem.breakpoints,
      zIndex: designSystem.zIndex,
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'marquee': {
          '0%': {
            transform: 'translateX(100%)',
          },
          '100%': {
            transform: 'translateX(-100%)',
          },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'marquee': 'marquee 9s linear infinite',
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
    },
  },
  plugins: [],
};
