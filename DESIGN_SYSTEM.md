# Twilight Design System

This document describes the design system for the Twilight Token Auction DEX application.

## Overview

The design system is defined in `design-system.json` and provides a centralized source of truth for all design tokens including colors, typography, spacing, shadows, transitions, and component styles.

## File Structure

- `design-system.json` - Main design system configuration file
- `src/utils/design-system.ts` - TypeScript utilities for accessing design system values
- `tailwind.config.js` - Tailwind CSS configuration that references the design system

## Usage

### In Tailwind CSS Classes

The design system is integrated with Tailwind CSS, so you can use design tokens directly in your className attributes:

```tsx
// Colors
<div className="bg-background-primary text-text-primary">
<div className="border-border-primary">
<div className="text-accent-cyan-base">

// Spacing
<div className="p-4 m-6"> // Uses spacing from design system

// Border Radius
<button className="rounded-lg"> // Uses borderRadius from design system

// Shadows
<div className="shadow-glow-cyan">
```

### In TypeScript/JavaScript

Import the design system utilities:

```tsx
import { colors, spacing, getColor, getSpacing } from './utils/design-system';

// Access colors
const primaryColor = colors.accent.cyan.base;
const backgroundColor = colors.background.primary;

// Access spacing
const padding = spacing['4']; // "1rem"

// Helper functions
const color = getColor('accent.cyan.base');
const space = getSpacing('4');
```

### In Inline Styles

```tsx
import { colors, spacing } from './utils/design-system';

<div style={{
  backgroundColor: colors.background.card.base,
  padding: spacing['6'],
  borderRadius: borderRadius.lg,
}}>
```

## Design Tokens

### Colors

#### Primary Colors
- `primary.50` through `primary.950` - Cyan color scale

