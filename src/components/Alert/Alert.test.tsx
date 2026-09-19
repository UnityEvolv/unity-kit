import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from './Alert'
import { Button } from '../Button'
import type { AlertVariant } from './Alert'

const variants: AlertVariant[] = ['info', 'ok', 'warn', 'danger']

const alertOf = (container: HTMLElement) => container.querySelector('.alert') as HTMLElement

describe('Alert', () => {
  it('renders its message', () => {
    render(<Alert>Recording is on.</Alert>)
    expect(screen.getByText('Recording is on.')).toBeInTheDocument()
  })

  it('defaults to info', () => {
    const { container } = render(<Alert>Note</Alert>)
    expect(alertOf(container)).toHaveClass('alert', 'alert-info')
  })

  it.each([
    ['info', 'alert-info'],
    ['ok', 'alert-success'],
    ['warn', 'alert-warning'],
    ['danger', 'alert-error'],
  ] as const)('applies the full class name for variant %s', (variant, expected) => {
    const { container } = render(<Alert variant={variant}>Note</Alert>)
    expect(alertOf(container)).toHaveClass(expected)
  })

  describe('how urgently it speaks', () => {
    it.each([
      ['warn', 'alert'],
      ['danger', 'alert'],
    ] as const)('%s interrupts, because something needs attention now', (variant, role) => {
      render(<Alert variant={variant}>Note</Alert>)
      expect(screen.getByRole(role)).toBeInTheDocument()
    })

    it.each([
      ['info', 'status'],
      ['ok', 'status'],
    ] as const)('%s waits its turn', (variant, role) => {
      render(<Alert variant={variant}>Note</Alert>)
      expect(screen.getByRole(role)).toBeInTheDocument()
    })

    it('lets a consumer who knows better override the role', () => {
      render(
        <Alert variant="danger" role="status">
          Note
        </Alert>,
      )
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('icons', () => {
    it('brings one by default', () => {
      const { container } = render(<Alert>Note</Alert>)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('keeps it decorative, so the message is read once', () => {
      const { container } = render(<Alert>Note</Alert>)
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })

    /**
     * WCAG 1.4.1: colour alone cannot carry a difference. A red triangle
     * beside an amber triangle is one picture in two colours, so each variant
     * has to draw something of its own.
     */
    it('draws a different glyph for every variant', () => {
      const drawings = variants.map((variant) => {
        const { container, unmount } = render(<Alert variant={variant}>Note</Alert>)
        const svg = container.querySelector('svg')?.outerHTML ?? ''
        unmount()
        return svg
      })
      expect(new Set(drawings).size).toBe(variants.length)
    })

    it('can be overridden', () => {
      const { container: theirs } = render(<Alert icon="bell">Note</Alert>)
      const { container: ours } = render(<Alert>Note</Alert>)
      expect(theirs.querySelector('svg')?.outerHTML).not.toBe(ours.querySelector('svg')?.outerHTML)
    })

    it('can be dropped entirely', () => {
      const { container } = render(<Alert showIcon={false}>Note</Alert>)
      expect(container.querySelector('svg')).toBeNull()
    })
  })

  describe('title', () => {
    it('renders above the body', () => {
      render(<Alert title="Storage almost full">Free some space.</Alert>)
      expect(screen.getByText('Storage almost full')).toBeInTheDocument()
      expect(screen.getByText('Free some space.')).toBeInTheDocument()
    })

    it('does not invent a heading level', () => {
      render(<Alert title="Storage almost full">Free some space.</Alert>)
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  it('renders the action slot', () => {
    render(<Alert action={<Button size="sm">Upgrade</Button>}>Storage almost full.</Alert>)
    expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument()
  })

  describe('dismiss', () => {
    it('shows no control unless the consumer handles it', () => {
      render(<Alert>Note</Alert>)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('calls back when pressed', async () => {
      const onDismiss = vi.fn()
      render(<Alert onDismiss={onDismiss}>Note</Alert>)
      await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
      expect(onDismiss).toHaveBeenCalledOnce()
    })

    /** The kit does not remember dismissals, so the alert is still there. */
    it('does not remove itself', async () => {
      render(<Alert onDismiss={() => {}}>Note</Alert>)
      await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
      expect(screen.getByText('Note')).toBeInTheDocument()
    })

    it('takes its own label', async () => {
      render(
        <Alert onDismiss={() => {}} dismissLabel="Hide this notice">
          Note
        </Alert>,
      )
      expect(screen.getByRole('button', { name: 'Hide this notice' })).toBeInTheDocument()
    })
  })

  describe('banner', () => {
    it('drops the rounding and the outer edges', () => {
      const { container } = render(<Alert banner>Note</Alert>)
      expect(alertOf(container)).toHaveClass('w-full', 'rounded-none', 'border-x-0', 'border-t-0')
    })

    it('is a card by default', () => {
      const { container } = render(<Alert>Note</Alert>)
      expect(alertOf(container)).not.toHaveClass('rounded-none')
    })
  })

  it('keeps consumer class names alongside its own', () => {
    const { container } = render(<Alert className="mb-4">Note</Alert>)
    expect(alertOf(container)).toHaveClass('alert', 'alert-info', 'mb-4')
  })
})
