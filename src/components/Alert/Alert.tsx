import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import { Button } from '../Button'

/**
 * Class names in full, as everywhere in the kit.
 *
 * The variant names are the kit's, not daisyUI's: `ok`, `warn`, `danger` and
 * `info`, matching `Progress` and the palette. daisyUI generates its classes
 * from its own token names, so this table is the only place the two meet.
 *
 * A banner drops the rounding and the side and top borders, because a notice
 * pinned to the top of a page is part of the page's edge rather than a card
 * floating on it.
 */
const alert = cva('alert', {
  variants: {
    variant: {
      info: 'alert-info',
      ok: 'alert-success',
      warn: 'alert-warning',
      danger: 'alert-error',
    },
    banner: { true: 'w-full rounded-none border-x-0 border-t-0', false: '' },
  },
  defaultVariants: { variant: 'info', banner: false },
})

type AlertVariants = VariantProps<typeof alert>
export type AlertVariant = NonNullable<AlertVariants['variant']>

/**
 * Warning and error interrupt; information and success wait their turn.
 *
 * `role="alert"` is assertive — it cuts across whatever a screen reader is
 * saying — which is right for something that has gone wrong and wrong for a
 * note that something saved.
 */
const liveRole: Record<AlertVariant, 'alert' | 'status'> = {
  info: 'status',
  ok: 'status',
  warn: 'alert',
  danger: 'alert',
}

/**
 * The icon each variant brings with it. `warn` and `danger` get different
 * glyphs on purpose: WCAG 1.4.1 says colour alone cannot carry a difference,
 * and a red triangle beside an amber triangle is one picture in two colours.
 */
const defaultIcon: Record<AlertVariant, IconName> = {
  info: 'info',
  ok: 'check',
  warn: 'alert',
  danger: 'error',
}

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant
  /** Full width, square corners: a notice along the top of a page or app. */
  banner?: boolean
  /** A short line above the body. Optional — a one-line alert needs no title. */
  title?: ReactNode
  /** Overrides the variant's own icon. */
  icon?: IconName
  /** Drops the icon entirely, for a notice that is all words. */
  showIcon?: boolean
  /** Buttons or links, placed after the message. */
  action?: ReactNode
  /**
   * Shows a dismiss control and is called when it is pressed. **The kit does
   * not remember dismissals** — it has no idea whether this notice should
   * come back on the next page load, and guessing would be worse than asking.
   * Keep that decision, and the state, in the consuming app.
   */
  onDismiss?: () => void
  /** What the dismiss control announces. */
  dismissLabel?: string
  children?: ReactNode
}

/**
 * A message that belongs on the page: a warning that stays put, an
 * explanation of why a form is locked, a notice across the top of an app.
 *
 * Not a toast. `Toast` (UKIT-8) is for transient feedback that has already
 * happened; an alert is content, and it is still there when the page is
 * scrolled back to.
 */
export function Alert({
  variant = 'info',
  banner = false,
  title,
  icon,
  showIcon = true,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
  children,
  ...props
}: AlertProps) {
  const hasTitle = title !== undefined && title !== null && title !== false && title !== ''

  return (
    <div
      // Before the spread, so a consumer who knows better can override it.
      role={liveRole[variant]}
      className={alert({ variant, banner, className })}
      {...props}
    >
      {showIcon ? (
        <Icon
          name={icon ?? defaultIcon[variant]}
          size="md"
          // daisyUI centres the row's items, which puts the icon halfway down
          // a two-line alert. With a title it belongs beside the first line.
          className={hasTitle ? 'shrink-0 self-start' : 'shrink-0'}
        />
      ) : null}

      <div className="min-w-0">
        {hasTitle ? <p className="font-semibold">{title}</p> : null}
        {children === undefined ? null : <div className="min-w-0">{children}</div>}
      </div>

      {action === undefined ? null : (
        <div className="flex shrink-0 items-center gap-2 self-center">{action}</div>
      )}

      {onDismiss === undefined ? null : (
        <Button
          variant="ghost"
          size="sm"
          icon="close"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="shrink-0 self-start"
        />
      )}
    </div>
  )
}
