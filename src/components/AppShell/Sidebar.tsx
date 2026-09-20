import type { ReactNode } from 'react'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import type { RenderLink } from '../Breadcrumbs'

export interface SidebarItem {
  /** Stable identity; `activeKey` names one of these. */
  key: string
  label: ReactNode
  icon?: IconName
  /** Where it goes. Rendered through `renderLink`, so a router can own it. */
  href?: string
  /** For an item that acts rather than navigates. Ignored with `href`. */
  onClick?: () => void
  /** A count or a marker at the end of the row. */
  badge?: ReactNode
  disabled?: boolean
  /** Nested items, rendered as a group under this item's label. */
  children?: SidebarItem[]
}

export interface SidebarProps {
  items: SidebarItem[]
  /**
   * The `key` of the item for the current route. The app knows its router;
   * the kit only draws the highlight, which is what keeps it router-agnostic.
   */
  activeKey?: string
  renderLink?: RenderLink
  /** Above the list. Usually a `Brand`, or nothing when the navbar has it. */
  header?: ReactNode
  /** Pinned below the list: the signed-in user, a version. */
  footer?: ReactNode
  /** Names the landmark. Defaults to "Main". */
  label?: string
  className?: string
}

const anchor: RenderLink = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
)

/**
 * A column of navigation, built on daisyUI's `menu`.
 *
 * The active item carries `aria-current="page"`, which daisyUI's `menu`
 * already styles as active — so the attribute a screen reader needs and the
 * highlight a sighted user needs are the same thing, and cannot disagree.
 *
 * Inside an `AppShell` it is the fixed column above `lg` and the drawer's
 * contents below it, from the same element.
 */
export function Sidebar({
  items,
  activeKey,
  renderLink = anchor,
  header,
  footer,
  label = 'Main',
  className,
}: SidebarProps) {
  const row = (entry: SidebarItem) => {
    const content = (
      <>
        {entry.icon === undefined ? null : <Icon name={entry.icon} size="sm" />}
        <span className="flex-1 truncate">{entry.label}</span>
        {entry.badge}
      </>
    )
    const current = entry.key === activeKey ? ('page' as const) : undefined
    if (entry.href !== undefined && !entry.disabled) {
      // `aria-current` has to sit on the link itself for daisyUI to see it,
      // and a custom link may not forward unknown props, so it is wrapped.
      return (
        <span className="contents" aria-current={current}>
          {renderLink({ href: entry.href, children: content })}
        </span>
      )
    }
    return (
      <button
        type="button"
        onClick={entry.onClick}
        disabled={entry.disabled}
        aria-current={current}
        className="w-full"
      >
        {content}
      </button>
    )
  }

  const list = (entries: SidebarItem[]) =>
    entries.map((entry) =>
      entry.children ? (
        <li key={entry.key}>
          <h2 className="menu-title">{entry.label}</h2>
          <ul>{list(entry.children)}</ul>
        </li>
      ) : (
        <li key={entry.key} className={entry.disabled ? 'menu-disabled' : undefined}>
          {row(entry)}
        </li>
      ),
    )

  return (
    <nav
      aria-label={label}
      className={['flex h-full flex-col bg-base-100 text-base-content', className ?? '']
        .join(' ')
        .trim()}
    >
      {header === undefined ? null : <div className="px-4 py-3">{header}</div>}
      <ul className="menu w-full flex-1 flex-nowrap overflow-y-auto p-2">{list(items)}</ul>
      {footer === undefined ? null : (
        <div className="border-t border-base-300 px-4 py-3">{footer}</div>
      )}
    </nav>
  )
}

/** One valid set of props for the blind install test. */
Sidebar.sampleProps = {
  items: [
    { key: 'home', label: 'Home', icon: 'office', href: '/' },
    { key: 'rooms', label: 'Rooms', icon: 'reception', href: '/rooms' },
  ],
  activeKey: 'home',
} satisfies SidebarProps
