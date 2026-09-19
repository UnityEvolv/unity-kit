import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Icon } from './Icon'
import { iconNames, iconSizes } from './icons'
import type { IconName, IconSize } from './icons'

const svgOf = (container: HTMLElement) => container.querySelector('svg')

describe('Icon', () => {
  it('renders an svg for a known name', () => {
    const { container } = render(<Icon name="mic" />)
    expect(svgOf(container)).toBeInTheDocument()
  })

  /**
   * The guarantee the whole component exists for: a name that no longer maps to
   * anything must not render an empty space. TypeScript catches this at compile
   * time, but the table is hand-maintained, so this walks it at runtime too.
   */
  it.each(iconNames)('renders %s', (name) => {
    const { container } = render(<Icon name={name} />)
    const svg = svgOf(container)
    expect(svg, `${name} rendered nothing`).toBeInTheDocument()
    expect(svg?.querySelector('path, circle, rect, line, polyline')).toBeTruthy()
  })

  it('takes its colour from currentColor, never its own', () => {
    const { container } = render(<Icon name="lock" />)
    const svg = svgOf(container)
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).not.toHaveAttribute('color')
    expect(svg?.getAttribute('fill')).toBe('none')
  })

  it('defaults to md, which is 20', () => {
    const { container } = render(<Icon name="bell" />)
    expect(svgOf(container)).toHaveAttribute('width', '20')
  })

  it.each(Object.entries(iconSizes))('renders size %s at %ipx', (size, pixels) => {
    const { container } = render(<Icon name="bell" size={size as IconSize} />)
    const svg = svgOf(container)
    expect(svg).toHaveAttribute('width', String(pixels))
    expect(svg).toHaveAttribute('height', String(pixels))
  })

  it('never renders larger than 32', () => {
    const largest = Math.max(...Object.values(iconSizes))
    expect(largest).toBeLessThanOrEqual(32)
  })

  it('defaults strokeWidth to 2 and allows a thinner stroke', () => {
    const { container: a } = render(<Icon name="settings" />)
    expect(svgOf(a)).toHaveAttribute('stroke-width', '2')

    const { container: b } = render(<Icon name="settings" strokeWidth={1.5} />)
    expect(svgOf(b)).toHaveAttribute('stroke-width', '1.5')
  })

  it('keeps consumer class names', () => {
    const { container } = render(<Icon name="search" className="shrink-0" />)
    expect(svgOf(container)).toHaveClass('shrink-0')
  })

  describe('accessibility', () => {
    it('hides itself when it has no title', () => {
      const { container } = render(<Icon name="mic" />)
      const svg = svgOf(container)
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg).not.toHaveAttribute('role')
      expect(svg).not.toHaveAttribute('aria-label')
    })

    it('becomes a labelled image when it has a title', () => {
      render(<Icon name="mic-off" title="Microphone muted" />)
      const svg = screen.getByRole('img', { name: 'Microphone muted' })
      expect(svg).toBeInTheDocument()
      expect(svg).not.toHaveAttribute('aria-hidden')
    })

    it('stays out of the tab order', () => {
      const { container } = render(<Icon name="mic" />)
      expect(svgOf(container)).toHaveAttribute('focusable', 'false')
    })

    /**
     * An icon-only button takes its name from the button. If the icon carried a
     * title too, a screen reader would announce the same thing twice.
     */
    it('is silent inside a labelled button', () => {
      render(
        <button aria-label="Mute">
          <Icon name="mic" />
        </button>,
      )
      expect(screen.getByRole('button', { name: 'Mute' })).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('the custom set', () => {
    const custom: IconName[] = [
      'knock',
      'raise-hand',
      'reception',
      'break-room',
      'office',
      'provider',
    ]

    it.each(custom)('%s is drawn on the same grid as Lucide', (name) => {
      const { container } = render(<Icon name={name} />)
      const svg = svgOf(container)
      // Matching viewBox, stroke and joins are what stop these looking foreign
      // beside a Lucide icon at the same size.
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
      expect(svg).toHaveAttribute('stroke', 'currentColor')
      expect(svg).toHaveAttribute('stroke-linecap', 'round')
      expect(svg).toHaveAttribute('stroke-linejoin', 'round')
    })

    it.each(custom)('%s honours size and strokeWidth like any other icon', (name) => {
      const { container } = render(<Icon name={name} size="xl" strokeWidth={1.5} />)
      const svg = svgOf(container)
      expect(svg).toHaveAttribute('width', '32')
      expect(svg).toHaveAttribute('stroke-width', '1.5')
    })
  })
})
