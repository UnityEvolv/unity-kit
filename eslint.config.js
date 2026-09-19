import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import { utilityAliases } from './scripts/tokens.source.mjs'

/**
 * Brand aliases that duplicate a daisyUI name, derived from the token source
 * rather than listed here, so adding a token cannot silently escape the rule.
 *
 * Only aliases resolving to a `--color-*` variable qualify: those have a
 * daisyUI spelling that components must use instead. Aliases resolving to
 * `--ue-*` (muted, surface-raised, the hover steps, focus) have no daisyUI
 * counterpart and are the only spelling that exists, so components have to be
 * allowed to use them.
 */
const duplicated = Object.entries(utilityAliases)
  .filter(([, value]) => value.includes('--color-'))
  .map(([name]) => name)
  // Longest first, so surface-raised cannot be shadowed by surface.
  .sort((a, b) => b.length - a.length)

// Written without backslash escapes on purpose: they do not survive being
// generated through a shell, and a silently mangled regex here would disable
// the rule without failing anything.
const PREFIXES = 'text|bg|border|ring|outline|fill|stroke|divide|from|via|to'
const BRAND_UTILITY = `/(^|[ ])(${PREFIXES})-(${duplicated.join('|')})([ ]|[/]|$)/`

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
    // The Icon component is the kit's only door to an icon library. Keeping
    // every other file off lucide-react is what makes swapping libraries later
    // one table rather than an edit everywhere an icon appears — and it is the
    // rule consuming apps inherit the benefit of, since they only ever see
    // <Icon name="..." />.
    files: ['src/**/*.{ts,tsx}', '.storybook/**/*.{ts,tsx}'],
    ignores: ['src/components/Icon/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lucide-react',
              message:
                'Import { Icon } from the kit instead. Icons are named in src/components/Icon/icons.ts so the library can be swapped in one file.',
            },
          ],
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
