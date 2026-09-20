import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Accordion } from './Accordion'

const items = [
  { value: 'audio', title: 'Audio', content: 'Microphone and speakers' },
  { value: 'video', title: 'Video', content: 'Camera' },
  { value: 'billing', title: 'Billing', content: 'Cards', disabled: true },
]

const trigger = (name: string) => screen.getByRole('button', { name })

describe('Accordion', () => {
  it('renders each title as a button inside a heading, all closed by default', () => {
    render(<Accordion items={items} />)
    expect(trigger('Audio').closest('h3')).not.toBeNull()
    expect(trigger('Audio')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Microphone and speakers')).toBeNull()
  })

  it('opens on click, marks the item open for daisyUI, and closes again', async () => {
    const user = userEvent.setup()
    render(<Accordion items={items} />)
    await user.click(trigger('Audio'))
    expect(trigger('Audio')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Microphone and speakers')).toBeVisible()
    const item = trigger('Audio').closest('.collapse') as HTMLElement
    expect(item).toHaveAttribute('data-state', 'open')
    expect(item).toHaveClass('collapse', 'collapse-arrow', 'data-[state=open]:collapse-open')
    await user.click(trigger('Audio'))
    expect(trigger('Audio')).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens one at a time in single mode', async () => {
    const user = userEvent.setup()
    render(<Accordion items={items} defaultValue="audio" />)
    await user.click(trigger('Video'))
    expect(trigger('Video')).toHaveAttribute('aria-expanded', 'true')
    expect(trigger('Audio')).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps one open when not collapsible', async () => {
    const user = userEvent.setup()
    render(<Accordion items={items} defaultValue="audio" collapsible={false} />)
    await user.click(trigger('Audio'))
    expect(trigger('Audio')).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens several in multiple mode and reports the array', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Accordion
        items={items}
        type="multiple"
        defaultValue={['audio']}
        onValueChange={onValueChange}
      />,
    )
    await user.click(trigger('Video'))
    expect(onValueChange).toHaveBeenCalledWith(['audio', 'video'])
    expect(trigger('Audio')).toHaveAttribute('aria-expanded', 'true')
    expect(trigger('Video')).toHaveAttribute('aria-expanded', 'true')
  })

  it('is controllable in single mode', () => {
    const { rerender } = render(<Accordion items={items} value="video" />)
    expect(screen.getByText('Camera')).toBeInTheDocument()
    rerender(<Accordion items={items} value="audio" />)
    expect(screen.queryByText('Camera')).toBeNull()
    expect(screen.getByText('Microphone and speakers')).toBeInTheDocument()
  })

  it('moves between triggers with the arrow keys and skips a disabled one', async () => {
    const user = userEvent.setup()
    render(<Accordion items={items} />)
    await user.click(trigger('Audio'))
    await user.keyboard('{ArrowDown}')
    expect(trigger('Video')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(trigger('Audio')).toHaveFocus()
    expect(trigger('Billing')).toBeDisabled()
  })

  it('takes a heading level and the plus variant', () => {
    render(<Accordion items={items} headingLevel={2} variant="plus" />)
    expect(trigger('Audio').closest('h2')).not.toBeNull()
    expect(trigger('Audio').closest('.collapse')).toHaveClass('collapse-plus')
  })
})
