import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stat } from './Stat'

const statOf = (container: HTMLElement) => container.firstElementChild as HTMLElement
const descOf = (container: HTMLElement) => container.querySelector('.stat-desc') as HTMLElement

describe('Stat', () => {
  it('renders its label and value', () => {
    render(<Stat label="Active rooms" value="24" />)
    expect(screen.getByText('Active rooms')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
  })

  /** `.stat` is what carries daisyUI's metric layout; jsdom loads no CSS. */
  it('uses daisyUI stat markup', () => {
    const { container } = render(<Stat label="Active rooms" value="24" />)
    expect(statOf(container)).toHaveClass('stat')
    expect(container.querySelector('.stat-title')).toHaveTextContent('Active rooms')
    expect(container.querySelector('.stat-value')).toHaveTextContent('24')
  })

  /**
   * daisyUI draws the title in `base-content` at 60%, which is below AA on the
   * dark background. The `muted` token is measured in src/contrast.test.ts.
   */
  it('overrides daisyUI muted text with the token that meets AA', () => {
    const { container } = render(
      <Stat label="Active rooms" value="24" description="since Monday" />,
    )
    expect(container.querySelector('.stat-title')).toHaveClass('text-muted')
    expect(descOf(container)).toHaveClass('text-muted')
  })

  it('renders no footer row without a delta or a description', () => {
    const { container } = render(<Stat label="Active rooms" value="24" />)
    expect(descOf(container)).toBeNull()
  })

  it('renders a description on its own', () => {
    render(<Stat label="Active rooms" value="24" description="since Monday" />)
    expect(screen.getByText('since Monday')).toBeInTheDocument()
  })

  describe('delta', () => {
    it.each([
      ['up', 'text-success'],
      ['down', 'text-error'],
      ['flat', 'text-muted'],
    ] as const)('colours a %s delta from the theme', (direction, expected) => {
      render(<Stat label="Active rooms" value="24" delta="+12%" direction={direction} />)
      expect(screen.getByText('+12%')).toHaveClass(expected)
    })

    it.each(['up', 'down', 'flat'] as const)(
      'draws an arrow for %s, so colour is not the only signal',
      (direction) => {
        const { container } = render(
          <Stat label="Active rooms" value="24" delta="+12%" direction={direction} />,
        )
        expect(descOf(container).querySelector('svg')).toBeInTheDocument()
      },
    )

    /**
     * Up is not always good news. A metric where rising is bad — churn,
     * latency, cost — keeps the arrow and changes the colour.
     */
    it('lets the tone disagree with the direction', () => {
      render(<Stat label="Dropped calls" value="18" delta="+4" direction="up" tone="negative" />)
      expect(screen.getByText('+4')).toHaveClass('text-error')
    })

    it('shows a delta and a description together', () => {
      render(
        <Stat
          label="Active rooms"
          value="24"
          delta="+12%"
          direction="up"
          description="since Monday"
        />,
      )
      expect(screen.getByText('+12%')).toBeInTheDocument()
      expect(screen.getByText('since Monday')).toBeInTheDocument()
    })
  })

  describe('icon', () => {
    it('renders no icon unless asked', () => {
      const { container } = render(<Stat label="Active rooms" value="24" />)
      expect(container.querySelector('svg')).toBeNull()
    })

    it('sets the icon to one side of the number', () => {
      const { container } = render(<Stat label="Active rooms" value="24" icon="office" />)
      const figure = container.querySelector('.stat-figure') as HTMLElement
      expect(figure.querySelector('svg')).toBeInTheDocument()
    })

    it('keeps the icon decorative, so the label is read once', () => {
      const { container } = render(<Stat label="Active rooms" value="24" icon="office" />)
      expect(container.querySelector('.stat-figure svg')).toHaveAttribute('aria-hidden', 'true')
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  it('keeps consumer class names alongside its own', () => {
    const { container } = render(<Stat label="Active rooms" value="24" className="min-w-48" />)
    expect(statOf(container)).toHaveClass('stat', 'min-w-48')
  })

  it('forwards a ref to the underlying element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Stat ref={ref} label="Active rooms" value="24" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('passes native props through', () => {
    const { container } = render(<Stat label="Active rooms" value="24" title="Right now" />)
    expect(statOf(container)).toHaveAttribute('title', 'Right now')
  })

  /** The blind install test renders every export with no knowledge of its types. */
  it('declares sample props, since label and value are required', () => {
    expect(Stat.sampleProps).toEqual({ label: 'Active rooms', value: '24' })
  })
})
