import type { Meta, StoryObj } from '@storybook/react-vite'
import { contrastRatio, meetsAA } from './contrast'
import { AA_TEXT, contrastPairs, scales, tokens, type ColorToken, type ThemeName } from './tokens'

/**
 * Every number on this page is computed from the same `tokens` object the CSS
 * is generated from and the contrast test asserts against, so the page cannot
 * claim a ratio the build does not actually ship.
 *
 * The page is the readable view; `src/contrast.test.ts` is the gate. A palette
 * documented as accessible on a page nobody opens is not a check.
 */

const themes: ThemeName[] = ['light', 'dark']
const swatchOrder = Object.keys(tokens.light) as ColorToken[]

function Panel({ theme, children }: { theme: ThemeName; children: React.ReactNode }) {
  return (
    <div
      data-theme={theme}
      className="flex-1 rounded-box border border-base-300 bg-base-100 p-6 text-base-content"
    >
      <h3 className="mb-4 text-lg font-semibold capitalize">{theme}</h3>
      {children}
    </div>
  )
}

function Swatches({ theme }: { theme: ThemeName }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {swatchOrder.map((token) => (
        <div key={token} className="flex items-center gap-3">
          <span
            className="size-10 shrink-0 rounded-md border border-base-300"
            style={{ backgroundColor: tokens[theme][token] }}
          />
          <span className="min-w-0">
            <code className="block truncate text-sm">{token}</code>
            <code className="block text-xs opacity-60">{tokens[theme][token]}</code>
          </span>
        </div>
      ))}
    </div>
  )
}

function ContrastTable({ theme }: { theme: ThemeName }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left opacity-60">
          <th className="pb-2 font-normal">Pair</th>
          <th className="pb-2 text-right font-normal">Ratio</th>
          <th className="pb-2 text-right font-normal">AA</th>
        </tr>
      </thead>
      <tbody>
        {contrastPairs.map(([foreground, background]) => {
          const fg = tokens[theme][foreground]
          const bg = tokens[theme][background]
          const passes = meetsAA(fg, bg)
          return (
            <tr key={foreground + background} className="border-t border-base-300">
              <td className="py-1.5">
                <span
                  className="mr-2 inline-block rounded px-2 py-0.5"
                  style={{ backgroundColor: bg, color: fg }}
                >
                  Ag
                </span>
                <code className="text-xs">
                  {foreground} on {background}
                </code>
              </td>
              <td className="py-1.5 text-right tabular-nums">
                {contrastRatio(fg, bg).toFixed(2)}:1
              </td>
              <td className="py-1.5 text-right">
                <span className={passes ? 'text-success' : 'text-error'}>
                  {passes ? 'pass' : 'fail'}
                </span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const meta: Meta = {
  title: 'Foundations/Tokens',
  parameters: {
    layout: 'fullscreen',
    // The page renders both themes side by side, so the toolbar switcher would
    // only restyle the frame around them.
    themes: { disable: true },
  },
}

export default meta
type Story = StoryObj

/** Every colour token, in both themes, with its literal value. */
export const Palette: Story = {
  render: () => (
    <div className="flex gap-4 p-4">
      {themes.map((theme) => (
        <Panel key={theme} theme={theme}>
          <Swatches theme={theme} />
        </Panel>
      ))}
    </div>
  ),
}

/**
 * Contrast for every text-weight pair, computed at render time. `line` is
 * absent by design: WCAG 1.4.11 covers boundaries that carry meaning, and
 * holding a plain divider to 3:1 would force it to read as a heavy rule.
 */
export const Contrast: Story = {
  render: () => (
    <div className="p-4">
      <p className="mb-4 text-sm opacity-70">
        Computed with WCAG 2.1 relative luminance. AA for body text is {AA_TEXT}:1. These same
        pairs are asserted in <code>src/contrast.test.ts</code>, so a failure here is a failed
        build, not a note on a page.
      </p>
      <div className="flex gap-4">
        {themes.map((theme) => (
          <Panel key={theme} theme={theme}>
            <ContrastTable theme={theme} />
          </Panel>
        ))}
      </div>
    </div>
  ),
}

/** Radius, type, shadow and spacing scales, shared with consuming apps. */
export const Scales: Story = {
  render: () => (
    <div className="p-4">
      <Panel theme="light">
        <div className="flex flex-wrap gap-6">
          {Object.entries(scales.radius).map(([name, value]) => (
            <div key={name} className="text-center">
              <div
                className="size-16 border border-base-300 bg-base-200"
                style={{ borderRadius: value }}
              />
              <code className="mt-1 block text-xs">
                {name} {value}
              </code>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-1">
          {Object.entries(scales.text).map(([name, [size, height]]) => (
            <p key={name} style={{ fontSize: size, lineHeight: height }}>
              {name} — The quick brown fox
            </p>
          ))}
        </div>
      </Panel>
    </div>
  ),
}
