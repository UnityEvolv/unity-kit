import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode, Ref } from 'react'

/**
 * Every class name appears here in full. Tailwind scans built files as static
 * text, so a name assembled from a variable is invisible to it and silently
 * produces no CSS.
 *
 * Three things here deliberately override daisyUI rather than inherit it:
 *
 * - `bg-base-100`. daisyUI's `.card` sets a radius and a layout but no
 *   background at all, so a card on the page background would be invisible
 *   apart from its border. The surface colour is the point of a card.
 * - `border-base-300`. daisyUI's `.card-border` draws the border in
 *   `base-200`, which is #FAF8FC against a #FFFFFF surface in light mode —
 *   a border nobody can see. `base-300` is the kit's line token.
 * - `focus-visible:outline-primary`. daisyUI already gives `.card` a
 *   transparent outline that turns `currentColor` on focus; primary is the
 *   colour this palette uses for focus rings everywhere else.
 *
 * Tailwind's utilities layer sorts after daisyUI's, so each wins at equal
 * specificity.
 */
const card = cva('card bg-base-100', {
  variants: {
    variant: {
      bordered: 'card-border border-base-300',
      elevated: 'shadow-md',
      // Same surface as `bordered`; what makes it interactive is the
      // affordance below, which `href` turns on independently so a linked
      // elevated card is not left without hover or focus.
      interactive: 'card-border border-base-300',
    },
    clickable: {
      true: 'cursor-pointer transition-[box-shadow,outline-color] duration-200 hover:shadow-md focus-visible:outline-primary',
      false: '',
    },
    side: { true: 'card-side', false: '' },
  },
  defaultVariants: { variant: 'bordered', clickable: false, side: false },
})

type CardVariants = VariantProps<typeof card>
export type CardVariant = NonNullable<CardVariants['variant']>

/** Where the media slot sits. `side` puts it alongside the body. */
export type CardMediaPosition = 'top' | 'bottom' | 'side'

/**
 * Props are typed from the CVA config rather than extending `VariantProps`
 * directly: that type admits `null` for every variant, which is how CVA spells
 * "no class", and a nullable variant cannot index a lookup table.
 */
export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant
  /**
   * Sits at the top of the body, styled as the card's title row. Pass a
   * heading element if the card titles a section — the kit styles the row but
   * does not choose the heading level, which depends on the page.
   */
  header?: ReactNode
  /** Sits at the foot of the body, laid out as an actions row. */
  footer?: ReactNode
  /** An image, chart or anything else, wrapped in a `figure`. */
  media?: ReactNode
  /** Defaults to `top`. Ignored without `media`. */
  mediaPosition?: CardMediaPosition
  /**
   * Renders the card as a link, which is the kit's way of making a whole card
   * activatable: an anchor is focusable and works from the keyboard without
   * this component hand-rolling either. Consumers on a client-side router use
   * `variant="interactive"` and supply their own link instead — the kit is
   * router-agnostic and will not import one.
   */
  href?: string
  children?: ReactNode
}

/**
 * A surface that groups related content: a list item, a panel, a tile.
 *
 * The kit owns the frame — radius, surface colour, border, padding, and where
 * the header, footer and media sit — and nothing else. What goes in each slot
 * is the consumer's, including charts, which the kit deliberately does not
 * ship: a chart lives inside a Card the app renders itself.
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    variant = 'bordered',
    header,
    footer,
    media,
    mediaPosition = 'top',
    href,
    className,
    children,
    ...props
  },
  ref,
) {
  const clickable = variant === 'interactive' || href !== undefined
  const side = media !== undefined && mediaPosition === 'side'

  const figure = media !== undefined ? <figure>{media}</figure> : null

  const content = (
    <>
      {mediaPosition === 'bottom' ? null : figure}
      <div className="card-body">
        {/*
         * `card-title` is daisyUI's flex row, so a title and a badge or a menu
         * sit at opposite ends without the consumer laying them out.
         */}
        {header !== undefined ? (
          <div className="card-title justify-between">{header}</div>
        ) : null}
        {children}
        {footer !== undefined ? <div className="card-actions justify-end">{footer}</div> : null}
      </div>
      {mediaPosition === 'bottom' ? figure : null}
    </>
  )

  const classes = card({ variant, clickable, side, className })

  if (href !== undefined) {
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...(props as HTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    )
  }

  return (
    <div ref={ref as Ref<HTMLDivElement>} className={classes} {...props}>
      {content}
    </div>
  )
})
