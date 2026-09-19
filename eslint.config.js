import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

/**
 * Brand-named colour utilities (text-ink, bg-surface, border-line). They are
 * published for consuming apps, but inside unitykit's own components the
 * daisyUI names are canonical — see the rule below for why.
 */
const BRAND_UTILITY =
  '/(^|[ ])(text|bg|border|ring|outline|fill|stroke|divide|from|via|to)-(ink|muted|surface-raised|surface|line|ok|warn|danger|primary-ink|primary-hover|secondary-ink|focus)([ ]|[/]|$)/'

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
      'no-restricted-syntax': [
        'error',
        {
          // Tailwind scans built files as static text, so a class name assembled from a
          // variable produces no CSS and the component renders unstyled with no error.
          // The blind install test cannot catch this for daisyUI classes, because daisyUI
          // emits its modifier rules whenever the base component class is present, so the
          // rule exists even when nothing references it. Static analysis is the only guard.
          selector: 'JSXAttribute[name.name="className"] TemplateLiteral',
          message:
            'Class names must be written out in full, not built by interpolation. Use a lookup object or a CVA config.',
        },
      ],
    },
  },
  {
    files: ['src/components/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          // unitykit ships two names for most colours: daisyUI's (base-content, error)
          // and the brand's (ink, danger). Both are real utilities, so without a rule
          // each component would pick whichever its author thought of first and the
          // codebase would end up with two vocabularies in the same file.
          //
          // daisyUI's win inside components because they cannot be avoided: daisyUI
          // generates btn-primary and alert-error from its own token names, and there
          // is no way to make btn-ink. The brand names stay for consuming apps, where
          // no daisyUI component class is involved.
          selector: `Literal[value=${BRAND_UTILITY}]`,
          message:
            'Use the daisyUI colour name inside components (text-base-content, bg-error) — the brand aliases are for consuming apps. See AGENTS.md.',
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
