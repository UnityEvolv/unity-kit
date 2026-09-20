import { isValidElement } from 'react'
import * as RadixPopover from '@radix-ui/react-popover'
import type { ReactNode } from 'react'

/**
 * A non-modal panel anchored to a trigger: a status picker, a reaction
 * palette, a filter form.
 *
 * Non-modal is the whole point and the one thing that separates it from
 * `Modal`. The page behind stays scrollable and stays reachable by assistive
 * technology, nothing is made inert, and the panel closes on an outside click
 * or Escape. Focus still moves into the panel when it opens and returns to the
 * trigger when it closes, so a keyboard user is never stranded.
 *
 * This is also the positioning base for `Combobox` (UKIT-13) and the date
 * pickers (UKIT-20, UKIT-21), which is why `padded` and `autoFocusContent`
 * exist: a listbox supplies its own padding, and a combobox must keep focus in
 * its text input while the list is open rather than moving it into the panel.
 */
export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'
export type PopoverAlign = 'start' | 'center' | 'end'
export type PopoverWidth = 'auto' | 'sm' | 'md' | 'lg' | 'trigger'

/**
 * Width is a prop rather than something passed through `className`, because
 * the kit does not merge Tailwind classes: a `w-72` from here and a `w-64`
 * from a caller are both real utilities at equal specificity, so which one
 * wins comes down to their order in the compiled stylesheet rather than to
 * which was asked for. A lookup keeps the answer in the API.
 *
 * `trigger` matches the panel to the control it hangs off, using the width
 * Radix measures and publishes as a custom property. That is what a combobox
 * needs — a list exactly as wide as its input — and it cannot be spelled as a
 * fixed size, because the input's width is the app's decision, not the kit's.
 */
const popoverWidth: Record<PopoverWidth, string> = {
  auto: 'w-auto',
  sm: 'w-56',
  md: 'w-72',
  lg: 'w-96',
  trigger: 'w-[var(--radix-popover-trigger-width)]',
}

export interface PopoverProps {
  /** The control the panel is anchored to. Required. */
  trigger: ReactNode
  side?: PopoverSide
  align?: PopoverAlign
  /** Gap between trigger and panel, in pixels. Defaults to 6. */
  sideOffset?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * `false` renders children straight into the panel with no padding, for
   * content that supplies its own — a listbox, a calendar grid.
   */
  padded?: boolean
  /**
   * `false` leaves focus where it was when the panel opened. A combobox needs
   * this: its input stays focused while the list below it is open, and the
   * arrow keys move a highlight rather than the caret.
   */
  autoFocusContent?: boolean
  /** Panel width. `trigger` matches the control it hangs off. */
  width?: PopoverWidth
  /**
   * Applied to the panel. Use it for things the kit does not own — a height
   * cap, a margin — not for width, which has its own prop for the reason given
   * above `popoverWidth`.
   */
  className?: string
  children?: ReactNode
}

const mergeable = (node: ReactNode) => isValidElement(node)

/**
 * daisyUI's `card` supplies the radius and `card-body` the padding and gap;
 * the surface, border and shadow are stated here because `card` sets none.
 *
 * `focus:outline-none` cancels `.card:focus-visible { outline-color:
 * currentColor }`. Radix moves focus to the panel when it opens, and a
 * container drawing a focus ring around itself reads as an error rather than
 * as a position.
 *
 * Exported for `Combobox`, which anchors a Radix popover of its own and must
 * look like this one; not exported from the package, since it hands out daisyUI
 * class names a consumer should never hold.
 *
 * The z-index matches daisyUI's overlay layer (999) so a popover opens above a
 * `Modal` instead of behind it.
 */
export const PANEL =
  'card card-sm z-[999] border border-base-300 bg-base-100 text-base-content shadow-md focus:outline-none'

export function Popover({
  trigger,
  side = 'bottom',
  align = 'center',
  sideOffset = 6,
  open,
  defaultOpen,
  onOpenChange,
  padded = true,
  autoFocusContent = true,
  width = 'md',
  className,
  children,
}: PopoverProps) {
  return (
    <RadixPopover.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild={mergeable(trigger)}>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className={[PANEL, popoverWidth[width], className ?? ''].join(' ').trim()}
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={8}
          onOpenAutoFocus={autoFocusContent ? undefined : (event) => event.preventDefault()}
        >
          {padded ? <div className="card-body">{children}</div> : children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}

export interface PopoverCloseProps {
  children: ReactNode
}

/** Closes the popover it sits inside. Reached as `Popover.Close`. */
function PopoverClose({ children }: PopoverCloseProps) {
  return <RadixPopover.Close asChild={mergeable(children)}>{children}</RadixPopover.Close>
}

Popover.Close = PopoverClose

/** One valid set of props for the blind install test. */
Popover.sampleProps = { trigger: 'Open' } satisfies PopoverProps
