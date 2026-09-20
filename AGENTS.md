# AGENTS.md

Working conventions for this repository. Read before making changes. `CONTRIBUTING.md` is
the short checklist for a first contribution; this file holds the reasoning behind it.

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

## Releases

Versioning and publishing are automated with Changesets (UKIT-27). The parts a
contributor touches:

- **Every PR that changes the package adds a changeset**: `npx changeset`, pick the bump
  level, describe the change for the changelog. A docs-only PR adds an empty one
  (`npx changeset add --empty`). CI's "Changeset present" job fails a PR without one.
- **Semver, on 0.x until the API settles.** While on 0.x a breaking change is a `minor`,
  a new component or feature a `minor` too, and a fix a `patch`. The first release is
  0.1.0.
- **Nothing publishes on merge to main.** The release workflow opens or updates a
  "Version Packages" PR that bumps `package.json`, rewrites `CHANGELOG.md` from the
  pending changesets and deletes them. Merging that PR is what publishes to npm
  (`--access public`, with provenance) and creates the GitHub release. Small changes
  batch into one release; the PR is the gate.
- **`CHANGELOG.md` is generated.** Do not edit it by hand; fix the changeset instead.
- **`npm link` stays the developer loop.** Versions are for consumers.
- The publishing token (`NPM_TOKEN`) must belong to the `unityevolv` npm org before the
  first release.

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

The UnityEvolv palette lives in `src/tokens.json` and **nowhere else**. It is published as
`@unityevolv/unitykit/tokens.json` for consumers outside React (UKIT-11), so its shape is
public API. `scripts/tokens.source.mjs` reads it and adds the web-only wiring (daisyUI
mapping, utility aliases, contrast pairs); `src/tokens.ts`, `src/tokens.css` and
`src/theme.css` are generated from it:

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

## Avatars

- **The colour is derived, never stored.** `tintIndexFor` hashes the name into one of six
  slots, so the same person is the same colour in every app with nothing written down.
  Changing the hash re-colours everyone, so treat it as a public API.
- **Six tints, because the palette is two hues.** A seventh colour that was neither
  violet nor teal would be the third hue UKIT-29 removed, so each hue appears twice —
  vivid and muted — and the separation comes from lightness. CIEDE2000 puts the closest
  pair at 15.3 in light mode and 17.8 in dark. Adding a tint means checking both numbers,
  not just picking something that looks nice.
- **Initials are text.** WCAG 1.4.3 applies, so every tint is in `contrastPairs` against
  the ink it is drawn with. The tints are `--ue-*` custom utilities rather than daisyUI
  ones, which means nothing else would notice if they stopped being emitted — the avatar
  would simply go transparent — so `Avatar.test.tsx` asserts the generated theme still
  defines all eight.
- **Status is never colour alone.** WCAG 1.4.1. The dot is `aria-hidden` and the word
  goes into the accessible name. Anything added later that signals state by colour does
  the same.
- **daisyUI's avatar classes are deliberately unused.** It ships `avatar-online` and
  `avatar-offline` and nothing for busy or away, so half the states would be its dot and
  half ours, at two sizes and two positions. Four drawn the same way is simpler than two
  borrowed and two invented. `avatar-group` is also unused: it sets `overflow: hidden`,
  which clips the status dots.
- **Size travels by context, not by cloning children.** `AvatarGroup` provides it and
  `Avatar` reads it. Cloning would work until someone wrapped an avatar in a tooltip or a
  link, at which point the clone lands on the wrapper and the size vanishes.

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

## File dropzone

