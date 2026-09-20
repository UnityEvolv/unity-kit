import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('is named by its label', () => {
    render(<Checkbox label="Remember me" />)
    expect(screen.getByRole('checkbox', { name: 'Remember me' })).toBeInTheDocument()
  })

  it('defaults to md', () => {
    render(<Checkbox label="Remember me" />)
    expect(screen.getByRole('checkbox')).toHaveClass('checkbox', 'checkbox-md')
  })

  it.each([
    ['xs', 'checkbox-xs'],
    ['sm', 'checkbox-sm'],
    ['md', 'checkbox-md'],
    ['lg', 'checkbox-lg'],
  ] as const)('applies the full class name for size %s', (size, expected) => {
    render(<Checkbox label="Remember me" size={size} />)
    expect(screen.getByRole('checkbox')).toHaveClass(expected)
  })

  /** The label wraps the control, so the words are part of the target. */
  it('is toggled by clicking its label', async () => {
    render(<Checkbox label="Remember me" />)
    await userEvent.click(screen.getByText('Remember me'))
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  describe('indeterminate', () => {
    it('is a DOM property React cannot set from JSX, so the component does', () => {
      render(<Checkbox label="Select all" indeterminate />)
      expect(screen.getByRole<HTMLInputElement>('checkbox').indeterminate).toBe(true)
    })

    it('is off unless asked for', () => {
      render(<Checkbox label="Select all" />)
      expect(screen.getByRole<HTMLInputElement>('checkbox').indeterminate).toBe(false)
    })

    it('clears when the prop goes away', () => {
      const { rerender } = render(<Checkbox label="Select all" indeterminate />)
      rerender(<Checkbox label="Select all" indeterminate={false} />)
      expect(screen.getByRole<HTMLInputElement>('checkbox').indeterminate).toBe(false)
    })

    it('still hands the node to the caller', () => {
      const ref = createRef<HTMLInputElement>()
      render(<Checkbox label="Select all" indeterminate ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current?.indeterminate).toBe(true)
    })
  })

  it('shows, wires and colours an error in one prop', () => {
    render(<Checkbox label="Accept the terms" error="You have to accept them." />)
    const box = screen.getByRole('checkbox')
    expect(box).toHaveClass('checkbox-error')
    expect(box).toHaveAttribute('aria-invalid', 'true')
    expect(box).toHaveAccessibleDescription('You have to accept them.')
  })

  it('is uncontrolled by default', async () => {
    render(<Checkbox label="Remember me" defaultChecked />)
    const box = screen.getByRole('checkbox')
    expect(box).toBeChecked()
    await userEvent.click(box)
    expect(box).not.toBeChecked()
  })

  it('passes native props through', () => {
    render(<Checkbox label="Remember me" name="remember" value="yes" />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('name', 'remember')
  })
})
