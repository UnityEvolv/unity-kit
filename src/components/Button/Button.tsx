import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

/**
 * Class names must appear here in full, never assembled as `btn-${variant}`.
 * Tailwind scans the built files as static text, so an interpolated name is
 * invisible to it and silently produces no CSS. This lookup is why UKIT-5
 * moves the library to class-variance-authority, which keeps variants static.
 *
 * `danger` maps to daisyUI's `error`, since daisyUI generates its component
 * classes from its own token names. The explicit hover is the brand's own
 * hover value: daisyUI derives a hover shade automatically, but UKIT-29 gives
 * each of these a value of its own so a destructive button is as finished as a
 * primary one. Tailwind's utilities layer sorts after daisyUI's components
 * layer, so these win at equal specificity.
 *
 * There is no `accent` variant. The palette is two hues plus the status
 * colours, and daisyUI's accent is aliased to primary so `btn-accent` cannot
 * introduce a third colour.
 */
const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary hover:bg-primary-hover',
  secondary: 'btn-secondary hover:bg-secondary-hover',
  danger: 'btn-error hover:bg-danger-hover',
}

interface ButtonBase extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Brand variant. Typed variants arrive with CVA in UKIT-5. */
  variant?: ButtonVariant
  /** An icon name from the kit. The button sizes and places it. */
  icon?: IconName
  /** Which side of the label the icon sits on. Ignored without a label. */
  iconPosition?: 'start' | 'end'
}

/**
 * Two shapes, so an icon-only button cannot ship without an accessible name.
 *
 * The icon is `aria-hidden` by design, so a button with an icon and no label
 * has nothing to announce. Making `aria-label` required on that branch turns
 * `<Button icon="trash" />` into a compile error rather than a button a screen
 * reader reads as "button".
 */
type LabelledButton = ButtonBase & { children: ReactNode }
type IconOnlyButton = ButtonBase & {
  icon: IconName
  children?: undefined
  'aria-label': string
}

export type ButtonProps = LabelledButton | IconOnlyButton

/**
 * Throwaway Button used to verify that a consuming app renders kit components
 * *and* styles them. Replaced by the real CVA-based Button in UKIT-5.
 *
 * The icon is a prop rather than a child on purpose. UKIT-5 requires that
 * consumers never write daisyUI class names directly, and composing an
 * icon-only button needs `btn-square` at the call site. Taking the icon as a
 * prop keeps that name inside the kit, and lets the button choose the icon
 * size rather than leaving every caller to guess it.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    icon,
    iconPosition = 'start',
    className,
    type = 'button',
    children,
    ...props
  },
  ref,
) {
  const iconOnly = icon !== undefined && children === undefined

  // `sm` is 16px, which is the match for the button's 14px label. UKIT-5
  // derives this from the button's own size prop; there is only one size here.
  const glyph = icon ? <Icon name={icon} size="sm" /> : null

  return (
    <button
      ref={ref}
      type={type}
      className={['btn', variantClass[variant], iconOnly ? 'btn-square' : null, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {iconPosition === 'start' ? glyph : null}
      {children}
      {iconPosition === 'end' ? glyph : null}
    </button>
  )
})
