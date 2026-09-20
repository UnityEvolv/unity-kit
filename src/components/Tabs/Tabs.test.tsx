import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tabs } from './Tabs'

const items = [
  { value: 'people', label: 'People', content: 'Who is here' },
  { value: 'chat', label: 'Chat', content: 'Messages' },
  { value: 'files', label: 'Files', content: 'Shared files', disabled: true },
]

describe('Tabs', () => {
  it('renders a tablist with the first tab active and only its panel mounted', () => {
    render(<Tabs items={items} label="Room" />)
    expect(screen.getByRole('tablist', { name: 'Room' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'People' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Who is here')
    expect(screen.queryByText('Messages')).toBeNull()
  })

  it('carries the daisyUI classes for variant and size in full', () => {
    render(<Tabs items={items} variant="lift" size="sm" />)
    expect(screen.getByRole('tablist')).toHaveClass('tabs', 'tabs-lift', 'tabs-sm')
    expect(screen.getByRole('tab', { name: 'People' })).toHaveClass('tab')
  })

  it('switches on click and reports the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Tabs items={items} onValueChange={onValueChange} />)
    await user.click(screen.getByRole('tab', { name: 'Chat' }))
    expect(onValueChange).toHaveBeenCalledWith('chat')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Messages')
  })

  it('moves with the arrow keys, skipping a disabled tab, and wraps', async () => {
    const user = userEvent.setup()
    render(<Tabs items={items} />)
    await user.click(screen.getByRole('tab', { name: 'People' }))
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Chat' })).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'People' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Files' })).toBeDisabled()
  })

  it('is controllable', () => {
    const { rerender } = render(<Tabs items={items} value="chat" />)
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Messages')
    rerender(<Tabs items={items} value="people" />)
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Who is here')
  })
})
