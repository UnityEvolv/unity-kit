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
@import "unitykit/theme.css";
@source "../node_modules/unitykit/dist";
```

```tsx
import { Button } from 'unitykit'

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
| `npm run lint` | ESLint, including the static-class-name rule |
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
