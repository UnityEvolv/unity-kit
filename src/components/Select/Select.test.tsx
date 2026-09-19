import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Select } from './Select'

const options = (
  <>
    <option value="uk">United Kingdom</option>
    <option value="in">India</option>
  </>
)

describe('Select', () => {
  it('is named by its label', () => {
    render(<Select label="Country">{options}</Select>)
    expect(screen.getByLabelText('Country')).toBeInstanceOf(HTMLSelectElement)
  })

  it('defaults to md', () => {
    render(<Select label="Country">{options}</Select>)
    expect(screen.getByLabelText('Country')).toHaveClass('select', 'select-md', 'w-full')
  })

  it.each([
    ['xs', 'select-xs'],
    ['sm', 'select-sm'],
    ['md', 'select-md'],
    ['lg', 'select-lg'],
  ] as const)('applies the full class name for size %s', (size, expected) => {
    render(
      <Select label="Country" size={size}>
        {options}
      </Select>,
    )
    expect(screen.getByLabelText('Country')).toHaveClass(expected)
  })

  it('renders its options as given', () => {
    render(<Select label="Country">{options}</Select>)
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  describe('placeholder', () => {
    it('sits first and starts selected', () => {
      render(
        <Select label="Country" placeholder="Choose a country">
          {options}
        </Select>,
      )
      expect(screen.getByLabelText<HTMLSelectElement>('Country').value).toBe('')
      expect(screen.getByRole('option', { name: 'Choose a country' })).toBeInTheDocument()
    })

    /** Disabled, so it cannot be chosen back once the user has moved on. */
    it('cannot be picked again', () => {
      render(
        <Select label="Country" placeholder="Choose a country">
          {options}
        </Select>,
      )
      expect(screen.getByRole('option', { name: 'Choose a country' })).toBeDisabled()
    })

    it('steps aside for a caller who says where to start', () => {
      render(
        <Select label="Country" placeholder="Choose a country" defaultValue="in">
          {options}
        </Select>,
      )
      expect(screen.getByLabelText<HTMLSelectElement>('Country').value).toBe('in')
    })

    it('steps aside for a controlled select too', () => {
      render(
        <Select label="Country" placeholder="Choose a country" value="uk" onChange={() => {}}>
          {options}
        </Select>,
      )
      expect(screen.getByLabelText<HTMLSelectElement>('Country').value).toBe('uk')
    })

    it('is absent unless asked for', () => {
      render(<Select label="Country">{options}</Select>)
      expect(screen.getAllByRole('option')).toHaveLength(2)
    })
  })

  it('shows, wires and colours an error in one prop', () => {
    render(
      <Select label="Country" error="Pick one.">
        {options}
      </Select>,
    )
    const field = screen.getByLabelText('Country')
    expect(field).toHaveClass('select-error')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAccessibleDescription('Pick one.')
  })

  it('is uncontrolled by default', async () => {
    render(<Select label="Country">{options}</Select>)
    const field = screen.getByLabelText<HTMLSelectElement>('Country')
    await userEvent.selectOptions(field, 'in')
    expect(field.value).toBe('in')
  })

  it('forwards a ref', () => {
    const ref = createRef<HTMLSelectElement>()
    render(
      <Select label="Country" ref={ref}>
        {options}
      </Select>,
    )
    expect(ref.current).toBeInstanceOf(HTMLSelectElement)
  })
})
