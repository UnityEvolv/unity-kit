import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from '../Icon'
import type { IconName, IconSize } from '../Icon'

/**
 * Every class name appears here in full. Tailwind scans built files as static
 * text, so a name assembled from a variable is invisible to it and silently
 * produces no CSS — which is the whole reason variants live in a CVA config
 * rather than in string concatenation at the call site.
 *
 * `danger` maps to daisyUI's `error`, because daisyUI generates its component
 * classes from its own token names. The explicit hovers are UKIT-29's own
 * hover values; daisyUI derives a shade automatically, but the brand gives
 * primary, secondary and danger a value each so a destructive button is as
 * finished as a primary one. Tailwind's utilities layer sorts after daisyUI's
 * components layer, so they win at equal specificity.
 *
 * There is no `accent` variant. The palette is two hues plus the status
 * colours, and daisyUI's accent is aliased to primary, so an accent variant
 * would be a synonym for primary dressed up as a choice.
 */
const button = cva('btn', {
  variants: {
    variant: {
      primary: 'btn-primary hover:bg-primary-hover',
      secondary: 'btn-secondary hover:bg-secondary-hover',
      danger: 'btn-error hover:bg-danger-hover',
      // Ghost and link carry no fill, so daisyUI's own hover is correct.
      ghost: 'btn-ghost',
      link: 'btn-link',
    },
    size: { xs: 'btn-xs', sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' },
    fullWidth: { true: 'btn-block', false: '' },
    iconOnly: { true: 'btn-square', false: '' },
  },
  defaultVariants: { variant: 'primary', size: 'md', fullWidth: false, iconOnly: false },
})

type ButtonVariants = VariantProps<typeof button>
export type ButtonVariant = NonNullable<ButtonVariants['variant']>
export type ButtonSize = NonNullable<ButtonVariants['size']>

/**
 * Icon and spinner sizes per button size, so a caller never picks one.
 *
 * Paired against the label rather than the button: daisyUI's sizes set
 * `--fontsize` to 11, 12, 14 and 18px, and an icon reads as part of the word
 * when it is a step above the text rather than matched to the button height.
 */
const glyphSize: Record<ButtonSize, IconSize> = { xs: 'xs', sm: 'xs', md: 'sm', lg: 'md' }
const spinnerSize: Record<ButtonSize, string> = {
  xs: 'loading-xs',
  sm: 'loading-xs',
  md: 'loading-sm',
  lg: 'loading-md',
}

/**
 * Props are typed from the CVA config rather than extending `VariantProps`
 * directly: that type admits `null` for every variant, which is how CVA spells
 * "no class", and a nullable `size` cannot index the glyph table below.
 */
interface ButtonBase extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretches the button to fill its container. */
  fullWidth?: boolean
  /** An icon name from the kit. The button sizes and places it. */
  icon?: IconName
  /** Which side of the label the icon sits on. Ignored without a label. */
  iconPosition?: 'start' | 'end'
  /** Shows a spinner in the icon's place and stops the button being pressed. */
  loading?: boolean
}

/**
 * Two shapes, so an icon-only button cannot ship without an accessible name.
 *
 * The icon is `aria-hidden` by design, so a button with an icon and no label
 * has nothing to announce. Requiring `aria-label` on that branch turns
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
 * The kit's button. Variants are picked from this API; consumers never write a
 * daisyUI class name, including `btn-square` for the icon-only case and
 * `btn-block` for full width.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    icon,
    iconPosition = 'start',
    className,
    type = 'button',
    disabled,
    children,
    ...props
  },
  ref,
) {
  const iconOnly = icon !== undefined && children === undefined

  // A spinner replaces the icon rather than joining it, so the button does not
  // change width mid-action and shift whatever sits beside it.
  const glyph = loading ? (
    <span className={['loading loading-spinner', spinnerSize[size]].join(' ')} aria-hidden="true" />
  ) : icon ? (
    <Icon name={icon} size={glyphSize[size]} />
  ) : null

  return (
    <button
      ref={ref}
      type={type}
      className={button({ variant, size, fullWidth, iconOnly, className })}
      // A loading button is not pressable, and `aria-busy` is what tells a
      // screen reader the state is temporary rather than the control broken.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {iconPosition === 'start' ? glyph : null}
      {children}
      {iconPosition === 'end' ? glyph : null}
    </button>
  )
})
