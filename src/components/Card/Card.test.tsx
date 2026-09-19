import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card } from './Card'

const cardOf = (container: HTMLElement) => container.firstElementChild as HTMLElement
const bodyOf = (container: HTMLElement) => container.querySelector('.card-body') as HTMLElement

/** The affordance the interactive variant and a link both turn on. */
const AFFORDANCE = ['cursor-pointer', 'hover:shadow-md', 'focus-visible:outline-primary']

describe('Card', () => {
  it('renders its children in the body', () => {
    render(<Card>Room details</Card>)
    expect(screen.getByText('Room details')).toBeInTheDocument()
  })

  it('defaults to the bordered variant on a theme surface', () => {
    const { container } = render(<Card>Room details</Card>)
    expect(cardOf(container)).toHaveClass('card', 'bg-base-100', 'card-border', 'border-base-300')
  })

  /**
   * daisyUI's `.card` sets a radius from `--radius-box` and no background, so
   * the base class is what satisfies the radius and `bg-base-100` the surface.
   * jsdom loads no CSS, so the class names are what can be asserted here.
   */
  it('carries the daisyUI base class that applies --radius-box', () => {
    const { container } = render(<Card>Room details</Card>)
    expect(cardOf(container)).toHaveClass('card')
  })

  it.each([
    ['bordered', 'card-border'],
    ['elevated', 'shadow-md'],
    ['interactive', 'card-border'],
  ] as const)('applies the full class name for variant %s', (variant, expected) => {
    const { container } = render(<Card variant={variant}>Room details</Card>)
    expect(cardOf(container)).toHaveClass(expected)
  })

  it('gives the interactive variant a hover and a focus ring', () => {
    const { container } = render(<Card variant="interactive">Room details</Card>)
    expect(cardOf(container)).toHaveClass(...AFFORDANCE)
  })

  it('leaves a plain card without the interactive affordance', () => {
    const { container } = render(<Card>Room details</Card>)
    expect(cardOf(container)).not.toHaveClass('cursor-pointer')
  })

  describe('as a link', () => {
    it('renders an anchor so it is focusable and works from the keyboard', () => {
      render(<Card href="/rooms/1">Room details</Card>)
      expect(screen.getByRole('link', { name: 'Room details' })).toHaveAttribute(
        'href',
        '/rooms/1',
      )
    })

    it('shows the affordance even when the variant is elevated', () => {
      render(
        <Card href="/rooms/1" variant="elevated">
          Room details
        </Card>,
      )
      const link = screen.getByRole('link')
      expect(link).toHaveClass('shadow-md', ...AFFORDANCE)
    })

    it('renders a div when there is no href', () => {
      const { container } = render(<Card>Room details</Card>)
      expect(cardOf(container).tagName).toBe('DIV')
    })
  })

  describe('slots', () => {
    it('renders the header as the title row', () => {
      const { container } = render(<Card header={<h3>Reception</h3>}>Room details</Card>)
      const title = container.querySelector('.card-title') as HTMLElement
      expect(title).toContainElement(screen.getByRole('heading', { name: 'Reception' }))
    })

    it('renders the footer as an actions row', () => {
      const { container } = render(<Card footer={<button>Join</button>}>Room details</Card>)
      const actions = container.querySelector('.card-actions') as HTMLElement
      expect(actions).toContainElement(screen.getByRole('button', { name: 'Join' }))
    })

    it('omits the header and footer rows when neither is given', () => {
      const { container } = render(<Card>Room details</Card>)
      expect(container.querySelector('.card-title')).toBeNull()
      expect(container.querySelector('.card-actions')).toBeNull()
    })

    it('wraps media in a figure', () => {
      const { container } = render(<Card media={<img alt="Floor plan" src="/plan.png" />} />)
      const figure = container.querySelector('figure') as HTMLElement
      expect(figure).toContainElement(screen.getByAltText('Floor plan'))
    })

    it('renders no figure without media', () => {
      const { container } = render(<Card>Room details</Card>)
      expect(container.querySelector('figure')).toBeNull()
    })

    /** daisyUI rounds the first and last child figure, so the order is the styling. */
    it('places media above the body by default', () => {
      const { container } = render(<Card media={<img alt="Floor plan" src="/plan.png" />} />)
      expect(cardOf(container).firstElementChild?.tagName).toBe('FIGURE')
    })

    it('places media below the body when asked', () => {
      const { container } = render(
        <Card media={<img alt="Floor plan" src="/plan.png" />} mediaPosition="bottom" />,
      )
      expect(cardOf(container).lastElementChild?.tagName).toBe('FIGURE')
      expect(cardOf(container).firstElementChild).toBe(bodyOf(container))
    })

    it('turns the card sideways when media sits beside the body', () => {
      const { container } = render(
        <Card media={<img alt="Floor plan" src="/plan.png" />} mediaPosition="side" />,
      )
      expect(cardOf(container)).toHaveClass('card-side')
    })

    it('does not turn sideways without media', () => {
      const { container } = render(<Card mediaPosition="side">Room details</Card>)
      expect(cardOf(container)).not.toHaveClass('card-side')
    })
  })

  it('keeps consumer class names alongside its own', () => {
    const { container } = render(<Card className="w-96">Room details</Card>)
    expect(cardOf(container)).toHaveClass('card', 'w-96')
  })

  it('forwards a ref to the underlying element', () => {
    const ref = createRef<HTMLElement>()
    render(<Card ref={ref}>Room details</Card>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('passes native props through', () => {
    const { container } = render(<Card aria-label="Reception room">Room details</Card>)
    expect(cardOf(container)).toHaveAttribute('aria-label', 'Reception room')
  })
})
