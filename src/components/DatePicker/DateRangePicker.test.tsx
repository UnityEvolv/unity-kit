import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DateRangePicker } from './DateRangePicker'

const trigger = () => screen.getByRole('button', { name: /Dates/ })
const day = (name: RegExp) => within(grids()[0]).getByRole('button', { name })
const grids = () => screen.getAllByRole('grid')

describe('DateRangePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date(2026, 2, 10, 12))
  })
  afterEach(() => vi.useRealTimers())

  it('shows the range in the trigger and says it as start to end', () => {
    render(<DateRangePicker label="Dates" locale="en-US" value={['2026-03-08', '2026-03-14']} />)
    expect(trigger()).toHaveTextContent(/Mar 8.*14, 2026/)
    expect(trigger()).toHaveAccessibleName('Dates, March 8, 2026 to March 14, 2026')
  })

  it('shows a placeholder and says no dates when empty', () => {
    render(<DateRangePicker label="Dates" locale="en-US" />)
    expect(trigger()).toHaveTextContent('Start – End')
    expect(trigger()).toHaveAccessibleName('Dates, No dates chosen')
  })

  it('opens two months side by side, the second without outside days', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker label="Dates" locale="en-US" />)
    await user.click(trigger())
    expect(grids()).toHaveLength(2)
    expect(grids()[0]).toHaveAccessibleName('March 2026')
    expect(grids()[1]).toHaveAccessibleName('April 2026')
    expect(within(grids()[1]).queryByRole('button', { name: /March 31, 2026/ })).toBeNull()
    expect(screen.getAllByRole('button', { name: 'Next month' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Previous month' })).toHaveLength(1)
  })

  it('sets start then end with clicks, announces, and closes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DateRangePicker label="Dates" locale="en-US" onChange={onChange} />)
    await user.click(trigger())
    await user.click(day(/March 8, 2026/))
    expect(onChange).toHaveBeenLastCalledWith(['2026-03-08', null])
    expect(grids()[0]).toHaveAccessibleName('March 2026, choose an end date')
    await user.click(day(/March 14, 2026/))
    expect(onChange).toHaveBeenLastCalledWith(['2026-03-08', '2026-03-14'])
    expect(screen.queryByRole('grid')).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('March 8, 2026 to March 14, 2026')
  })

  it('previews the band on hover and marks both ends selected', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker label="Dates" locale="en-US" />)
    await user.click(trigger())
    await user.click(day(/March 8, 2026/))
    await user.hover(day(/March 11, 2026/))
    expect(day(/March 9, 2026/).parentElement).toHaveClass('bg-primary/10')
    expect(day(/March 8, 2026/).parentElement).toHaveClass('rounded-l-full')
    expect(day(/March 11, 2026/).parentElement).toHaveClass('rounded-r-full')
    expect(day(/March 12, 2026/).parentElement).not.toHaveClass('bg-primary/10')
    expect(day(/March 8, 2026/)).toHaveAttribute('aria-selected', 'true')
  })

  it('starts again from a day before the start', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DateRangePicker label="Dates" locale="en-US" onChange={onChange} />)
    await user.click(trigger())
    await user.click(day(/March 10, 2026/))
    await user.click(day(/March 4, 2026/))
    expect(onChange).toHaveBeenLastCalledWith(['2026-03-04', null])
    expect(screen.getAllByRole('grid', { name: /choose an end date/ })[0]).toBeInTheDocument()
  })

  it('selects with the keyboard: Enter for start, arrows preview, Enter for end', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DateRangePicker label="Dates" locale="en-US" onChange={onChange} />)
    await user.click(trigger())
    expect(document.activeElement).toHaveAttribute('data-date', '2026-03-10')
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenLastCalledWith(['2026-03-10', null])
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(day(/March 11, 2026/).parentElement).toHaveClass('bg-primary/10')
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenLastCalledWith(['2026-03-10', '2026-03-12'])
  })

  it('applies a preset and closes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <DateRangePicker
        label="Dates"
        locale="en-US"
        onChange={onChange}
        presets={[{ label: 'This week', range: ['2026-03-08', '2026-03-14'] }]}
      />,
    )
    await user.click(trigger())
    await user.click(
      within(screen.getByRole('list', { name: 'Presets' })).getByRole('button', {
        name: 'This week',
      }),
    )
    expect(onChange).toHaveBeenCalledWith(['2026-03-08', '2026-03-14'])
    expect(screen.queryByRole('grid')).toBeNull()
  })

  it('honours min, max and a disabled predicate', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <DateRangePicker
        label="Dates"
        locale="en-US"
        min="2026-03-05"
        max="2026-03-20"
        isDateDisabled={(iso) => iso === '2026-03-12'}
        onChange={onChange}
      />,
    )
    await user.click(trigger())
    expect(day(/March 4, 2026/)).toHaveAttribute('aria-disabled', 'true')
    expect(day(/March 12, 2026/)).toHaveAttribute('aria-disabled', 'true')
    await user.click(day(/March 12, 2026/))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clears both ends and renders hidden inputs for a form', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(
      <DateRangePicker
        label="Dates"
        locale="en-US"
        value={['2026-03-08', '2026-03-14']}
        names={['from', 'to']}
        onChange={onChange}
      />,
    )
    expect(container.querySelector('input[name="from"]')).toHaveValue('2026-03-08')
    expect(container.querySelector('input[name="to"]')).toHaveValue('2026-03-14')
    await user.click(screen.getByRole('button', { name: 'Clear dates' }))
    expect(onChange).toHaveBeenCalledWith([null, null])
  })
})
