import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

/**
 * Class names in full, as everywhere in the kit: Tailwind scans built files as
 * static text, so an assembled name produces no CSS and the spinner renders as
 * an invisible empty span with no error anywhere.
 *
 * daisyUI's `.loading` already honours `prefers-reduced-motion` — it swaps the
 * mask for one whose SVG animations run at a quarter speed rather than
 * stopping, which keeps the "still working" signal without the strobe. Nothing
 * here needs a `motion-reduce:` variant, and `Spinner.test.tsx` asserts
 * daisyUI still does it so an upgrade cannot drop it quietly.
 */
const spinner = cva('loading loading-spinner', {
  variants: {
    size: { xs: 'loading-xs', sm: 'loading-sm', md: 'loading-md', lg: 'loading-lg' },
  },
  defaultVariants: { size: 'md' },
})

const frame = cva('', {
  variants: {
    block: {
      // Centred in whatever it is given, which is the shape a page or panel
      // placeholder wants. `w-full` is what makes the centring mean anything.
      true: 'flex w-full flex-col items-center justify-center gap-3 py-10',
      false: 'inline-flex items-center gap-2 align-middle',
    },
  },
  defaultVariants: { block: false },
})

type SpinnerVariants = VariantProps<typeof spinner>
export type SpinnerSize = NonNullable<SpinnerVariants['size']>

/** Label text scales with the spinner, so a caller never picks a size. */
const labelSize: Record<SpinnerSize, string> = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

/**
 * The spinner's class names, for the few places that need the glyph without
 * the live region around it — a button that is already `aria-busy`, for one.
 * Deliberately not exported from the package: it hands out daisyUI class
 * names, and a consumer of the kit should never hold one.
 */
export const spinnerClass = (size: SpinnerSize) => spinner({ size })

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Matches the type scale. Defaults to `md`. */
  size?: SpinnerSize
  /**
   * Shown beside the spinner, and what a screen reader reads when it appears.
   * Without one the spinner still announces "Loading", just not on screen.
   */
  label?: string
  /** Centred in its container with breathing room, rather than inline in a line of text. */
  block?: boolean
}

/**
 * An indeterminate busy indicator: something is happening and there is no way
 * to say how far along it is. When there is a way, use `Progress`.
 *
 * It is a live region rather than a picture. `role="status"` announces the
 * spinner's arrival politely, which is the part a screen reader user actually
 * needs — otherwise the page simply stops with no explanation.
 *
 * **A live region is announced by its contents, not by its accessible name.**
 * `role="status"` takes no name from what it contains, and an empty one with
 * only an `aria-label` announces nothing at all in most screen readers. So a
 * spinner with no visible label carries the word in `sr-only` text instead —
 * the announcement is real either way, and only its visibility changes.
 */
export function Spinner({
  size = 'md',
  label,
  block = false,
  className,
  ...props
}: SpinnerProps) {
  return (
    <span role="status" className={frame({ block, className })} {...props}>
      <span className={spinner({ size })} />
      {label === undefined ? (
        <span className="sr-only">Loading</span>
      ) : (
        <span className={[labelSize[size], 'text-muted'].join(' ')}>{label}</span>
      )}
    </span>
  )
}
