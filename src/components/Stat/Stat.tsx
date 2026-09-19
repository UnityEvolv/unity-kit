import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

/** Which way the number moved. */
export type StatDirection = 'up' | 'down' | 'flat'

/** Whether that movement is good news, bad news or neither. */
export type StatTone = 'positive' | 'negative' | 'neutral'

/** The arrow per direction, so a caller never picks an icon. */
const directionIcon: Record<StatDirection, IconName> = {
  up: 'trend-up',
  down: 'trend-down',
  flat: 'trend-flat',
}

/**
 * The tone a direction carries when nothing says otherwise.
 *
 * Up is not always good — churn, latency and cost all read the other way —
 * so `tone` overrides this rather than the direction being reinterpreted.
 * Keeping the two separate is what lets the arrow point up while the colour
 * says the number got worse.
 */
const toneForDirection: Record<StatDirection, StatTone> = {
  up: 'positive',
  down: 'negative',
  flat: 'neutral',
}

/**
 * Class names written out in full, because Tailwind scans built files as
 * static text. `success` and `error` are daisyUI's names for what the brand
 * calls ok and danger; inside components daisyUI's vocabulary wins.
 */
const toneClass: Record<StatTone, string> = {
  positive: 'text-success',
  negative: 'text-error',
  neutral: 'text-muted',
}

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  /** What the number is. Reads above the value. */
  label: ReactNode
  /** The number itself. */
  value: ReactNode
  /** The change since last period — "+12%", "3 more". */
  delta?: ReactNode
  /** Which way it moved. Chooses the arrow, and the colour unless `tone` says. */
  direction?: StatDirection
  /** Overrides the colour when up is bad news, or down is good. */
  tone?: StatTone
  /** A sentence under the value, or under the delta when there is one. */
  description?: ReactNode
  /** An icon name from the kit, set to one side of the number. */
  icon?: IconName
}

/**
 * One metric: a label, a number, and optionally how it moved.
 *
 * daisyUI draws `stat-title` and `stat-desc` in `base-content` at 60%, which
 * composites to roughly 4.1:1 on the dark background — below AA. Both are
 * given the `muted` token instead, which is measured in `src/contrast.test.ts`
 * and passes in both themes.
 *
 * The direction is carried by an arrow as well as by colour, so the delta does
 * not depend on colour alone to be understood.
 */
const StatImpl = forwardRef<HTMLDivElement, StatProps>(function Stat(
  { label, value, delta, direction = 'flat', tone, description, icon, className, ...props },
  ref,
) {
  const resolvedTone = tone ?? toneForDirection[direction]
  const hasFooter = delta !== undefined || description !== undefined

  return (
    <div ref={ref} className={['stat', className].filter(Boolean).join(' ')} {...props}>
      {icon !== undefined ? (
        <div className="stat-figure text-muted">
          <Icon name={icon} size="lg" />
        </div>
      ) : null}
      <div className="stat-title text-muted">{label}</div>
      <div className="stat-value">{value}</div>
      {hasFooter ? (
        <div className="stat-desc text-muted flex items-center gap-2">
          {delta !== undefined ? (
            <span
              className={['inline-flex items-center gap-1 font-medium', toneClass[resolvedTone]].join(
                ' ',
              )}
            >
              <Icon name={directionIcon[direction]} size="xs" />
              {delta}
            </span>
          ) : null}
          {description !== undefined ? <span>{description}</span> : null}
        </div>
      ) : null}
    </div>
  )
})

/**
 * `sampleProps` is one valid set of props for the blind install test, which
 * renders every export with no knowledge of their types. It is attached with
 * `Object.assign` because a `forwardRef` component is not a plain function and
 * cannot take a new property by assignment without losing its type.
 */
export const Stat = Object.assign(StatImpl, {
  sampleProps: { label: 'Active rooms', value: '24' } satisfies StatProps,
})
