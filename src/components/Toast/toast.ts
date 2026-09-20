import { toast as sonner } from 'sonner'
import type { ReactNode } from 'react'

export type ToastId = string | number

export interface ToastAction {
  label: ReactNode
  onClick: () => void
}

export interface ToastOptions {
  /** A second line under the message. */
  description?: ReactNode
  /** Milliseconds before it dismisses itself. Defaults to the Toaster's duration. */
  duration?: number
  /** Reuse an id to update a toast in place rather than stacking a second one. */
  id?: ToastId
  /** One button on the toast: "Undo", "View", "Retry". */
  action?: ToastAction
  /** `false` keeps the toast until dismissed in code. */
  dismissible?: boolean
  /** Called when the toast leaves, however it left. */
  onDismiss?: () => void
}

type Kind = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'message'

const show =
  (kind: Kind) =>
  (message: ReactNode, options: ToastOptions = {}): ToastId =>
    sonner[kind](message, options)

/**
 * The kit's toast API. Callable from anywhere — an event handler, a data
 * layer, a route loader — as long as a `Toaster` is mounted once at the root.
 *
 * `success`, `error`, `warning` and `info` are the four the story names and
 * the four every toast library spells the same way; they are function names
 * rather than variant props, which is why they do not follow `Alert`'s
 * `ok` / `warn` / `danger`. `promise` shows loading until the promise settles,
 * then success or error; `dismiss` with no id clears everything.
 */
export const toast = Object.assign(show('message'), {
  success: show('success'),
  error: show('error'),
  warning: show('warning'),
  info: show('info'),
  /** An indeterminate spinner that stays until dismissed or updated by id. */
  loading: show('loading'),
  dismiss: (id?: ToastId) => sonner.dismiss(id),
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: {
      loading: ReactNode
      success: ReactNode | ((value: T) => ReactNode)
      error: ReactNode | ((error: unknown) => ReactNode)
    },
    options: Omit<ToastOptions, 'description'> = {},
  ) => sonner.promise(promise, { ...messages, ...options }),
})
