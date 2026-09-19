import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'accent'

/**
 * Class names must appear here in full, never assembled as `btn-${variant}`.
 * Tailwind scans the built files as static text, so an interpolated name is
 * invisible to it and silently produces no CSS. This lookup is why UKIT-5
 * moves the library to class-variance-authority, which keeps variants static.
 */
const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** daisyUI colour variant. Typed variants arrive with CVA in UKIT-5. */
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
