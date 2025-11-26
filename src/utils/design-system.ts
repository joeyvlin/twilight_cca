import designSystem from '../../design-system.json';

/**
 * Design System Utilities
 * Provides type-safe access to design system tokens
 */

export type DesignSystem = typeof designSystem;

// Color utilities
export const colors = {
  primary: designSystem.colors.primary,
  accent: designSystem.colors.accent,
  neutral: designSystem.colors.neutral,
  semantic: designSystem.colors.semantic,
  background: designSystem.colors.background,
  text: designSystem.colors.text,
  border: designSystem.colors.border,
} as const;

// Typography utilities
export const typography = {
  fontFamily: designSystem.typography.fontFamily,
  fontSize: designSystem.typography.fontSize,
  fontWeight: designSystem.typography.fontWeight,
  letterSpacing: designSystem.typography.letterSpacing,
} as const;

// Spacing utilities
export const spacing = designSystem.spacing;

// Border radius utilities
export const borderRadius = designSystem.borderRadius;

// Shadow utilities
export const shadows = designSystem.shadows;

// Transition utilities
export const transitions = designSystem.transitions;

// Breakpoint utilities
export const breakpoints = designSystem.breakpoints;

// Component utilities
export const components = designSystem.components;

/**
 * Get a color value from the design system
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let value: any = designSystem.colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      throw new Error(`Color path "${path}" not found in design system`);
    }
  }
  
  return value as string;
}

/**
 * Get a spacing value from the design system
 */
export function getSpacing(size: keyof typeof designSystem.spacing): string {
  return designSystem.spacing[size];
}

/**
 * Get a border radius value from the design system
 */
export function getBorderRadius(size: keyof typeof designSystem.borderRadius): string {
  return designSystem.borderRadius[size];
}

/**
 * Get a transition property from the design system
 */
export function getTransition(property: keyof typeof designSystem.transitions.properties): string {
  return designSystem.transitions.properties[property];
}

export default designSystem;

