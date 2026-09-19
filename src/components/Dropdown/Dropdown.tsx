import { isValidElement } from 'react'
import * as Menu from '@radix-ui/react-dropdown-menu'
import type { ReactNode } from 'react'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

/**
 * A menu of actions hanging off a button.
 *
 * Behaviour is Radix's: roving focus with the arrow keys, type-ahead, Escape
 * and outside click to close, focus returned to the trigger, and `role="menu"`
 * with `role="menuitem"` children. Appearance is daisyUI's `menu`, which is
 * why the content is a real `ul` and every item is wrapped in an `li` — those
 * are the elements `.menu` styles, and using a bare `div` would leave the
 * items with no padding, radius or row layout at all.
 *
 * daisyUI's `.dropdown` / `.dropdown-content` pair is deliberately unused. It
 * positions with CSS anchor positioning and opens on `:focus-within`, so it
 * would be a second, conflicting open/close mechanism layered on top of the
 * one Radix already runs, and it cannot flip or shift away from a viewport
 * edge the way Radix's positioning does.
 */
export type DropdownAlign = 'start' | 'center' | 'end'
export type DropdownSide = 'top' | 'right' | 'bottom' | 'left'

export interface DropdownProps {
  /** The control the menu hangs off. Required — a menu needs an anchor. */
  trigger: ReactNode
  /** Which edge of the trigger the menu opens from. Defaults to `bottom`. */
  side?: DropdownSide
  /** How the menu lines up along that edge. Defaults to `start`. */
  align?: DropdownAlign
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Applied to the menu panel, for a one-off width. */
  className?: string
  /** `Dropdown.Item`, `Dropdown.Separator` and `Dropdown.Label`. */
  children?: ReactNode
}

const mergeable = (node: ReactNode) => isValidElement(node)

/**
 * `.menu` supplies the row layout and spacing but sets no surface of its own,
 * so the panel's background, border, radius and shadow are stated here.
 *
 * The z-index matches daisyUI's own overlay layer (999), which is what lets a
 * dropdown open above a `Modal` rather than behind it.
 */
const PANEL = 'menu z-[999] min-w-48 rounded-box border border-base-300 bg-base-100 p-1 shadow-md'

export function Dropdown({
  trigger,
  side = 'bottom',
  align = 'start',
  open,
  defaultOpen,
  onOpenChange,
  className,
  children,
}: DropdownProps) {
  return (
    <Menu.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <Menu.Trigger asChild={mergeable(trigger)}>{trigger}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          asChild
          side={side}
          align={align}
          sideOffset={6}
          // Keeps the menu clear of the viewport edge when it flips or shifts.
          collisionPadding={8}
        >
          <ul className={[PANEL, className ?? ''].join(' ').trim()}>{children}</ul>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}

export interface DropdownItemProps {
  /** Runs on click and on Enter or Space. */
  onSelect?: () => void
  icon?: IconName
  /** `danger` for a destructive action, which reads red until highlighted. */
  variant?: 'default' | 'danger'
  disabled?: boolean
  /** Right-aligned hint — a shortcut, a count, a checkmark. */
  hint?: ReactNode
  children: ReactNode
}

/**
 * Radix marks the item under the cursor or arrow keys with `data-highlighted`,
 * which unifies mouse hover and keyboard focus into one state. daisyUI's own
 * `.menu-focus` cannot be driven from an attribute, so the highlight is stated
 * as utilities here — the rest of the row still comes from `.menu`.
 */
const ITEM =
  'cursor-pointer select-none outline-none data-[highlighted]:bg-base-200 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50'
const ITEM_DANGER =
  'cursor-pointer select-none outline-none text-error data-[highlighted]:bg-error data-[highlighted]:text-error-content data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50'

function DropdownItem({
  onSelect,
  icon,
  variant = 'default',
  disabled,
  hint,
  children,
}: DropdownItemProps) {
  return (
    <li>
      <Menu.Item
        className={variant === 'danger' ? ITEM_DANGER : ITEM}
        disabled={disabled}
        onSelect={onSelect}
      >
        {icon ? <Icon name={icon} size="sm" /> : null}
        <span className="truncate">{children}</span>
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </Menu.Item>
    </li>
  )
}

/**
 * A rule between groups of items. Rendered as the `li` itself rather than
 * inside one, so it is a valid child of the `ul` and escapes `.menu`'s
 * styling of item rows.
 */
function DropdownSeparator() {
  return (
    <Menu.Separator asChild>
      <li className="my-1 h-px bg-base-300" />
    </Menu.Separator>
  )
}

export interface DropdownLabelProps {
  children: ReactNode
}

/** A heading over a group of items, using daisyUI's own `menu-title`. */
function DropdownLabel({ children }: DropdownLabelProps) {
  return (
    <Menu.Label asChild>
      <li className="menu-title">{children}</li>
    </Menu.Label>
  )
}

/*
 * Reached through `Dropdown` rather than exported on their own: each throws
 * outside a `Dropdown`, and the kit's blind install test renders every
 * top-level export standalone.
 */
Dropdown.Item = DropdownItem
Dropdown.Separator = DropdownSeparator
Dropdown.Label = DropdownLabel

/** One valid set of props for the blind install test. */
Dropdown.sampleProps = { trigger: 'Menu' } satisfies DropdownProps
