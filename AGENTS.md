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

## Styling conventions

- Use daisyUI semantic tokens (`bg-primary`, `text-base-content`), never raw Tailwind
  colours, so themes stay consistent.
- Muted and disabled text uses opacity modifiers (`text-base-content/60`, `/40`) rather
  than picked greys, so it stays correct in both light and dark.
- Behaviour-heavy components sit on Radix primitives. daisyUI supplies appearance only —
  it ships no JavaScript. Do not hand-roll focus traps.
