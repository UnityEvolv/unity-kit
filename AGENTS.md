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

`src/contrast.test.ts` asserts contrast for every pair in both themes, so a colour that
breaks it fails the pull request. The Storybook page at `Foundations/Tokens` renders from
the same functions — it is the readable view, not the gate.

Every hover value is checked as well as its base, because a hover state that drops below AA
is the easiest one to miss — nobody screenshots it.

`line` is exempt. WCAG 1.4.11 covers boundaries that carry meaning, and holding a plain
divider to 3:1 forces it to read as a heavy rule.

Four light-mode values differ from UKIT-29's first draft. Its `secondary`/`info`, `ok`,
`warn` and `danger` measured 3.83, 4.25, 3.64 and 4.49 against the light background, below
the AA the story also required, so each was deepened along its own hue until it cleared
4.5:1 with headroom. The story now carries the deepened values, so they are not a
deviation — but the originals are still in older drafts, and restoring one would fail the
build rather than pass silently. Dark mode was never changed; it already passes everywhere.

### There is no third hue

Two hues plus the status colours is the whole palette. An accent was tried and removed: any
third hue that carries white text at AA lands in the warm band already occupied by `warn`
and `danger`. Measured with CIEDE2000, amber at that lightness is ΔE 1.7 from `warn` —
the same colour — and the best warm option anywhere is ΔE 14.6, against a palette that
otherwise spaces its colours 22–29 apart.

daisyUI always emits an accent, so `--color-accent` is aliased to primary. Without that,
any consumer writing `btn-accent` would get daisyUI's default teal and nothing would fail.
`src/contrast.test.ts` reads the generated theme and asserts the alias holds.

Highlights that are not actions — a raised hand, an unread mention, a recording indicator —
use `secondary`.

## Variants: CVA is the convention

Any component with variants follows `src/components/Button/Button.tsx`: one `cva()`
config holding class names written out in full, prop types derived from that config, and
a lookup table for anything that has to scale with a variant, such as the icon or spinner
size. Do not concatenate class strings, and do not add a `className` escape hatch for a
variant that should be in the config.

- **Derive prop types with `NonNullable<VariantProps<typeof x>['size']>`**, not by
  extending `VariantProps` directly. That type admits `null` for every variant — CVA's way
  of spelling "no class" — and a nullable `size` cannot index a lookup table. This costs
  ten minutes to rediscover every time.
- **Emit a class for every size, including the default.** `btn-md` exists; leaving the
  default as an empty string makes the output depend on daisyUI's defaults rather than on
  this config, and makes a size impossible to assert in a test.
- **A variant that maps to nothing should not exist.** There is no `accent` button, because
  daisyUI's accent is aliased to primary and the variant would be a synonym; there is no
  `link` badge, because daisyUI has no badge equivalent and the name would map to no class.

## Icons

Every icon goes through `<Icon name="..." />`. `src/components/Icon/icons.ts` is the only
file allowed to name a Lucide component, and `npm run lint` fails a direct `lucide-react`
import anywhere else — including a type-only import. That is what keeps a library swap to
one table instead of every call site.

- **Names are ours, and describe the job, not the drawing.** `share`, not `monitor-up`;
  `record`, not `circle-dot`; `trash`, not `trash-2`. A few coincide with Lucide's because
  the obvious word is the same. Adding an icon means adding a row to the table, which is
  also what makes it appear in the Storybook page and in the test that walks every name.
- **Colour is never set by the icon.** It inherits `currentColor`, so colour the parent.
  An icon that sets its own colour breaks in the other theme and nobody notices until a
  screenshot.
- **Sizes are a union, not a number.** `xs` 14 through `xl` 32. Anything larger is an
  illustration, and the type is what enforces that without a runtime check.
- **Decorative by default.** An icon is `aria-hidden` unless given a `title`. An icon-only
  button takes its name from the button; adding a `title` as well announces it twice.
- **New custom icons match Lucide's geometry**: 24x24 viewBox, 2px stroke, `currentColor`,
  round caps and joins. Put them in `customIcons.tsx` with a comment saying why Lucide's
  equivalent did not work — the tests assert the geometry, but not the reason.
- Never ship an emoji as an icon.
- **A component that shows an icon takes it as a prop, not as a child.** `<Button
  icon="invite">Invite</Button>`, not `<Button><Icon name="invite" /></Button>`. Composition
  works — daisyUI's `.btn` is already a flex row with a gap — but it pushes decisions onto
  the caller that the kit should own: which icon size pairs with which text size, and
  `btn-square` for the icon-only case, which is a daisyUI class name a consumer must never
  have to write.
- **An icon-only control must not compile without an accessible name.** The icon is
  `aria-hidden`, so there is nothing left to announce. Use two prop shapes — one requiring
  `children`, one requiring `icon` and `aria-label` — rather than a runtime warning nobody
  reads. `Button` is the worked example.

