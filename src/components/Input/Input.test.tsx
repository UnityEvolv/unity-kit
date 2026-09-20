import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('is named by its label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInstanceOf(HTMLInputElement)
  })

  it('defaults to a text input at md', () => {
    render(<Input label="Email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveClass('input', 'input-md', 'w-full')
  })

  it.each([
    ['xs', 'input-xs'],
    ['sm', 'input-sm'],
    ['md', 'input-md'],
    ['lg', 'input-lg'],
  ] as const)('applies the full class name for size %s', (size, expected) => {
    render(<Input label="Email" size={size} />)
    expect(screen.getByLabelText('Email')).toHaveClass(expected)
  })

  it('takes another type when asked', () => {
    render(<Input label="Password" type="password" />)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  describe('error', () => {
    it('shows, wires and colours it in one prop', () => {
      render(<Input label="Email" error="That address is already in use." />)
      const input = screen.getByLabelText('Email')
      expect(input).toHaveClass('input-error')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAccessibleDescription('That address is already in use.')
    })

    it('leaves the control unmarked when there is none', () => {
      render(<Input label="Email" />)
      expect(screen.getByLabelText('Email')).not.toHaveClass('input-error')
    })
  })

  it('describes the control with its help text', () => {
    render(<Input label="Room name" help="Shown to everyone who joins." />)
    expect(screen.getByLabelText('Room name')).toHaveAccessibleDescription(
      'Shown to everyone who joins.',
    )
  })

  describe('staying out of the way of forms', () => {
    it('is uncontrolled by default', async () => {
      render(<Input label="Room name" defaultValue="Standup" />)
      const input = screen.getByLabelText<HTMLInputElement>('Room name')
      await userEvent.type(input, '!')
      expect(input.value).toBe('Standup!')
    })

    it('forwards a ref, which is how a form library reaches it', () => {
      const ref = createRef<HTMLInputElement>()
      render(<Input label="Email" ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('passes native props straight through', () => {
      render(<Input label="Email" name="email" placeholder="you@example.com" autoComplete="email" />)
      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('name', 'email')
      expect(input).toHaveAttribute('placeholder', 'you@example.com')
      expect(input).toHaveAttribute('autocomplete', 'email')
    })
  })

  it('marks itself required', () => {
    render(<Input label="Email" required />)
    expect(screen.getByRole('textbox')).toBeRequired()
  })

  it('keeps consumer class names alongside its own', () => {
    render(<Input label="Email" className="font-mono" />)
    expect(screen.getByLabelText('Email')).toHaveClass('input', 'font-mono')
  })
})
