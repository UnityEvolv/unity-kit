import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Combobox } from './Combobox'
import type { ComboboxOption } from './Combobox'

interface Person extends ComboboxOption {
  email: string
}

const people: Person[] = [
  { value: 'sasha', label: 'Sasha Kim', email: 'sasha@example.com' },
  { value: 'jo', label: 'Jo Ortega', email: 'jo@example.com' },
  { value: 'amir', label: 'Amir Haddad', email: 'amir@example.com', disabled: true },
  { value: 'lena', label: 'Lena Fischer', email: 'lena@example.com' },
]

const input = () => screen.getByRole('combobox', { name: 'Person' })
const options = () => within(screen.getByRole('listbox')).getAllByRole('option')
const activeOf = () => {
  const id = input().getAttribute('aria-activedescendant')
  return id ? document.getElementById(id)?.textContent : null
}

describe('Combobox', () => {
  it('is a labelled combobox that opens a listbox on click', async () => {
    const user = userEvent.setup()
    render(<Combobox label="Person" options={people} />)
    expect(input()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).toBeNull()
    await user.click(input())
    expect(input()).toHaveAttribute('aria-expanded', 'true')
    expect(options()).toHaveLength(4)
    expect(input()).toHaveAttribute('aria-controls', screen.getByRole('listbox').id)
  })

  it('filters by label as the user types', async () => {
    const user = userEvent.setup()
    render(<Combobox label="Person" options={people} />)
    await user.type(input(), 'fi')
    expect(options().map((o) => o.textContent)).toEqual(['Lena Fischer'])
  })

  it('shows the empty message when nothing matches', async () => {
    const user = userEvent.setup()
    render(<Combobox label="Person" options={people} emptyMessage="Nobody by that name" />)
    await user.type(input(), 'zzz')
    expect(screen.queryByRole('listbox')?.children).toHaveLength(0)
    expect(screen.getByRole('status')).toHaveTextContent('Nobody by that name')
  })

  describe('single', () => {
    it('selects with a click, shows the label and closes', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Combobox label="Person" options={people} onChange={onChange} />)
      await user.click(input())
      await user.click(screen.getByRole('option', { name: 'Jo Ortega' }))
      expect(onChange).toHaveBeenCalledWith('jo', people[1])
      expect(input()).toHaveValue('Jo Ortega')
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('reflects a controlled value and keeps the full list when reopened', async () => {
      const user = userEvent.setup()
      render(<Combobox label="Person" options={people} value="lena" />)
      expect(input()).toHaveValue('Lena Fischer')
      await user.click(input())
      expect(options()).toHaveLength(4)
      expect(screen.getByRole('option', { name: /Lena Fischer/ })).toHaveAttribute(
        'aria-selected',
        'true',
      )
      expect(activeOf()).toContain('Lena Fischer')
    })

    it('restores the chosen label when typing is abandoned with Escape', async () => {
      const user = userEvent.setup()
      render(<Combobox label="Person" options={people} defaultValue="sasha" />)
      await user.type(input(), 'xx')
      expect(input()).toHaveValue('xx')
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(input()).toHaveValue('Sasha Kim')
    })
  })

  describe('keyboard', () => {
    it('moves the highlight with the arrows, skipping disabled options, and picks with Enter', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Combobox label="Person" options={people} onChange={onChange} />)
      input().focus()
      await user.keyboard('{ArrowDown}')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(activeOf()).toContain('Sasha Kim')
      await user.keyboard('{ArrowDown}{ArrowDown}')
      expect(activeOf()).toContain('Lena Fischer')
      await user.keyboard('{ArrowUp}')
      expect(activeOf()).toContain('Jo Ortega')
      await user.keyboard('{Enter}')
      expect(onChange).toHaveBeenCalledWith('jo', people[1])
      expect(document.activeElement).toBe(input())
    })

    it('jumps with Home and End', async () => {
      const user = userEvent.setup()
      render(<Combobox label="Person" options={people} />)
      input().focus()
      await user.keyboard('{ArrowDown}{End}')
      expect(activeOf()).toContain('Lena Fischer')
      await user.keyboard('{Home}')
      expect(activeOf()).toContain('Sasha Kim')
    })

    it('never leaves focus in the list: the input keeps focus and points at the option', async () => {
      const user = userEvent.setup()
      render(<Combobox label="Person" options={people} />)
      await user.click(input())
      await user.keyboard('{ArrowDown}')
      expect(document.activeElement).toBe(input())
      const id = input().getAttribute('aria-activedescendant')!
      expect(document.getElementById(id)).toHaveAttribute('role', 'option')
    })

    it('closes on Tab', async () => {
      const user = userEvent.setup()
      render(<Combobox label="Person" options={people} />)
      await user.click(input())
      await user.tab()
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    })
  })

  describe('multiple', () => {
    it('toggles options, keeps the list open and renders chips', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Combobox label="Person" options={people} multiple onChange={onChange} />)
      await user.click(input())
      await user.click(screen.getByRole('option', { name: 'Sasha Kim' }))
      expect(onChange).toHaveBeenLastCalledWith(['sasha'], [people[0]])
      expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
      await user.click(screen.getByRole('option', { name: /Jo Ortega/ }))
      expect(onChange).toHaveBeenLastCalledWith(['sasha', 'jo'], [people[0], people[1]])
      expect(screen.getByRole('button', { name: 'Remove Sasha Kim' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Remove Jo Ortega' })).toBeInTheDocument()
      await user.click(screen.getByRole('option', { name: /Sasha Kim/ }))
      expect(onChange).toHaveBeenLastCalledWith(['jo'], [people[1]])
    })

    it('removes a chip from its button and with Backspace on an empty input', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <Combobox
          label="Person"
          options={people}
          multiple
          value={['sasha', 'jo']}
          onChange={onChange}
        />,
      )
      await user.click(screen.getByRole('button', { name: 'Remove Sasha Kim' }))
      expect(onChange).toHaveBeenLastCalledWith(['jo'], [people[1]])
      input().focus()
      await user.keyboard('{Backspace}')
      expect(onChange).toHaveBeenLastCalledWith(['sasha'], [people[0]])
    })

    it('marks chosen options selected in the list', async () => {
      const user = userEvent.setup()
      render(<Combobox label="Person" options={people} multiple value={['jo']} />)
      await user.click(input())
      expect(screen.getByRole('option', { name: /Jo Ortega/ })).toHaveAttribute(
        'aria-selected',
        'true',
      )
      expect(screen.getByRole('option', { name: 'Sasha Kim' })).toHaveAttribute(
        'aria-selected',
        'false',
      )
    })
  })

  describe('async', () => {
    it('hands the query to onSearch, leaves filtering to the caller and shows loading', async () => {
      const user = userEvent.setup()
      const onSearch = vi.fn()
      const { rerender } = render(
        <Combobox label="Person" options={people} onSearch={onSearch} loading />,
      )
      await user.click(input())
      expect(onSearch).toHaveBeenCalledWith('')
      await user.type(input(), 'zz')
      expect(onSearch).toHaveBeenLastCalledWith('zz')
      // Not filtered here: the caller has the query and will swap the options.
      expect(options()).toHaveLength(4)
      expect(screen.getByRole('status')).toHaveTextContent('Loading')
      rerender(
        <Combobox label="Person" options={[people[3]]} onSearch={onSearch} loading={false} />,
      )
      expect(options()).toHaveLength(1)
      expect(screen.queryByRole('status')).toBeNull()
    })
  })

  it('lets the caller draw each option', async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        label="Person"
        options={people}
        renderOption={(person, { selected }) => (
          <span data-testid="row" data-selected={selected}>
            {person.label} · {person.email}
          </span>
        )}
        value="jo"
      />,
    )
    await user.click(input())
    const rows = screen.getAllByTestId('row')
    expect(rows[1]).toHaveTextContent('Jo Ortega · jo@example.com')
    expect(rows[1]).toHaveAttribute('data-selected', 'true')
  })

  it('renders hidden inputs for a plain form when given a name', () => {
    const { container } = render(
      <Combobox label="Person" options={people} multiple value={['sasha', 'jo']} name="people" />,
    )
    const hidden = container.querySelectorAll('input[type="hidden"][name="people"]')
    expect([...hidden].map((node) => (node as HTMLInputElement).value)).toEqual(['sasha', 'jo'])
  })

  it('wires the field: error marks it invalid and disabled stops it opening', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Combobox label="Person" options={people} error="Pick someone" />)
    expect(input()).toHaveAttribute('aria-invalid', 'true')
    expect(input().parentElement).toHaveClass('input-error')
    expect(screen.getByRole('alert')).toHaveTextContent('Pick someone')
    rerender(<Combobox label="Person" options={people} disabled />)
    expect(input()).toBeDisabled()
    await act(async () => {
      await user.click(input())
    })
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})
