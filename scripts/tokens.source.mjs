/**
 * The web wiring for the UnityEvolv brand palette (UKIT-29, UKIT-11).
 *
 * The values live in `src/tokens.json`; nothing else in the repository holds
 * them by hand. `src/tokens.ts`, `src/tokens.css` and `src/theme.css` are all
 * generated from the JSON through this module by `scripts/generate-tokens.mjs`,
 * and CI fails if they drift, so a colour can only ever be changed in one place.
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

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * The brand values themselves live in `src/tokens.json` (UKIT-11): a
 * platform-neutral file a consumer outside React can read with no build
 * step, exported from the package as `@unityevolv/unitykit/tokens.json`.
 * This module reads it and adds the web-specific wiring below — how the
 * brand maps onto daisyUI's names, which utilities alias which variable, and
 * which pairs must clear AA. Those are the kit's business, not the palette's.
 */
export const tokensJson = JSON.parse(
  readFileSync(fileURLToPath(new URL('../src/tokens.json', import.meta.url)), 'utf8'),
)

/** Colour tokens, per theme. Every value is a literal hex string. */
export const palette = tokensJson.color

/** Non-colour scales, shared by the kit and its consumers. */
export const scales = {
  font: tokensJson.font,
  text: tokensJson.text,
  radius: tokensJson.radius,
  size: tokensJson.size,
  shadow: tokensJson.shadow,
  space: tokensJson.space,
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
  'avatar-1': 'var(--ue-avatar-1)',
  'avatar-2': 'var(--ue-avatar-2)',
  'avatar-3': 'var(--ue-avatar-3)',
  'avatar-4': 'var(--ue-avatar-4)',
  'avatar-5': 'var(--ue-avatar-5)',
  'avatar-6': 'var(--ue-avatar-6)',
  'avatar-ink-vivid': 'var(--ue-avatar-ink-vivid)',
  'avatar-ink-muted': 'var(--ue-avatar-ink-muted)',
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
  // Avatar initials are text, so WCAG 1.4.3 applies: the vivid slots carry
  // one ink and the muted slots the other, and both are checked per theme.
  ['avatar-ink-vivid', 'avatar-1'],
  ['avatar-ink-muted', 'avatar-2'],
  ['avatar-ink-vivid', 'avatar-3'],
  ['avatar-ink-muted', 'avatar-4'],
  ['avatar-ink-vivid', 'avatar-5'],
  ['avatar-ink-muted', 'avatar-6'],
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
