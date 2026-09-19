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

`src/contrast.test.ts` asserts contrast for every pair in both themes, reading the same
tokens the CSS is generated from. A colour that breaks it fails the pull request. The
`Foundations/Tokens` Storybook page renders every ratio from the same functions — it is
the readable view, not the check.

Every hover value is checked alongside its base, because a hover state that drops below AA
is the easiest one to miss — nobody screenshots it.

Light-mode values are deeper than the raw brand palette. `#25E0F8` cyan measures 1.6:1 on
white and `#C27FFF` lavender 2.1:1, so neither can carry text in light mode; the brand is
dark-first. The light theme uses deepened partners of the same hue, and dark mode uses the
brand values unchanged.

`line` is exempt by design: WCAG 1.4.11 covers boundaries that carry meaning, not dividers
that merely separate content.

### Two hues, and no accent

`primary` carries actions — buttons, join, the selected item, the focus ring. `secondary`
is the second voice: links, the active speaker, the in-a-call status, and anything that
needs attention without being an action, such as a raised hand or an unread mention.
`danger` is a real button variant rather than only a status colour, with its own hover and
ink so a destructive button is as finished as a primary one.

There is no third hue. Any accent dark enough to carry white text at AA lands in the warm
band already held by `warn` and `danger` — measured with CIEDE2000, amber at that lightness
is ΔE 1.7 from `warn`, which is the same colour. daisyUI always emits an accent, so
`--color-accent` is aliased to primary and `btn-accent` can never introduce one; a test
asserts that alias against the generated theme.

## Buttons and badges

Variants are picked from the API. A consumer never writes a daisyUI class name — not for
the colour, not `btn-square` for an icon-only button, not `btn-block` for full width.

```tsx
import { Badge, Button } from '@unityevolv/unitykit'

<Button variant="primary" size="lg" icon="invite">Invite</Button>
<Button variant="danger" icon="trash" aria-label="Delete" />
<Button loading fullWidth>Joining</Button>

<Badge variant="danger" icon="record">Recording</Badge>
<Badge size="sm" outline>Draft</Badge>
```

| | Button | Badge |
| --- | --- | --- |
| Colours | `primary` `secondary` `danger` `ghost` `link` | `primary` `secondary` `danger` `ghost` |
| Sizes | `xs` `sm` `md` `lg` | `xs` `sm` `md` `lg` |
| Also | `loading`, `fullWidth`, `icon`, `iconPosition` | `outline`, `icon` |

There is no `accent` variant: the palette is two hues plus the status colours, and
daisyUI's accent is aliased to primary, so it would be a synonym dressed up as a choice.
Badge has no `link` — that is a button style, a control that looks like text, and daisyUI
has no badge equivalent.

