/**
 * Design System Usage Examples
 * 
 * This file demonstrates different ways to use the design system:
 * 1. Using Tailwind classes (recommended - automatically uses design system)
 * 2. Using design system utilities in TypeScript
 * 3. Using inline styles with design system values
 */

import { colors, spacing, borderRadius, getColor } from '../utils/design-system';

export function DesignSystemExample() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-text-primary mb-4">
        Design System Usage Examples
      </h2>

      {/* Example 1: Using Tailwind classes (recommended) */}
      <div className="bg-background-card-base border-border-primary rounded-lg p-6">
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          Example 1: Tailwind Classes
        </h3>
        <p className="text-text-secondary">
          Tailwind classes automatically use design system tokens via tailwind.config.js
        </p>
        <button className="mt-4 bg-accent-cyan-base text-black font-semibold px-4 py-3 rounded-lg hover:bg-accent-cyan-hover transition-colors">
          Primary Button
        </button>
      </div>

      {/* Example 2: Using design system utilities in TypeScript */}
      <div
        style={{
          backgroundColor: colors.background.card.base,
          borderColor: colors.border.primary,
          borderRadius: borderRadius.lg,
          padding: spacing['6'],
        }}
      >
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: colors.text.primary,
            marginBottom: spacing['2'],
          }}
        >
          Example 2: Inline Styles with Design System
        </h3>
        <p style={{ color: colors.text.secondary }}>
          Using design system utilities for dynamic or computed styles
        </p>
        <button
          style={{
            marginTop: spacing['4'],
            backgroundColor: colors.accent.cyan.base,
            color: colors.neutral.black,
            fontWeight: 600,
            padding: `${spacing['3']} ${spacing['4']}`,
            borderRadius: borderRadius.lg,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.accent.cyan.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.accent.cyan.base;
          }}
        >
          Dynamic Button
        </button>
      </div>

      {/* Example 3: Using helper functions */}
      <div
        className="rounded-lg p-6"
        style={{
          background: `linear-gradient(to bottom right, ${getColor('background.card.gradient.from')}, ${getColor('background.card.gradient.to')})`,
          border: `1px solid ${getColor('border.primary')}`,
        }}
      >
        <h3 className="text-xl font-semibold mb-2" style={{ color: getColor('text.primary') }}>
          Example 3: Helper Functions
        </h3>
        <p style={{ color: getColor('text.secondary') }}>
          Using getColor() and getSpacing() helper functions for nested paths
        </p>
      </div>

      {/* Example 4: Semantic colors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-success-base text-white rounded-lg p-4">
          Success Message
        </div>
        <div className="bg-error-base text-white rounded-lg p-4">
          Error Message
        </div>
        <div className="bg-warning-base text-white rounded-lg p-4">
          Warning Message
        </div>
        <div className="bg-info-base text-white rounded-lg p-4">
          Info Message
        </div>
      </div>
    </div>
  );
}

