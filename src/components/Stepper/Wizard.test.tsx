import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Wizard } from './Wizard'
import type { WizardApi } from './Wizard'

const steps = [
  { key: 'account', label: 'Account', content: 'Account form' },
  { key: 'team', label: 'Team', content: (api: WizardApi) => `Team form, step ${api.index + 1}` },
  { key: 'done', label: 'Done', content: 'All set' },
]

const next = () => screen.getByRole('button', { name: /Next|Finish/ })
const back = () => screen.getByRole('button', { name: 'Back' })

describe('Wizard', () => {
  it('renders the first step, its region and a footer with Back disabled', () => {
    render(<Wizard steps={steps} />)
    expect(screen.getByRole('region', { name: 'Step 1 of 3: Account' })).toHaveTextContent(
      'Account form',
    )
    expect(back()).toBeDisabled()
    expect(next()).toHaveTextContent('Next')
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-current', 'step')
  })

  it('moves with Next and Back and hands content the controls', async () => {
    const user = userEvent.setup()
    const onIndexChange = vi.fn()
    render(<Wizard steps={steps} onIndexChange={onIndexChange} />)
    await user.click(next())
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
    expect(screen.getByRole('region')).toHaveTextContent('Team form, step 2')
    await user.click(back())
    expect(onIndexChange).toHaveBeenLastCalledWith(0)
    expect(screen.getByRole('region')).toHaveTextContent('Account form')
  })

  it('shows Finish on the last step and calls onFinish', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(<Wizard steps={steps} defaultIndex={2} onFinish={onFinish} />)
    expect(next()).toHaveTextContent('Finish')
    await user.click(next())
    expect(onFinish).toHaveBeenCalledOnce()
  })

  it('gates Next on canProceed but still allows Back', async () => {
    const user = userEvent.setup()
    const onIndexChange = vi.fn()
    render(
      <Wizard steps={steps} defaultIndex={1} canProceed={false} onIndexChange={onIndexChange} />,
    )
    expect(next()).toBeDisabled()
    await user.click(back())
    expect(onIndexChange).toHaveBeenLastCalledWith(0)
  })

  it('refuses a forward jump past the gate, from content controls too', async () => {
    const user = userEvent.setup()
    const onIndexChange = vi.fn()
    render(
      <Wizard
        steps={[
          {
            key: 'a',
            label: 'A',
            content: (api: WizardApi) => (
              <button type="button" onClick={() => api.goTo(2)}>
                Skip
              </button>
            ),
          },
          ...steps.slice(1),
        ]}
        canProceed={false}
        onIndexChange={onIndexChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Skip' }))
    expect(onIndexChange).not.toHaveBeenCalled()
  })

  it('lets the indicator jump back to completed steps only when linear', async () => {
    const user = userEvent.setup()
    const onIndexChange = vi.fn()
    render(<Wizard steps={steps} defaultIndex={1} onIndexChange={onIndexChange} />)
    expect(screen.queryByRole('button', { name: /Done/ })).toBeNull()
    await user.click(screen.getByRole('button', { name: /Account/ }))
    expect(onIndexChange).toHaveBeenLastCalledWith(0)
  })

  it('makes every step reachable from the indicator when not linear', async () => {
    const user = userEvent.setup()
    const onIndexChange = vi.fn()
    render(<Wizard steps={steps} linear={false} onIndexChange={onIndexChange} />)
    await user.click(screen.getByRole('button', { name: /Done/ }))
    expect(onIndexChange).toHaveBeenLastCalledWith(2)
    expect(screen.getByRole('region')).toHaveTextContent('All set')
  })

  it('is controllable', () => {
    const { rerender } = render(<Wizard steps={steps} index={2} />)
    expect(screen.getByRole('region')).toHaveTextContent('All set')
    rerender(<Wizard steps={steps} index={0} />)
    expect(screen.getByRole('region')).toHaveTextContent('Account form')
  })

  it('takes a custom footer with the same controls', async () => {
    const user = userEvent.setup()
    const onIndexChange = vi.fn()
    render(
      <Wizard
        steps={steps}
        onIndexChange={onIndexChange}
        footer={(api) => (
          <button type="button" onClick={api.next}>
            Continue ({api.index + 1}/{api.count})
          </button>
        )}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Continue (1/3)' }))
    expect(onIndexChange).toHaveBeenCalledWith(1)
  })

  it('shows error steps in the indicator', () => {
    render(<Wizard steps={steps} defaultIndex={2} errorSteps={['team']} />)
    expect(screen.getAllByRole('listitem')[1]).toHaveClass('step-error')
  })
})
