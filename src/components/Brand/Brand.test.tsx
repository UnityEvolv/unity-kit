import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Brand } from './Brand'
import type { BrandProduct, BrandSize } from './Brand'

const markOf = (container: HTMLElement) => container.querySelector('svg')

describe('Brand', () => {
  it('renders the mark and the product name', () => {
    const { container } = render(<Brand product="unityevolv" />)
    expect(markOf(container)).toBeInTheDocument()
    expect(container.textContent).toBe('UnityEvolv')
  })

  /**
   * The two words butt against each other, as they do on the website. A stray
   * space is invisible in review and obvious in production.
   */
  it.each([
    ['unityevolv', 'UnityEvolv'],
    ['unityofis', 'UnityOfis'],
    ['ofiskit', 'ofiskit'],
  ] as const)('writes %s with no space between the words', (product, expected) => {
    const { container } = render(<Brand product={product} />)
    expect(container.textContent).toBe(expected)
  })

  it('splits the name across the two brand tones', () => {
    const { container } = render(<Brand product="unityofis" />)
    // Scoped to the wordmark: the mark uses the same two tones, on purpose, so
    // an unscoped selector finds the monogram's empty <g> first.
    const wordmark = container.querySelector('span[aria-hidden="true"]')
    expect(wordmark?.querySelector('.text-secondary')?.textContent).toBe('Unity')
    expect(wordmark?.querySelector('.text-primary')?.textContent).toBe('Ofis')
  })

  it('gives the mark the same two tones as the name', () => {
    const { container } = render(<Brand product="unityevolv" markOnly />)
    const mark = markOf(container)
    expect(mark?.querySelector('g.text-secondary')).toBeInTheDocument()
    expect(mark?.querySelector('g.text-primary')).toBeInTheDocument()
  })

  it('shares one mark between unityofis and ofiskit', () => {
    const { container: a } = render(<Brand product="unityofis" markOnly />)
    const { container: b } = render(<Brand product="ofiskit" markOnly />)
    const { container: c } = render(<Brand product="unityevolv" markOnly />)

    expect(markOf(b)?.innerHTML).toBe(markOf(a)?.innerHTML)
    // ...and that the engine sharing a mark is not simply every mark being equal.
    expect(markOf(c)?.innerHTML).not.toBe(markOf(a)?.innerHTML)
  })

  describe('sizes', () => {
    it.each([
      ['sm', 24],
      ['md', 30],
      ['lg', 40],
    ] as const)('%s renders the mark at %ipx', (size, height) => {
      const { container } = render(<Brand product="unityevolv" size={size as BrandSize} />)
      expect(markOf(container)).toHaveAttribute('height', String(height))
    })

    it('defaults to md', () => {
      const { container } = render(<Brand product="unityevolv" />)
      expect(markOf(container)).toHaveAttribute('height', '30')
    })

    it('keeps the mark in proportion rather than squashing it', () => {
      const { container } = render(<Brand product="unityevolv" size="lg" />)
      const mark = markOf(container)
      const width = Number(mark?.getAttribute('width'))
      const height = Number(mark?.getAttribute('height'))
      expect(width / height).toBeCloseTo(36 / 22, 1)
    })
  })

  describe('accessibility', () => {
    it.each(['unityevolv', 'unityofis', 'ofiskit'] as const)(
      'is announced once, as %s',
      (product) => {
        render(<Brand product={product as BrandProduct} />)
        const expected = { unityevolv: 'UnityEvolv', unityofis: 'UnityOfis', ofiskit: 'ofiskit' }[
          product
        ]
        expect(screen.getByRole('img', { name: expected })).toBeInTheDocument()
      },
    )

    it('becomes a single named link when given an href', () => {
      render(<Brand product="unityofis" href="/" />)
      const link = screen.getByRole('link', { name: 'UnityOfis' })
      expect(link).toHaveAttribute('href', '/')
      // One link, not a link wrapping separately announced fragments.
      expect(screen.getAllByRole('link')).toHaveLength(1)
    })

    it('keeps the mark silent, since the wrapper is already named', () => {
      const { container } = render(<Brand product="unityevolv" />)
      expect(markOf(container)).toHaveAttribute('aria-hidden', 'true')
    })

    it('hides the two-tone split, which is decoration rather than information', () => {
      const { container } = render(<Brand product="unityofis" />)
      const wordmark = container.querySelector('span[aria-hidden="true"] .text-secondary')
      expect(wordmark).toBeInTheDocument()
    })

    it('still carries the full name when only the mark is shown', () => {
      const { container } = render(<Brand product="ofiskit" markOnly />)
      expect(screen.getByRole('img', { name: 'ofiskit' })).toBeInTheDocument()
      expect(container.textContent).toBe('')
    })
  })

  it('keeps consumer class names for placement', () => {
    render(<Brand product="unityevolv" className="mr-auto" />)
    expect(screen.getByRole('img', { name: 'UnityEvolv' })).toHaveClass('mr-auto')
  })
})