#### Accent Colors
- `accent.cyan.base` - Main accent color (#22d3ee)
- `accent.cyan.light` - Light variant (#67e8f9)
- `accent.cyan.dark` - Dark variant (#06b6d4)
- `accent.cyan.hover` - Hover state (#67e8f9)

#### Neutral Colors
- `neutral.black` - Pure black (#000000)
- `neutral.white` - Pure white (#ffffff)
- `neutral.gray.50` through `neutral.gray.950` - Gray scale

#### Semantic Colors
- `success.base`, `success.light`, `success.dark` - Success states
- `error.base`, `error.light`, `error.dark` - Error states
- `warning.base`, `warning.light`, `warning.dark` - Warning states
- `info.base`, `info.light`, `info.dark` - Info states

#### Background Colors
- `background.primary` - Main background (#000000)
- `background.secondary` - Secondary background (#111827)
- `background.card.base` - Card background (#1f2937)
- `background.card.gradient.from` - Gradient start (#111827)
- `background.card.gradient.to` - Gradient end (#1f2937)
- `background.input` - Input background (#1f2937)

#### Text Colors
- `text.primary` - Primary text (#ffffff)
- `text.secondary` - Secondary text (#9ca3af)
- `text.tertiary` - Tertiary text (#6b7280)
- `text.accent` - Accent text (#22d3ee)
- `text.muted` - Muted text (#4b5563)

#### Border Colors
- `border.primary` - Primary border (#374151)
- `border.secondary` - Secondary border (#1f2937)
- `border.accent` - Accent border (#22d3ee)
- `border.hover` - Hover border (#22d3ee)

### Typography

#### Font Families
- `fontFamily.sans` - System sans-serif stack
- `fontFamily.mono` - Monospace font stack

#### Font Sizes
- `fontSize.xs` through `fontSize.6xl` - Size scale with line heights

#### Font Weights
- `fontWeight.light` (300)
- `fontWeight.normal` (400)
- `fontWeight.medium` (500)
- `fontWeight.semibold` (600)
- `fontWeight.bold` (700)
- `fontWeight.extrabold` (800)

#### Letter Spacing
- `letterSpacing.tight` through `letterSpacing.widest`

### Spacing

Spacing scale from `0` to `24`:
- `spacing.0` = 0
- `spacing.1` = 0.25rem (4px)
- `spacing.2` = 0.5rem (8px)
- `spacing.4` = 1rem (16px)
- `spacing.6` = 1.5rem (24px)
- etc.

### Border Radius

- `borderRadius.none` = 0
- `borderRadius.sm` = 0.125rem
- `borderRadius.base` = 0.25rem
- `borderRadius.md` = 0.375rem
- `borderRadius.lg` = 0.5rem
- `borderRadius.xl` = 0.75rem
- `borderRadius.2xl` = 1rem
- `borderRadius.3xl` = 1.5rem
- `borderRadius.full` = 9999px

### Shadows

- `shadows.sm` through `shadows.xl` - Standard shadows
- `shadows.glow.cyan` - Cyan glow effect
- `shadows.glow.cyan-lg` - Large cyan glow effect

### Transitions

#### Durations
- `transitions.duration.fast` = 150ms
- `transitions.duration.base` = 200ms
- `transitions.duration.slow` = 300ms
- `transitions.duration.slower` = 500ms

#### Easing Functions
- `transitions.easing.ease-in`
- `transitions.easing.ease-out`
- `transitions.easing.ease-in-out`

#### Pre-configured Properties
- `transitions.properties.colors` - Color transitions
- `transitions.properties.background` - Background transitions
- `transitions.properties.border` - Border transitions
- `transitions.properties.all` - All properties

### Breakpoints

- `breakpoints.sm` = 640px
- `breakpoints.md` = 768px
- `breakpoints.lg` = 1024px
- `breakpoints.xl` = 1280px
- `breakpoints.2xl` = 1536px

### Z-Index Scale

- `zIndex.base` = 0
- `zIndex.dropdown` = 1000
- `zIndex.sticky` = 1020
- `zIndex.fixed` = 1030
- `zIndex.modal-backdrop` = 1040
- `zIndex.modal` = 1050
- `zIndex.popover` = 1060
- `zIndex.tooltip` = 1070

## Component Styles

The design system includes predefined component styles:

### Button

#### Primary Button
- Background: `#22d3ee`
- Color: `#000000`
- Hover Background: `#67e8f9`
- Padding: `1rem` (x) × `0.75rem` (y)
- Border Radius: `0.5rem`
- Font Weight: `600`

#### Secondary Button
- Background: `transparent`
- Color: `#22d3ee`
- Border: `1px solid #22d3ee`
- Hover Background: `#22d3ee`
- Hover Color: `#000000`
- Padding: `1rem` (x) × `0.5rem` (y)
- Border Radius: `0.5rem`

### Card

- Background Gradient: `from-gray-900 to-gray-800`
- Border: `1px solid #374151`
- Border Radius: `0.5rem`
- Padding: `1.5rem`

### Input

- Background: `#1f2937`
- Border: `1px solid #374151`
- Border Radius: `0.5rem`
- Padding: `1rem` (x) × `0.75rem` (y)
- Focus Border: `1px solid #22d3ee`
- Placeholder Color: `#6b7280`

## Making Changes

When you need to update design tokens:

1. **Edit `design-system.json`** - Update the JSON values directly
2. **Restart Dev Server** - Tailwind will pick up the changes automatically
3. **Update Components** - Components using Tailwind classes will automatically reflect changes

### Example: Changing the Primary Accent Color

1. Open `design-system.json`
2. Update `colors.accent.cyan.base` to your new color
3. Update related colors (light, dark, hover) if needed
4. Save and restart the dev server

All components using `text-accent-cyan-base`, `bg-accent-cyan-base`, etc. will automatically update.

## Best Practices

1. **Always use design system tokens** - Don't hardcode colors, spacing, or other values
2. **Use Tailwind classes when possible** - They're optimized and use the design system automatically
3. **Use TypeScript utilities for dynamic values** - When you need computed or conditional styling
4. **Keep the design system consistent** - Update the JSON file rather than overriding in components
5. **Document new tokens** - When adding new tokens, update this documentation

## Examples

### Example Component Using Design System

```tsx
import { colors, spacing, borderRadius } from './utils/design-system';

function Card({ children }) {
  return (
    <div 
      className="bg-background-card-base border-border-primary rounded-lg p-6"
      style={{
        // Or use inline styles with design system values
        background: `linear-gradient(to bottom right, ${colors.background.card.gradient.from}, ${colors.background.card.gradient.to})`,
      }}
    >
      {children}
    </div>
  );
}
```

### Example Button Using Design System

```tsx
function PrimaryButton({ children, onClick }) {
  return (
    <button
      className="bg-accent-cyan-base text-black font-semibold px-4 py-3 rounded-lg hover:bg-accent-cyan-hover transition-colors"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

