import { describe, expect, it } from 'vitest'
import { contrastRatio, meetsAA, relativeLuminance } from './contrast'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { AA_TEXT, contrastPairs, tokens, type ThemeName } from './tokens'

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

})

/**
 * UKIT-29 requires that no accent colour appears anywhere. daisyUI always
 * emits an accent, so the guarantee is that its accent is primary rather than
 * a third colour — without this, a consumer writing `btn-accent` would get
 * daisyUI's default teal and nothing would fail.
 */
describe.each(Object.keys(tokens) as ThemeName[])('%s theme has no third hue', (theme) => {
  it('daisyUI accent resolves to primary', () => {
    // Read from the repo root rather than import.meta.url: Vitest serves test
    // modules over a non-file URL, so new URL(..., import.meta.url) throws.
    const css = readFileSync(resolve(process.cwd(), 'src/theme.css'), 'utf8')
    const block = css.split(`name: "${theme}"`)[1].split('}')[0]
    const accent = block.match(/--color-accent:\s*(#[0-9A-Fa-f]{6})/)?.[1]

    expect(accent, `no --color-accent found in the ${theme} theme block`).toBeDefined()
    expect(accent?.toUpperCase()).toBe(tokens[theme].primary.toUpperCase())
  })
})
