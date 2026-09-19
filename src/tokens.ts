/*
 * GENERATED FILE — do not edit.
 *
 * Written by scripts/generate-tokens.mjs from scripts/tokens.source.mjs.
 * Change a colour there and run `npm run tokens`; CI fails if this file is
 * edited directly or left stale.
 */

/** The themes unitykit ships. Selected with `data-theme` on a root element. */
export type ThemeName = 'light' | 'dark'

/** Every colour token, in both themes. */
export type ColorToken = 'bg' | 'surface' | 'surface-raised' | 'line' | 'ink' | 'muted' | 'primary' | 'primary-hover' | 'primary-ink' | 'secondary' | 'secondary-hover' | 'secondary-ink' | 'accent' | 'accent-hover' | 'accent-ink' | 'status-ink' | 'ok' | 'warn' | 'danger' | 'info' | 'focus'

/**
 * The brand palette as literal hex strings, for anything that cannot use a CSS
 * class: charts, canvas, SVG, Remotion. Components should use the utilities
 * instead, so they follow `data-theme` without being told which theme is on.
 */
export const tokens: Record<ThemeName, Record<ColorToken, string>> = {
  light: {
    bg: '#FAF8FC',
    surface: '#FFFFFF',
    'surface-raised': '#FFFFFF',
    line: '#E6E1EE',
    ink: '#1B1A1F',
    muted: '#6B6577',
    primary: '#7A3FD6',
    'primary-hover': '#6A33BF',
    'primary-ink': '#FFFFFF',
    secondary: '#0C798A',
    'secondary-hover': '#0B7686',
    'secondary-ink': '#FFFFFF',
    accent: '#C3831D',
    'accent-hover': '#B1771A',
    'accent-ink': '#1B1A1F',
    'status-ink': '#FFFFFF',
    ok: '#297D4E',
    warn: '#966319',
    danger: '#BE4736',
    info: '#0C798A',
    focus: '#7A3FD666',
  },
  dark: {
    bg: '#121212',
    surface: '#1C1B20',
    'surface-raised': '#26242C',
    line: '#2E2C35',
    ink: '#FFFFFF',
    muted: '#A9A3B5',
    primary: '#C27FFF',
    'primary-hover': '#D29BFF',
    'primary-ink': '#121212',
    secondary: '#25E0F8',
    'secondary-hover': '#5CE8FA',
    'secondary-ink': '#121212',
    accent: '#E8A33D',
    'accent-hover': '#F0B75F',
    'accent-ink': '#121212',
    'status-ink': '#121212',
    ok: '#5CD68C',
    warn: '#F2B84B',
    danger: '#F06A6A',
    info: '#25E0F8',
    focus: '#C27FFF66',
  },
}

/** Type, radius, shadow and spacing scales, shared with consuming apps. */
export const scales = {
  "font": {
    "sans": "\"Inter\", ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif",
    "mono": "ui-monospace, SFMono-Regular, \"SF Mono\", Menlo, Consolas, monospace"
  },
  "text": {
    "xs": [
      "0.75rem",
      "1rem"
    ],
    "sm": [
      "0.875rem",
      "1.25rem"
    ],
    "base": [
      "1rem",
      "1.5rem"
    ],
    "lg": [
      "1.125rem",
      "1.75rem"
    ],
    "xl": [
      "1.25rem",
      "1.75rem"
    ],
    "2xl": [
      "1.5rem",
      "2rem"
    ],
    "3xl": [
      "1.875rem",
      "2.25rem"
    ]
  },
  "radius": {
    "sm": "4px",
    "md": "6px",
    "lg": "8px",
    "xl": "12px",
    "full": "999px"
  },
  "shadow": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.10)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.06)"
  },
  "space": "0.25rem"
} as const

/**
 * Foreground/background pairs that must meet WCAG AA for text. Used by the
 * contrast test and by the Storybook token page, so both report the same set.
 */
export const contrastPairs: ReadonlyArray<readonly [ColorToken, ColorToken]> = [
  ['ink', 'bg'],
  ['ink', 'surface'],
  ['ink', 'surface-raised'],
  ['muted', 'bg'],
  ['muted', 'surface'],
  ['primary-ink', 'primary'],
  ['primary-ink', 'primary-hover'],
  ['secondary-ink', 'secondary'],
  ['secondary-ink', 'secondary-hover'],
  ['accent-ink', 'accent'],
  ['accent-ink', 'accent-hover'],
  ['status-ink', 'ok'],
  ['status-ink', 'warn'],
  ['status-ink', 'danger'],
  ['status-ink', 'info'],
  ['primary', 'bg'],
  ['primary', 'surface'],
  ['secondary', 'bg'],
  ['secondary', 'surface'],
  ['ok', 'surface'],
  ['warn', 'surface'],
  ['danger', 'surface'],
  ['info', 'surface'],
]

/**
 * Pairs held to the non-text bar instead. WCAG 1.4.11 applies 3:1 to UI
 * components and graphical objects, which is what an indicator dot or a badge
 * fill is; body text is the stricter 1.4.3 list above.
 */
export const indicatorPairs: ReadonlyArray<readonly [ColorToken, ColorToken]> = [
  ['accent', 'bg'],
  ['accent', 'surface'],
  ['accent-hover', 'bg'],
]

/** WCAG AA minimum contrast ratio for body text. */
export const AA_TEXT = 4.5

/** WCAG AA minimum contrast ratio for non-text UI components. */
export const AA_NON_TEXT = 3
