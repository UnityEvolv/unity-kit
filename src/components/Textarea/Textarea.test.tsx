import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('is named by its label', () => {
    render(<Textarea label="Agenda" />)
    expect(screen.getByLabelText('Agenda')).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('defaults to md and three rows, which reads as "a few sentences"', () => {
    render(<Textarea label="Agenda" />)
    const field = screen.getByLabelText('Agenda')
    expect(field).toHaveClass('textarea', 'textarea-md', 'w-full')
    expect(field).toHaveAttribute('rows', '3')
  })

  it('takes another row count', () => {
    render(<Textarea label="Agenda" rows={8} />)
    expect(screen.getByLabelText('Agenda')).toHaveAttribute('rows', '8')
  })

  it.each([
    ['xs', 'textarea-xs'],
    ['sm', 'textarea-sm'],
    ['md', 'textarea-md'],
    ['lg', 'textarea-lg'],
  ] as const)('applies the full class name for size %s', (size, expected) => {
    render(<Textarea label="Agenda" size={size} />)
    expect(screen.getByLabelText('Agenda')).toHaveClass(expected)
  })

  it('shows, wires and colours an error in one prop', () => {
    render(<Textarea label="Agenda" error="Say something about the meeting." />)
    const field = screen.getByLabelText('Agenda')
    expect(field).toHaveClass('textarea-error')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAccessibleDescription('Say something about the meeting.')
  })

  it('forwards a ref', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea label="Agenda" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })
})
