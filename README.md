# unitykit

[![CI](https://github.com/UnityEvolv/unity-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/UnityEvolv/unity-kit/actions/workflows/ci.yml)

Shared React component library for UnityEvolv, built on Tailwind CSS v4 and daisyUI 5.

The kit has no knowledge of any consuming application. It ships components, a theme and
its tokens; consuming apps supply their own data, routing and behaviour.

## Install

```bash
npm install github:UnityEvolv/unity-kit#main
```

No registry is involved. `dist/` is not committed — the package builds itself on install
via the `prepare` script.

## Usage

Three lines in your app's CSS entry point, then import components normally.

```css
@import "tailwindcss";
@import "@unityevolv/unitykit/theme.css";
@source "../node_modules/@unityevolv/unitykit/dist";
```

```tsx
import { Button } from '@unityevolv/unitykit'

export function Example() {
  return <Button variant="primary">Save</Button>
}
```

> **The `@source` line is not optional.** Tailwind does not scan `node_modules`, so
> without it the kit's class names produce no CSS at all. Components render with correct
> markup and no styling, and nothing errors. If something looks unstyled, check this first.

## Design decision: this package ships source, not compiled CSS

unitykit ships **compiled JavaScript with Tailwind and daisyUI class names left intact as
strings**, plus a `theme.css` containing only `@plugin "daisyui"` and the brand token
overrides. It ships **no bundled utility CSS**. Your app's own Tailwind build is what turns
those class names into real CSS.

Chosen because:

- Utility-class overrides on a kit component just work, with no specificity fights
- One Tailwind instance and one theme across the app and the kit
- No duplicated daisyUI CSS when the consuming app already uses daisyUI

The cost is the `@source` requirement above. `theme.css` deliberately does not
`@import "tailwindcss"` itself — the consuming app does that once.

## Design tokens

The UnityEvolv palette ships in both themes. Importing `theme.css` is enough — it carries
the tokens, the daisyUI themes built from them and the brand-named utilities.

```tsx
<html data-theme="dark">
```

Without `data-theme`, the kit follows the operating system via `prefers-color-scheme` and
switches the moment an app sets the attribute.

Colours are available three ways:

```tsx
// daisyUI names — use these inside components
<p className="text-base-content bg-base-100" />

// brand aliases — for consuming apps
<p className="text-ink bg-surface border-line" />

// literal values, for charts, canvas, SVG and Remotion
import { tokens } from '@unityevolv/unitykit'
tokens.dark.primary // '#C27FFF'
```

Apps that want only the values, with no daisyUI, can import them alone:

```css
@import "@unityevolv/unitykit/tokens.css";   /* --ue-primary, --ue-ink, ... */
```

### One source, generated three ways

Every value lives in `scripts/tokens.source.mjs`. `src/tokens.ts`, `src/tokens.css` and
`src/theme.css` are generated from it by `npm run tokens`, and CI fails if a generated file
is stale or hand-edited. The palette exists in three forms because consumers need all
three, and three hand-kept copies drift — usually the one the contrast page reads, so the
page ends up reporting a number the build does not ship.

### Contrast is a build gate, not a page

`src/contrast.test.ts` asserts WCAG AA (4.5:1) for every text-weight pair in both themes,
reading the same tokens the CSS is generated from. A colour that breaks contrast fails the
pull request. The `Foundations/Tokens` Storybook page renders every ratio from the same
functions — it is the readable view, not the check.

Four light-mode values are deeper than the raw brand palette. `#25E0F8` cyan measures
1.6:1 on white and `#C27FFF` lavender 2.1:1, so neither can carry text in light mode; the
brand is dark-first. The light theme uses deepened partners of the same hue, and dark mode
uses the brand values unchanged.

`line` is exempt from the contrast check by design: WCAG 1.4.11 covers boundaries that
carry meaning, not dividers that merely separate content.

## Local development

```bash
npm install
npm run dev      # vite build --watch
```

To develop against a real app, link the kit:

```bash
# in unity-kit
npm link

# in the consuming app
npm link unitykit
```

Add this to the consuming app's Vite config while linked:

```ts
export default defineConfig({
  resolve: { dedupe: ['react', 'react-dom'] },
})
```

`npm link` symlinks the package, which lets a second copy of React load alongside the
app's own. The symptom is an `Invalid hook call` error that does not mention linking or
React duplication at all. `dedupe` prevents it.

## Blind install test

`npm run blind-test` runs automatically on every pull request. It packs the kit and
installs the tarball into a throwaway Vite React app in a temporary directory, with no
link back to this checkout — a tarball install is the honest test, because `npm link` and
workspace installs both resolve packages the kit never declared.

It renders every exported component, collects the class names they emit, and requires each
one to resolve to a non-empty rule in the app's compiled CSS. New components are covered
automatically, with no per-component setup.

That fails the build on:

- **an undeclared runtime dependency** — npm's flat `node_modules` resolves these locally
  and then fails for consumers on a clean install
- **a missing `@source` line**, which stops Tailwind scanning the kit entirely

It does *not* catch a class name assembled from a variable; daisyUI emits its modifier
rules whenever the base component class is present, so the CSS exists either way. `npm run
lint` guards that instead.

Use `npm run blind-test -- --keep` to leave the generated app in place for inspection.

## Storybook

```bash
npm run storybook        # dev server on :6006
```

Build components here rather than in a product app. The toolbar switches between the
light and dark daisyUI themes, so every story can be checked in both — which is the
fastest way to catch a token that only works in one.

`src/components/Button/Button.stories.tsx` is the template every component follows:
`Category/Component` title, `autodocs` for the generated props page, one story per
meaningful state, and an `AllVariants` story that shows them together.

CI builds every story, so a broken story fails the PR.

## Scripts

| Script | Does |
| --- | --- |
| `npm run build` | Build `dist/` — ESM bundle, `.d.ts` declarations, `theme.css` |
| `npm run dev` | Same, in watch mode |
| `npm run tokens` | Regenerate the token files from `scripts/tokens.source.mjs` |
| `npm run tokens:check` | Fail if a generated token file is stale or hand-edited |
| `npm run lint` | ESLint: static class names, and daisyUI naming inside components |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest unit tests |
| `npm run blind-test` | Pack and install into a throwaway app (see above) |
| `npm run storybook` | Storybook dev server on :6006 |
| `npm run build-storybook` | Static Storybook into `storybook-static/` |

## Contributing

Every runtime import must be declared in `dependencies` or `peerDependencies`. `react` and
`react-dom` are peers, never direct dependencies.

### Class names must be static

Never assemble a class name from a variable:

```tsx
`btn-${variant}`          // does not work: produces no CSS, silently
variantClass[variant]     // works: full names appear in the built file
```

Tailwind scans built files as static text. An interpolated name is invisible to it, so the
component renders with correct markup and no styling, and nothing errors — the same symptom
as a missing `@source` line. Keep every class name written out in full, in a lookup object
or a CVA config. This is the main reason UKIT-5 moves the library onto
class-variance-authority.

### Use daisyUI's colour names inside components

The kit publishes two names for most colours — daisyUI's (`base-content`, `error`) and the
brand's (`ink`, `danger`). Both are real utilities. Inside `src/components/**`, use
daisyUI's:

```tsx
<p className="text-base-content bg-base-100" />   // in the kit
<p className="text-ink bg-surface" />             // in a consuming app
```

daisyUI generates its component classes from its own token names — `btn-primary`,
`alert-error` — and there is no way to write `btn-ink`, so that vocabulary is already
unavoidable here. A second one would mean two names for the same colour in the same file.
`npm run lint` rejects a brand alias in a component.

The brand aliases exist because consuming apps write their own markup, where no daisyUI
component class is involved, and `text-ink` reads better than `text-base-content`.
