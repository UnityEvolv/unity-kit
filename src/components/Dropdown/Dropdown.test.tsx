import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Dropdown } from './Dropdown'
import { Button } from '../Button'

/**
 * A menu is the one overlay whose keyboard contract is more than "open and
 * close": arrow keys move between items, Enter and Space pick one, Escape
 * closes and hands focus back. All of that is Radix's, and all of it is worth
 * a test here, because a menu that only works with a mouse looks perfectly
 * fine in a screenshot.
 */

const menu = (
  <Dropdown trigger={<Button>Actions</Button>}>
    <Dropdown.Label>Room</Dropdown.Label>
    <Dropdown.Item icon="edit" onSelect={() => {}}>
      Rename
    </Dropdown.Item>
    <Dropdown.Item icon="copy" onSelect={() => {}}>
      Duplicate
    </Dropdown.Item>
    <Dropdown.Separator />
    <Dropdown.Item icon="trash" variant="danger" onSelect={() => {}}>
      Delete
    </Dropdown.Item>
  </Dropdown>
)

const openWithMouse = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Actions' }))
  return screen.findByRole('menu')
}

describe('Dropdown', () => {
  it('renders nothing until it is opened', () => {
    render(menu)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens from its trigger', async () => {
    const user = userEvent.setup()
    render(menu)
    expect(await openWithMouse(user)).toBeInTheDocument()
  })

  it('marks the trigger as the thing that opens it', async () => {
    const user = userEvent.setup()
    render(menu)
    const trigger = screen.getByRole('button', { name: 'Actions' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await openWithMouse(user)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('gives every action the menuitem role', async () => {
    const user = userEvent.setup()
    render(menu)
    await openWithMouse(user)
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      'Rename',
      'Duplicate',
      'Delete',
    ])
  })

  it('marks a separator as one rather than as an empty action', async () => {
    const user = userEvent.setup()
    render(menu)
    await openWithMouse(user)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  describe('keyboard', () => {
    it('opens from the trigger and highlights the first item', async () => {
      const user = userEvent.setup()
      render(menu)

      await user.tab()
      expect(screen.getByRole('button', { name: 'Actions' })).toHaveFocus()

      await user.keyboard('{Enter}')
      await screen.findByRole('menu')
      await waitFor(() =>
        expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus(),
      )
    })

    it('moves between items with the arrow keys', async () => {
      const user = userEvent.setup()
      render(menu)

      await user.tab()
      await user.keyboard('{ArrowDown}')
      await screen.findByRole('menu')
      await waitFor(() =>
        expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus(),
      )

      await user.keyboard('{ArrowDown}')
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus()
    })

    it('picks the highlighted item with Enter', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <Dropdown trigger={<Button>Actions</Button>}>
          <Dropdown.Item onSelect={onSelect}>Rename</Dropdown.Item>
        </Dropdown>,
      )

      await user.tab()
      await user.keyboard('{Enter}')
      await screen.findByRole('menu')
      await user.keyboard('{Enter}')

      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('closes on Escape and hands focus back to the trigger', async () => {
      const user = userEvent.setup()
      render(menu)
      const trigger = screen.getByRole('button', { name: 'Actions' })

      await openWithMouse(user)
      await user.keyboard('{Escape}')

      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
      expect(trigger).toHaveFocus()
    })
  })

  describe('items', () => {
    it('runs onSelect when an item is clicked', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <Dropdown trigger={<Button>Actions</Button>}>
          <Dropdown.Item onSelect={onSelect}>Rename</Dropdown.Item>
        </Dropdown>,
      )

      await openWithMouse(user)
      await user.click(screen.getByRole('menuitem', { name: 'Rename' }))

      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('closes the menu after a selection', async () => {
      const user = userEvent.setup()
      render(menu)
      await openWithMouse(user)
      await user.click(screen.getByRole('menuitem', { name: 'Rename' }))
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    })

    it('does not run a disabled item', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <Dropdown trigger={<Button>Actions</Button>}>
          <Dropdown.Item onSelect={onSelect} disabled>
            Rename
          </Dropdown.Item>
        </Dropdown>,
      )

      await openWithMouse(user)
      await user.click(screen.getByRole('menuitem', { name: 'Rename' }))

      expect(onSelect).not.toHaveBeenCalled()
    })

    it('keeps an item icon decorative, so the label is read once', async () => {
      const user = userEvent.setup()
      render(menu)
      await openWithMouse(user)
      const item = screen.getByRole('menuitem', { name: 'Rename' })
      expect(item.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders a hint beside the label', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown trigger={<Button>Actions</Button>}>
          <Dropdown.Item hint="⌘R">Rename</Dropdown.Item>
        </Dropdown>,
      )
      await openWithMouse(user)
      expect(screen.getByText('⌘R')).toBeInTheDocument()
    })
  })

  /**
   * `.menu` styles `li > *`, not a bare `div`, so the panel has to be a real
   * list or every item loses its padding, radius and row layout at once — with
   * no error to say so.
   */
  describe('daisyUI markup', () => {
    it('renders the panel as a menu list', async () => {
      const user = userEvent.setup()
      render(menu)
      const panel = await openWithMouse(user)
      expect(panel.tagName).toBe('UL')
      expect(panel).toHaveClass('menu')
    })

    it('wraps each item in a list item', async () => {
      const user = userEvent.setup()
      render(menu)
      await openWithMouse(user)
      expect(screen.getByRole('menuitem', { name: 'Rename' }).parentElement?.tagName).toBe('LI')
    })

    it('renders a separator as a valid child of the list', async () => {
      const user = userEvent.setup()
      render(menu)
      await openWithMouse(user)
      expect(screen.getByRole('separator').tagName).toBe('LI')
    })

    it('uses menu-title for a group heading', async () => {
      const user = userEvent.setup()
      render(menu)
      await openWithMouse(user)
      expect(screen.getByText('Room')).toHaveClass('menu-title')
    })

    it('keeps consumer class names alongside its own', async () => {
      const user = userEvent.setup()
      render(
        <Dropdown trigger={<Button>Actions</Button>} className="w-64">
          <Dropdown.Item>Rename</Dropdown.Item>
        </Dropdown>,
      )
      const panel = await openWithMouse(user)
      expect(panel).toHaveClass('menu', 'w-64')
    })
  })
})
