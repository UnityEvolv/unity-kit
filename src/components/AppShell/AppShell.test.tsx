import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

const items = [
  { key: 'home', label: 'Home', icon: 'office' as const, href: '/' },
  { key: 'rooms', label: 'Rooms', icon: 'reception' as const, href: '/rooms', badge: '3' },
  {
    key: 'admin',
    label: 'Admin',
    children: [
      { key: 'people', label: 'People', href: '/admin/people' },
      { key: 'billing', label: 'Billing', onClick: () => {}, disabled: true },
    ],
  },
]

describe('Sidebar', () => {
  it('is a labelled navigation with a daisyUI menu', () => {
    render(<Sidebar items={items} />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav.querySelector('ul')).toHaveClass('menu')
    expect(screen.getByRole('link', { name: /Rooms/ })).toHaveAttribute('href', '/rooms')
  })

  it('marks the active item with aria-current from a prop, not a router', () => {
    render(<Sidebar items={items} activeKey="rooms" />)
    const active = screen.getByRole('link', { name: /Rooms/ }).closest('[aria-current]')
    expect(active).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Home' }).closest('[aria-current]')).toBeNull()
  })

  it('renders groups with a menu title and honours disabled', () => {
    render(<Sidebar items={items} />)
    expect(screen.getByRole('heading', { name: 'Admin' })).toHaveClass('menu-title')
    expect(screen.getByRole('link', { name: 'People' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Billing' })).toBeDisabled()
  })

  it('renders links through renderLink so a router can own them', () => {
    render(
      <Sidebar
        items={items}
        renderLink={({ href, children }) => (
          <a href={href} data-router="yes">
            {children}
          </a>
        )}
      />,
    )
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('data-router', 'yes')
  })
})

describe('Navbar', () => {
  it('lays out brand, children and actions in the three regions', () => {
    const { container } = render(
      <Navbar brand={<span>UnityOfis</span>} actions={<button>Me</button>}>
        <h1>Rooms</h1>
      </Navbar>,
    )
    expect(container.firstElementChild).toHaveClass('navbar')
    expect(container.querySelector('.navbar-start')).toHaveTextContent('UnityOfis')
    expect(container.querySelector('.navbar-center')).toHaveTextContent('Rooms')
    expect(container.querySelector('.navbar-end')).toHaveTextContent('Me')
  })

  it('shows no menu button outside an AppShell', () => {
    render(<Navbar />)
    expect(screen.queryByRole('button', { name: 'Open navigation' })).toBeNull()
  })
})

describe('AppShell', () => {
  const shell = (extra = {}) => (
    <AppShell navbar={<Navbar />} sidebar={<Sidebar items={items} />} {...extra}>
      <p>Page</p>
    </AppShell>
  )

  it('renders navbar, sidebar column and main content', () => {
    render(shell())
    expect(screen.getByRole('main')).toHaveTextContent('Page')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    const aside = screen.getByRole('complementary')
    expect(aside).toHaveClass('hidden', 'lg:block')
    expect(within(aside).getByRole('navigation')).toBeInTheDocument()
  })

  it('opens the sidebar as a drawer from the navbar button', async () => {
    const user = userEvent.setup()
    render(shell())
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    const dialog = await screen.findByRole('dialog', { name: 'Navigation' })
    expect(within(dialog).getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  it('can be controlled', () => {
    const onSidebarOpenChange = vi.fn()
    render(shell({ sidebarOpen: true, onSidebarOpenChange }))
    expect(screen.getByRole('dialog', { name: 'Navigation' })).toBeInTheDocument()
  })

  it('draws no menu button and no column without a sidebar', () => {
    render(
      <AppShell navbar={<Navbar />}>
        <p>Page</p>
      </AppShell>,
    )
    expect(screen.queryByRole('button', { name: 'Open navigation' })).toBeNull()
    expect(screen.queryByRole('complementary')).toBeNull()
  })
})
