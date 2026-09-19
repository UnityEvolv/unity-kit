import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('defaults to the primary variant', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn', 'btn-primary')
  })

  it.each([
    ['primary', 'btn-primary'],
    ['secondary', 'btn-secondary'],
    ['danger', 'btn-error'],
  ] as const)('applies the full class name for variant %s', (variant, expected) => {
    render(<Button variant={variant}>Save</Button>)
    expect(screen.getByRole('button')).toHaveClass(expected)
  })

  it('keeps consumer class names alongside its own', () => {
    render(<Button className="w-full">Save</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn', 'btn-primary', 'w-full')
  })

  it('defaults to type=button so it does not submit a surrounding form', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('forwards a ref to the underlying element', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Save</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('passes native button props through', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
