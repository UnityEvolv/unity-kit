/**
 * Blind install test.
 *
 * Packs the kit into a tarball and installs it into a throwaway Vite React app in a
 * fresh directory, with no link back to this checkout. A tarball install is the honest
 * test: `npm link` and workspace installs both resolve packages the kit never declared,
 * so they pass locally and fail for real consumers.
 *
 * It catches two failures that produce correct markup, no styling and no error message:
 *
 *   1. an undeclared runtime dependency, which npm's flat node_modules hides locally
 *   2. a consumer missing its `@source` line, which stops Tailwind scanning the kit at
 *      all, so that none of its classes resolve
 *
 * It deliberately does NOT claim to catch a class name assembled from a variable.
 * daisyUI emits its modifier rules whenever the base component class is present, so
 * `.btn-primary` exists in the compiled CSS whether or not anything references that name
 * statically. Verified by reintroducing the bug and watching this test still pass. The
 * ESLint rule banning template literals in `className` is the guard for that instead.
 *
 * Rather than probing one known class, it renders every exported component, collects the
 * class names they actually emit, and requires each one to resolve to a non-empty rule in
 * the consuming app's compiled CSS. New components are covered automatically.
 */
import { execSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const KIT_ROOT = resolve(import.meta.dirname, '..')
const KEEP = process.argv.includes('--keep')

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit', env: process.env })
const capture = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8', env: process.env }).trim()

const step = (msg) => console.log(`\n=== ${msg} ===`)

const BACKSLASH = String.fromCharCode(92)

/**
 * Does `cls` appear in `css` as a selector with a non-empty rule body?
 *
 * Tailwind escapes characters that are not valid in a bare selector, so `w-1/2` is
 * emitted as `.w-1\/2`. Both spellings are tried.
 */
function classResolves(css, cls) {
  const plain = '.' + cls
  const escaped =
    '.' + [...cls].map((ch) => (/[a-zA-Z0-9_-]/.test(ch) ? ch : BACKSLASH + ch)).join('')

  for (const needle of new Set([plain, escaped])) {
    let from = 0
    for (;;) {
      const at = css.indexOf(needle, from)
      if (at === -1) break
      // Guard against matching a prefix: `.btn` must not be satisfied by `.btn-primary`.
      const next = css[at + needle.length] ?? ''
      if (!/[\w-]/.test(next)) {
        const open = css.indexOf('{', at)
        const close = css.indexOf('}', open)
        if (open !== -1 && close !== -1 && css.slice(open + 1, close).includes(':')) return true
      }
      from = at + needle.length
    }
  }
  return false
}

const workdir = mkdtempSync(join(tmpdir(), 'unitykit-blind-'))
let failed = false

try {
  step('Building and packing the kit')
  run('npm run build', KIT_ROOT)
  // `npm pack` runs the prepare script, so the build's own output reaches stdout as
  // well. The tarball name is the last line.
  const packed = capture(`npm pack --silent --pack-destination "${workdir}"`, KIT_ROOT)
  const tarball = packed.split(/\r?\n/).pop().trim()
  const tarballPath = join(workdir, tarball)
  console.log(`packed ${tarball}`)

  step('Scaffolding a throwaway consumer app')
  const app = join(workdir, 'consumer')
  mkdirSync(join(app, 'src'), { recursive: true })

  writeFileSync(
    join(app, 'package.json'),
    JSON.stringify({ name: 'blind-consumer', private: true, type: 'module' }, null, 2),
  )

  writeFileSync(
    join(app, 'vite.config.js'),
    `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { dedupe: ['react', 'react-dom'] },
})
`,
  )

  writeFileSync(
    join(app, 'index.html'),
    `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>blind</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`,
  )

  // The @source line is what makes Tailwind scan the kit. Without it every kit class
  // silently produces no CSS, which is one of the two failures under test.
  writeFileSync(
    join(app, 'src', 'index.css'),
    `@import "tailwindcss";\n@import "unitykit/theme.css";\n@source "../node_modules/unitykit/dist";\n`,
  )

  writeFileSync(
    join(app, 'src', 'components.js'),
    `import * as kit from 'unitykit'

const isComponent = (value) =>
  typeof value === 'function' ||
  (typeof value === 'object' && value !== null && 'render' in value)

export const components = Object.entries(kit).filter(([, value]) => isComponent(value))
`,
  )

  writeFileSync(
    join(app, 'src', 'main.jsx'),
    `import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { components } from './components.js'
import './index.css'

createRoot(document.getElementById('root')).render(
  components.map(([name, Component]) => createElement(Component, { key: name }, name)),
)
`,
  )

  // Rendered server-side so a runtime error surfaces as a failure here rather than as a
  // blank page nobody is watching, and so the emitted class names can be collected.
  writeFileSync(
    join(app, 'render.mjs'),
    `import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { components } from './src/components.js'

const html = components
  .map(([name, Component]) => renderToStaticMarkup(createElement(Component, null, name)))
  .join('')

console.log(JSON.stringify({ names: components.map(([name]) => name), html }))
`,
  )

  step('Installing dependencies and the packed kit')
  run('npm install --no-fund --no-audit react react-dom', app)
  run('npm install --no-fund --no-audit -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite', app)
  run(`npm install --no-fund --no-audit "${tarballPath}"`, app)

  step('Rendering every exported component')
  const rendered = JSON.parse(capture('node render.mjs', app))
  if (rendered.names.length === 0) {
    throw new Error('the kit exported no components to render')
  }
  console.log(`rendered ${rendered.names.length}: ${rendered.names.join(', ')}`)

  const used = new Set()
  for (const [, value] of rendered.html.matchAll(/class="([^"]*)"/g)) {
    for (const cls of value.split(/\s+/).filter(Boolean)) used.add(cls)
  }
  if (used.size === 0) {
    throw new Error('no class names were emitted, so styling cannot be verified')
  }
  console.log(`class names in use: ${[...used].join(', ')}`)

  step('Building the consumer app')
  run('npx vite build', app)

  step('Checking every class resolves to real CSS')
  const assetsDir = join(app, 'dist', 'assets')
  const cssFile = readdirSync(assetsDir).find((f) => f.endsWith('.css'))
  if (!cssFile) throw new Error('the consumer build emitted no CSS at all')
  const css = readFileSync(join(assetsDir, cssFile), 'utf8')

  const missing = [...used].filter((cls) => !classResolves(css, cls))

  if (missing.length > 0) {
    failed = true
    console.error(
      `\nFAIL: ${missing.length} class name(s) produced no CSS: ${missing.join(', ')}\n\n` +
        'Either a class name is being assembled from a variable, which Tailwind\n' +
        'cannot see when it scans built files as static text, or the consuming app\n' +
        'is missing its @source line. Both render correct markup with no styling.\n',
    )
  } else {
    console.log(
      `\nPASS: all ${used.size} class name(s) resolve to real CSS (${(css.length / 1024).toFixed(1)} kB emitted)\n`,
    )
  }
} catch (error) {
  failed = true
  console.error(`\nFAIL: ${error.message}\n`)
} finally {
  if (KEEP) {
    console.log(`workdir kept at ${workdir}`)
  } else {
    rmSync(workdir, { recursive: true, force: true })
  }
}

process.exit(failed ? 1 : 0)
