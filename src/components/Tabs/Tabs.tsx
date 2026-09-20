import * as RadixTabs from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

/**
 * Class names in full, as everywhere in the kit. daisyUI's `tabs` styles the
 * strip and `tab` each control. Its active look keys off
 * `[aria-selected=true]` as well as `tab-active`, and its disabled look off
 * `[disabled]`, so the attributes Radix already sets are the whole story:
 * there is no class to toggle and no second source of truth for which tab
 * is on.
 */
const tabs = cva('tabs', {
  variants: {
    variant: { border: 'tabs-border', lift: 'tabs-lift', box: 'tabs-box' },
    size: { xs: 'tabs-xs', sm: 'tabs-sm', md: 'tabs-md', lg: 'tabs-lg' },
  },
  defaultVariants: { variant: 'border', size: 'md' },
})

const TAB = 'tab gap-1.5'

type TabsVariants = VariantProps<typeof tabs>
export type TabsVariant = NonNullable<TabsVariants['variant']>
export type TabsSize = NonNullable<TabsVariants['size']>

export interface TabItem {
  /** Stable identity, used for `value`. */
  value: string
  label: ReactNode
  icon?: IconName
  disabled?: boolean
  /** The panel shown while this tab is active. */
  content: ReactNode
}

export interface TabsProps {
  items: TabItem[]
  /** The active tab. Controlled. */
  value?: string
  /** The tab open at first. Defaults to the first item. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  variant?: TabsVariant
  size?: TabsSize
  /** Names the tab list for assistive technology. */
  label?: string
  className?: string
}

/**
 * Tabs for switching between views in one place: settings sections, a
 * room's people and chat.
 *
 * Radix owns the behaviour — `role="tablist"`, arrow keys between tabs, Home
 * and End, automatic activation on focus, `aria-controls` between tab and
 * panel — and daisyUI owns the look. Only the active panel is in the DOM.
 *
 * Not for navigation between pages. A row of links that changes the URL is
 * a `Sidebar` or a `Navbar` item, which stays router-agnostic and lets the
 * app decide what a link is.
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = 'border',
  size = 'md',
  label,
  className,
}: TabsProps) {
  return (
    <RadixTabs.Root
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={onValueChange}
      className={className}
    >
      <RadixTabs.List aria-label={label} className={tabs({ variant, size })}>
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={TAB}
          >
            {item.icon === undefined ? null : <Icon name={item.icon} size="sm" />}
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content
          key={item.value}
          value={item.value}
          className="pt-4 focus-visible:outline-2 focus-visible:outline-primary"
        >
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  )
}

/** One valid set of props for the blind install test. */
Tabs.sampleProps = {
  items: [
    { value: 'people', label: 'People', content: 'People' },
    { value: 'chat', label: 'Chat', content: 'Chat' },
  ],
} satisfies TabsProps
