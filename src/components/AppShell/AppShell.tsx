import { useState } from 'react'
import type { ReactNode } from 'react'
import { Drawer } from '../Drawer'
import { AppShellContext } from './context'

export interface AppShellProps {
  /** A `Navbar`. Across the top, above both columns. */
  navbar?: ReactNode
  /** A `Sidebar`. A fixed column above `lg`, a drawer below it. */
  sidebar?: ReactNode
  /** The drawer's accessible name on a narrow screen. Defaults to "Navigation". */
  sidebarTitle?: ReactNode
  /** Whether the narrow-screen drawer is open. Controlled; leave off to let the shell manage it. */
  sidebarOpen?: boolean
  onSidebarOpenChange?: (open: boolean) => void
  /** The page. */
  children?: ReactNode
  className?: string
}

/**
 * Navbar over sidebar plus content: the frame every consuming app hangs its
 * screens in.
 *
 * Above `lg` the sidebar is a column beside the content. Below it the same
 * element moves into a `Drawer` from the start edge, opened by the menu
 * button the `Navbar` grows when it finds this shell around it. The sidebar
 * is rendered in one place at a time, so a screen reader meets one set of
 * links, not two.
 *
 * It is a skeleton on purpose. What goes in the navbar and the sidebar is
 * each app's; the shell knows nothing about routes, which is what keeps the
 * package free of a router.
 */
export function AppShell({
  navbar,
  sidebar,
  sidebarTitle = 'Navigation',
  sidebarOpen,
  onSidebarOpenChange,
  children,
  className,
}: AppShellProps) {
  const [internal, setInternal] = useState(false)
  const open = sidebarOpen ?? internal
  const setOpen = (next: boolean) => {
    if (sidebarOpen === undefined) setInternal(next)
    onSidebarOpenChange?.(next)
  }

  // A fresh object each render is fine: the only consumer is the Navbar's
  // menu button, and this tree re-renders when the shell does anyway.
  const state = { hasSidebar: sidebar !== undefined, openSidebar: () => setOpen(true) }

  return (
    <AppShellContext.Provider value={state}>
      <div
        className={['flex min-h-dvh flex-col bg-base-200 text-base-content', className ?? '']
          .join(' ')
          .trim()}
      >
        {navbar}
        <div className="flex flex-1">
          {sidebar === undefined ? null : (
            <aside className="hidden w-64 shrink-0 border-r border-base-300 lg:block">
              {sidebar}
            </aside>
          )}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
        {sidebar === undefined ? null : (
          <Drawer
            open={open}
            onOpenChange={setOpen}
            side="start"
            size="sm"
            title={sidebarTitle}
            className="lg:hidden"
          >
            {sidebar}
          </Drawer>
        )}
      </div>
    </AppShellContext.Provider>
  )
}
