import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Progress } from './Progress'

describe('Progress', () => {
  it('is a progressbar without a line of ARIA, because it is a native element', () => {
    render(<Progress value={40} />)
    expect(screen.getByRole('progressbar')).toBeInstanceOf(HTMLProgressElement)
  })

  it('carries its value and maximum', () => {
    render(<Progress value={40} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('value', '40')
    expect(bar).toHaveAttribute('max', '100')
  })

  it('counts against a max other than 100', () => {
    render(<Progress value={3} max={7} label="Step" showValue />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('max', '7')
    expect(screen.getByText('43%')).toBeInTheDocument()
  })

  it('defaults to the primary variant', () => {
    render(<Progress value={40} />)
    expect(screen.getByRole('progressbar')).toHaveClass('progress', 'progress-primary')
  })

  it.each([
    ['primary', 'progress-primary'],
    ['secondary', 'progress-secondary'],
    ['danger', 'progress-error'],
    ['ok', 'progress-success'],
    ['warn', 'progress-warning'],
    ['info', 'progress-info'],
  ] as const)('applies the full class name for variant %s', (variant, expected) => {
    render(<Progress value={40} variant={variant} />)
    expect(screen.getByRole('progressbar')).toHaveClass(expected)
  })

  describe('indeterminate', () => {
    it('omits the value attribute entirely when there is no value', () => {
      render(<Progress />)
      expect(screen.getByRole('progressbar')).not.toHaveAttribute('value')
    })

    it('is not the same as zero, which is a bar that has not started', () => {
      render(<Progress value={0} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0')
    })

    it('shows no percentage, because there is none to show', () => {
      render(<Progress label="Importing" showValue />)
      expect(screen.queryByText(/%/)).not.toBeInTheDocument()
    })
  })

  describe('label', () => {
    it('renders no wrapper at all without one', () => {
      const { container } = render(<Progress value={40} />)
      expect(container.firstElementChild).toBeInstanceOf(HTMLProgressElement)
    })

    it('names the bar', () => {
      render(<Progress value={40} label="Uploading recording" />)
      expect(screen.getByRole('progressbar', { name: 'Uploading recording' })).toBeInTheDocument()
    })

    it('shows the percentage only when asked', () => {
      render(<Progress value={40} label="Uploading" />)
      expect(screen.queryByText('40%')).not.toBeInTheDocument()
    })

    it('rounds the percentage rather than printing a fraction', () => {
      render(<Progress value={1} max={3} label="Step" showValue />)
      expect(screen.getByText('33%')).toBeInTheDocument()
    })
  })

  describe('out-of-range values', () => {
    it('clamps above the maximum', () => {
      render(<Progress value={150} label="Quota" showValue />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('value', '100')
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('clamps below zero', () => {
      render(<Progress value={-20} label="Quota" showValue />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0')
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('shows no percentage when the maximum is zero, rather than NaN', () => {
      render(<Progress value={0} max={0} label="Nothing to do" showValue />)
      expect(screen.queryByText(/%/)).not.toBeInTheDocument()
    })
  })

  it('keeps consumer class names alongside its own', () => {
    render(<Progress value={40} className="mt-2" />)
    expect(screen.getByRole('progressbar')).toHaveClass('progress', 'mt-2')
  })
})
