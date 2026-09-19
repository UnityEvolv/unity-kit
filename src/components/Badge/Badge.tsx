import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'
import { Icon } from '../Icon'
import type { IconName, IconSize } from '../Icon'

/**
 * Same colours and sizes as Button, written out in full for the same reason:
 * Tailwind scans built files as static text, so an assembled class name
 * produces no CSS and the badge renders unstyled with no error.
 *
 * There is no `link` variant. `btn-link` is a button style — a control that
 * looks like text — and daisyUI has no badge equivalent, so offering one would
 * be inventing an API that maps to nothing.
 */
const badge = cva('badge', {
  variants: {
    variant: {
      primary: 'badge-primary',
      secondary: 'badge-secondary',
      danger: 'badge-error',
      ghost: 'badge-ghost',
    },
    size: { xs: 'badge-xs', sm: 'badge-sm', md: 'badge-md', lg: 'badge-lg' },
    outline: { true: 'badge-outline', false: '' },
  },
  defaultVariants: { variant: 'primary', size: 'md', outline: false },
})

type BadgeVariants = VariantProps<typeof badge>
export type BadgeVariant = NonNullable<BadgeVariants['variant']>
export type BadgeSize = NonNullable<BadgeVariants['size']>

/** Icon size per badge size, so a caller never picks one. */
const glyphSize: Record<BadgeSize, IconSize> = { xs: 'xs', sm: 'xs', md: 'xs', lg: 'sm' }

/**
 * Typed from the CVA config rather than extending `VariantProps`, which admits
 * `null` for every variant — CVA's way of spelling "no class" — and a nullable
 * `size` cannot index the glyph table above.
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  /** Outlined rather than filled, for a quieter marker. */
  outline?: boolean
  /** An icon name from the kit, rendered before the label. */
  icon?: IconName
  children?: ReactNode
}

/**
 * A small status marker: a count, a state, a label on a row.
 *
 * A badge is not a control. If it needs to be clicked it is a Button, and if
 * it conveys something not already in the surrounding text it needs a label
 * the same way any other non-text content does.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'primary', size = 'md', outline = false, icon, className, children, ...props },
  ref,
) {
  return (
    <span ref={ref} className={badge({ variant, size, outline, className })} {...props}>
      {icon ? <Icon name={icon} size={glyphSize[size]} /> : null}
      {children}
    </span>
  )
})
