import { isValidElement } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { Icon } from '../Icon'

/**
 * Why Radix rather than daisyUI's own modal.
 *
 * daisyUI's `.modal` is driven by `:target`, a checkbox or the native
 * `<dialog>` element: it styles a dialog without managing one. Nothing in it
 * traps focus, returns focus to the trigger, or hides the rest of the page
 * from assistive technology. Those are the parts that are genuinely hard — a
 * hand-rolled focus trap is where most libraries get this wrong — so behaviour
 * comes from Radix and appearance comes from daisyUI, the same split the rest
 * of the kit uses.
 *
 * The nesting is not arbitrary. `.modal-box` is `opacity: 0; scale: .95` until
 * it matches `.modal.modal-open > .modal-box`, so it must be a **direct child**
 * of an element carrying both classes or the panel renders invisible.
 * `Dialog.Content` therefore sits inside `Dialog.Overlay` rather than beside
 * it — Radix supports that nesting, and it is what creates the parent/child
 * relationship daisyUI's selector requires.
 *
 * `modal-open` is applied unconditionally because Radix mounts the portal only
 * while the dialog is open. Presence in the DOM already means open; the class
 * is how daisyUI is told so.
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * daisyUI caps `.modal-box` at 32rem. Tailwind's utilities are unlayered
 * within `@layer utilities` while daisyUI's sit in a sublayer of it, so a
 * plain `max-w-*` wins at any specificity and no `!important` is needed.
 */
const modalWidth: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export interface ModalProps {
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean
  /** Uncontrolled starting state, for a modal that owns its own open state. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * The control that opens the modal. An element is rendered in place with the
   * trigger wiring merged onto it, so it can be a `Button` from this kit;
   * anything else is wrapped in a button.
   */
  trigger?: ReactNode
  /**
   * Required, and rendered as the dialog's accessible name. A dialog with no
   * name is announced as "dialog" and nothing else, which is why this stays
   * required even for a design that shows no visible heading.
   */
  title: ReactNode
  /** A sentence under the title, referenced by `aria-describedby`. */
  description?: ReactNode
  /** Actions, end-aligned by daisyUI's `modal-action`. */
  footer?: ReactNode
  size?: ModalSize
  /** Hides the ✕. Escape and an overlay click still close the dialog. */
  hideCloseButton?: boolean
  /**
   * `false` stops an overlay click closing the dialog — for a destructive
   * confirmation, or a submit in flight, where a stray click should not
   * discard what was typed. Escape still closes it: a dialog that cannot be
   * escaped is a trap.
   */
  dismissible?: boolean
  /**
   * Applied to the panel. Use it for things the kit does not own — a height
   * cap, a margin. Width belongs to `size`: the kit does not merge Tailwind
   * classes, so a `max-w-*` here and the one `size` sets are both real
   * utilities at equal specificity, and which wins depends on their order in
   * the compiled stylesheet rather than on which was asked for.
   */
  className?: string
  children?: ReactNode
}

/**
 * `asChild` merges Radix's props onto the element it is given, and throws when
 * handed anything that is not one. Deciding per call means a string trigger
 * gets Radix's own button instead of a crash.
 */
const mergeable = (node: ReactNode) => isValidElement(node)

/**
 * A modal dialog: focus trapped while open, returned to the trigger on close,
 * background scroll locked, and the rest of the page hidden from assistive
 * technology. All four come from Radix; none is hand-rolled here.
 */
export function Modal({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  footer,
  size = 'md',
  hideCloseButton = false,
  dismissible = true,
  className,
  children,
}: ModalProps) {
  const panel = ['modal-box relative', modalWidth[size], className ?? ''].join(' ').trim()

  return (
    <Dialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger === undefined ? null : (
        <Dialog.Trigger asChild={mergeable(trigger)}>{trigger}</Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className="modal modal-middle modal-open">
          <Dialog.Content
            className={panel}
            // Radix points `aria-describedby` at a description whether or not
            // one was rendered, and warns in development when that id resolves
            // to nothing. Spreading the attribute away when there is no
            // description says "there is none"; spreading nothing when there is
            // one leaves Radix's own wiring intact.
            {...(description ? {} : { 'aria-describedby': undefined })}
            onPointerDownOutside={dismissible ? undefined : (event) => event.preventDefault()}
          >
            <Dialog.Title className="text-lg font-semibold text-base-content">{title}</Dialog.Title>
            {description ? (
              <Dialog.Description className="mt-1 text-sm text-muted">
                {description}
              </Dialog.Description>
            ) : null}
            {children ? <div className="mt-4 text-sm text-base-content">{children}</div> : null}
            {footer ? <div className="modal-action">{footer}</div> : null}
            {hideCloseButton ? null : (
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="btn btn-ghost btn-square btn-sm absolute end-3 top-3"
                  aria-label="Close"
                >
                  <Icon name="close" size="sm" />
                </button>
              </Dialog.Close>
            )}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export interface ModalCloseProps {
  children: ReactNode
}

/**
 * Closes the modal it sits inside, whatever it wraps — a `Button`, a link,
 * anything taking an `onClick`. Without it a footer button in a controlled
 * modal has to reach for the same state the parent holds, which is the one
 * place a consumer would otherwise need to know how the dialog works.
 *
 * Reached as `Modal.Close` rather than exported on its own: it throws outside
 * a `Modal`, and the kit's blind install test renders every top-level export
 * standalone.
 */
function ModalClose({ children }: ModalCloseProps) {
  return <Dialog.Close asChild={mergeable(children)}>{children}</Dialog.Close>
}

Modal.Close = ModalClose

/** One valid set of props for the blind install test. */
Modal.sampleProps = { title: 'Example' } satisfies ModalProps
