import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Tooltip, TooltipProvider } from './Tooltip'
import { Button } from '../Button'

/**
 * The two things a tooltip has to do beyond appearing on hover: open on
 * keyboard focus, and be announced. daisyUI's CSS-only tooltip does neither —
 * its text is generated content, which no screen reader reads — so those are
 * the tests that justify the swap to Radix.
 */

describe('Tooltip', () => {
  it('renders its trigger and nothing else', () => {
    render(
      <Tooltip content="Mute">
        <Button icon="mic" aria-label="Microphone" />
      </Tooltip>,
    )
    expect(screen.getByRole('button', { name: 'Microphone' })).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('works without an app-level provider', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Mute">
        <Button icon="mic" aria-label="Microphone" />
      </Tooltip>,
    )
    await user.hover(screen.getByRole('button', { name: 'Microphone' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Mute')
  })

  it('defers to an app-level provider when there is one', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip content="Mute">
          <Button icon="mic" aria-label="Microphone" />
        </Tooltip>
      </TooltipProvider>,
    )
    await user.hover(screen.getByRole('button', { name: 'Microphone' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Mute')
  })

  /**
   * A tooltip that only opens on hover is invisible to anyone driving the page
   * from the keyboard, which is most of the people it was added for.
   */
  it('opens on keyboard focus', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Mute">
        <Button icon="mic" aria-label="Microphone" />
      </Tooltip>,
    )

    await user.tab()
    expect(screen.getByRole('button', { name: 'Microphone' })).toHaveFocus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Mute')
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Mute">
        <Button icon="mic" aria-label="Microphone" />
      </Tooltip>,
    )

    await user.tab()
    await screen.findByRole('tooltip')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
  })

  /**
   * Radix renders the label twice: once visibly and once for assistive
   * technology, with the trigger pointing at the second. That is what makes
   * the tooltip something a screen reader reads rather than something it
   * cannot see.
   */
  it('describes its trigger while open', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Mute">
        <Button icon="mic" aria-label="Microphone" />
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Microphone' })

    expect(trigger).not.toHaveAttribute('aria-describedby')

    await user.tab()
    await screen.findByRole('tooltip')

    await waitFor(() => expect(trigger).toHaveAccessibleDescription('Mute'))
  })

  /**
   * A tooltip is a second label, never the only one. The kit already refuses
   * an icon-only `Button` without an `aria-label`, and this records why: the
   * tooltip must not be doing that job.
   */
  it('leaves the trigger to supply its own name', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Mute your microphone">
        <Button icon="mic" aria-label="Microphone" />
      </Tooltip>,
    )
    await user.tab()
    await screen.findByRole('tooltip')

    expect(screen.getByRole('button', { name: 'Microphone' })).toHaveAccessibleName('Microphone')
  })

  it('wraps a plain string trigger rather than failing', async () => {
    const user = userEvent.setup()
    render(<Tooltip content="Mute">Microphone</Tooltip>)

    await user.tab()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Mute')
  })

  it('keeps consumer class names alongside its own', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Mute" className="max-w-md">
        <Button icon="mic" aria-label="Microphone" />
      </Tooltip>,
    )
    await user.tab()
    await screen.findByRole('tooltip')

    const bubble = document.querySelector('.rounded-field') as HTMLElement
    expect(bubble).toHaveClass('bg-neutral', 'text-neutral-content', 'max-w-md')
  })
})
