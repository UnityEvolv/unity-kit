/// <reference types="vitest/config" />
import { copyFileSync, mkdirSync } from 'node:fs'
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
      external: ['react', 'react-dom', 'react/jsx-runtime'],
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
