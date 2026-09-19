import { useId } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ProgressHTMLAttributes, ReactNode } from 'react'

/**
 * Class names in full, for the reason every other component in the kit spells
 * them out: Tailwind scans built files as static text.
 *
 * daisyUI's names are the canonical ones inside components — `progress-error`,
 * not `progress-danger` — because daisyUI generates these classes from its own
 * token names and there is no way to make it generate ours. The API above is
 * the kit's vocabulary; this table is the only place the two meet.
 */
const progress = cva('progress w-full', {
  variants: {
    variant: {
      primary: 'progress-primary',
      secondary: 'progress-secondary',
      danger: 'progress-error',
      ok: 'progress-success',
      warn: 'progress-warning',
      info: 'progress-info',
    },
  },
  defaultVariants: { variant: 'primary' },
})

type ProgressVariants = VariantProps<typeof progress>
export type ProgressVariant = NonNullable<ProgressVariants['variant']>

export interface ProgressProps
  extends Omit<ProgressHTMLAttributes<HTMLProgressElement>, 'value' | 'max'> {
  /**
   * How far along, between 0 and `max`. **Leave it off for indeterminate** —
   * work is happening and its length is unknown. Out-of-range values are
   * clamped rather than trusted.
   */
  value?: number
  /** What `value` counts up to. Defaults to 100, so `value` reads as a percentage. */
  max?: number
  variant?: ProgressVariant
  /** Shown above the bar, and used as the bar's accessible name. */
  label?: ReactNode
  /** Shows the percentage opposite the label. Determinate bars only. */
  showValue?: boolean
}

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max)

/**
 * A determinate progress bar: an upload, an import, a quota.
 *
 * It is a native `<progress>`, which carries `role="progressbar"` and its own
 * value semantics without a line of ARIA. Omitting `value` is what makes it
 * indeterminate, in the platform and in daisyUI's animation alike — there is
 * no separate `indeterminate` prop, because two ways to say the same thing
 * eventually disagree.
 *
 * For work with no measurable extent and no bar to draw, use `Spinner`.
 */
export function Progress({
  value,
  max = 100,
  variant = 'primary',
  label,
  showValue = false,
  className,
  ...props
}: ProgressProps) {
  const labelId = useId()
  const determinate = value !== undefined
  const safe = determinate ? clamp(value, max) : undefined
  const percent = safe === undefined || max === 0 ? undefined : Math.round((safe / max) * 100)

  const bar = (
    <progress
      className={progress({ variant, className })}
      // The attribute is absent, not zero, when indeterminate: a `<progress>`
      // with `value={0}` is a bar that has not started, which is a different
      // statement from a bar whose length nobody knows.
      value={safe}
      max={max}
      aria-labelledby={label === undefined ? undefined : labelId}
      {...props}
    />
  )

  if (label === undefined) return bar

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span id={labelId} className="text-base-content">
          {label}
        </span>
        {showValue && percent !== undefined ? (
          <span className="text-muted tabular-nums">{percent}%</span>
        ) : null}
      </div>
      {bar}
    </div>
  )
}
