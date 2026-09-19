import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './EmptyState'
import { Button } from '../Button'

describe('EmptyState', () => {
  it('says what is not here', () => {
    render(<EmptyState title="No rooms yet" />)
    expect(screen.getByText('No rooms yet')).toBeInTheDocument()
  })

  it('renders a description when given one', () => {
    render(<EmptyState title="No rooms yet" description="Create one to get started." />)
    expect(screen.getByText('Create one to get started.')).toBeInTheDocument()
  })

  it('renders only the title when that is all there is', () => {
    const { container } = render(<EmptyState title="No rooms yet" />)
    expect(container.querySelectorAll('p')).toHaveLength(1)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('renders the action slot', () => {
    render(<EmptyState title="No rooms yet" action={<Button>New room</Button>} />)
    expect(screen.getByRole('button', { name: 'New room' })).toBeInTheDocument()
  })

  describe('icon', () => {
    it('draws one when asked', () => {
      const { container } = render(<EmptyState icon="office" title="No rooms yet" />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('keeps it decorative, so the title is read once', () => {
      const { container } = render(<EmptyState icon="office" title="No rooms yet" />)
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  /**
   * The title is deliberately not a heading. Heading level depends on where
   * the panel sits, and a component that picked one would skip levels on half
   * the pages it appeared on.
   */
  it('does not invent a heading level', () => {
    render(<EmptyState title="No rooms yet" />)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('renders the level the page asks for', () => {
    render(<EmptyState title="No rooms yet" titleAs="h2" />)
    expect(screen.getByRole('heading', { level: 2, name: 'No rooms yet' })).toBeInTheDocument()
  })

  it('is centred in its container', () => {
    const { container } = render(<EmptyState title="No rooms yet" />)
    expect(container.firstElementChild).toHaveClass('items-center', 'justify-center', 'text-center')
  })

  it('keeps consumer class names alongside its own', () => {
    const { container } = render(<EmptyState title="No rooms yet" className="rounded-box border" />)
    expect(container.firstElementChild).toHaveClass('text-center', 'rounded-box', 'border')
  })

  it('declares sample props the blind install test can render', () => {
    render(<EmptyState {...EmptyState.sampleProps} />)
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
  })
})
