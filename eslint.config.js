import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['dist', 'storybook-static', 'coverage', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ['src/**/*.tsx'],
    rules: {
      // Tailwind scans built files as static text, so a class name assembled from a
      // variable produces no CSS and the component renders unstyled with no error.
      // The blind install test cannot catch this for daisyUI classes, because daisyUI
      // emits its modifier rules whenever the base component class is present, so the
      // rule exists even when nothing references it. Static analysis is the only guard.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="className"] TemplateLiteral',
          message:
            'Class names must be written out in full, not built by interpolation. Use a lookup object or a CVA config.',
        },
      ],
    },
  },
  {
    // Build config and scripts run in Node, not the browser.
    files: ['vite.config.ts', '.storybook/**/*.ts', 'scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
)
