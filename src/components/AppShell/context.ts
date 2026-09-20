import { createContext, useContext } from 'react'

export interface AppShellState {
  /** Whether a sidebar exists to open. */
  hasSidebar: boolean
  /** Opens the sidebar drawer on a narrow screen. */
  openSidebar: () => void
}

/**
 * How the `Navbar` finds out there is a sidebar to open. Outside an
 * `AppShell` the value is `null` and the navbar draws no menu button.
 */
export const AppShellContext = createContext<AppShellState | null>(null)

export const useAppShell = () => useContext(AppShellContext)
