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

  describe('sizes', () => {
    it.each([
      ['xs', 'btn-xs'],
      ['sm', 'btn-sm'],
      ['md', 'btn-md'],
      ['lg', 'btn-lg'],
    ] as const)('applies the full class name for size %s', (size, expected) => {
      render(<Button size={size}>Save</Button>)
      expect(screen.getByRole('button')).toHaveClass(expected)
    })

    it('defaults to md', () => {
      render(<Button>Save</Button>)
      expect(screen.getByRole('button')).toHaveClass('btn-md')
    })

    it.each([
      ['xs', 14],
      ['sm', 14],
      ['md', 16],
      ['lg', 20],
    ] as const)('scales the icon with size %s', (size, pixels) => {
      render(
        <Button size={size} icon="invite">
          Invite
        </Button>,
      )
      expect(screen.getByRole('button').querySelector('svg')).toHaveAttribute(
        'width',
        String(pixels),
      )
    })
  })

  describe('full width', () => {
    it('stretches when asked', () => {
      render(<Button fullWidth>Save</Button>)
      expect(screen.getByRole('button')).toHaveClass('btn-block')
    })

    it('does not by default', () => {
      render(<Button>Save</Button>)
      expect(screen.getByRole('button')).not.toHaveClass('btn-block')
    })
  })

  describe('loading', () => {
    it('shows a spinner', () => {
      render(<Button loading>Save</Button>)
      expect(screen.getByRole('button').querySelector('.loading-spinner')).toBeInTheDocument()
    })

    it('cannot be pressed', async () => {
      const onClick = vi.fn()
      render(
        <Button loading onClick={onClick}>
          Save
        </Button>,
      )
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      await userEvent.click(button)
      expect(onClick).not.toHaveBeenCalled()
    })

    /**
     * `disabled` alone reads as "this control is unavailable"; `aria-busy` is
     * what says the state is temporary and something is happening.
     */
    it('announces itself as busy, not merely disabled', () => {
      render(<Button loading>Save</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })

    it('is not busy when it is not loading', () => {
      render(<Button>Save</Button>)
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy')
    })

    /**
     * The spinner takes the icon's place rather than joining it, so the button
     * keeps its width and does not shove whatever sits beside it.
     */
    it('replaces the icon rather than joining it', () => {
      render(
        <Button loading icon="invite">
          Invite
        </Button>,
      )
      const button = screen.getByRole('button')
      expect(button.querySelector('.loading-spinner')).toBeInTheDocument()
      expect(button.querySelector('svg')).toBeNull()
    })

    it('sizes the spinner with the button', () => {
      render(
        <Button loading size="lg">
          Save
        </Button>,
      )
      expect(screen.getByRole('button').querySelector('.loading-md')).toBeInTheDocument()
    })
  })

  describe('icons', () => {
    const svgIn = (button: HTMLElement) => button.querySelector('svg')

    it('renders no icon unless asked', () => {
      render(<Button>Save</Button>)
      expect(svgIn(screen.getByRole('button'))).toBeNull()
    })

    it('puts the icon before the label by default', () => {
      render(<Button icon="invite">Invite</Button>)
      const button = screen.getByRole('button', { name: 'Invite' })
      // firstChild rather than a class check: the ordering is the behaviour.
      expect(button.firstElementChild?.tagName).toBe('svg')
    })

    it('puts the icon after the label when asked', () => {
      render(
        <Button icon="chevron-right" iconPosition="end">
          Next
        </Button>,
      )
      const button = screen.getByRole('button', { name: 'Next' })
      expect(button.lastElementChild?.tagName).toBe('svg')
    })

    it('sizes the icon itself, so callers do not have to', () => {
      render(<Button icon="invite">Invite</Button>)
      // 16px is the match for the button's 14px label.
      expect(svgIn(screen.getByRole('button'))).toHaveAttribute('width', '16')
    })

    it('keeps the icon decorative so the button is announced once', () => {
      render(<Button icon="invite">Invite</Button>)
      const button = screen.getByRole('button', { name: 'Invite' })
      expect(svgIn(button)).toHaveAttribute('aria-hidden', 'true')
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('squares off an icon-only button', () => {
      render(<Button icon="trash" aria-label="Delete" />)
      // btn-square comes from the kit, not the call site: UKIT-5 requires that
      // consumers never write a daisyUI class name themselves.
      expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('btn-square')
    })

    it('does not square off a button that has a label', () => {
      render(<Button icon="trash">Delete</Button>)
      expect(screen.getByRole('button', { name: 'Delete' })).not.toHaveClass('btn-square')
    })

    it('names an icon-only button by its aria-label', () => {
      render(<Button icon="mic-off" aria-label="Mute microphone" />)
      expect(screen.getByRole('button', { name: 'Mute microphone' })).toBeInTheDocument()
    })

    it('still carries its variant', () => {
      render(<Button variant="danger" icon="trash" aria-label="Delete" />)
      expect(screen.getByRole('button')).toHaveClass('btn-error', 'btn-square')
    })
  })

  it('defaults to the primary variant', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn', 'btn-primary')
  })

  it.each([
    ['primary', 'btn-primary'],
    ['secondary', 'btn-secondary'],
    ['danger', 'btn-error'],
    ['ghost', 'btn-ghost'],
    ['link', 'btn-link'],
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
