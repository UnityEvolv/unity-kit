/**
 * WCAG relative luminance and contrast, per WCAG 2.1 definitions.
 *
 * Kept in the library rather than in a test helper because the Storybook token
 * page renders from the same functions. A ratio printed on a docs page and a
 * ratio asserted in CI that came from different code is how a palette ends up
 * documented as accessible while shipping something else.
 */

/** Parses `#RGB`, `#RRGGBB` or `#RRGGBBAA`. Alpha is ignored — see below. */
function toRgb(hex: string): [number, number, number] {
  let value = hex.replace('#', '')
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (value.length !== 6 && value.length !== 8) {
    throw new Error(`Not a hex colour: ${hex}`)
  }
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number]
}

/**
 * WCAG relative luminance.
 *
 * A translucent colour is treated as if it were opaque. Contrast against a
 * translucent foreground depends on what is behind it, which a pair of hex
 * strings cannot express, so the only token with alpha (`focus`) is a ring
 * rather than text and is excluded from the contrast requirements.
 */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Contrast ratio between two colours, from 1 (identical) to 21 (black/white). */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** Whether a pair meets WCAG AA for body text (4.5:1). */
export function meetsAA(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= 4.5
}
