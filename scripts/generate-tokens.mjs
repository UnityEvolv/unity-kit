/**
 * Generates every file that carries brand token values from one source.
 *
 * UKIT-29 asks for the palette in three places at once — CSS custom properties,
 * a typed JavaScript object, and daisyUI theme definitions. Three hand-kept
 * copies drift, and a contrast check that reads the copy rather than the
 * shipped CSS reports a number nobody is actually looking at. So all three are
 * written from `src/tokens.json` (through `tokens.source.mjs`) here, and
 * `npm run tokens:check` fails CI if
 * a generated file has been edited by hand or left stale.
 *
 *   node scripts/generate-tokens.mjs
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  palette,
  scales,
  daisyMap,
  daisyMapOverrides,
  utilityAliases,
  contrastPairs,
  AA_TEXT,
} from './tokens.source.mjs'

const resolvePath = (relative) => fileURLToPath(new URL(relative, import.meta.url))
const check = process.argv.includes('--check')

const BANNER = (source) => `/*
 * GENERATED FILE — do not edit.
 *
 * Written by scripts/generate-tokens.mjs from ${source}.
 * Change a colour there and run \`npm run tokens\`; CI fails if this file is
 * edited directly or left stale.
 */`

const themeNames = Object.keys(palette)
const colorTokens = Object.keys(palette.light)

/** daisyUI token -> brand token, with the per-theme overrides applied. */
const daisyFor = (theme) => ({ ...daisyMap, ...(daisyMapOverrides[theme] ?? {}) })

// ---------------------------------------------------------------- tokens.ts

const quoteKey = (key) => (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `'${key}'`)

const tokensTs = `${BANNER('src/tokens.json')}

/** The themes unitykit ships. Selected with \`data-theme\` on a root element. */
export type ThemeName = ${themeNames.map((n) => `'${n}'`).join(' | ')}

/** Every colour token, in both themes. */
export type ColorToken = ${colorTokens.map((t) => `'${t}'`).join(' | ')}

/**
 * The brand palette as literal hex strings, for anything that cannot use a CSS
 * class: charts, canvas, SVG, Remotion. Components should use the utilities
 * instead, so they follow \`data-theme\` without being told which theme is on.
 */
export const tokens: Record<ThemeName, Record<ColorToken, string>> = {
${themeNames
  .map(
    (theme) =>
      `  ${theme}: {\n${colorTokens
        .map((token) => `    ${quoteKey(token)}: '${palette[theme][token]}',`)
        .join('\n')}\n  },`,
  )
  .join('\n')}
}

/** Type, radius, shadow and spacing scales, shared with consuming apps. */
export const scales = ${JSON.stringify(scales, null, 2)
  .split('\n')
  .join('\n')} as const

/**
 * Foreground/background pairs that must meet WCAG AA for text. Used by the
 * contrast test and by the Storybook token page, so both report the same set.
 */
export const contrastPairs: ReadonlyArray<readonly [ColorToken, ColorToken]> = [
${contrastPairs.map(([fg, bg]) => `  ['${fg}', '${bg}'],`).join('\n')}
]

/** WCAG AA minimum contrast ratio for body text. */
export const AA_TEXT = ${AA_TEXT}
`

// --------------------------------------------------------------- tokens.css

const brandProps = (theme, indent) =>
  colorTokens.map((t) => `${indent}--ue-${t}: ${palette[theme][t]};`).join('\n')

const tokensCss = `${BANNER('src/tokens.json')}

/*
 * The brand palette as plain custom properties, for consumers that want the
 * values without daisyUI — raw CSS, SVG, canvas. Apps using the kit's
 * components import theme.css instead, which already carries these.
 *
 *   @import "@unityevolv/unitykit/tokens.css";
 */

:root {
  color-scheme: light;
${brandProps('light', '  ')}
}

[data-theme="dark"] {
  color-scheme: dark;
${brandProps('dark', '  ')}
}

