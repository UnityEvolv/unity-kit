import { describe, expect, it } from 'vitest'
import { contrastRatio, meetsAA, relativeLuminance } from './contrast'
import {
  AA_NON_TEXT,
  AA_TEXT,
  contrastPairs,
  indicatorPairs,
  tokens,
  type ThemeName,
} from './tokens'

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
  })

  it('returns 1 for a colour against itself', () => {
    expect(contrastRatio('#7A3FD6', '#7A3FD6')).toBeCloseTo(1, 5)
  })

  it('is symmetric', () => {
    expect(contrastRatio('#1B1A1F', '#FAF8FC')).toBeCloseTo(
      contrastRatio('#FAF8FC', '#1B1A1F'),
      10,
    )
  })

  it('expands three-digit hex', () => {
    expect(relativeLuminance('#fff')).toBeCloseTo(relativeLuminance('#FFFFFF'), 10)
  })

  it('ignores the alpha channel', () => {
    expect(relativeLuminance('#7A3FD666')).toBeCloseTo(relativeLuminance('#7A3FD6'), 10)
  })

  it('rejects anything that is not a hex colour', () => {
    expect(() => relativeLuminance('rebeccapurple')).toThrow(/Not a hex colour/)
  })
})

/**
 * The gate UKIT-29 actually needs. The story asks for contrast to be visible on
 * a docs page, but a docs page only catches a regression if somebody opens it.
 * These assertions read the same tokens the CSS is generated from, so a colour
 * that breaks AA fails the pull request instead.
 */
describe.each(Object.keys(tokens) as ThemeName[])('%s theme meets WCAG AA', (theme) => {
  it.each(contrastPairs)('text: %s on %s', (foreground, background) => {
    const fg = tokens[theme][foreground]
    const bg = tokens[theme][background]
    const ratio = contrastRatio(fg, bg)

    expect(
      meetsAA(fg, bg, AA_TEXT),
      `${theme}: ${foreground} (${fg}) on ${background} (${bg}) is ${ratio.toFixed(2)}:1, below the ${AA_TEXT}:1 required for text`,
    ).toBe(true)
  })

  // Indicators are held to WCAG 1.4.11 rather than 1.4.3. Checking them at all
  // is the point: without this tier an indicator-only colour would simply go
  // unverified, which is how accent shipped at 3.85:1 in the first draft.
  it.each(indicatorPairs)('indicator: %s on %s', (foreground, background) => {
    const fg = tokens[theme][foreground]
    const bg = tokens[theme][background]
    const ratio = contrastRatio(fg, bg)

    expect(
      meetsAA(fg, bg, AA_NON_TEXT),
      `${theme}: ${foreground} (${fg}) on ${background} (${bg}) is ${ratio.toFixed(2)}:1, below the ${AA_NON_TEXT}:1 required for a non-text UI component`,
    ).toBe(true)
  })
})

/**
 * Two tokens that are meant to mean different things have to look different.
 * `accent` and `warn` share a hue by the story's own choice, so lightness is
 * the only thing separating them; this pins that separation so a later nudge
 * to either value cannot quietly collapse them into the same colour.
 */
describe.each(Object.keys(tokens) as ThemeName[])('%s theme keeps roles apart', (theme) => {
  it('accent is distinguishable from warn', () => {
    const ratio = contrastRatio(tokens[theme].accent, tokens[theme].warn)
    expect(
      ratio >= 1.15,
      `${theme}: accent (${tokens[theme].accent}) and warn (${tokens[theme].warn}) differ by only ${ratio.toFixed(2)}:1`,
    ).toBe(true)
  })

  it('the three voices are three different colours', () => {
    const { primary, secondary, accent } = tokens[theme]
    expect(new Set([primary, secondary, accent]).size).toBe(3)
  })
})