- **The target is a `<button type="button">`**, not a `div` with `tabIndex` and key
  handlers: it is labelable (so the Field's `label` works), focusable, and Enter/Space
  are native. The `<input type="file">` is a sibling with `tabIndex=-1` and
  `aria-hidden`, opened programmatically; its `value` is cleared after each change so
  picking the same file twice still fires.
- **`accept` filters drops too.** The attribute only filters the picker; dropped files
  bypass it, so `accepts()` re-checks by extension, `type/*` wildcard and exact type.
- **The kit never uploads.** `progress` and `fileErrors` are props keyed by
  `fileKey(file)` (name, size, lastModified), because two `File` objects for the same
  file are not equal and a `File` has no id.
- **Rejections are the dropzone's state; `error` is the Field's.** They answer different
  questions ("why was this file refused" vs "what does the form require") and both can be
  true at once.

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

## Toasts

`Toaster` wraps sonner with `unstyled: true` and dresses each toast through sonner's
`classNames` as a daisyUI `alert`; `toast` wraps sonner's function so the kit owns the
API surface and the option names.

- **Do not use daisyUI's `.toast` shell.** It positions with `position: fixed`, and so does
  sonner; two things placing the same list fight. sonner positions, daisyUI styles the
  message. `theme.css` carries `@import "sonner/dist/styles.css"` because sonner 2 ships
  its layout CSS as a file rather than injecting it, and a consumer should not have to
  know that.
- **`theme` is pinned to `light`.** sonner's theme only drives its stock look, which is
  off; leaving it on `system` makes sonner read `prefers-color-scheme` on its own, out of
  step with `data-theme`.
- **The close button is `order-last`.** sonner renders it first in the DOM and places it
  absolutely in styled mode; unstyled, the grid would put it in the first column.
- **Icons come from the kit's table**, the same glyphs `Alert` uses per variant, so an
  event reported both ways shows one picture. `loading` uses `spinnerClass`, not the
  `Spinner` component, because the toast is already a live region.
- **`toast.success/error/warning/info` are the names**, per the story and every toast
  library; they are functions, not a `variant` prop, so `Alert`'s `ok/warn/danger` does
  not apply.

## Form primitives

Every control renders through `Field`. Nothing in the kit draws its own label.

- **`error` is one prop that does four things**: shows the message, points
  `aria-describedby` at it, sets `aria-invalid`, and picks the `-error` class. The class
  is taken from the wiring — `control['aria-invalid'] === true` — rather than recomputed,
  so a red border without `aria-invalid` is not expressible.
- **Help stays visible under an error.** Help is the rule, the error is the breach, and
  hiding the rule when it is broken is backwards. Both go into `aria-describedby`.
- **Required is the attribute, not the asterisk.** The marker is `aria-hidden`, and a test
  asserts the accessible name is still "Email" rather than "Email star". Note that
  `getByLabelText` matches raw text and disagrees; assert `toHaveAccessibleName`.
- **`Field` takes a function child.** That is how a control the kit does not ship gets the
  same wiring, and it is why `Field` needs no context and no `cloneElement`.
- **A group of controls needs `as="fieldset"`.** A legend is the only thing that names a
  set of radios; without it a screen reader reads options and never says what they are
  options for. A disabled fieldset disables its contents natively, so the control is not
  also given `disabled` — the browser already did it.
- **`Radio` requires `name`.** A radio without one is not a choice, it is a checkbox that
  cannot be unchecked. The type asks rather than letting it be forgotten.
- **`Toggle` is a checkbox, not `role="switch"`.** Same keyboard behaviour, same form
  value, same announcement; only the drawing differs. Use it where the change applies
  immediately, and `Checkbox` where the answer is submitted with a form.
- **A `Select` placeholder needs an empty starting value, not just `disabled`.** The
  browser skips disabled options when choosing the initial selection, so a disabled
  placeholder alone is never the one showing and the user silently answers a question they
  never saw. `Select` sets `defaultValue=""` when a placeholder is given and the caller has
  set neither `value` nor `defaultValue`.
- **Sizes resolve to the theme's units.** `--size-field` for inputs, selects and
  textareas; `--size-selector` for the checkbox family. Both are stated in the generated
  theme now, so control heights come from the brand rather than from daisyUI's fallback.
  Do not set a height on a control.
- **daisyUI 5 has no `input-bordered`.** The border is on `.input` itself. The old
  modifier compiles to nothing and fails silently, which is exactly the class of bug the
  static-class rule exists for.
- **Declaring `sampleProps` also opts out of children.** The blind install test passes the
  component name as children so a component that needs content has some; a form control
  cannot take children, and React throws when they reach a void element. Use
  `WithSampleProps` from `src/components/sampleProps.ts` to type a `forwardRef` component
  that carries the static.

## Combobox

`Combobox` is the ARIA combobox pattern written by hand over a Radix Popover used for
positioning only. The listbox behaviour is the kit's.

- **Radix `Anchor`, not `Trigger`.** A trigger toggles on click and announces itself as
  opening a dialog; both are wrong for a field you type into. The panel gets
  `onOpenAutoFocus` and `onCloseAutoFocus` prevented so focus never leaves the input, and
  `onInteractOutside` ignores the input's own box so clicking into it does not close the
  list. It reuses `PANEL` from `Popover.tsx` (an internal export) so the two look alike.
- **Focus stays in the input; the highlight is `aria-activedescendant`.** Options are
  `li[role=option]` with `aria-selected` and `aria-disabled`; the highlight is a
  `data-active` attribute styled with a Tailwind data variant. Nothing in the list is
  focusable. `onMouseDown` on an option is prevented so a click does not blur the input.
- **A typed query filters; an opened value does not.** Opening on a chosen option shows
  its label in the input without hiding every other option (`typed` flag). Escape restores
  the label. With `onSearch` the kit filters nothing and calls it with `''` on open.
- **The outer box is daisyUI `input` with its height released** (`h-auto flex-wrap`), so
  chips wrap. `input-error` follows the Field's `aria-invalid`, as every control does.
- **Generic over the option type.** `ComboboxOption` is the floor (`value`, `label`,
  `description?`, `disabled?`); consumers extend it and get their type back in
  `renderOption` and `onChange`. `Combobox` is a plain generic function, not `forwardRef`,
  for the same reason `Table` is.

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

## Loading and empty states

`Spinner`, `Skeleton`, `Progress` and `EmptyState` cover waiting and nothing-here. Reach
for `Progress` when the extent is known, `Spinner` when it is not, `Skeleton` when the
shape of the answer is, and `EmptyState` when the wait is over and there is nothing to
show.

- **A live region is announced by its contents, not its accessible name.** `Spinner` is
  `role="status"`; that role takes no name from what it contains, and an empty one
  carrying only an `aria-label` announces nothing in most screen readers. A spinner with
  no visible label therefore holds `sr-only` text. Any live region added later follows
  the same rule — put the words inside it.
- **`Skeleton` is `aria-hidden`, and the container carries `aria-busy`.** Reading grey
  bars aloud is worse than silence, and the region being filled is the thing that knows
  what is loading. Do not add a label to a skeleton to "fix" its silence.
- **Indeterminate is the absence of a value, not a prop.** `Progress` is a native
  `<progress>`; omitting `value` is what the platform and daisyUI both read as
  indeterminate. `value={0}` is a bar that has not started, which is a different
  statement. Out-of-range values are clamped.
- **`EmptyState` renders its title as a `p` and takes `titleAs` for a level.** Heading
  level belongs to the page. It is an element name rather than a node because HTML
  forbids a heading inside a paragraph.
- **Reduced motion comes from daisyUI**, which already confines both the spinner and the
  skeleton animations to `prefers-reduced-motion: no-preference`. Do not stack a
  `motion-reduce:` variant on top. `Spinner.test.tsx` and `Skeleton.test.tsx` read
  daisyUI's shipped CSS and assert it still holds, because a dependency is satisfying an
  accessibility promise the kit makes in its own name.
- **One place knows how a spinner is drawn.** `Button` imports `spinnerClass` from
  `Spinner` rather than repeating `loading loading-spinner`, and deliberately does not
  nest the component: the button is already `aria-busy`, and a `role="status"` inside it
  would announce the same state twice. `spinnerClass` is not exported from the package —
  it hands out daisyUI class names, which a consumer should never hold.

## Cards and stats

`Card` is a frame and nothing else: radius, surface, border, padding, and where the
header, footer and media sit. What goes inside each slot is the consuming app's, which
is why the body is a plain `children` slot rather than a set of sub-components.

- **Charts are deliberately not in the kit.** An app renders its own chart inside a Card.
  Shipping one would mean picking a charting library for every consumer and owning its
  theming, and the Card already gives the chart its frame.
- **The slots are props, not sub-components** — `header`, `footer`, `media` — for the same
  reason `Button` takes an icon as a prop. The kit owns which daisyUI class each slot gets
  (`card-title`, `card-actions`, `figure`) so a consumer never writes one. It does not own
  the heading level: pass a heading element into `header` when the card titles a section.
- **`interactive` is bordered plus a hover and a focus ring.** `href` renders the card as
  an anchor, which is what makes a whole-card link focusable and keyboard-activatable
  without hand-rolling either, and it turns the affordance on whichever variant is chosen.
  Apps on a client-side router use `variant="interactive"` and supply their own link — the
  kit is router-agnostic and will not import one.

Three daisyUI defaults are deliberately overridden, and each would be a silent bug if
restored:

- **`.card` and `.stats` set no background.** daisyUI gives them a radius and a layout
  only, so both components add `bg-base-100`. Without it a card is invisible on the page
  background apart from its border.
- **`.card-border` draws in `base-200`**, which is `#FAF8FC` against a `#FFFFFF` surface
  in light mode — a border nobody can see. `border-base-300` is the kit's line token.
- **`.stat-title` and `.stat-desc` are `base-content` at 60%**, the exact composite
  AGENTS.md warns about elsewhere: roughly 4.1:1 on the dark background, below AA. Both
  get the `muted` token instead, which `src/contrast.test.ts` measures in both themes.

`Stat` separates **direction** from **tone**. Direction picks the arrow; tone picks the
colour, defaulting from direction. Up is not always good news — dropped calls, latency
and cost all read the other way — so a metric where rising is bad keeps the arrow pointing
up and sets `tone="negative"`. The arrow also means the delta does not rely on colour
alone to be understood.

`StatGroup` stacks below `sm` and sits in a row above it by default. daisyUI's `.stats` is
a grid with `grid-auto-flow: column`: it scrolls horizontally rather than wrapping, so on a
phone a row of metrics runs off the edge instead of reflowing. Stacking is daisyUI's own
answer and it is the default here so a dashboard row survives a narrow viewport without
the consumer thinking about it; `horizontal` and `vertical` pin it.

## Pagination

`Pagination` is daisyUI `join` around the kit's own `Button`s; the page-window logic is
the kit's own in `pageWindow.ts`, tested on its own without rendering anything.

- **The window has a constant width.** Near an edge the slack moves to the other side
  instead of disappearing, so the strip never changes length as the user pages and
  nothing under the cursor jumps. An ellipsis only ever hides two or more pages; a gap
  of one page shows the page. `pageWindow.test.ts` pins both.
- **The current page is a focusable button**, marked `aria-current="page"` and drawn
  primary. Making it a span would drop it from the tab order and break arrowing along
  the row. The ellipsis is a disabled ghost button with `aria-hidden` and `tabIndex=-1`,
  so it takes the same space as a page and says nothing.
- **Controlled only.** `page`, `pageSize` and the callbacks come from the consumer;
  `pageCount` derives from `total / pageSize` when omitted. A `page` outside the range is
  clamped for rendering rather than trusted.
- **The page-size selector is a plain `select` in a wrapping `label`**, not the kit's
  `Select`: that component stacks its label above the control, and a strip wants the
  label beside it.

## Overlays

`Modal`, `Drawer`, `Dropdown`, `Popover` and `Tooltip` are Radix primitives wearing daisyUI
classes. Radix owns the focus trap, the focus return, Escape, outside-click dismissal, the
scroll lock and the ARIA roles; daisyUI owns the surface. Never hand-roll any of the first
list — that is the one place CSS genuinely cannot reach, and it is where component
libraries most often get accessibility wrong.

**`.modal-box` must be a direct child of `.modal.modal-open`.** daisyUI renders the panel
at `opacity: 0; scale: .95` until that exact selector matches, so `Dialog.Content` is
nested *inside* `Dialog.Overlay` rather than placed beside it. Break the nesting and the
dialog is present, focused and invisible, with nothing in the console to say why. Radix
mounts the portal only while the dialog is open, so `modal-open` is applied
unconditionally: being in the DOM already means open, and the class is how daisyUI is told.

**Three daisyUI classes cannot be used with Radix at all**, because each is a second
open/close mechanism rather than a style:

- `.drawer` is revealed by `.drawer-toggle:checked ~ .drawer-side`, which can never match
  when Radix decides whether the panel exists. daisyUI's own edge sheet is
  `modal-start` / `modal-end` / `modal-top` / `modal-bottom`, and that is what `Drawer`
  uses. `menu` is still right for navigation *inside* a drawer.
- `.dropdown-content` positions with CSS anchor positioning and opens on `:focus-within`.
  `Dropdown` uses `menu` on a real `ul`, with every item in an `li` — those are the
  elements `.menu` styles, and a bare `div` would leave items with no padding, radius or
  row layout.
- `.tooltip` renders its text through `content: attr(data-tip)`. Generated content is
  unreachable by assistive technology, so the class defeats the purpose of the component.
  `Tooltip` matches its colours with utilities instead.

**Radix state maps to Tailwind data variants, not to daisyUI state classes.**
`data-[highlighted]:bg-base-200` unifies hover and keyboard focus into the one state Radix
already tracks; `.menu-focus` cannot be driven from an attribute.

**Sub-components that need Radix context are statics, not exports** — `Modal.Close`,
`Dropdown.Item`, `Popover.Close`. The blind install test renders every top-level export
standalone, and anything requiring a provider throws there. `TooltipProvider` is a genuine
top-level export because it renders fine on its own.

**A trigger prop decides `asChild` per call** (`asChild={isValidElement(trigger)}`). Radix
throws when `asChild` is handed anything that is not an element, and a string trigger
should get Radix's own button rather than a crash.

`vitest.setup.ts` stubs `ResizeObserver` and the pointer-capture methods jsdom omits.
Without them Radix's positioning throws a `TypeError` and an overlay test fails for
reasons that have nothing to do with the overlay. Those stubs report no geometry on
purpose: assert behaviour and markup, never where a panel landed on screen.


## App shell and navigation

`AppShell`, `Navbar`, `Sidebar`, `Tabs`, `Breadcrumbs` and `Accordion`. The rules that keep
the package router-agnostic and the daisyUI classes honest:

- **Never import a router.** Active state comes in as `activeKey`; links go out through
  `renderLink({ href, children, className })`, whose default is a plain `<a>`. That pair
  is the whole contract, and it is shared by `Sidebar` and `Breadcrumbs`.
- **`aria-current="page"` is the active state, and daisyUI reads it.** `.menu` styles
  `[aria-current]` as active and `.tab` styles `[aria-selected=true]`, so neither
  component toggles `menu-active` or `tab-active` — the attribute Radix or the kit sets is
  the single source of truth. In `Sidebar` the attribute sits on a `contents` span around
  the rendered link, because a custom link may not forward unknown props.
- **`collapse-open` is applied through a data variant.** daisyUI's `collapse` reads open
  from a checked input, focus, `[open]` or the `collapse-open` class; Radix keeps it on
  `data-state`. `data-[state=open]:collapse-open` bridges them with no JS. The trigger is a
  real `<button>` inside a heading whose level is a prop.
- **The `Navbar` finds the shell through context** (`useAppShell`), so it draws its menu
  button only when there is a sidebar to open, and the same component serves a sign-in
  page. The sidebar element is rendered in the column or the drawer, never both.
- **`.navbar` and `.menu` set no surface.** Both components add `bg-base-100`, as `Card`
  and `Stat` do, or they sit invisible on the page background.

## Tables

`Table` is a generic component over one column definition and renders either a daisyUI
table or a list of `Card`s. Decisions that are easy to undo by accident:

- **The layout switch is a JS media query on `(pointer: coarse)`, not a Tailwind
  breakpoint.** The two layouts have different DOM, and rendering both and hiding one
  hands a screen reader two copies of every row. `useCoarsePointer` is a
  `useSyncExternalStore` over `matchMedia`, so it flips live when a tablet docks, and it
  reports a fine pointer wherever `matchMedia` is missing (jsdom, SSR) so the server
  markup is the one with real table semantics.
- **It never sorts and never fetches.** `sort` is drawn as `aria-sort` plus an indicator;
  `onSortChange` reports the next sort (unsorted → asc, asc → desc, desc → asc). Rows are
  rendered in the order given. Selection is controlled the same way.
- **Row activation is a title button, not a `tabIndex` on the row.** A focusable `tr` or
  card with a checkbox inside is a nested interactive control with no role. The title
  cell becomes a real `<button>` in both layouts, and the row-wide click handler is a
  pointer convenience that ignores clicks landing on any control.
- **Loading rows are `Skeleton`, and the error is `Alert`.** The wrapper carries
  `aria-busy`; skeletons stay `aria-hidden`, so the state is announced once. The empty
  panel is `EmptyState`, replaceable through `empty`.
- **`table-zebra` and `table-pin-rows` are pure CSS.** Pinning only shows inside a
  scrolling ancestor with a bounded height, which is the consumer's container, not the
  table's. The `checkbox` inputs are plain daisyUI inputs with `aria-label`, because a
  cell has no room for a visible label.

## Stepper and Wizard

- **daisyUI `steps` is pure CSS**: counters for the numbers, `:before` for the connector,
  `step-primary` / `step-error` for colour. A `step-icon` child replaces the number, which
  is how complete gets a check and error a mark, so state is never colour alone. The
  spoken state is `sr-only` text after the label.
- **The list is an `ol`** so "step 2 of 5" comes for free, and the current item carries
  `aria-current="step"`.
- **Only steps a user may reach are buttons.** Rendering every step as a button and
  ignoring the click would present controls that do nothing. Completed and error steps are
  buttons when `onStepClick` is given; upcoming ones only with `allowUpcoming`.
- **`Wizard` holds the index and nothing else.** Validation is the consumer's;
  `canProceed` is the single gate, refused both by the Next button and by `goTo` for any
  forward jump, while Back always works. Controls go to content and footer as render-prop
  arguments rather than through context.

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
