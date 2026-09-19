import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from './Skeleton'

const rootOf = (container: HTMLElement) => container.firstElementChild as HTMLElement

describe('Skeleton', () => {
  it('is hidden from assistive tech, because grey bars say nothing', () => {
    const { container } = render(<Skeleton />)
    expect(rootOf(container)).toHaveAttribute('aria-hidden', 'true')
  })

  describe('rect', () => {
    it('is the default shape, full width at a default height', () => {
      const { container } = render(<Skeleton />)
      expect(rootOf(container)).toHaveClass('skeleton', 'w-full')
      expect(rootOf(container)).toHaveStyle({ height: '80px' })
    })

    it('takes a number as pixels', () => {
      const { container } = render(<Skeleton height={120} width={240} />)
      expect(rootOf(container)).toHaveStyle({ height: '120px', width: '240px' })
    })

    it('passes a string length through untouched', () => {
      const { container } = render(<Skeleton height="6rem" width="50%" />)
      expect(rootOf(container)).toHaveStyle({ height: '6rem', width: '50%' })
    })
  })

  describe('circle', () => {
    it('is round and square-sided', () => {
      const { container } = render(<Skeleton shape="circle" width={64} />)
      expect(rootOf(container)).toHaveClass('skeleton', 'rounded-full')
      expect(rootOf(container)).toHaveStyle({ width: '64px', height: '64px' })
    })

    it('defaults to an avatar size', () => {
      const { container } = render(<Skeleton shape="circle" />)
      expect(rootOf(container)).toHaveStyle({ width: '40px', height: '40px' })
    })
  })

  describe('text', () => {
    it('draws the lines rather than shimmering behind them', () => {
      const { container } = render(<Skeleton shape="text" />)
      expect(rootOf(container)).not.toHaveClass('skeleton')
      expect(container.querySelectorAll('.skeleton')).toHaveLength(3)
    })

    it('draws as many lines as asked', () => {
      const { container } = render(<Skeleton shape="text" lines={5} />)
      expect(container.querySelectorAll('.skeleton')).toHaveLength(5)
    })

    it('stops the last line short, the way a paragraph ends', () => {
      const { container } = render(<Skeleton shape="text" lines={3} />)
      const lines = container.querySelectorAll('.skeleton')
      expect(lines[0]).toHaveClass('w-full')
      expect(lines[2]).toHaveClass('w-3/5')
    })

    it('keeps a single line full width, since one line is not a paragraph', () => {
      const { container } = render(<Skeleton shape="text" lines={1} />)
      expect(container.querySelector('.skeleton')).toHaveClass('w-full')
    })

    it('never draws nothing', () => {
      const { container } = render(<Skeleton shape="text" lines={0} />)
      expect(container.querySelectorAll('.skeleton')).toHaveLength(1)
    })
  })

  it('keeps consumer class names alongside its own', () => {
    const { container } = render(<Skeleton className="mb-4" />)
    expect(rootOf(container)).toHaveClass('skeleton', 'mb-4')
  })

  /**
   * UKIT-19 asks the skeleton to respect `prefers-reduced-motion`, and daisyUI
   * already does it: the shimmer lives inside a `no-preference` media query,
   * so `reduce` gets a flat block. Asserting it here is what keeps a
   * dependency upgrade from quietly removing a criterion this story shipped.
   */
  it('leans on daisyUI, which still confines the shimmer to no-preference', () => {
    const css = readFileSync(resolve(process.cwd(), 'node_modules/daisyui/components/skeleton.css'), 'utf8')
    const guard = css.search(/@media\s*\(prefers-reduced-motion:\s*no-preference\)/)
    expect(guard).toBeGreaterThan(-1)
    expect(css.slice(0, guard)).not.toContain('animation:')
    expect(css.slice(guard)).toContain('animation:')
  })
})
