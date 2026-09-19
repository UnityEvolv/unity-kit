import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Popover } from './Popover'
import { Button } from '../Button'

/**
 * Non-modal is the whole difference between this and `Modal`, and it is the
 * part most easily lost: swap one Radix prop and the popover starts locking
 * the page and hiding it from screen readers while still looking identical.
 * Those two tests are the reason this file exists.
 *
 * `padded` and `autoFocusContent` are tested because `Combobox` (UKIT-13) and
 * the date pickers (UKIT-20, UKIT-21) are built on them.
 */

describe('Popover', () => {
  it('renders nothing until it is opened', () => {
    render(
      <Popover trigger={<Button>Status</Button>}>
        <p>Away</p>
      </Popover>,
    )
    expect(screen.queryByText('Away')).not.toBeInTheDocument()
  })

  it('opens from its trigger', async () => {
    const user = userEvent.setup()
    render(
      <Popover trigger={<Button>Status</Button>}>
        <p>Away</p>
      </Popover>,
    )
    await user.click(screen.getByRole('button', { name: 'Status' }))
    expect(await screen.findByText('Away')).toBeInTheDocument()
  })

  it('marks the trigger as the thing that opens it', async () => {
    const user = userEvent.setup()
    render(<Popover trigger={<Button>Status</Button>}>Away</Popover>)
    const trigger = screen.getByRole('button', { name: 'Status' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
  })

  /**
   * The point of a popover: the page behind it keeps working. A status picker
   * that froze the page every time it opened would be a modal wearing a
   * smaller panel.
   */
  describe('non-modal', () => {
    it('does not lock page scrolling', async () => {
      const user = userEvent.setup()
      render(<Popover trigger={<Button>Status</Button>} defaultOpen>Away</Popover>)
      await screen.findByText('Away')

      expect(document.body).not.toHaveAttribute('data-scroll-locked')
      await user.keyboard('{Escape}')
    })

    it('leaves the rest of the page visible to assistive technology', async () => {
      const { container } = render(
        <>
          <main>Behind</main>
          <Popover trigger={<Button>Status</Button>} defaultOpen>
            Away
          </Popover>
        </>,
      )
      await screen.findByText('Away')
      expect(container).not.toHaveAttribute('aria-hidden')
      expect(screen.getByText('Behind')).toBeInTheDocument()
    })
  })

  describe('dismissal', () => {
    it('closes on Escape', async () => {
      const user = userEvent.setup()
      render(<Popover trigger={<Button>Status</Button>} defaultOpen>Away</Popover>)
      await screen.findByText('Away')

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByText('Away')).not.toBeInTheDocument())
    })

    it('closes on a click outside it', async () => {
      const user = userEvent.setup()
      render(
        <>
          <button type="button">Elsewhere</button>
          <Popover trigger={<Button>Status</Button>} defaultOpen>
            Away
          </Popover>
        </>,
      )
      await screen.findByText('Away')

      await user.click(screen.getByRole('button', { name: 'Elsewhere' }))
      await waitFor(() => expect(screen.queryByText('Away')).not.toBeInTheDocument())
    })

    it('stays open for a click inside it', async () => {
      const user = userEvent.setup()
      render(
        <Popover trigger={<Button>Status</Button>} defaultOpen>
          <button type="button">Set away</button>
        </Popover>,
      )
      const inside = await screen.findByRole('button', { name: 'Set away' })

      await user.click(inside)
      expect(screen.getByRole('button', { name: 'Set away' })).toBeInTheDocument()
    })

    it('returns focus to the trigger when it closes', async () => {
      const user = userEvent.setup()
      render(<Popover trigger={<Button>Status</Button>}>Away</Popover>)
      const trigger = screen.getByRole('button', { name: 'Status' })

      await user.click(trigger)
      await screen.findByText('Away')
      await user.keyboard('{Escape}')

      await waitFor(() => expect(trigger).toHaveFocus())
    })
  })

  describe('as a positioning base', () => {
    it('moves focus into the panel by default', async () => {
      const user = userEvent.setup()
      render(
        <Popover trigger={<Button>Status</Button>}>
          <button type="button">Set away</button>
        </Popover>,
      )
      await user.click(screen.getByRole('button', { name: 'Status' }))
      const panel = await screen.findByRole('dialog')

      await waitFor(() => expect(panel).toContainElement(document.activeElement as HTMLElement))
    })

    /**
     * What a combobox needs: the list opens below the input and the input
     * keeps the caret, so typing carries on and the arrow keys move a
     * highlight rather than moving focus.
     */
    it('can leave focus where it was', async () => {
      const user = userEvent.setup()
      render(
        <Popover trigger={<Button>Status</Button>} autoFocusContent={false}>
          <button type="button">Set away</button>
        </Popover>,
      )
      const trigger = screen.getByRole('button', { name: 'Status' })

      await user.click(trigger)
      await screen.findByRole('button', { name: 'Set away' })

      expect(trigger).toHaveFocus()
    })

    it('wraps content in a padded card body by default', async () => {
      render(<Popover trigger={<Button>Status</Button>} defaultOpen>Away</Popover>)
      const panel = await screen.findByRole('dialog')

      expect(panel).toHaveClass('card')
      expect(panel.querySelector('.card-body')).toBeInTheDocument()
    })

    it('renders content flush when the content supplies its own padding', async () => {
      render(
        <Popover trigger={<Button>Status</Button>} defaultOpen padded={false}>
          Away
        </Popover>,
      )
      const panel = await screen.findByRole('dialog')

      expect(panel.querySelector('.card-body')).not.toBeInTheDocument()
      expect(panel).toHaveTextContent('Away')
    })

    it.each([
      ['auto', 'w-auto'],
      ['sm', 'w-56'],
      ['md', 'w-72'],
      ['lg', 'w-96'],
    ] as const)('writes the width class for %s out in full', async (width, expected) => {
      render(
        <Popover trigger={<Button>Status</Button>} defaultOpen width={width}>
          Away
        </Popover>,
      )
      expect(await screen.findByRole('dialog')).toHaveClass(expected)
    })

    /**
     * A combobox list has to be exactly as wide as its input, and the input's
     * width belongs to the app. Radix measures the trigger and publishes it as
     * a custom property, which is the only way to say that in a static class.
     */
    it('can match the width of its trigger', async () => {
      render(
        <Popover trigger={<Button>Status</Button>} defaultOpen width="trigger">
          Away
        </Popover>,
      )
      expect(await screen.findByRole('dialog')).toHaveClass(
        'w-[var(--radix-popover-trigger-width)]',
      )
    })

    it('keeps consumer class names alongside its own', async () => {
      render(
        <Popover trigger={<Button>Status</Button>} defaultOpen className="max-h-96">
          Away
        </Popover>,
      )
      expect(await screen.findByRole('dialog')).toHaveClass('card', 'max-h-96')
    })
  })

  describe('Popover.Close', () => {
    it('closes the popover it sits inside', async () => {
      const user = userEvent.setup()
      render(
        <Popover trigger={<Button>Status</Button>} defaultOpen>
          <Popover.Close>
            <Button variant="ghost">Done</Button>
          </Popover.Close>
        </Popover>,
      )
      await user.click(await screen.findByRole('button', { name: 'Done' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })
  })
})
