/**
 * The single source of truth for the UnityEvolv brand palette (UKIT-29).
 *
 * Nothing else in the repository holds these values by hand. `src/tokens.ts`,
 * `src/tokens.css` and `src/theme.css` are all generated from this file by
 * `scripts/generate-tokens.mjs`, and CI fails if they drift, so a colour can
 * only ever be changed in one place.
 *
 * Light-mode deviation from UKIT-29 as originally written: the story's
 * secondary/info (#0E8FA3), ok (#2E8B57), warn (#B7791F) and danger (#C8503F)
 * fail WCAG AA against the light background, at 3.83, 4.25, 3.64 and 4.49
 * respectively. Its own acceptance criteria require AA in both modes, so the
 * four are deepened along the same hue to clear 4.5:1 with headroom. Dark mode
 * uses the brand values unchanged; it already passes everywhere.
 */

/** Colour tokens, per theme. Every value is a literal hex string. */
export const palette = {
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
    'secondary-ink': '#FFFFFF',
    'status-ink': '#FFFFFF',
    ok: '#297D4E',
    warn: '#97641A',
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
    'secondary-ink': '#121212',
    'status-ink': '#121212',
    ok: '#5CD68C',
    warn: '#F2B84B',
    danger: '#F06A6A',
    info: '#25E0F8',
    focus: '#C27FFF66',
  },
}

/** Non-colour scales, shared by the kit and its consumers. */
export const scales = {
  font: {
    sans: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  text: {
    xs: ['0.75rem', '1rem'],
    sm: ['0.875rem', '1.25rem'],
    base: ['1rem', '1.5rem'],
    lg: ['1.125rem', '1.75rem'],
    xl: ['1.25rem', '1.75rem'],
    '2xl': ['1.5rem', '2rem'],
    '3xl': ['1.875rem', '2.25rem'],
  },
  radius: { sm: '4px', md: '6px', lg: '8px', xl: '12px', full: '999px' },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.10)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
  },
  /** Tailwind v4 derives every spacing utility from this single base step. */
  space: '0.25rem',
}

/**
 * How each brand token maps onto daisyUI's vocabulary.
 *
 * daisyUI generates its component classes (`btn-primary`, `alert-error`) from
 * its own token names, so those names cannot be removed from the codebase.
 * They are therefore the canonical ones inside kit components; the brand names
 * are aliases layered on top for consuming apps. `surface-raised`, `muted`,
 * `primary-hover` and `focus` have no daisyUI equivalent and stay brand-only.
 */
export const daisyMap = {
  'base-100': 'surface',
  'base-200': 'bg',
  'base-300': 'line',
  'base-content': 'ink',
  primary: 'primary',
  'primary-content': 'primary-ink',
  secondary: 'secondary',
  'secondary-content': 'secondary-ink',
  // The brand has two voices, not three, so accent tracks secondary. UKIT-5
  // should drop the Button `accent` variant rather than invent a third colour.
  accent: 'secondary',
  'accent-content': 'secondary-ink',
  neutral: 'ink',
  'neutral-content': 'surface',
  info: 'info',
  'info-content': 'status-ink',
  success: 'ok',
  'success-content': 'status-ink',
  warning: 'warn',
  'warning-content': 'status-ink',
  error: 'danger',
  'error-content': 'status-ink',
}

/** daisyUI tokens that track the brand differently per theme. */
export const daisyMapOverrides = {
  // In dark mode a "neutral" surface has to be lighter than the page, not ink.
  dark: { neutral: 'surface-raised', 'neutral-content': 'ink' },
}

/** Brand utility names (`text-ink`) mapped to the CSS variable they alias. */
export const utilityAliases = {
  ink: 'var(--color-base-content)',
  bg: 'var(--color-base-200)',
  surface: 'var(--color-base-100)',
  line: 'var(--color-base-300)',
  'primary-ink': 'var(--color-primary-content)',
  'secondary-ink': 'var(--color-secondary-content)',
  ok: 'var(--color-success)',
  warn: 'var(--color-warning)',
  danger: 'var(--color-error)',
  muted: 'var(--ue-muted)',
  'surface-raised': 'var(--ue-surface-raised)',
  'primary-hover': 'var(--ue-primary-hover)',
  focus: 'var(--ue-focus)',
}

/**
 * Text-weight pairs that must meet WCAG AA (4.5:1).
 *
 * `line` is deliberately absent. WCAG 1.4.11 covers boundaries that carry
 * meaning; a divider that merely separates content is exempt, and holding
 * dividers to 3:1 would force them to read as heavy rules.
 */
export const contrastPairs = [
  ['ink', 'bg'],
  ['ink', 'surface'],
  ['ink', 'surface-raised'],
  ['muted', 'bg'],
  ['muted', 'surface'],
  ['primary-ink', 'primary'],
  ['primary-ink', 'primary-hover'],
  ['secondary-ink', 'secondary'],
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

export const AA_TEXT = 4.5
