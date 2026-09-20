import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Drawer } from './Drawer'
import { Button } from '../Button'

/**
 * A drawer is the same Radix dialog as `Modal`, so the focus and dismissal
 * tests here are deliberately thin — the behaviour is proven in Modal.test.tsx
 * and what is worth checking twice is that a drawer really did inherit it. The
 * rest of the file is about what is specific to a drawer: which edge it is
 * anchored to, and a body that scrolls between a fixed header and footer.
 */

const boxIn = (container: HTMLElement) =>
  container.ownerDocument.querySelector('.modal-box') as HTMLElement

const overlayIn = (container: HTMLElement) =>
  container.ownerDocument.querySelector('.modal') as HTMLElement

describe('Drawer', () => {
  it('renders nothing until it is opened', () => {
    render(<Drawer title="Filters" trigger={<Button>Open</Button>} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens from its trigger', async () => {
    const user = userEvent.setup()
    render(<Drawer title="Filters" trigger={<Button>Open</Button>} />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('names the dialog with its title', () => {
    render(<Drawer title="Filters" defaultOpen />)
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Filters')
  })

  it('leaves no dangling description id when there is no description', () => {
    render(<Drawer title="Filters" defaultOpen />)
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby')
  })

  describe('dismissal', () => {
    it('closes on Escape', async () => {
      const user = userEvent.setup()
      render(<Drawer title="Filters" defaultOpen />)
      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    it('closes on an overlay click', async () => {
      const user = userEvent.setup()
      const { container } = render(<Drawer title="Filters" defaultOpen />)
      await user.click(overlayIn(container))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    it('can refuse an overlay click while still closing on Escape', async () => {
      const user = userEvent.setup()
      const { container } = render(<Drawer title="Filters" defaultOpen dismissible={false} />)

      await user.click(overlayIn(container))
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })
  })

  it('returns focus to the trigger when it closes', async () => {
    const user = userEvent.setup()
    render(<Drawer title="Filters" trigger={<Button>Open</Button>} />)
    const trigger = screen.getByRole('button', { name: 'Open' })

    await user.click(trigger)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('locks page scrolling while open', async () => {
    render(<Drawer title="Filters" defaultOpen />)
    await waitFor(() => expect(document.body).toHaveAttribute('data-scroll-locked'))
  })

  /**
   * daisyUI's edge sheets are `modal-start` / `modal-end` / `modal-top` /
   * `modal-bottom`, not `.drawer`: that class is revealed by
   * `.drawer-toggle:checked ~ .drawer-side`, a selector that can never match
   * when Radix is the thing deciding whether the panel exists.
   */
  describe('anchoring', () => {
    it.each([
      ['start', 'modal-start'],
      ['end', 'modal-end'],
      ['top', 'modal-top'],
      ['bottom', 'modal-bottom'],
    ] as const)('writes the class for side %s out in full', (side, expected) => {
      const { container } = render(<Drawer title="Filters" defaultOpen side={side} />)
      expect(overlayIn(container)).toHaveClass('modal', 'modal-open', expected)
    })

    it('defaults to the end edge', () => {
      const { container } = render(<Drawer title="Filters" defaultOpen />)
      expect(overlayIn(container)).toHaveClass('modal-end')
    })

    it('puts the panel directly inside the open overlay', () => {
      const { container } = render(<Drawer title="Filters" defaultOpen />)
      expect(boxIn(container).parentElement).toHaveClass('modal', 'modal-open')
    })

    it.each([
      ['sm', 'max-w-xs'],
      ['md', 'max-w-sm'],
      ['lg', 'max-w-md'],
    ] as const)('writes the width class for size %s out in full', (size, expected) => {
      const { container } = render(<Drawer title="Filters" defaultOpen size={size} />)
      expect(boxIn(container)).toHaveClass(expected)
    })

    /**
     * A bottom sheet is as wide as the screen and as tall as its content, so a
     * width cap would only fight daisyUI's own sizing.
     */
    it('ignores size for a bottom sheet', () => {
      const { container } = render(<Drawer title="Filters" defaultOpen side="bottom" size="sm" />)
      expect(boxIn(container)).not.toHaveClass('max-w-xs')
      expect(boxIn(container)).toHaveClass('w-full')
    })
  })

  it('keeps consumer class names alongside its own', () => {
    const { container } = render(<Drawer title="Filters" defaultOpen className="max-h-96" />)
    expect(boxIn(container)).toHaveClass('modal-box', 'max-h-96')
  })

  it('renders its footer', () => {
    render(<Drawer title="Filters" defaultOpen footer={<Button>Apply</Button>} />)
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })

  describe('Drawer.Close', () => {
    it('closes the drawer it sits inside', async () => {
      const user = userEvent.setup()
      render(
        <Drawer
          title="Filters"
          defaultOpen
          footer={
            <Drawer.Close>
              <Button variant="ghost">Cancel</Button>
            </Drawer.Close>
          }
        />,
      )
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })
  })
})
