import type { HTMLAttributes, ReactNode } from 'react'
import { Button } from '../Button'
import { useAppShell } from './context'

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  /** The product mark, at the start. Usually `<Brand />`. */
  brand?: ReactNode
  /** Actions at the end: search, notifications, the user menu. */
  actions?: ReactNode
  /** Anything in between: a page title, a search field. */
  children?: ReactNode
  /** Names the landmark when a page has more than one. */
  label?: string
}

/**
 * The bar across the top of an app. daisyUI's `navbar` lays out the three
 * regions; the surface and the bottom line are the kit's, since `.navbar`
 * sets neither.
 *
 * Inside an `AppShell` with a sidebar it grows a menu button below `lg`,
 * which opens the sidebar as a drawer. Outside one it is just a bar, and the
 * button never appears, so the same component works on a sign-in page.
 */
export function Navbar({ brand, actions, children, label, className, ...props }: NavbarProps) {
  const shell = useAppShell()
  return (
    <header
      className={[
        'navbar min-h-14 gap-2 border-b border-base-300 bg-base-100 px-4 text-base-content',
        className ?? '',
      ]
        .join(' ')
        .trim()}
      aria-label={label}
      {...props}
    >
      <div className="navbar-start gap-2">
        {shell?.hasSidebar ? (
          <Button
            variant="ghost"
            size="sm"
            icon="menu"
            aria-label="Open navigation"
            className="lg:hidden"
            onClick={shell.openSidebar}
          />
        ) : null}
        {brand}
      </div>
      <div className="navbar-center">{children}</div>
      <div className="navbar-end gap-1">{actions}</div>
    </header>
  )
}
