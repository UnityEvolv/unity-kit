import { createContext, isValidElement, useContext } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'

/**
 * A label for a control that shows one, on hover and on keyboard focus.
 *
 * daisyUI's `.tooltip` is CSS-only: the text lives in a `data-tip` attribute
 * rendered through `content: attr(data-tip)`, which means it is generated
 * content — unselectable, unreachable by assistive technology, clipped by any
 * ancestor with `overflow: hidden`, and unable to move away from a viewport
 * edge. Radix renders real text in a portal, positions it, and also announces
 * it: the trigger gets `aria-describedby` pointing at a visually hidden copy,
 * so a screen reader reads the tooltip whether or not it is on screen.
 *
 * A tooltip is never the only label for a control. An icon-only button needs
 * its own `aria-label` as well — which `Button` already requires at the type
 * level — because a tooltip that only appears on hover is nothing a touch user
 * or a screen reader can rely on.
 */
export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'
export type TooltipAlign = 'start' | 'center' | 'end'

/**
 * Radix's provider carries the shared timing that makes a toolbar feel right:
 * the first tooltip waits, and moving straight to the next one skips the wait.
 * That only works when one provider wraps them all, so `Tooltip` needs to know
 * whether it is already inside one. Radix exposes no way to ask, hence this
 * flag — without it, every `Tooltip` would have to mount its own provider and
 * the skip behaviour would be lost wherever an app did mount one.
 */
const InsideProvider = createContext(false)

export interface TooltipProviderProps {
  /** How long to wait before the first tooltip opens, in ms. */
  delayDuration?: number
  /** How long the wait stays skipped after one closes, in ms. */
  skipDelayDuration?: number
  children?: ReactNode
}

/**
 * Mount once, near the root of the app. Optional: a lone `Tooltip` supplies
 * its own provider, so a single tooltip on a page needs no setup.
 */
export function TooltipProvider({
  delayDuration = 300,
  skipDelayDuration = 300,
  children,
}: TooltipProviderProps) {
  return (
    <InsideProvider.Provider value={true}>
      <RadixTooltip.Provider
        delayDuration={delayDuration}
        skipDelayDuration={skipDelayDuration}
      >
        {children}
      </RadixTooltip.Provider>
    </InsideProvider.Provider>
  )
}

export interface TooltipProps {
  /** The label. A tooltip with no content renders nothing. */
  content: ReactNode
  side?: TooltipSide
  align?: TooltipAlign
  /** Overrides the provider's delay for this one tooltip, in ms. */
  delayDuration?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  /** The control the tooltip describes. */
  children: ReactNode
}

/**
 * Matches daisyUI's own tooltip colours — `neutral` on `neutral-content` at
 * `radius-field` — without its CSS-only machinery, so the two look the same
 * wherever both appear.
 */
const BUBBLE =
  'z-[1000] max-w-xs rounded-field bg-neutral px-2 py-1 text-sm text-neutral-content shadow-md'

export function Tooltip({
  content,
  side = 'top',
  align = 'center',
  delayDuration,
  open,
  defaultOpen,
  onOpenChange,
  className,
  children,
}: TooltipProps) {
  const insideProvider = useContext(InsideProvider)

  const tooltip = (
    <RadixTooltip.Root
      delayDuration={delayDuration}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <RadixTooltip.Trigger asChild={isValidElement(children)}>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className={[BUBBLE, className ?? ''].join(' ').trim()}
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={8}
        >
          {content}
          <RadixTooltip.Arrow className="fill-neutral" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )

  // A lone tooltip still works: it mounts the provider it needs, and defers to
  // an app-level one when there is a shared delay to respect.
  return insideProvider ? (
    tooltip
  ) : (
    <RadixTooltip.Provider delayDuration={delayDuration}>{tooltip}</RadixTooltip.Provider>
  )
}

/** One valid set of props for the blind install test. */
Tooltip.sampleProps = { content: 'Example' } satisfies Omit<TooltipProps, 'children'>
