import { Toaster as Sonner } from 'sonner'
import { Icon } from '../Icon'
import { spinnerClass } from '../Spinner/Spinner'

export type ToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

export interface ToasterProps {
  /** Defaults to `bottom-right`. */
  position?: ToastPosition
  /** Milliseconds a toast stays unless it says otherwise. Defaults to 5000. */
  duration?: number
  /** How many stack before the oldest is hidden. Defaults to 3. */
  visibleToasts?: number
  /** A close button on every toast. Swipe and auto-dismiss work without it. */
  closeButton?: boolean
}

/**
 * Every class name in full, as everywhere in the kit. sonner is told to
 * apply none of its own look (`unstyled`) and these are what dress the toast
 * instead: daisyUI's `alert` is a grid that already lays out an icon, a
 * message and buttons, so the toast is an Alert that happens to move.
 *
 * sonner renders its close button first in the DOM and places it with CSS in
 * styled mode; unstyled, `order-last` puts it where a dismiss control reads.
 */
const classNames = {
  toast: 'alert w-full shadow-lg sm:w-96',
  title: 'font-medium',
  description: 'text-sm',
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
  actionButton: 'btn btn-sm',
  cancelButton: 'btn btn-sm btn-ghost',
  closeButton: 'btn btn-ghost btn-xs btn-square order-last justify-self-end',
}

/**
 * The icons `toast.success` and friends bring with them, from the kit's own
 * set so a toast and an `Alert` for the same event show the same glyph.
 * `warning` and `error` differ on purpose: colour alone cannot carry the
 * difference (WCAG 1.4.1).
 */
const icons = {
  success: <Icon name="check" size="sm" />,
  error: <Icon name="error" size="sm" />,
  warning: <Icon name="alert" size="sm" />,
  info: <Icon name="info" size="sm" />,
  loading: <span className={spinnerClass('sm')} aria-hidden="true" />,
  close: <Icon name="close" size="xs" />,
}

/**
 * Mount once at the app root. After that, `toast(...)` works from anywhere.
 *
 * sonner underneath, per the story: stacking, swipe-to-dismiss, pausing on
 * hover, queueing past `visibleToasts` and the `aria-live` region are its.
 * daisyUI dresses each toast as an `alert`. daisyUI's own `.toast` shell is
 * deliberately not used — it positions with `position: fixed` too, and two
 * things placing the same list fight.
 *
 * `theme` is pinned to `light` so sonner never reads `prefers-color-scheme`
 * itself: with `unstyled` its theme changes nothing visible, and the kit's
 * colours already follow `data-theme` through daisyUI.
 */
export function Toaster({
  position = 'bottom-right',
  duration = 5000,
  visibleToasts = 3,
  closeButton = false,
}: ToasterProps) {
  return (
    <Sonner
      position={position}
      duration={duration}
      visibleToasts={visibleToasts}
      closeButton={closeButton}
      theme="light"
      icons={icons}
      toastOptions={{ unstyled: true, classNames, closeButtonAriaLabel: 'Dismiss' }}
    />
  )
}
