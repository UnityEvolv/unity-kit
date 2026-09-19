import { isValidElement } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { Icon } from '../Icon'

/**
 * A drawer is a dialog anchored to an edge, so it is the same Radix dialog as
 * `Modal` with different daisyUI appearance classes — focus trap, focus
 * return, Escape, overlay click and scroll lock all come from the same place.
 *
 * It deliberately does **not** use daisyUI's `.drawer`. That class is the
 * checkbox-driven sidebar layout: `.drawer-side` is revealed by
 * `.drawer-toggle:checked ~ .drawer-side`, a selector that can never match
 * when Radix is the thing deciding whether the panel exists, so the panel
 * would mount and stay translated off-screen. daisyUI's own edge-anchored
 * sheet is `modal-start` / `modal-end` / `modal-top` / `modal-bottom`, which
 * gives `.modal-box` a full-height (or full-width) panel with the outer
 * corners squared off — the drawer appearance, from the library, without
 * fighting a mechanism the kit has replaced.
 *
 * `menu` is still the right class for navigation *inside* a drawer, and the
 * stories show it that way.
 */
export type DrawerSide = 'start' | 'end' | 'top' | 'bottom'
export type DrawerSize = 'sm' | 'md' | 'lg'

/**
 * `start` and `end` are inline-relative, so a drawer is on the left in English
 * and on the right in Arabic without the caller thinking about it. daisyUI
 * handles the flip, including which corners are rounded.
 */
const sideClass: Record<DrawerSide, string> = {
  start: 'modal-start',
  end: 'modal-end',
  top: 'modal-top',
  bottom: 'modal-bottom',
}

/**
 * Size means width for a side drawer and is left to the content for a top or
 * bottom sheet, where daisyUI already caps the height at `100vh - 5em`.
 */
const drawerWidth: Record<DrawerSize, string> = {
  sm: 'w-full max-w-xs',
  md: 'w-full max-w-sm',
  lg: 'w-full max-w-md',
}

export interface DrawerProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The control that opens the drawer. */
  trigger?: ReactNode
  /** Required, and rendered as the dialog's accessible name. */
  title: ReactNode
  description?: ReactNode
  /** Pinned to the bottom of the panel, below the scrolling body. */
  footer?: ReactNode
  /** Which edge the panel is anchored to. Defaults to `end`. */
  side?: DrawerSide
  /** Width for a `start` or `end` drawer; ignored for `top` and `bottom`. */
  size?: DrawerSize
  hideCloseButton?: boolean
  /** `false` stops an overlay click closing it. Escape still does. */
  dismissible?: boolean
  /**
   * Applied to the panel. Width belongs to `size` for the same reason it does
   * on `Modal`: the kit does not merge Tailwind classes.
   */
  className?: string
  children?: ReactNode
}

const mergeable = (node: ReactNode) => isValidElement(node)

/**
 * An edge-anchored dialog. Header and footer stay put while the body scrolls,
 * which is what separates a drawer from a tall modal: a navigation list or a
 * filter panel is expected to be longer than the screen.
 *
 * daisyUI pads `.modal-box` by 1.5rem on every side. A drawer wants the header
 * and footer padded but the scrolling region flush to the edges, so the
 * padding is removed here and reapplied per region.
 */
export function Drawer({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  footer,
  side = 'end',
  size = 'md',
  hideCloseButton = false,
  dismissible = true,
  className,
  children,
}: DrawerProps) {
  const sized = side === 'start' || side === 'end' ? drawerWidth[size] : 'w-full'
  const panel = ['modal-box flex flex-col overflow-hidden p-0', sized, className ?? '']
    .join(' ')
    .trim()

  return (
    <Dialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger === undefined ? null : (
        <Dialog.Trigger asChild={mergeable(trigger)}>{trigger}</Dialog.Trigger>
      )}
      <Dialog.Portal>
        {/* Same nesting rule as Modal: `.modal-box` only becomes visible as a
            direct child of `.modal.modal-open`. */}
        <Dialog.Overlay className={['modal modal-open', sideClass[side]].join(' ')}>
          <Dialog.Content
            className={panel}
            {...(description ? {} : { 'aria-describedby': undefined })}
            onPointerDownOutside={dismissible ? undefined : (event) => event.preventDefault()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-base-300 p-4">
              <div className="min-w-0">
                <Dialog.Title className="truncate text-base font-semibold text-base-content">
                  {title}
                </Dialog.Title>
                {description ? (
                  <Dialog.Description className="mt-1 text-sm text-muted">
                    {description}
                  </Dialog.Description>
                ) : null}
              </div>
              {hideCloseButton ? null : (
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="btn btn-ghost btn-square btn-sm -me-1 shrink-0"
                    aria-label="Close"
                  >
                    <Icon name="close" size="sm" />
                  </button>
                </Dialog.Close>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm text-base-content">
              {children}
            </div>
            {footer ? (
              <div className="flex justify-end gap-2 border-t border-base-300 p-4">{footer}</div>
            ) : null}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export interface DrawerCloseProps {
  children: ReactNode
}

/** Closes the drawer it sits inside. Reached as `Drawer.Close`. */
function DrawerClose({ children }: DrawerCloseProps) {
  return <Dialog.Close asChild={mergeable(children)}>{children}</Dialog.Close>
}

Drawer.Close = DrawerClose

/** One valid set of props for the blind install test. */
Drawer.sampleProps = { title: 'Example' } satisfies DrawerProps
