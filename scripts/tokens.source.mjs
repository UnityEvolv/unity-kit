/**
 * The single source of truth for the UnityEvolv brand palette (UKIT-29).
 *
 * Nothing else in the repository holds these values by hand. `src/tokens.ts`,
 * `src/tokens.css` and `src/theme.css` are all generated from this file by
 * `scripts/generate-tokens.mjs`, and CI fails if they drift, so a colour can
 * only ever be changed in one place.
 *
 * Two hues and the status colours are the whole palette. There is no accent
 * token: a third hue collided with `warn`, and the app's main screen is a
 * full-colour illustration the interface should not compete with. daisyUI
 * requires an accent, so it is aliased to primary and `btn-accent` never
 * introduces a third colour.
 *
 * These values match UKIT-29. Four of the light ones differ from the story's
 * first draft: `secondary`/`info` (#0E8FA3), `ok` (#2E8B57), `warn` (#B7791F)
 * and `danger` (#C8503F) measured 3.83, 4.25, 3.64 and 4.49 against the light
 * background, below the AA the story also required, so each was deepened along
 * its own hue until it cleared 4.5:1 with headroom. The story now carries the
 * deepened values; this note is here so nobody "restores" the originals from
 * an older draft without noticing they fail. Dark mode was never changed --
 * every dark pair already passes.
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
    danger: '#BE4736',
    'danger-hover': '#AD4232',
    'danger-ink': '#FFFFFF',
    'status-ink': '#FFFFFF',
    ok: '#297D4E',
    warn: '#966319',
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
    danger: '#F06A6A',
    'danger-hover': '#F58585',
    'danger-ink': '#121212',
    'status-ink': '#121212',
    ok: '#5CD68C',
    warn: '#F2B84B',
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
  /*
   * The two units every daisyUI control is measured in. `field` scales inputs,
   * selects and textareas; `selector` scales checkboxes, radios and toggles.
   * daisyUI falls back to 0.25rem when a theme says nothing, which means the
   * control heights come from the library rather than from the brand — so the
   * theme states them, and one edit here moves every control together.
   */
  size: { field: '0.25rem', selector: '0.25rem' },
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
 * are aliases layered on top for consuming apps.
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
  // Aliased to primary on purpose. daisyUI always emits an accent, and leaving
  // it at daisyUI's default would put an off-brand third colour one `btn-accent`
  // away from any consumer. Pointing it at primary makes that impossible.
  accent: 'primary',
  'accent-content': 'primary-ink',
  neutral: 'ink',
  'neutral-content': 'surface',
  info: 'info',
  'info-content': 'status-ink',
  success: 'ok',
  'success-content': 'status-ink',
  warning: 'warn',
  'warning-content': 'status-ink',
  error: 'danger',
  'error-content': 'danger-ink',
}

/** daisyUI tokens that track the brand differently per theme. */
export const daisyMapOverrides = {
  // In dark mode a "neutral" surface has to be lighter than the page, not ink.
  dark: { neutral: 'surface-raised', 'neutral-content': 'ink' },
}

/**
 * Brand utility names (`text-ink`) mapped to the CSS variable they alias.
 *
 * Aliases pointing at a `--color-*` variable have a daisyUI equivalent, so
 * components must use that name instead; `npm run lint` derives its rule from
 * exactly this distinction. Aliases pointing at `--ue-*` have no daisyUI
 * counterpart and are the only spelling available anywhere, components
 * included.
 */
export const utilityAliases = {
  ink: 'var(--color-base-content)',
  bg: 'var(--color-base-200)',
  surface: 'var(--color-base-100)',
  line: 'var(--color-base-300)',
  'primary-ink': 'var(--color-primary-content)',
  'secondary-ink': 'var(--color-secondary-content)',
  'danger-ink': 'var(--color-error-content)',
  ok: 'var(--color-success)',
  warn: 'var(--color-warning)',
  danger: 'var(--color-error)',
  muted: 'var(--ue-muted)',
  'surface-raised': 'var(--ue-surface-raised)',
  'primary-hover': 'var(--ue-primary-hover)',
  'secondary-hover': 'var(--ue-secondary-hover)',
  'danger-hover': 'var(--ue-danger-hover)',
  focus: 'var(--ue-focus)',
}

/**
 * Foreground/background pairs that must meet WCAG AA for text, 4.5:1.
 *
 * `line` is deliberately absent. WCAG 1.4.11 covers boundaries that carry
 * meaning; a divider that merely separates content is exempt, and holding
 * dividers to 3:1 would force them to read as heavy rules.
 *
 * Every hover value is checked as well as its base. A hover state that drops
 * below AA is the easiest one to miss, because nobody screenshots it.
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
  ['danger-ink', 'danger'],
  ['danger-ink', 'danger-hover'],
  ['status-ink', 'ok'],
  ['status-ink', 'warn'],
  ['status-ink', 'info'],
  ['primary', 'bg'],
  ['primary', 'surface'],
  ['secondary', 'bg'],
  ['secondary', 'surface'],
  ['danger', 'surface'],
  ['ok', 'surface'],
  ['warn', 'surface'],
  ['info', 'surface'],
]

/** WCAG AA minimum contrast ratio for body text. */
export const AA_TEXT = 4.5
