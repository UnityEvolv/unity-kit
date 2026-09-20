import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Modal } from './Modal'
import { Button } from '../Button'

const meta = {
  title: 'Overlays/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
    hideCloseButton: { control: 'boolean' },
    dismissible: {
      control: 'boolean',
      description:
        'Off stops an overlay click closing the dialog. Escape still closes it — a dialog that cannot be escaped is a trap.',
    },
  },
  args: {
    title: 'Delete room',
    description: 'Everyone in the room will be disconnected. This cannot be undone.',
    size: 'md',
  },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    trigger: <Button variant="danger">Delete room</Button>,
    footer: (
      <>
        <Modal.Close>
          <Button variant="ghost">Cancel</Button>
        </Modal.Close>
        <Modal.Close>
          <Button variant="danger">Delete</Button>
        </Modal.Close>
      </>
    ),
  },
}

/**
 * **Drive this one from the keyboard and never touch the mouse.**
 *
 * 1. `Tab` to the trigger, then `Enter` or `Space` to open it.
 * 2. Focus is now inside the dialog. `Tab` repeatedly — it cycles through the
 *    dialog's own controls and never reaches the buttons behind, which are
 *    still in the page but have been hidden from assistive technology.
 * 3. `Shift+Tab` walks the same loop backwards.
 * 4. `Escape` closes it, and focus lands back on the trigger you started from
 *    rather than at the top of the document.
 *
 * None of that is hand-rolled. The focus trap, the focus return and the scroll
 * lock are Radix's; daisyUI supplies the panel.
 */
export const KeyboardOnly: Story = {
  args: {
    title: 'Invite people',
    description: 'Tab around inside this dialog, then press Escape.',
    trigger: <Button>Invite people</Button>,
    footer: (
      <>
        <Modal.Close>
          <Button variant="ghost">Cancel</Button>
        </Modal.Close>
        <Modal.Close>
          <Button>Send invites</Button>
        </Modal.Close>
      </>
    ),
  },
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <p className="max-w-prose text-sm text-muted">
        The three buttons below sit outside the dialog. Once it is open, Tab can never reach them.
      </p>
      <Modal {...args}>
        <p>
          Anyone with the link can join. You can change this later from the room&rsquo;s settings.
        </p>
      </Modal>
      <div className="flex gap-2">
        <Button variant="ghost">Behind 1</Button>
        <Button variant="ghost">Behind 2</Button>
        <Button variant="ghost">Behind 3</Button>
      </div>
    </div>
  ),
}

/** The panel scrolls; the page behind it does not. */
export const LongContent: Story = {
  args: {
    title: 'Terms',
    description: undefined,
    trigger: <Button variant="secondary">Read the terms</Button>,
    className: 'max-h-96',
    footer: (
      <Modal.Close>
        <Button>Got it</Button>
      </Modal.Close>
    ),
  },
  render: (args) => (
    <Modal {...args}>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 20 }, (_, index) => (
          <p key={index}>
            Paragraph {index + 1}. Scroll inside the panel — the page behind it stays put.
          </p>
        ))}
      </div>
    </Modal>
  ),
}

export const Sizes: Story = {
  args: { trigger: undefined },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Modal
          {...args}
          key={size}
          size={size}
          title={`A ${size} modal`}
          trigger={<Button variant="secondary">{size}</Button>}
        >
          <p>daisyUI caps the panel at 32rem; each size states its own width in full.</p>
        </Modal>
      ))}
    </div>
  ),
}

/**
 * A destructive confirmation should survive a stray click beside the panel, so
 * `dismissible` is off here. Escape still works: the dialog is deliberate, not
 * inescapable.
 */
export const NotDismissible: Story = {
  args: {
    title: 'Leave the call?',
    description: 'Clicking outside will not close this. Press Escape or choose below.',
    dismissible: false,
    trigger: <Button variant="danger">Leave call</Button>,
    footer: (
      <>
        <Modal.Close>
          <Button variant="ghost">Stay</Button>
        </Modal.Close>
        <Modal.Close>
          <Button variant="danger">Leave</Button>
        </Modal.Close>
      </>
    ),
  },
}

/** Driving the open state from outside, for a modal opened by something else. */
export const Controlled: Story = {
  args: { trigger: undefined },
  render: (args) => {
    function Example() {
      const [open, setOpen] = useState(false)
      return (
        <div className="flex items-center gap-3">
          <Button onClick={() => setOpen(true)}>Open</Button>
          <span className="text-sm text-muted">open: {String(open)}</span>
          <Modal {...args} open={open} onOpenChange={setOpen} title="Controlled">
            <p>The parent holds the state; the modal only reports changes to it.</p>
          </Modal>
        </div>
      )
    }
    return <Example />
  },
}
