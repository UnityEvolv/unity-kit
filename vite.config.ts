/// <reference types="vitest/config" />
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

const resolvePath = (relative: string) => fileURLToPath(new URL(relative, import.meta.url))

/**
 * Tailwind source, not build artifacts. theme.css holds `@plugin "daisyui"`,
 * which only the consuming app's Tailwind can resolve, and tokens.css must keep
 * its custom properties intact. Both are copied verbatim so Vite's CSS pipeline
 * never touches them.
 */
const cssSources = ['theme.css', 'tokens.css']

/**
 * Everything declared in package.json stays external, derived rather than
 * listed so adding a dependency cannot silently bundle it.
 *
 * Vite's library mode bundles anything it is not told to externalise. That is
 * right for an app and wrong for a library: a bundled dependency ships a second
 * copy to every consumer that already has it, and with an icon set it also
 * defeats the tree-shaking the library was chosen for. The subpath pattern
 * covers imports like `react/jsx-runtime`.
 */
const pkg = JSON.parse(readFileSync(resolvePath('./package.json'), 'utf8'))
const externalNames = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
]
const external = (id: string) =>
  externalNames.some((name) => id === name || id.startsWith(`${name}/`))

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], exclude: ['**/*.stories.tsx', '**/*.test.ts', '**/*.test.tsx'] }),
    {
      name: 'unitykit:copy-theme',
      closeBundle() {
        mkdirSync(resolvePath('./dist'), { recursive: true })
        for (const file of cssSources) {
          copyFileSync(resolvePath(`./src/${file}`), resolvePath(`./dist/${file}`))
        }
      },
    },
  ],
  build: {
    lib: {
      entry: resolvePath('./src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external,
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
