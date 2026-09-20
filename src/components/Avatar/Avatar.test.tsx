import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar, initialsFor, tintIndexFor } from './Avatar'

const rootOf = (container: HTMLElement) => container.firstElementChild as HTMLElement
const faceOf = (container: HTMLElement) =>
  container.querySelector('span > span.rounded-full') as HTMLElement

describe('Avatar', () => {
  describe('initials', () => {
    it('takes the first letter of the first and last word', () => {
      render(<Avatar name="Sasha Kim" />)
      expect(screen.getByText('SK')).toBeInTheDocument()
    })

    it('takes one letter from a single name', () => {
      render(<Avatar name="Prince" />)
      expect(screen.getByText('P')).toBeInTheDocument()
    })

    it('skips the middle of a longer name', () => {
      expect(initialsFor('Ana Maria Ruiz Vega')).toBe('AV')
    })

    it('ignores stray whitespace', () => {
      expect(initialsFor('  sasha   kim  ')).toBe('SK')
    })

    it('does not cut a name outside the basic plane in half', () => {
      // A surrogate pair: charAt(0) would return half a character.
      expect(initialsFor('\u{1D49E}harlie Parker')).toBe('\u{1D49E}P')
    })

    it('says nothing rather than something wrong for an empty name', () => {
      expect(initialsFor('   ')).toBe('')
    })
  })

  describe('colour', () => {
    it('gives the same name the same tint every time', () => {
      const { container: a } = render(<Avatar name="Sasha Kim" />)
      const { container: b } = render(<Avatar name="Sasha Kim" />)
      expect(faceOf(a).className).toBe(faceOf(b).className)
    })

    it('uses one of the six', () => {
      const { container } = render(<Avatar name="Sasha Kim" />)
      expect(faceOf(container).className).toMatch(/bg-avatar-[1-6]\b/)
    })

    it('pairs every tint with the ink it was contrast-checked against', () => {
      const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']
      for (const name of names) {
        const { container, unmount } = render(<Avatar name={name} />)
        const className = faceOf(container).className
        const slot = Number(/bg-avatar-([1-6])/.exec(className)?.[1])
        // Odd slots are the vivid ones, even slots the muted ones.
        expect(className).toContain(
          slot % 2 === 1 ? 'text-avatar-ink-vivid' : 'text-avatar-ink-muted',
        )
        unmount()
      }
    })

    it('spreads short names across all six slots', () => {
      const seen = new Set(
        Array.from({ length: 200 }, (_, i) => tintIndexFor(`Person ${i}`)),
      )
      expect(seen.size).toBe(6)
    })
  })

  describe('image', () => {
    it('renders it with the name as alt text', () => {
      render(<Avatar name="Sasha Kim" src="/sasha.jpg" />)
      expect(screen.getByRole('img', { name: 'Sasha Kim' })).toBeInTheDocument()
    })

    it('draws no initials while the image is there', () => {
      render(<Avatar name="Sasha Kim" src="/sasha.jpg" />)
      expect(screen.queryByText('SK')).not.toBeInTheDocument()
    })

    it('falls back to initials when it fails to load', () => {
      render(<Avatar name="Sasha Kim" src="/missing.jpg" />)
      fireEvent.error(screen.getByRole('img'))
      expect(screen.getByText('SK')).toBeInTheDocument()
    })

    it('tries again when given a different src', () => {
      const { rerender } = render(<Avatar name="Sasha Kim" src="/missing.jpg" />)
      fireEvent.error(screen.getByRole('img'))
      rerender(<Avatar name="Sasha Kim" src="/found.jpg" />)
      expect(screen.getByRole('img', { name: 'Sasha Kim' })).toBeInTheDocument()
    })
  })

  describe('sizes', () => {
    it.each([
      ['xs', 'size-6'],
      ['sm', 'size-8'],
      ['md', 'size-10'],
      ['lg', 'size-12'],
      ['xl', 'size-16'],
    ] as const)('draws %s at the right box', (size, expected) => {
      const { container } = render(<Avatar name="Sasha Kim" size={size} />)
      expect(faceOf(container)).toHaveClass(expected)
    })

    it('defaults to md', () => {
      const { container } = render(<Avatar name="Sasha Kim" />)
      expect(faceOf(container)).toHaveClass('size-10')
    })
  })

  describe('status', () => {
    it('draws no dot unless asked', () => {
      const { container } = render(<Avatar name="Sasha Kim" />)
      expect(container.querySelector('.bg-success')).toBeNull()
    })

    it.each([
      ['online', 'bg-success'],
      ['busy', 'bg-error'],
      ['away', 'bg-warning'],
      ['offline', 'bg-base-300'],
    ] as const)('fills the %s dot from the theme', (status, expected) => {
      const { container } = render(<Avatar name="Sasha Kim" status={status} />)
      expect(container.querySelector(`.${expected}`)).toBeInTheDocument()
    })

    /** WCAG 1.4.1: the colour is not allowed to be the only carrier. */
    it('puts the state into words as well as colour', () => {
      const { container } = render(<Avatar name="Sasha Kim" status="busy" />)
      expect(rootOf(container)).toHaveTextContent(/Sasha Kim, busy/)
    })

    it('hides the dot itself, so the word is not said twice', () => {
      const { container } = render(<Avatar name="Sasha Kim" status="online" />)
      expect(container.querySelector('.bg-success')).toHaveAttribute('aria-hidden', 'true')
    })

    it('takes the app’s own word for it', () => {
      const { container } = render(
        <Avatar name="Sasha Kim" status="busy" statusLabel="in a meeting" />,
      )
      expect(rootOf(container)).toHaveTextContent(/Sasha Kim, in a meeting/)
    })
  })

  it('keeps consumer class names alongside its own', () => {
    const { container } = render(<Avatar name="Sasha Kim" className="mr-2" />)
    expect(rootOf(container)).toHaveClass('relative', 'mr-2')
  })

  /**
   * The tints are custom utilities rather than daisyUI ones, so nothing else
   * would notice if they stopped being emitted — the avatar would simply be
   * transparent with unreadable initials.
   */
  it('has every tint it references defined in the shipped theme', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/theme.css'), 'utf8')
    for (const n of [1, 2, 3, 4, 5, 6]) expect(css).toContain(`--color-avatar-${n}:`)
    expect(css).toContain('--color-avatar-ink-vivid:')
    expect(css).toContain('--color-avatar-ink-muted:')
  })
})
