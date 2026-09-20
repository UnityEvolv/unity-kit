import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DatePicker } from './DatePicker'
import { TimePicker } from './TimePicker'
import { DateTimePicker } from './DateTimePicker'

describe('DatePicker', () => {
  const input = () => screen.getByRole('textbox', { name: 'Start date' })

  it('shows the value in the locale and the locale pattern as placeholder', () => {
    render(<DatePicker label="Start date" value="2026-03-08" locale="en-US" />)
    expect(input()).toHaveValue('Mar 8, 2026')
    expect(input()).toHaveAttribute('placeholder', 'MM/DD/YYYY')
  })

  it('accepts a typed date on Enter and on blur, as ISO out', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker label="Start date" locale="en-GB" onChange={onChange} />)
    await user.type(input(), '8/3/2026{Enter}')
    expect(onChange).toHaveBeenLastCalledWith('2026-03-08')
    await user.clear(input())
    await user.type(input(), '2026-12-25')
    await user.tab()
    expect(onChange).toHaveBeenLastCalledWith('2026-12-25')
  })

  it('marks a bad entry invalid with the pattern, and clears with an empty entry', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker label="Start date" locale="en-US" value="2026-03-08" onChange={onChange} />)
    await user.clear(input())
    await user.type(input(), 'soon{Enter}')
    expect(input()).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a date as MM/DD/YYYY')
    expect(onChange).not.toHaveBeenCalled()
    await user.clear(input())
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('clears from the clear button and hides it when empty', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(
      <DatePicker label="Start date" locale="en-US" value="2026-03-08" onChange={onChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Clear date' }))
    expect(onChange).toHaveBeenCalledWith(null)
    rerender(<DatePicker label="Start date" locale="en-US" value={null} onChange={onChange} />)
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull()
  })

  it('opens the calendar, picks a day, closes and returns focus', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker label="Start date" locale="en-US" value="2026-03-08" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    expect(await screen.findByRole('grid', { name: 'March 2026' })).toBeInTheDocument()
    expect(document.activeElement).toHaveAttribute('data-date', '2026-03-08')
    await user.click(screen.getByRole('button', { name: /March 12, 2026/ }))
    expect(onChange).toHaveBeenCalledWith('2026-03-12')
    expect(screen.queryByRole('grid')).toBeNull()
    expect(input()).toHaveFocus()
  })

  it('closes the calendar on Escape and returns focus to the input', async () => {
    const user = userEvent.setup()
    render(<DatePicker label="Start date" locale="en-US" value="2026-03-08" />)
    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    await screen.findByRole('grid')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('grid')).toBeNull()
    expect(input()).toHaveFocus()
  })

  it('wires the field and a hidden input for a plain form', () => {
    const { container } = render(
      <DatePicker
        label="Start date"
        locale="en-US"
        value="2026-03-08"
        name="start"
        error="Too early"
      />,
    )
    expect(input()).toHaveAttribute('aria-invalid', 'true')
    expect(container.querySelector('input[name="start"]')).toHaveValue('2026-03-08')
  })
})

describe('TimePicker', () => {
  const hour = () => screen.getByRole('textbox', { name: 'Hour' })
  const minute = () => screen.getByRole('textbox', { name: 'Minute' })

  it('is a labelled group with hour, minute and a day period on a 12-hour locale', () => {
    render(<TimePicker label="Starts at" locale="en-US" value="14:05" />)
    expect(screen.getByRole('group', { name: 'Starts at' })).toBeInTheDocument()
    expect(hour()).toHaveValue('02')
    expect(minute()).toHaveValue('05')
    expect(screen.getByRole('combobox', { name: 'AM or PM' })).toHaveValue('1')
  })

  it('uses a 24-hour clock for a locale that does, or when told', () => {
    const { rerender } = render(<TimePicker label="Starts at" locale="de-DE" value="14:05" />)
    expect(hour()).toHaveValue('14')
    expect(screen.queryByRole('combobox')).toBeNull()
    rerender(<TimePicker label="Starts at" locale="en-US" hourCycle={24} value="14:05" />)
    expect(hour()).toHaveValue('14')
  })

  it('steps with the arrows, minutes by the step, and wraps', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <TimePicker
        label="Starts at"
        locale="de-DE"
        value="23:55"
        minuteStep={15}
        onChange={onChange}
      />,
    )
    hour().focus()
    await user.keyboard('{ArrowUp}')
    expect(onChange).toHaveBeenLastCalledWith('00:55')
    minute().focus()
    await user.keyboard('{ArrowUp}')
    expect(onChange).toHaveBeenLastCalledWith('23:15')
    await user.keyboard('{ArrowDown}')
    expect(onChange).toHaveBeenLastCalledWith('23:45')
  })

  it('jumps to typed digits and moves to the next segment when unambiguous', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker label="Starts at" locale="de-DE" onChange={onChange} />)
    await user.click(hour())
    await user.keyboard('9')
    expect(onChange).toHaveBeenLastCalledWith('09:00')
    expect(minute()).toHaveFocus()
    await user.keyboard('30')
    expect(onChange).toHaveBeenLastCalledWith('09:30')
  })

  it('switches the period and keeps HH:mm out', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker label="Starts at" locale="en-US" value="09:30" onChange={onChange} />)
    await user.selectOptions(screen.getByRole('combobox', { name: 'AM or PM' }), '1')
    expect(onChange).toHaveBeenLastCalledWith('21:30')
  })
})

describe('DateTimePicker', () => {
  it('shows the wall clock of the zone and emits an offset-qualified instant', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <DateTimePicker
        label="Starts"
        locale="en-US"
        timeZone="Asia/Kolkata"
        value="2026-03-08T04:00:00Z"
        onChange={onChange}
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Date' })).toHaveValue('Mar 8, 2026')
    expect(screen.getByRole('textbox', { name: 'Hour' })).toHaveValue('09')
    expect(screen.getByRole('textbox', { name: 'Minute' })).toHaveValue('30')
    expect(screen.getByText('GMT+5:30')).toBeInTheDocument()
    await user.selectOptions(screen.getByRole('combobox', { name: 'AM or PM' }), '1')
    expect(onChange).toHaveBeenLastCalledWith('2026-03-08T21:30:00+05:30')
  })

  it('starts the time at defaultTime when a date is picked first', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <DateTimePicker label="Starts" locale="en-GB" timeZone="Europe/London" onChange={onChange} />,
    )
    expect(screen.getByRole('textbox', { name: 'Hour' })).toBeDisabled()
    await user.type(screen.getByRole('textbox', { name: 'Date' }), '1/7/2026{Enter}')
    expect(onChange).toHaveBeenLastCalledWith('2026-07-01T09:00:00+01:00')
  })
})
