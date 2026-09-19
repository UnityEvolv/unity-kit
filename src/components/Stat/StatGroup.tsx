import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'

/**
 * daisyUI's `.stats` is a grid with `grid-auto-flow: column`, so a row of
 * stats does not wrap mid-row the way a flex row would — it scrolls
 * horizontally instead, which on a phone hides the metrics off the edge.
 * Stacking below `sm` is daisyUI's answer and it is the default here, so a
 * dashboard row survives a narrow viewport without the consumer thinking
 * about it.
 *
 * `bg-base-100` because `.stats` sets a radius and a grid but no background,
 * so the group would otherwise sit invisible on the page background.
 */
const statGroup = cva('stats bg-base-100', {
  variants: {
    direction: {
      responsive: 'stats-vertical sm:stats-horizontal',
      horizontal: 'stats-horizontal',
      vertical: 'stats-vertical',
    },
  },
  defaultVariants: { direction: 'responsive' },
})

type StatGroupVariants = VariantProps<typeof statGroup>
export type StatGroupDirection = NonNullable<StatGroupVariants['direction']>

export interface StatGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `responsive` stacks below `sm` and sits in a row above it. The other two
   * pin it, for a sidebar that is always narrow or a strip that is always
   * wide.
   */
  direction?: StatGroupDirection
  children?: ReactNode
}

/**
 * A row of Stats sharing one surface, with daisyUI's dashed rule between them.
 *
 * It does not lay out charts. Charts are deliberately not in the kit; an app
 * renders its own inside a Card beside this.
 */
export const StatGroup = forwardRef<HTMLDivElement, StatGroupProps>(function StatGroup(
  { direction = 'responsive', className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={statGroup({ direction, className })} {...props}>
      {children}
    </div>
  )
})
