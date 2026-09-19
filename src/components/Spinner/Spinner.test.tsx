import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from './Spinner'

const glyphOf = (container: HTMLElement) =>
  container.querySelector('span.loading') as HTMLElement

describe('Spinner', () => {
  it('is a live region, so its arrival is announced', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('announces "Loading" when it carries no label of its own', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading')
  })

  it('keeps that announcement off the screen', () => {
    render(<Spinner />)
    expect(screen.getByText('Loading')).toHaveClass('sr-only')
  })

  it('shows the label, and announces it instead', () => {
    render(<Spinner label="Joining the office" />)
    expect(screen.getByText('Joining the office')).not.toHaveClass('sr-only')
    expect(screen.getByRole('status')).toHaveTextContent('Joining the office')
    expect(screen.queryByText('Loading')).not.toBeInTheDocument()
  })

  it('defaults to md', () => {
    const { container } = render(<Spinner />)
    expect(glyphOf(container)).toHaveClass('loading', 'loading-spinner', 'loading-md')
  })

  it.each([
    ['xs', 'loading-xs'],
    ['sm', 'loading-sm'],
    ['md', 'loading-md'],
    ['lg', 'loading-lg'],
  ] as const)('applies the full class name for size %s', (size, expected) => {
    const { container } = render(<Spinner size={size} />)
    expect(glyphOf(container)).toHaveClass(expected)
  })

  it('is inline by default, so it sits in a line of text', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveClass('inline-flex')
  })

  it('centres itself in its container in block mode', () => {
    render(<Spinner block label="Loading rooms" />)
    expect(screen.getByRole('status')).toHaveClass('flex', 'w-full', 'items-center', 'justify-center')
  })

  it('keeps consumer class names alongside its own', () => {
    render(<Spinner className="mt-4" />)
    expect(screen.getByRole('status')).toHaveClass('inline-flex', 'mt-4')
  })

  /**
   * The reduced-motion behaviour is daisyUI's, not ours: `.loading` swaps its
   * mask for one whose animations run at a quarter speed under `reduce`. That
   * is a dependency satisfying one of this story's acceptance criteria, so it
   * is worth a guard — an upgrade that dropped it would otherwise ship a
   * strobing page to someone who asked for stillness, silently.
   */
  it('leans on daisyUI, which still varies the animation by motion preference', () => {
    const css = readFileSync(resolve(process.cwd(), 'node_modules/daisyui/components/loading.css'), 'utf8')
    expect(css).toContain('prefers-reduced-motion:no-preference')
  })
})