/* Follow the operating system until an app sets data-theme explicitly. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    color-scheme: dark;
${brandProps('dark', '    ')}
  }
}
`

// ---------------------------------------------------------------- theme.css

const themeBlock = (theme) => {
  const map = daisyFor(theme)
  const flag = theme === 'light' ? '  default: true;' : '  prefersdark: true;'
  return `@plugin "daisyui/theme" {
  name: "${theme}";
${flag}
  color-scheme: ${theme};

${Object.entries(map)
  .map(([daisy, brand]) => `  --color-${daisy}: ${palette[theme][brand]};`)
  .join('\n')}

  /* Brand tokens with no daisyUI equivalent, so they switch with the theme. */
${brandProps(theme, '  ')}

  --radius-selector: ${scales.radius.md};
  --radius-field: ${scales.radius.md};
  --radius-box: ${scales.radius.lg};
  --border: 1px;
  --size-field: ${scales.size.field};
  --size-selector: ${scales.size.selector};
}`
}

const themeCss = `${BANNER('src/tokens.json')}

/*
 * unitykit theme.
 *
 * Deliberately does NOT \`@import "tailwindcss"\` — the consuming app does that
 * once. Importing it here too would pull a second copy of Tailwind into every
 * consumer.
 *
 * Consuming apps use it like this:
 *
 *   @import "tailwindcss";
 *   @import "@unityevolv/unitykit/theme.css";
 *   @source "../node_modules/@unityevolv/unitykit/dist";
 */

/*
 * sonner (the Toast engine) ships its layout stylesheet as a file rather than
 * injecting it. Importing it here means a consumer that mounts <Toaster /> has
 * nothing extra to add. It is layout only: the kit styles each toast as an
 * alert, so this costs no look of its own.
 */
@import "sonner/dist/styles.css";

/* themes: false because the two below replace daisyUI's built-ins entirely. */
@plugin "daisyui" {
  themes: false;
}

${themeNames.map(themeBlock).join('\n\n')}

/*
 * Brand-named utilities (text-ink, bg-surface, border-line) for consuming apps.
 *
 * These are aliases, not a second palette: each resolves to the daisyUI
 * variable holding the same value. Inside unitykit's own components use the
 * daisyUI names, because daisyUI generates its component classes (btn-primary,
 * alert-error) from those names and they cannot be avoided — one vocabulary per
 * file. \`npm run lint\` enforces that.
 */
@theme inline {
${Object.entries(utilityAliases)
  .map(([name, value]) => `  --color-${name}: ${value};`)
  .join('\n')}
}

/* Type, radius, shadow and spacing scales. */
@theme {
  --font-sans: ${scales.font.sans};
  --font-mono: ${scales.font.mono};

${Object.entries(scales.text)
  .map(([k, [size, height]]) => `  --text-${k}: ${size};\n  --text-${k}--line-height: ${height};`)
  .join('\n')}

${Object.entries(scales.radius)
  .map(([k, v]) => `  --radius-${k}: ${v};`)
  .join('\n')}

  --shadow-sm: ${scales.shadow.sm};
  --shadow-md: ${scales.shadow.md};

  --spacing: ${scales.space};
}
`

// ------------------------------------------------------------------- write

const stripCr = (text) => text.split(String.fromCharCode(13)).join(String())

const outputs = [
  ['../src/tokens.ts', tokensTs],
  ['../src/tokens.css', tokensCss],
  ['../src/theme.css', themeCss],
]

let stale = []
for (const [relative, contents] of outputs) {
  const target = resolvePath(relative)
  const current = existsSync(target) ? readFileSync(target, 'utf8') : null
  // Compared with carriage returns stripped. Git checks these files out with CRLF on
  // Windows, so a byte comparison would report every generated file as stale on a
  // fresh clone even though nothing had been edited.
  if (current !== null && stripCr(current) === stripCr(contents)) continue
  if (check) {
    stale.push(relative.replace('../', ''))
    continue
  }
  writeFileSync(target, contents)
  console.log(`wrote ${relative.replace('../', '')}`)
}

if (check) {
  if (stale.length) {
    console.error(
      `Generated token files are stale or hand-edited:\n` +
        stale.map((f) => `  - ${f}`).join('\n') +
        `\n\nRun \`npm run tokens\` and commit the result.`,
    )
    process.exit(1)
  }
  console.log('token files are up to date')
}
