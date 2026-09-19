/**
 * The single source of truth for the UnityEvolv brand palette (UKIT-29).
 *
 * Nothing else in the repository holds these values by hand. `src/tokens.ts`,
 * `src/tokens.css` and `src/theme.css` are all generated from this file by
 * `scripts/generate-tokens.mjs`, and CI fails if they drift, so a colour can
 * only ever be changed in one place.
 *
 * Three deviations from UKIT-29 as written, all recorded on the story:
 *
 * 1. Five light values are deepened. The story's secondary/info (#0E8FA3), ok
 *    (#2E8B57), warn (#B7791F), danger (#C8503F) and accent (#B0761A) measure
 *    3.83, 4.25, 3.64, 4.49 and 3.85 against the light background, all below
 *    the AA its own acceptance criteria require. Each moves along its own hue
 *    until it clears its tier with headroom. Dark mode is untouched.
 *
 * 2. Light-mode `accent` is held to 3:1, not 4.5:1, and takes dark ink. The
 *    story's roles make accent an indicator and never text -- a raised hand, a
 *    mention badge, a recording dot, a chart series, a selected cell -- so
 *    WCAG 1.4.11 (3:1, non-text) is the applicable bar rather than 1.4.3.
 *    Holding it to 4.5:1 would turn it into a dark brown indistinguishable
 *    from `warn`; see the collision note below.
 *
 * 3. Light `accent-ink` is #1B1A1F rather than the story's #FFFFFF, which
 *    follows from 2: the lighter amber carries dark text, not white.
 *
 * Known collision, flagged for a brand decision. `accent` and `warn` are the
 * same hue -- 37 and 36 in light, 36 and 39 in dark. At equal AA lightness they
 * are literally the same colour, so shifting accent to gold does not help:
 * forced to 4.5:1 both land at a luminance ratio of 1.00 to each other. They
 * are separated here by lightness instead (1.61 apart in light, 1.20 in dark),
 * which works but is thin. A genuinely distinct third voice needs a different
 * hue family, which is a brand call rather than an implementation one.
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
 * the hover steps and `focus` have no daisyUI equivalent and stay brand-only.
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
  // Its own value now, so btn-primary, btn-secondary and btn-accent are three
  // visibly different colours as UKIT-29 requires.
  accent: 'accent',
  'accent-content': 'accent-ink',
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
  'accent-ink': 'var(--color-accent-content)',
  ok: 'var(--color-success)',
  warn: 'var(--color-warning)',
  danger: 'var(--color-error)',
  muted: 'var(--ue-muted)',
  'surface-raised': 'var(--ue-surface-raised)',
  'primary-hover': 'var(--ue-primary-hover)',
  'secondary-hover': 'var(--ue-secondary-hover)',
  'accent-hover': 'var(--ue-accent-hover)',
  focus: 'var(--ue-focus)',
}

/**
 * Text-weight pairs that must meet WCAG AA, 4.5:1 (WCAG 1.4.3).
 *
 * `line` is deliberately absent. WCAG 1.4.11 covers boundaries that carry
 * meaning; a divider that merely separates content is exempt, and holding
 * dividers to 3:1 would force them to read as heavy rules.
 *
 * `accent` is absent as a foreground on purpose -- its roles are all fills and
 * indicators, never body text. It is checked in the non-text tier below, and
 * the ink that sits on it is checked here.
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
 * Non-text UI components, which WCAG 1.4.11 holds to 3:1 rather than 4.5:1.
 *
 * An accent dot or badge has to be visible against the page, but nothing in
 * its role ever renders it as body text, so the text bar does not apply. This
 * tier is what lets accent stay a recognisable amber instead of collapsing
 * into the same dark brown as `warn`.
 */
export const indicatorPairs = [
  ['accent', 'bg'],
  ['accent', 'surface'],
  ['accent-hover', 'bg'],
]

/** WCAG AA minimum contrast ratio for body text. */
export const AA_TEXT = 4.5

/** WCAG AA minimum contrast ratio for non-text UI components. */
export const AA_NON_TEXT = 3
