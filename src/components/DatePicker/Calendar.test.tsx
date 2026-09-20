import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Calendar } from './Calendar'

const grid = () => screen.getByRole('grid')
const cell = (label: RegExp | string) => screen.getByRole('button', { name: label })
const focusedDate = () => (document.activeElement as HTMLElement).getAttribute('data-date')

describe('Calendar', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date(2026, 2, 10, 12)) // 10 March 2026, local
  })
  afterEach(() => vi.useRealTimers())

  it('shows the month of the value with weekday headers from the locale', () => {
    render(<Calendar value="2026-03-08" locale="en-US" />)
    expect(grid()).toHaveAccessibleName('March 2026')
    const headers = within(grid()).getAllByRole('columnheader')
    expect(headers.map((h) => h.textContent)).toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ])
    expect(headers[0]).toHaveAccessibleName('Sunday')
  })

  it('starts the week on Monday for a locale that does', () => {
    render(<Calendar value="2026-03-08" locale="fr-FR" />)
    expect(within(grid()).getAllByRole('columnheader')[0].textContent).toMatch(/^lun/)
  })

  it('renders six weeks with adjacent-month days muted', () => {
    render(<Calendar value="2026-03-08" locale="en-US" />)
    const rows = within(grid()).getAllByRole('row')
    expect(rows).toHaveLength(7)
    const days = within(grid()).getAllByRole('button')
    expect(days).toHaveLength(42)
    expect(days[0]).toHaveAttribute('data-date', '2026-03-01')
    expect(days[41]).toHaveAttribute('data-date', '2026-04-11')
    expect(days[41]).toHaveClass('text-muted')
    expect(days[7]).not.toHaveClass('text-muted')
  })

  it('marks the selection, today, and one tab stop', () => {
    render(<Calendar value="2026-03-08" locale="en-US" />)
    expect(cell(/March 8, 2026/)).toHaveAttribute('aria-selected', 'true')
    expect(cell(/March 10, 2026/)).toHaveAttribute('aria-current', 'date')
    const stops = within(grid())
      .getAllByRole('button')
      .filter((b) => b.tabIndex === 0)
    expect(stops).toHaveLength(1)
    expect(stops[0]).toHaveAttribute('data-date', '2026-03-08')
  })

  it('selects with a click and with Enter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Calendar value="2026-03-08" locale="en-US" onChange={onChange} />)
    await user.click(cell(/March 12, 2026/))
    expect(onChange).toHaveBeenLastCalledWith('2026-03-12')
    cell(/March 8, 2026/).focus()
    await user.keyboard('{ArrowRight}{Enter}')
    expect(onChange).toHaveBeenLastCalledWith('2026-03-09')
  })

  it('moves by day, week, week edges, month and year from the keyboard', async () => {
    const user = userEvent.setup()
    render(<Calendar value="2026-03-11" locale="en-US" />)
    cell(/March 11, 2026/).focus()
    await user.keyboard('{ArrowRight}')
    expect(focusedDate()).toBe('2026-03-12')
    await user.keyboard('{ArrowDown}')
    expect(focusedDate()).toBe('2026-03-19')
    await user.keyboard('{ArrowUp}{ArrowLeft}')
    expect(focusedDate()).toBe('2026-03-11')
    await user.keyboard('{Home}')
    expect(focusedDate()).toBe('2026-03-08')
    await user.keyboard('{End}')
    expect(focusedDate()).toBe('2026-03-14')
    await user.keyboard('{PageDown}')
    expect(focusedDate()).toBe('2026-04-14')
    expect(grid()).toHaveAccessibleName('April 2026')
    await user.keyboard('{PageUp}')
    expect(focusedDate()).toBe('2026-03-14')
    await user.keyboard('{Shift>}{PageDown}{/Shift}')
    expect(focusedDate()).toBe('2027-03-14')
    expect(grid()).toHaveAccessibleName('March 2027')
  })

  it('crosses a month boundary with the arrows and shows the new month', async () => {
    const user = userEvent.setup()
    render(<Calendar value="2026-03-31" locale="en-US" />)
    cell(/March 31, 2026/).focus()
    await user.keyboard('{ArrowRight}')
    expect(focusedDate()).toBe('2026-04-01')
    expect(grid()).toHaveAccessibleName('April 2026')
  })

  it('calls onEscape', async () => {
    const user = userEvent.setup()
    const onEscape = vi.fn()
    render(<Calendar value="2026-03-08" locale="en-US" onEscape={onEscape} />)
    cell(/March 8, 2026/).focus()
    await user.keyboard('{Escape}')
    expect(onEscape).toHaveBeenCalledOnce()
  })

  it('respects min, max and a disabled predicate', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Calendar
        value="2026-03-10"
        locale="en-US"
        min="2026-03-05"
        max="2026-03-20"
        isDateDisabled={(iso) => iso === '2026-03-12'}
        onChange={onChange}
      />,
    )
    expect(cell(/March 4, 2026/)).toHaveAttribute('aria-disabled', 'true')
    expect(cell(/March 21, 2026/)).toHaveAttribute('aria-disabled', 'true')
    expect(cell(/March 12, 2026/)).toHaveAttribute('aria-disabled', 'true')
    await user.click(cell(/March 12, 2026/))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled()
    cell(/March 20, 2026/).focus()
    await user.keyboard('{ArrowRight}')
    expect(focusedDate()).toBe('2026-03-20')
  })

  it('jumps months with the arrows and the month and year selectors', async () => {
    const user = userEvent.setup()
    const onMonthChange = vi.fn()
    render(<Calendar value="2026-03-08" locale="en-US" onMonthChange={onMonthChange} />)
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(grid()).toHaveAccessibleName('April 2026')
    expect(onMonthChange).toHaveBeenLastCalledWith('2026-04-01')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Month' }), '12')
    expect(grid()).toHaveAccessibleName('December 2026')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Year' }), '2030')
    expect(grid()).toHaveAccessibleName('December 2030')
  })

  it('focuses the active day on mount when asked', () => {
    render(<Calendar value="2026-03-08" locale="en-US" autoFocus />)
    expect(focusedDate()).toBe('2026-03-08')
  })
})
