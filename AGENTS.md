# AGENTS.md

Working conventions for this repository. Read before making changes.

## What this package is

`unitykit` is a standalone React component library built on Tailwind CSS v4 and daisyUI 5.
It has no knowledge of any consuming application: it ships components, a theme and tokens,
while consuming apps supply their own data, routing and behaviour. Every component is
router-agnostic, data-source-agnostic and state-management-agnostic. Web only.

Work is specified in Jira under the **UKIT** project. Read the story before starting; the
repository does not carry that context.

## Branching and pull requests

Trunk-based development. `main` is always releasable and is not committed to directly.

- Branch per story, named `UKIT-<number>-<short-slug>` — for example
  `UKIT-2-package-scaffold`. The key prefix is what links the branch and PR back to the
  Jira story, so keep the exact format.
- Branch **before** starting work, not after.
- One component or one fix per PR, with its story and test.
- CI must be green before merge.
- **Squash merge** into `main`, which keeps history readable and the generated changelog
  clean once release automation lands.

## Package management

**npm only.** Do not introduce `pnpm-lock.yaml` or `yarn.lock`. Commit `package-lock.json`.

## Rules that prevent silent breakage

These three failures all render correct markup with no styling and no error message. They
are the most likely cause of a "why does nothing look right" report.

**1. Class names must be static.** Tailwind scans built files as static text, so a name
assembled from a variable is invisible to it and produces no CSS.

```tsx
`btn-${variant}`          // does not work
variantClass[variant]     // works: the full name appears in the built file
```

Keep every class name written out in full, in a lookup object or a CVA config. `npm run
lint` enforces this: a template literal inside a `className` is an error.

Note that the blind install test does not catch this one. daisyUI emits its modifier rules
whenever the base component class is present, so `.btn-primary` is in the compiled CSS
whether or not anything references the name statically. Lint is the only guard.

**2. Consuming apps need the `@source` line.** Tailwind does not scan `node_modules`. Any
app using the kit needs all three lines:

```css
@import "tailwindcss";
@import "@unityevolv/unitykit/theme.css";
@source "../node_modules/@unityevolv/unitykit/dist";
```

**3. Every runtime import must be declared** in `dependencies` or `peerDependencies`.
`react` and `react-dom` are peers, never direct dependencies. npm's flat `node_modules`
resolves undeclared packages locally and then fails for consumers on a clean install.

## Before publishing

Run the blind install test: on a clean checkout with no link and no cached
`node_modules`, pack the kit, install the tarball into a throwaway Vite React app, add the
three CSS lines and render one component. It passes only if the component renders
**styled**. This catches both missing CSS scanning and undeclared dependencies, neither of
which reproduces on the author's machine.

## Design tokens

The UnityEvolv palette lives in `scripts/tokens.source.mjs` and **nowhere else**.
`src/tokens.ts`, `src/tokens.css` and `src/theme.css` are generated from it:

```bash
npm run tokens         # regenerate after changing a value
npm run tokens:check    # what CI runs; fails if a generated file is stale or hand-edited
```

UKIT-29 needs the same palette in three forms at once — custom properties, a typed
object, and daisyUI theme definitions. Three hand-kept copies drift, and the copy that
drifts is usually the one the contrast page reads, so the page reports a number the build
does not ship. Generating all three removes that failure entirely.

`src/contrast.test.ts` asserts WCAG AA for every text-weight pair in both themes, so a
colour that breaks contrast fails the pull request. The Storybook page at
`Foundations/Tokens` renders from the same functions — it is the readable view, not the
gate. `line` is deliberately exempt: WCAG 1.4.11 covers boundaries that carry meaning, and
holding a plain divider to 3:1 forces it to read as a heavy rule.

Four light-mode values deviate from UKIT-29 as originally written. The story's
`secondary`/`info`, `ok`, `warn` and `danger` measure 3.83, 4.25, 3.64 and 4.49 against the
light background, all below AA, which its own acceptance criteria require. Each is deepened
along the same hue until it clears 4.5:1 with headroom. Dark mode uses the brand values
unchanged; it already passes everywhere.

## Styling conventions

- Use daisyUI semantic tokens (`bg-primary`, `text-base-content`), never raw Tailwind
  colours, so themes stay consistent.
- **Inside components, daisyUI's colour names are the canonical ones.** The kit publishes
  brand aliases too (`text-ink`, `bg-surface`, `border-line`, `text-danger`), but those are
  for consuming apps. daisyUI generates its component classes from its own token names —
  `btn-primary`, `alert-error` — and there is no way to write `btn-ink`, so daisyUI's
  vocabulary cannot be removed from this repository. Adding a second one that components
  also use would mean two names for the same colour in the same file. `npm run lint`
  rejects a brand alias in `src/components/**`.
- Muted text uses the `muted` token (`text-muted`, or `--ue-muted` outside Tailwind), not
  an opacity modifier. `text-base-content/60` composites to roughly 4.1:1 on the dark
  background — below AA — whereas both `muted` values are checked in CI and pass. Opacity
  modifiers are still right for **disabled** state, where AA does not apply.
- Behaviour-heavy components sit on Radix primitives. daisyUI supplies appearance only —
  it ships no JavaScript. Do not hand-roll focus traps.