A component with a required prop must declare `sampleProps`, because the blind install
test renders every export blind:

```tsx
Icon.sampleProps = { name: 'mic' } satisfies IconProps
```

Leave it off and the test fails by name asking for it. It does not skip the component,
because skipping would drop the one whose real risk — an undeclared dependency on the icon
library — is exactly what that test exists to catch.

## Alerts

`Alert` is a message that belongs on the page. `Toast` (UKIT-8) is transient feedback
about something that already happened. If it is still true after a reload, it is an
alert.

- **Urgency is part of the variant, not a separate prop.** `warn` and `danger` render
  `role="alert"`, which is assertive and interrupts a screen reader mid-sentence;
  `info` and `ok` render `role="status"`, which waits. Anything added later that speaks
  makes the same choice deliberately rather than defaulting to `alert` because it is
  the more familiar word.
- **Colour never carries a difference on its own.** WCAG 1.4.1. `warn` and `danger`
  draw different glyphs, which is why `icons.ts` gained an `error` row: `alert` was
  already the warning triangle, and one picture in two colours is not a distinction.
  A test asserts all four variants render different SVG, so adding a fifth that reuses
  a glyph fails the build.
- **The kit never remembers a dismissal.** `onDismiss` fires and the alert stays on
  screen. Whether a notice returns on the next load is a product decision, and a
  component that hides itself cannot be brought back without a re-render the app did
  not ask for. The same rule applies to anything dismissible added later.
- **`banner` is a prop, not a second component.** A `Banner` would be an `Alert` with
  two class names changed, and a second name for one thing drifts.
- **The title is a `p`, and there is no `titleAs`.** Unlike `EmptyState`, which replaces
  a region's content and may need a heading, an alert is a notice inside a region that
  already has one. Adding a prop nobody needs is worse than the inconsistency.

## Brand

`Brand` renders a product's identity: the monogram, then the name split across the
secondary and primary tones. Products live in one table inside the component, so adding
one is a row and nothing else.

- **The marks in `src/components/Brand/marks.tsx` are placeholder artwork.** They are
  geometric letterforms at the right proportions and colour split, not the real logo,
  which the website only ships as a PNG. Replacing them is that file alone — `Brand` asks
  for a mark at a height and nothing more — so do not work around them elsewhere.
- **The two-tone split is decoration, not information.** The wordmark is `aria-hidden` and
  the wrapper carries the full product name, so a screen reader says `unityofis` once
  rather than reading two fragments. Keep it that way when adding a product.
- `ofiskit` shares the UO mark with `unityofis` on purpose: the engine carries the
  product's mark rather than earning a third one.

## Styling conventions

- Use daisyUI semantic tokens (`bg-primary`, `text-base-content`), never raw Tailwind
  colours, so themes stay consistent.
- **Inside components, daisyUI's colour names are the canonical ones.** The kit publishes
  brand aliases too (`text-ink`, `bg-surface`, `border-line`, `text-danger`), but those are
  for consuming apps. daisyUI generates its component classes from its own token names —
  `btn-primary`, `alert-error` — and there is no way to write `btn-ink`, so daisyUI's
  vocabulary cannot be removed from this repository. Adding a second one that components
  also use would mean two names for the same colour in the same file. `npm run lint`
  rejects a brand alias in `src/components/**` — but only one that *duplicates* a daisyUI
  name. The rule is derived from the token source, so `muted`, `surface-raised`, the hover
  steps and `focus` stay available everywhere: they have no daisyUI counterpart, and
  forbidding them would leave components with no way to write them at all.
- **Each colour has one job.** `primary` carries actions — buttons, join, the selected
  item, the focus ring. `secondary` is the second voice: links, the active speaker, the
  in-a-call status, and anything needing attention without being an action (a raised hand,
  an unread mention, a recording indicator). `danger` is a real button variant, not only a
  status colour — delete, remove, revoke, end, leave call — and has its own hover and ink
  so a destructive button is as finished as a primary one. `ok` and `warn` are status;
  `info` is a neutral notice. Everything else stays neutral so the content is the colour on
  screen.
- **Hover values are brand tokens, not daisyUI ones.** daisyUI derives a hover shade
  automatically; UKIT-29 gives primary, secondary and danger their own. Components spell
  them `hover:bg-primary-hover` and so on — these are `--ue-*` aliases with no daisyUI
  counterpart, so the naming rule below does not apply to them.
- Muted text uses the `muted` token (`text-muted`, or `--ue-muted` outside Tailwind), not
  an opacity modifier. `text-base-content/60` composites to roughly 4.1:1 on the dark
  background — below AA — whereas both `muted` values are checked in CI and pass. Opacity
  modifiers are still right for **disabled** state, where AA does not apply.
- Behaviour-heavy components sit on Radix primitives. daisyUI supplies appearance only —
  it ships no JavaScript. Do not hand-roll focus traps.
