/// <reference types="vitest/config" />
import { copyFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

const resolvePath = (relative: string) => fileURLToPath(new URL(relative, import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], exclude: ['**/*.stories.tsx', '**/*.test.tsx'] }),
    {
      // theme.css is Tailwind source, not a build artifact: it holds `@plugin "daisyui"`,
      // which only the consuming app's Tailwind can resolve. Copy it verbatim so Vite's
      // CSS pipeline never touches it.
      name: 'unitykit:copy-theme',
      closeBundle() {
        mkdirSync(resolvePath('./dist'), { recursive: true })
        copyFileSync(resolvePath('./src/theme.css'), resolvePath('./dist/theme.css'))
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
