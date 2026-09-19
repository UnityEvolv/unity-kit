import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

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

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Brand variant. Typed variants arrive with CVA in UKIT-5. */
  variant?: ButtonVariant
}

/**
 * Throwaway Button used to verify that a consuming app renders kit components
 * *and* styles them. Replaced by the real CVA-based Button in UKIT-5.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={['btn', variantClass[variant], className].filter(Boolean).join(' ')}
      {...props}
    />
  ),
)

Button.displayName = 'Button'
