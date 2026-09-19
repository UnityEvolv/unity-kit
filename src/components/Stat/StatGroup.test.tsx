import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stat } from './Stat'
import { StatGroup } from './StatGroup'

const groupOf = (container: HTMLElement) => container.firstElementChild as HTMLElement

describe('StatGroup', () => {
  it('renders the stats it is given', () => {
    render(
      <StatGroup>
        <Stat label="Active rooms" value="24" />
        <Stat label="In a call" value="112" />
      </StatGroup>,
    )
    expect(screen.getByText('Active rooms')).toBeInTheDocument()
    expect(screen.getByText('In a call')).toBeInTheDocument()
  })

  /**
   * daisyUI's `.stats` is a column grid that scrolls rather than wraps, so the
   * default stacks below `sm` — otherwise a dashboard row runs off a phone.
   */
  it('stacks on a narrow viewport and sits in a row above sm by default', () => {
    const { container } = render(
      <StatGroup>
        <Stat label="Active rooms" value="24" />
      </StatGroup>,
    )
    expect(groupOf(container)).toHaveClass(
      'stats',
      'bg-base-100',
      'stats-vertical',
      'sm:stats-horizontal',
    )
  })

  it.each([
    ['horizontal', 'stats-horizontal'],
    ['vertical', 'stats-vertical'],
  ] as const)('applies the full class name for direction %s', (direction, expected) => {
    const { container } = render(
      <StatGroup direction={direction}>
        <Stat label="Active rooms" value="24" />
      </StatGroup>,
    )
    expect(groupOf(container)).toHaveClass(expected)
  })

  it('pins a horizontal group rather than stacking it', () => {
    const { container } = render(
      <StatGroup direction="horizontal">
        <Stat label="Active rooms" value="24" />
      </StatGroup>,
    )
    expect(groupOf(container)).not.toHaveClass('stats-vertical')
  })

  it('keeps consumer class names alongside its own', () => {
    const { container } = render(<StatGroup className="w-full" />)
    expect(groupOf(container)).toHaveClass('stats', 'w-full')
  })

  it('forwards a ref to the underlying element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<StatGroup ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
