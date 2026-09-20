# Contributing to unitykit

Short version: one component or fix per pull request, with its story and test, CI green,
squash-merged into `main`. The rest of this file is where things go and what a good change
looks like. `AGENTS.md` holds the longer reasoning behind each rule.

## Setup

```bash
npm install          # npm only — no pnpm, no yarn
npm run storybook    # develop against stories at http://localhost:6006
npm test             # vitest + jsdom
npm run lint && npm run typecheck && npm run build
```

Work is specified in Jira under **UKIT**. Branch from `main` as `UKIT-<number>-<slug>`
before you start.

## Folder layout

```
src/
  index.ts                 the public API — every export the package ships
  tokens.json              the theme: colours, roles and scales (the source of truth)
  tokens.ts, tokens.css,   generated from tokens.json by `npm run tokens`; never edit
  theme.css
  contrast.ts              WCAG contrast maths, tested against the tokens
  components/
    Button/
      Button.tsx           the component
      Button.test.tsx      behaviour and accessibility
      Button.stories.tsx   every variant and state, checked in both themes
      index.ts             re-exports for src/index.ts
    sampleProps.ts         a type helper for components with required props
scripts/
  generate-tokens.mjs      writes the generated token files
  tokens.source.mjs        web wiring around tokens.json: daisyUI mapping, aliases, contrast pairs
  blind-install-test.mjs   packs the kit and renders every export in a clean consumer app
.storybook/                Storybook config, including the theme switcher
```

## How to add a component

A checklist, because the last two items are what gets missed:

1. **Create `src/components/Name/Name.tsx`.** Props are typed from a CVA config; every
   class name is written out in full (a lookup object or `cva`), never assembled from a
   variable. Use daisyUI's colour names inside components (`text-base-content`, not
   `text-ink`). Any icon comes through `<Icon name="…" />`, never a direct icon import.
2. **Write `Name.test.tsx`.** Test behaviour and the accessibility contract: roles, names,
   keyboard, what a screen reader hears. Query by role, not by class.
3. **Write `Name.stories.tsx`.** One story per variant and state, under a sensible title
   (`Primitives/`, `Forms/`, `Feedback/`, `Navigation/`, `Overlays/`, `Data/`). Storybook
   has a light/dark switcher; check both.
4. **Add `sampleProps`** if any prop is required: `Name.sampleProps = { … } satisfies
   NameProps`. The blind install test renders every export with no knowledge of its
   types and fails by name without it.
5. **Export it** from `src/components/Name/index.ts` **and** from `src/index.ts`, types
   included. An export missing from `src/index.ts` does not ship.
6. **Document it** in `README.md` (how to use it) and, if you made a decision someone
   might undo, in `AGENTS.md` (why).
7. Run `npm run lint && npm run typecheck && npm test && npm run build`, then
   `npm run blind-test` once before opening the PR.

Behaviour that is hard to get right — focus traps, dismissal, roving focus, positioning —
comes from Radix; daisyUI supplies the look. Do not hand-roll either.

## Token conventions

- **Never use a raw Tailwind colour** (`text-gray-500`, `bg-blue-600`). Every colour is a
  token, so it follows `data-theme` and passes the contrast gate.
- **Inside `src/components/**`, use daisyUI's semantic names**: `bg-primary`,
  `text-base-content`, `bg-base-100`, `text-error`. Lint rejects a brand alias there.
  The brand aliases (`text-ink`, `bg-surface`, `text-danger`) are for consuming apps.
- **Muted text is `text-muted`, not an opacity modifier.** `text-base-content/60`
  measures about 4.1:1 on the dark theme, below AA; the `muted` token is tuned to pass
  in both themes and `src/contrast.test.ts` proves it. Disabled controls take daisyUI's
  own disabled styling (`disabled:` / `aria-disabled:` variants), which is exempt from
  the text contrast rule.
- **Changing a colour means editing `src/tokens.json`** and running `npm run tokens`.
  The generated files are checked in CI; edit them by hand and the build fails.
- **Status is never colour alone.** Pair a colour with a glyph or a word (WCAG 1.4.1).

## Pull request expectations

- **One component or one fix per PR**, named for its story (`UKIT-12: Avatar …`).
- **Story and test included.** A component PR without both is not ready for review.
- **CI green**: lint, typecheck, tests, build and the blind install test.
- Say in the description what you decided and why, especially where you departed from the
  story. Decisions are cheap to reverse in review and expensive to rediscover later.
- `main` is protected. Squash merge; the maintainer merges.

## Reporting a problem

If something renders with correct markup and no styling, check the consuming app has all
three CSS lines from the README (`@import "tailwindcss"`, the theme import and the
`@source` line) before opening an issue. That is the cause nine times in ten.
