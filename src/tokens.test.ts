import { describe, expect, it } from 'vitest'
import themeTokens from './tokens.json'
import { scales, tokens } from './tokens'

/**
 * `src/tokens.json` is the source (UKIT-11) and the TypeScript object is
 * generated from it. `npm run tokens:check` guards the generated files in CI;
 * this test guards the other direction, so a consumer reading the JSON and a
 * component reading `tokens` can never disagree.
 */
describe('tokens.json', () => {
  it('is what the generated palette was built from', () => {
    expect(themeTokens.color).toEqual(tokens)
    expect(themeTokens.themes).toEqual(Object.keys(tokens))
  })

  it('carries the scales the kit uses', () => {
    expect(themeTokens.radius).toEqual(scales.radius)
    expect(themeTokens.size).toEqual(scales.size)
    expect(themeTokens.text).toEqual(scales.text)
    expect(themeTokens.font).toEqual(scales.font)
    expect(themeTokens.shadow).toEqual(scales.shadow)
    expect(themeTokens.space).toEqual(scales.space)
  })

  it('names every role the story asks for, resolving to a real token', () => {
    const roles = ['accent', 'neutral', 'success', 'warning', 'error', 'info'] as const
    for (const role of roles) {
      const target = themeTokens.roles[role]
      expect(themeTokens.color.light).toHaveProperty(target)
      expect(themeTokens.color.dark).toHaveProperty(target)
    }
    expect(themeTokens.color.light).toHaveProperty('primary')
    expect(themeTokens.color.light).toHaveProperty('secondary')
  })

  it('keeps every colour a hex string, so it survives without a build step', () => {
    for (const theme of Object.values(themeTokens.color)) {
      for (const value of Object.values(theme)) expect(value).toMatch(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/)
    }
  })
})