**Invalid combinations do not compile.** Variants are declared in a
[class-variance-authority](https://cva.style) config and the prop types are derived from
it, so a colour or size that does not exist is a type error rather than a class name that
silently produces no CSS:

```tsx
<Button variant="accent">Save</Button>   // Type '"accent"' is not assignable
<Badge size="xl">New</Badge>             // Type '"xl"' is not assignable
```

An icon-only button with no accessible name does not compile either.

`loading` shows a spinner **in the icon's place** rather than beside it, so the button
keeps its width and does not shove whatever sits next to it. It also disables the button
and sets `aria-busy`, which is what tells a screen reader the state is temporary rather
than the control being unavailable.

### CVA is the pattern for the rest of the library

Every component with variants follows the shape in `src/components/Button/Button.tsx`:
one `cva()` config holding full class names, prop types derived from it, and a lookup
table for anything that must scale with a variant, such as the icon size.

One wrinkle worth knowing before copying it: derive props with
`NonNullable<VariantProps<typeof x>['size']>` rather than extending `VariantProps`
directly. That type admits `null` for every variant — CVA's way of spelling "no class" —
and a nullable `size` cannot index a lookup table.

## Avatars

A person, as a picture or as their initials, with an optional presence dot.

```tsx
import { Avatar, AvatarGroup } from '@unityevolv/unitykit'

<Avatar name="Sasha Kim" src={user.photo} status="online" />
<Avatar name="Sasha Kim" size="xl" />          // initials, if there is no photo

<AvatarGroup size="sm" max={3}>
  {people.map((p) => <Avatar key={p.id} name={p.name} src={p.photo} />)}
</AvatarGroup>
```

Sizes are `xs` 24px through `xl` 64px. The initials, the status dot and the overlap in a
group all follow the size, so a caller sets one thing.

### Six tints, not a rainbow

The colour comes from the name, so the same person is the same colour in every app
without anything being stored. There are six to choose from rather than the dozen most
kits offer, because the palette is two hues and a seventh colour that was neither violet
nor teal would be the third hue UKIT-29 removed. Each hue therefore appears twice, vivid
and muted, which buys separation from lightness instead of from a new colour.

Measured with CIEDE2000, the closest pair is 15.3 apart in light mode and 17.8 in dark —
far enough to tell two people apart at a glance. Initials are text, so each tint is
checked against its own ink for AA in `src/contrast.test.ts` along with everything else.

The slots hold their hue across themes: whoever is violet in light mode is violet in dark
mode, even though neither value is the same.

### The status dot is never colour alone

WCAG 1.4.1. The dot is `aria-hidden` and the word goes into the accessible name, so the
avatar reads as "Sasha Kim, busy" rather than as a colour nobody can see. Pass
`statusLabel` when the app has its own wording — "in a meeting" rather than "busy".

The four states are `online`, `busy`, `away` and `offline`, mapped to the theme's
success, error, warning and line colours. That vocabulary is the kit's; consuming apps
map their own presence states onto it rather than the kit growing a fifth for each
product.

daisyUI's `avatar-online` and `avatar-offline` are not used. They cover two of the four
states, so half the dots would be daisyUI's and half ours — two sizes, two positions, one
inconsistency. Four drawn the same way is simpler than two borrowed and two invented.

### A broken image falls back

`onError` swaps to the initials, and a new `src` tries again. A dead avatar URL is the
most common way this component meets reality, and an empty square is worse than initials.

## Icons

One component, so no app ever imports an icon library directly.

```tsx
import { Icon } from '@unityevolv/unitykit'

<Icon name="mic" />                              // 20px, decorative
<Icon name="lock" size="sm" />                   // 16px
<Icon name="record" title="Recording" />         // labelled for screen readers
```

Names are the kit's own, not the library's — `share`, not `monitor-up`; `record`, not
`circle-dot`. They are typed as a union, so an unknown name is a compile error rather than
a blank space. The mapping lives in one table in `src/components/Icon/icons.ts`, the only
file in the repository that names a Lucide component; swapping libraries later is that
file rather than every call site. `npm run lint` fails a direct `lucide-react` import
anywhere else.

Sizes match the type scale: `xs` 14, `sm` 16, `md` 20 (default), `lg` 24, `xl` 32. There is
no numeric size prop — anything larger than 32 is an illustration, not an icon, and the
union is what keeps that true.

**Colour always comes from `currentColor`.** An icon never sets its own, so it inherits
from the text around it and every theme and token works without the icon knowing they
exist. Colour a parent, not the icon.

### Icons in components

Components take an icon as a **prop**, not as a child. The component picks the size, the
placement and the shape, so a caller never writes a daisyUI class name or guesses at
pixel sizes:

```tsx
<Button icon="invite">Invite</Button>
<Button icon="chevron-right" iconPosition="end">Next</Button>
<Button icon="trash" variant="danger" aria-label="Delete" />   // icon-only
```

An icon-only button with no accessible name **does not compile**. The icon is
`aria-hidden`, so the button would have nothing to announce; the type requires
`aria-label` on that shape:

```tsx
<Button icon="trash" />   // Property 'aria-label' is missing
```

### Labelling

An icon is decorative by default: `aria-hidden`, and out of the tab order. A button takes
its name from its own label, so giving the icon a `title` as well makes a screen reader
announce the same thing twice. Reach for `title` only when an icon stands alone and
carries meaning:

```tsx
<Icon name="record" title="Recording" />   // standalone and meaningful
```

### The custom set

Six icons are drawn here because Lucide has no equivalent, or none in the right sense:
`knock`, `raise-hand`, `reception`, `break-room`, `office`, `provider`. They use the same
24px viewBox, 2px stroke and round caps Lucide emits, so they sit beside it without looking
foreign — the `Primitives/Icon` Storybook page shows them next to Lucide icons at the same
size, which is the fastest way to spot one that does not.

Nothing ships with an emoji as an icon. Emoji render differently on every platform and
cannot take a colour.

## Alerts and banners

A message that belongs on the page — a warning that stays put, an explanation of why a
form is locked, a notice across the top of an app. Not a toast: `Toast` (UKIT-8) is for
transient feedback about something that already happened, and it is gone before anyone
scrolls back.

```tsx
import { Alert, Button } from '@unityevolv/unitykit'

<Alert variant="warn" title="Storage almost full">
  Recordings older than 30 days will be removed to make room.
</Alert>

<Alert variant="danger" action={<Button size="sm" variant="danger">Retry</Button>} onDismiss={hide}>
  Could not join the office.
</Alert>

<Alert banner variant="info">Scheduled maintenance tonight from 22:00 UTC.</Alert>
```

Variants are the kit's names — `info`, `ok`, `warn`, `danger` — the same four `Progress`
uses. daisyUI spells two of them differently (`alert-success`, `alert-error`); that
translation lives in the component and nowhere else.

### Warnings interrupt, confirmations wait

`warn` and `danger` render `role="alert"`, which is assertive: it cuts across whatever a
screen reader is saying. `info` and `ok` render `role="status"`, which waits for a pause.
The difference is the whole point of the distinction — a failure that has to be dealt
with now should interrupt, and a note that something saved should not. Pass `role`
explicitly to override it.

### Every variant draws its own glyph

WCAG 1.4.1: colour alone cannot carry a difference. A red triangle beside an amber
triangle is one picture in two colours, so `danger` uses a circled exclamation and `warn`
keeps the triangle. This is why the icon table gained an `error` row — `alert` was
already the warning triangle, and the two states needed different drawings. Set `icon` to
use another, or `showIcon={false}` to drop it.

### The kit does not remember dismissals

`onDismiss` fires and nothing else happens. The alert does not remove itself, because
whether a notice should come back on the next page load, next session or never is a
product decision the kit cannot see — and an alert that hides itself is one that cannot
be brought back without a re-render the app did not ask for. Keep the state in the app.

### Banner

`banner` makes it full width with square corners and no side or top border, for a notice
pinned to the edge of a page rather than floating on it as a card. It is a prop rather
than a second component, because a `Banner` would be an `Alert` with two class names
changed, and two names for one thing drift apart.

## Brand

A product's identity — the monogram, then the product name in two tones, the way
unityevolv.com writes it.

```tsx
import { Brand } from '@unityevolv/unitykit'

<Brand product="unityofis" href="/" />     // a navbar brand link
<Brand product="ofiskit" size="lg" />
<Brand product="unityevolv" markOnly />    // collapsed sidebars
```

Three products today: `unityevolv` (UE mark, **Unity**Evolv), `unityofis` (UO mark,
**unity**ofis) and `ofiskit` (UO mark, **ofis**kit — the engine carries the product's
mark rather than earning its own). Adding another is one row in the table inside the
component.

Sizes set the mark height and the name scales with it: `sm` 24px, `md` 30px, `lg` 40px.
The first word takes the secondary tone and the second the primary, from the theme — so
light mode gets the deepened shades and dark mode the brand values, with no
per-product colour anywhere.

**The whole thing is announced once**, as the product name. The two-tone split is
decoration, not information, so the pieces are hidden and the link or span carries the
full name — a screen reader reads `unityofis`, not "unity, ofis". With `href` it is one
link; without, a labelled image.

The marks are also exported on their own as `<UEMark />` and `<UOMark />`, for anywhere
the wordmark is too much. Generate favicons from these per app at build time rather than
rendering `Brand` into one.

> **The marks are placeholder artwork.** They are geometric letterforms built to the
> right proportions and colour split, not the real logo — the website ships its mark as a
> PNG, which cannot be traced into something faithful. Replace the paths in
> `src/components/Brand/marks.tsx` when the vector artwork exists; nothing outside that
> file changes, because `Brand` only ever asks for a mark at a height.

## Waiting and nothing-here states

Four components, and the first decision is which one the screen actually needs.

| The screen is… | Use | Why |
| --- | --- | --- |
| busy, and you know how far along | `Progress` | a measurable bar is information a spinner cannot carry |
| busy, with no measurable extent | `Spinner` | honest about not knowing |
| busy, and the shape of the answer is known | `Skeleton` | the page does not jump when the answer lands |
| finished, and there is nothing to show | `EmptyState` | an empty rectangle explains nothing |

```tsx
import { Spinner, Skeleton, Progress, EmptyState } from '@unityevolv/unitykit'

<Spinner size="sm" />                          // inline, announces "Loading"
<Spinner block label="Loading rooms" />        // centred in its container

<Skeleton shape="text" lines={3} />
<Skeleton shape="circle" width={40} />
<Skeleton shape="rect" height={120} />

<Progress value={40} label="Uploading" showValue />
<Progress label="Importing" />                 // no value = indeterminate

<EmptyState
  icon="office"
  title="No rooms yet"
  description="Create a room and invite your team to join it."
  action={<Button icon="plus">New room</Button>}
/>
```

### A live region is announced by its contents, not its name

`Spinner` is a `role="status"` region, so a screen reader reads it when it appears —
which is the part that matters when a page otherwise just stops. That role takes no
accessible name from what it contains, and an empty region with only an `aria-label`
announces nothing at all in most screen readers. So a spinner with no visible `label`
carries the word "Loading" as `sr-only` text: the announcement is real either way, and
only its visibility changes.

### Skeletons are silent on purpose

`Skeleton` is `aria-hidden`. Three grey bars read aloud are worse than silence — a
skeleton is the absence of content drawn so the page does not jump. The **region being
filled** is what carries `aria-busy="true"` while it waits, so the state is announced
once, by the thing that knows what is loading.

```tsx
<section aria-busy={loading} aria-label="Rooms">
  {loading ? <Skeleton shape="text" lines={3} /> : <RoomList rooms={rooms} />}
</section>
```

There is one `Skeleton` with three shapes rather than three components, because
sketching a card is these nested in ordinary layout divs. A `SkeletonCard` would be
guessing at a card the kit has not shipped, and a `SkeletonAvatar` would be a `Skeleton`
with a border radius.

### Indeterminate is the absence of a value

`Progress` is a native `<progress>`, so it carries `role="progressbar"` and its value
semantics without a line of ARIA. **Omitting `value` is what makes it indeterminate**,
in the platform and in daisyUI's animation alike — there is no `indeterminate` prop,
because two ways of saying the same thing eventually disagree. `value={0}` stays a bar
that has not started, which is a different statement. Values outside `0…max` are clamped
rather than trusted.

### EmptyState does not invent a heading level

The title renders as a `<p>`. Heading level depends on where the panel sits, and a
component that guessed `h3` would skip levels on half the pages it appeared on. Pass
`titleAs="h2"` where the panel is a section in its own right. It is an element name
rather than a node because HTML forbids a heading inside a paragraph, so
`title={<h2>…</h2>}` would render markup that browsers silently reshape.

### Reduced motion is daisyUI's, and tested as such

Both `.loading` and `.skeleton` already confine their animation to
`@media (prefers-reduced-motion: no-preference)` — the skeleton goes flat and the
spinner drops to a quarter speed. Neither component stacks a `motion-reduce:` variant on
top. Since a dependency is satisfying one of the kit's accessibility promises, the tests
read daisyUI's own CSS and assert it still does, so an upgrade that dropped it fails the
build instead of quietly shipping a strobe.

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
automatically — a component whose props are all optional needs no setup at all.

A component with a **required** prop declares one valid set, because the test renders
blind and has no way to know:

```tsx
Icon.sampleProps = { name: 'mic' } satisfies IconProps
```

Without it the test fails by name and tells you to add one, rather than skipping the
component — skipping would quietly drop the component most likely to have a packaging
problem.

That fails the build on:

- **an undeclared runtime dependency** — npm's flat `node_modules` resolves these locally
  and then fails for consumers on a clean install
- **a missing `@source` line**, which stops Tailwind scanning the kit entirely
- **any component that throws from a clean install**, reported by export name

Two things it does *not* catch:

- **A class name assembled from a variable.** daisyUI emits its modifier rules whenever the
  base component class is present, so the CSS exists either way. `npm run lint` guards that.
- **Marker classes.** Lucide stamps `lucide lucide-mic` on every icon; those are hooks, not
  styling, and are skipped by an explicit list in the script. An ignored class is an
  unchecked class, so that list should stay as short as it can be.

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
