import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

const badgeOf = (container: HTMLElement) => container.querySelector('span.badge') as HTMLElement

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('defaults to the primary variant at md', () => {
    const { container } = render(<Badge>New</Badge>)
    expect(badgeOf(container)).toHaveClass('badge', 'badge-primary', 'badge-md')
  })

  it.each([
    ['primary', 'badge-primary'],
    ['secondary', 'badge-secondary'],
    ['danger', 'badge-error'],
    ['ghost', 'badge-ghost'],
  ] as const)('applies the full class name for variant %s', (variant, expected) => {
    const { container } = render(<Badge variant={variant}>New</Badge>)
    expect(badgeOf(container)).toHaveClass(expected)
  })

  it.each([
    ['xs', 'badge-xs'],
    ['sm', 'badge-sm'],
    ['md', 'badge-md'],
    ['lg', 'badge-lg'],
  ] as const)('applies the full class name for size %s', (size, expected) => {
    const { container } = render(<Badge size={size}>New</Badge>)
    expect(badgeOf(container)).toHaveClass(expected)
  })

  it('can be outlined instead of filled', () => {
    const { container } = render(<Badge outline>New</Badge>)
    expect(badgeOf(container)).toHaveClass('badge-outline')
  })

  it('is filled by default', () => {
    const { container } = render(<Badge>New</Badge>)
    expect(badgeOf(container)).not.toHaveClass('badge-outline')
  })

  describe('icons', () => {
    it('renders no icon unless asked', () => {
      const { container } = render(<Badge>New</Badge>)
      expect(badgeOf(container).querySelector('svg')).toBeNull()
    })

    it('renders the icon before the label', () => {
      const { container } = render(<Badge icon="record">Recording</Badge>)
      expect(badgeOf(container).firstElementChild?.tagName).toBe('svg')
    })

    it('sizes the icon with the badge', () => {
      const { container } = render(
        <Badge icon="record" size="lg">
          Recording
        </Badge>,
      )
      expect(badgeOf(container).querySelector('svg')).toHaveAttribute('width', '16')
    })

    it('keeps the icon decorative, so the label is read once', () => {
      const { container } = render(<Badge icon="record">Recording</Badge>)
      expect(badgeOf(container).querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  it('keeps consumer class names alongside its own', () => {
    const { container } = render(<Badge className="ml-2">New</Badge>)
    expect(badgeOf(container)).toHaveClass('badge', 'badge-primary', 'ml-2')
  })

  it('forwards a ref to the underlying element', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Badge ref={ref}>New</Badge>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  it('passes native props through', () => {
    const { container } = render(<Badge title="Two unread">2</Badge>)
    expect(badgeOf(container)).toHaveAttribute('title', 'Two unread')
  })

  /**
   * A badge with no text says nothing to a screen reader. There is no way to
   * require a label at the type level without banning the common case of a
   * count, so this is documentation by test: an icon-only badge needs one.
   */
  it('can be labelled when it carries no text of its own', () => {
    render(<Badge icon="record" aria-label="Recording" />)
    expect(screen.getByLabelText('Recording')).toBeInTheDocument()
  })
})
