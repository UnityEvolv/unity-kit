import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

/**
 * daisyUI's `.skeleton` carries the shimmer, and already confines the
 * animation to `@media (prefers-reduced-motion: no-preference)` — under
 * `reduce` the block is a flat surface with no movement at all. That is the
 * behaviour UKIT-19 asks for, so this component adds no `motion-reduce:`
 * variant of its own; `Skeleton.test.tsx` asserts daisyUI still does it, so a
 * dependency upgrade that dropped it would fail the build rather than ship a
 * strobing page to someone who asked for stillness.
 */
const skeleton = cva('', {
  variants: {
    shape: {
      // `text` is a stack of shimmering lines, so the shimmer belongs to the
      // lines and the wrapper stays a plain flex column. Giving the wrapper
      // `skeleton` as well would draw a solid block behind the gaps.
      text: 'flex flex-col gap-2',
      circle: 'skeleton shrink-0 rounded-full',
      rect: 'skeleton w-full',
    },
  },
  defaultVariants: { shape: 'rect' },
})

type SkeletonVariants = VariantProps<typeof skeleton>
export type SkeletonShape = NonNullable<SkeletonVariants['shape']>

/** A bare number means pixels, which is what a placeholder is measured in. */
const length = (value: number | string | undefined) =>
  typeof value === 'number' ? `${value}px` : value

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** `text` for lines of copy, `circle` for an avatar, `rect` for anything else. */
  shape?: SkeletonShape
  /** How many lines `text` draws. Ignored by the other shapes. */
  lines?: number
  /** A number is pixels. `circle` uses it for both axes. */
  width?: number | string
  /** A number is pixels. Defaults to a line height for `text`, 80 for `rect`. */
  height?: number | string
}

const DEFAULT_CIRCLE = 40
const DEFAULT_RECT_HEIGHT = 80

/**
 * A placeholder for content that has not arrived: the shape of the answer,
 * drawn before the answer exists.
 *
 * One component and three shapes rather than three components, because
 * sketching a card is these nested inside ordinary layout divs — a separate
 * `SkeletonAvatar` would only be a `Skeleton` with a border radius, and a
 * `SkeletonCard` would guess at a card this kit has not shipped yet.
 *
 * **It is `aria-hidden`.** A skeleton says nothing — it is the absence of
 * content drawn so the page does not jump — and reading three grey bars aloud
 * is worse than silence. The region being filled is what carries
 * `aria-busy="true"` while it waits, so the state is announced once, by the
 * thing that knows what is loading.
 */
export function Skeleton({
  shape = 'rect',
  lines = 3,
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  if (shape === 'text') {
    const count = Math.max(1, lines)

    return (
      <div
        aria-hidden="true"
        className={skeleton({ shape, className })}
        style={{ width: length(width), ...style }}
        {...props}
      >
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className={[
              'skeleton h-4',
              // The last line stops short, which is what a paragraph does and
              // what keeps identical bars from reading as a table.
              count > 1 && index === count - 1 ? 'w-3/5' : 'w-full',
            ].join(' ')}
            style={{ height: length(height) }}
          />
        ))}
      </div>
    )
  }

  const across = shape === 'circle' ? (width ?? DEFAULT_CIRCLE) : width
  const down = shape === 'circle' ? (height ?? across) : (height ?? DEFAULT_RECT_HEIGHT)

  return (
    <div
      aria-hidden="true"
      className={skeleton({ shape, className })}
      style={{ width: length(across), height: length(down), ...style }}
      {...props}
    />
  )
}
