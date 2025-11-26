import designSystem from './design-system.json';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: designSystem.colors.primary,
        accent: {
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
      fontFamily: designSystem.typography.fontFamily,
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
    },
  },
  plugins: [],
};
