import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'
import { AvatarGroup } from './AvatarGroup'

const people = ['Sasha Kim', 'Ana Ruiz', 'Tom Fry', 'Mia Oduya', 'Ben Hale']

const groupOf = (container: HTMLElement) => container.firstElementChild as HTMLElement

const renderGroup = (props: { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; max?: number } = {}) =>
  render(
    <AvatarGroup {...props}>
      {people.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </AvatarGroup>,
  )

describe('AvatarGroup', () => {
  it('shows everyone when there is no limit', () => {
    renderGroup()
    for (const name of people) expect(screen.getByText(name)).toBeInTheDocument()
  })

  it('adds no count when everyone fits', () => {
    renderGroup({ max: 5 })
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  describe('overflow', () => {
    it('counts the ones it did not draw', () => {
      renderGroup({ max: 3 })
      expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('stops drawing at the limit', () => {
      renderGroup({ max: 3 })
      expect(screen.getByText('Tom Fry')).toBeInTheDocument()
      expect(screen.queryByText('Mia Oduya')).not.toBeInTheDocument()
    })

    it('says the count in words as well, since "+2" reads as punctuation', () => {
      renderGroup({ max: 3 })
      expect(screen.getByText('2 more')).toHaveClass('sr-only')
      expect(screen.getByText('+2')).toHaveAttribute('aria-hidden', 'true')
    })

    it('treats a limit of zero as a count of everyone', () => {
      renderGroup({ max: 0 })
      expect(screen.getByText('+5')).toBeInTheDocument()
      expect(screen.queryByText('Sasha Kim')).not.toBeInTheDocument()
    })

    it('ignores a limit larger than the group', () => {
      renderGroup({ max: 99 })
      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
    })
  })

  describe('size', () => {
    it('sizes its avatars without being told twice', () => {
      const { container } = renderGroup({ size: 'lg' })
      expect(container.querySelector('span > span.rounded-full')).toHaveClass('size-12')
    })

    it('lets an avatar overrule it', () => {
      const { container } = render(
        <AvatarGroup size="lg">
          <Avatar name="Sasha Kim" size="xs" />
        </AvatarGroup>,
      )
      expect(container.querySelector('span > span.rounded-full')).toHaveClass('size-6')
    })

    it.each([
      ['xs', '-space-x-1'],
      ['md', '-space-x-2'],
      ['xl', '-space-x-4'],
    ] as const)('overlaps %s avatars by an amount that suits them', (size, expected) => {
      const { container } = renderGroup({ size })
      expect(groupOf(container)).toHaveClass(expected)
    })
  })

  /** Overlapping faces need a rim in the page colour or they read as a smear. */
  it('rims its avatars, and a lone avatar does not', () => {
    const { container: grouped } = renderGroup({ max: 2 })
    expect(grouped.querySelector('span > span.rounded-full')).toHaveClass('ring-2')

    const { container: alone } = render(<Avatar name="Sasha Kim" />)
    expect(alone.querySelector('span > span.rounded-full')).not.toHaveClass('ring-2')
  })

  it('renders an empty group without complaint', () => {
    const { container } = render(<AvatarGroup />)
    expect(groupOf(container)).toBeEmptyDOMElement()
  })

  it('keeps consumer class names alongside its own', () => {
    const { container } = render(<AvatarGroup className="mt-4" />)
    expect(groupOf(container)).toHaveClass('flex', 'mt-4')
  })
})
