# unitykit

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

Run this before every publish. It is the only check that catches both of the failures
that do not show up on the author's machine.

1. On a clean machine or container, with no link and no cached `node_modules`, scaffold a
   throwaway Vite React app
2. `npm install github:UnityEvolv/unity-kit#main`
3. Add the three CSS lines above
4. Render one `Button`

It passes only if the Button renders **styled**. A styled Button proves Tailwind scanned
the kit's `dist/`, and proves the kit declared every package it imports at runtime — npm's
flat `node_modules` hides undeclared dependencies locally but not in a clean install.

## Scripts

| Script | Does |
| --- | --- |
| `npm run build` | Build `dist/` — ESM bundle, `.d.ts` declarations, `theme.css` |
| `npm run dev` | Same, in watch mode |
| `npm run typecheck` | `tsc --noEmit` |

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
