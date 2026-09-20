import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Breadcrumbs } from './Breadcrumbs'

const items = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms', icon: 'reception' as const },
  { label: 'Reception', href: '/rooms/1' },
]

describe('Breadcrumbs', () => {
  it('is a labelled navigation landmark with a list', () => {
    render(<Breadcrumbs items={items} />)
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(nav).toHaveClass('breadcrumbs')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('links every crumb but the last, which is the current page', () => {
    render(<Breadcrumbs items={items} />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Rooms' })).toHaveAttribute('href', '/rooms')
    expect(screen.queryByRole('link', { name: 'Reception' })).toBeNull()
    expect(screen.getByText('Reception')).toHaveAttribute('aria-current', 'page')
  })

  it('renders links through renderLink so a router can own them', () => {
    render(
      <Breadcrumbs
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

  it('draws an icon when a crumb has one', () => {
    render(<Breadcrumbs items={items} />)
    expect(screen.getByRole('link', { name: 'Rooms' }).querySelector('svg')).not.toBeNull()
  })
})
