import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Stepper } from './Stepper'

const steps = [
  { key: 'account', label: 'Account' },
  { key: 'team', label: 'Team', description: 'Who is joining' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'done', label: 'Done' },
]

describe('Stepper', () => {
  it('is an ordered list with the current step marked', () => {
    render(<Stepper steps={steps} current={1} />)
    const list = screen.getByRole('list', { name: 'Progress' })
    expect(list.tagName).toBe('OL')
    expect(list).toHaveClass('steps')
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(4)
    expect(items[1]).toHaveAttribute('aria-current', 'step')
    expect(items[0]).not.toHaveAttribute('aria-current')
  })

  it('derives complete, current and upcoming from the index, with full class names', () => {
    render(<Stepper steps={steps} current={1} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveClass('step', 'step-primary')
    expect(items[1]).toHaveClass('step', 'step-primary')
    expect(items[2]).toHaveClass('step')
    expect(items[2]).not.toHaveClass('step-primary')
  })

  it('says the state in words, not only colour', () => {
    render(<Stepper steps={steps} current={1} errorSteps={['rooms']} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Account, complete')
    expect(items[0].querySelector('.step-icon svg')).not.toBeNull()
    expect(items[2]).toHaveClass('step-error')
    expect(items[2]).toHaveTextContent('Rooms, has an error')
    expect(items[3]).toHaveTextContent('Done, not started')
  })

  it('shows a description', () => {
    render(<Stepper steps={steps} current={0} />)
    expect(screen.getByText('Who is joining')).toBeInTheDocument()
  })

  it.each([
    ['horizontal', 'steps-horizontal'],
    ['vertical', 'steps-vertical'],
    ['responsive', 'sm:steps-horizontal'],
  ] as const)('orientation %s', (orientation, expected) => {
    render(<Stepper steps={steps} current={0} orientation={orientation} />)
    expect(screen.getByRole('list')).toHaveClass(expected)
  })

  describe('click to navigate', () => {
    it('renders no buttons without onStepClick', () => {
      render(<Stepper steps={steps} current={2} />)
      expect(screen.queryAllByRole('button')).toHaveLength(0)
    })

    it('makes completed and error steps buttons, but not current or upcoming', async () => {
      const user = userEvent.setup()
      const onStepClick = vi.fn()
      render(<Stepper steps={steps} current={2} errorSteps={['done']} onStepClick={onStepClick} />)
      expect(screen.getByRole('button', { name: /Account/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Team/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Rooms/ })).toBeNull()
      expect(screen.getByRole('button', { name: /Done/ })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /Account/ }))
      expect(onStepClick).toHaveBeenCalledWith(0)
    })

    it('makes upcoming steps buttons when allowed', () => {
      render(<Stepper steps={steps} current={0} onStepClick={() => {}} allowUpcoming />)
      expect(screen.getByRole('button', { name: /Done/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Account/ })).toBeNull()
    })
  })
})
