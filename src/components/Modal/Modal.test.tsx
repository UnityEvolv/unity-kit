import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'
import { Button } from '../Button'

/**
 * These tests are about the four things a dialog has to get right — focus
 * trapped, focus returned, Escape, and the page behind it frozen — because
 * those are the reason the component exists at all. The rest of the file
 * guards the markup contract with daisyUI, which is silent when broken: a
 * `.modal-box` that is not a direct child of `.modal.modal-open` renders at
 * `opacity: 0` with no error anywhere.
 */

const overlayIn = (container: HTMLElement) =>
  container.ownerDocument.querySelector('.modal') as HTMLElement

const boxIn = (container: HTMLElement) =>
  container.ownerDocument.querySelector('.modal-box') as HTMLElement

describe('Modal', () => {
  it('renders nothing until it is opened', () => {
    render(<Modal title="Delete room" trigger={<Button>Delete</Button>} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens from its trigger', async () => {
    const user = userEvent.setup()
    render(<Modal title="Delete room" trigger={<Button>Delete</Button>} />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('opens without a trigger when told to', () => {
    render(<Modal title="Delete room" defaultOpen />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  describe('labelling', () => {
    it('names the dialog with its title', () => {
      render(<Modal title="Delete room" defaultOpen />)
      expect(screen.getByRole('dialog')).toHaveAccessibleName('Delete room')
    })

    it('describes the dialog with its description', () => {
      render(<Modal title="Delete room" description="This cannot be undone." defaultOpen />)
      expect(screen.getByRole('dialog')).toHaveAccessibleDescription('This cannot be undone.')
    })

    /**
     * Radix points `aria-describedby` at a description whether or not one was
     * rendered. Left alone, every modal without a description would ship a
     * dangling id — valid-looking markup that resolves to nothing.
     */
    it('leaves no dangling description id when there is no description', () => {
      render(<Modal title="Delete room" defaultOpen />)
      expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby')
    })

    it('labels the close button', () => {
      render(<Modal title="Delete room" defaultOpen />)
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('can be rendered without a close button', () => {
      render(<Modal title="Delete room" defaultOpen hideCloseButton />)
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    })
  })

  describe('dismissal', () => {
    it('closes on Escape', async () => {
      const user = userEvent.setup()
      render(<Modal title="Delete room" defaultOpen />)
      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    it('closes on an overlay click', async () => {
      const user = userEvent.setup()
      const { container } = render(<Modal title="Delete room" defaultOpen />)
      await user.click(overlayIn(container))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    it('closes from the close button', async () => {
      const user = userEvent.setup()
      render(<Modal title="Delete room" defaultOpen />)
      await user.click(screen.getByRole('button', { name: 'Close' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    it('reports every close through onOpenChange', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(<Modal title="Delete room" defaultOpen onOpenChange={onOpenChange} />)
      await user.keyboard('{Escape}')
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
    })

    /**
     * An in-flight submit or a destructive confirmation should survive a stray
     * click beside the panel — but never at the cost of trapping someone in a
     * dialog they cannot leave, so Escape keeps working.
     */
    it('can refuse an overlay click while still closing on Escape', async () => {
      const user = userEvent.setup()
      const { container } = render(<Modal title="Delete room" defaultOpen dismissible={false} />)

      await user.click(overlayIn(container))
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })
  })

  describe('focus', () => {
    it('moves focus into the dialog when it opens', async () => {
      const user = userEvent.setup()
      render(<Modal title="Delete room" trigger={<Button>Delete</Button>} />)
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      const dialog = await screen.findByRole('dialog')
      await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement))
    })

    it('returns focus to the trigger when it closes', async () => {
      const user = userEvent.setup()
      render(<Modal title="Delete room" trigger={<Button>Delete</Button>} />)
      const trigger = screen.getByRole('button', { name: 'Delete' })

      await user.click(trigger)
      await screen.findByRole('dialog')
      await user.keyboard('{Escape}')

      await waitFor(() => expect(trigger).toHaveFocus())
    })

    /**
     * The point of the trap: tabbing off the end of the dialog comes back to
     * the start rather than walking into the page behind, which is still in
     * the DOM and full of focusable controls.
     */
    it('keeps Tab inside the dialog', async () => {
      const user = userEvent.setup()
      render(
        <>
          <button type="button">Outside</button>
          <Modal
            title="Delete room"
            defaultOpen
            footer={
              <>
                <Button variant="ghost">Cancel</Button>
                <Button variant="danger">Delete</Button>
              </>
            }
          />
        </>,
      )

      const dialog = screen.getByRole('dialog')
      // `hidden: true` because the page behind an open dialog is already
      // `aria-hidden` — the button is still focusable, which is exactly the
      // thing the trap has to prevent.
      const outside = screen.getByRole('button', { name: 'Outside', hidden: true })

      for (let press = 0; press < 6; press += 1) {
        await user.tab()
        expect(dialog).toContainElement(document.activeElement as HTMLElement)
        expect(outside).not.toHaveFocus()
      }
    })
  })

  /**
   * Radix freezes the page behind the dialog through react-remove-scroll,
   * which marks the body rather than setting an inline style.
   */
  describe('the page behind', () => {
    it('locks page scrolling while open and releases it on close', async () => {
      const user = userEvent.setup()
      render(<Modal title="Delete room" defaultOpen />)

      await waitFor(() => expect(document.body).toHaveAttribute('data-scroll-locked'))

      await user.keyboard('{Escape}')
      await waitFor(() => expect(document.body).not.toHaveAttribute('data-scroll-locked'))
    })

    /**
     * Radix marks the dialog's siblings at the top of the body, not every node
     * inside them, so the assertion is on the render root rather than on the
     * `main` it contains. A screen reader walking the page finds the subtree
     * cut off at that point either way.
     */
    it('hides the rest of the page from assistive technology', async () => {
      const { container } = render(
        <>
          <main>Behind</main>
          <Modal title="Delete room" defaultOpen />
        </>,
      )
      await waitFor(() => expect(container).toHaveAttribute('aria-hidden', 'true'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  /**
   * daisyUI's panel is `opacity: 0; scale: .95` until it matches
   * `.modal.modal-open > .modal-box`. Break the nesting and the dialog is
   * present, focused and invisible — with nothing in the console to say why.
   */
  describe('daisyUI markup', () => {
    it('puts the panel directly inside an open modal overlay', () => {
      const { container } = render(<Modal title="Delete room" defaultOpen />)
      expect(boxIn(container).parentElement).toHaveClass('modal', 'modal-open')
    })

    it('lays actions out with modal-action', () => {
      const { container } = render(
        <Modal title="Delete room" defaultOpen footer={<Button>Delete</Button>} />,
      )
      expect(container.ownerDocument.querySelector('.modal-action')).toBeInTheDocument()
    })

    it.each([
      ['sm', 'max-w-sm'],
      ['md', 'max-w-lg'],
      ['lg', 'max-w-2xl'],
      ['xl', 'max-w-4xl'],
    ] as const)('writes the width class for size %s out in full', (size, expected) => {
      const { container } = render(<Modal title="Delete room" defaultOpen size={size} />)
      expect(boxIn(container)).toHaveClass(expected)
    })

    it('keeps consumer class names alongside its own', () => {
      const { container } = render(<Modal title="Delete room" defaultOpen className="max-h-96" />)
      expect(boxIn(container)).toHaveClass('modal-box', 'max-h-96')
    })
  })

  describe('Modal.Close', () => {
    it('closes a controlled modal without the consumer wiring it up', async () => {
      const user = userEvent.setup()

      function Controlled() {
        const [open, setOpen] = useState(true)
        return (
          <Modal
            title="Delete room"
            open={open}
            onOpenChange={setOpen}
            footer={
              <Modal.Close>
                <Button variant="ghost">Cancel</Button>
              </Modal.Close>
            }
          />
        )
      }

      render(<Controlled />)
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })
  })
})
