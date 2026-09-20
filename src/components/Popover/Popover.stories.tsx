import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Popover } from './Popover'
import { Button } from '../Button'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

const meta = {
  title: 'Overlays/Popover',
  component: Popover,
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    width: {
      control: 'inline-radio',
      options: ['auto', 'sm', 'md', 'lg', 'trigger'],
      description:
        'Width is a prop, not a `className`, because the kit does not merge Tailwind classes. `trigger` matches the control the panel hangs off — what a combobox needs.',
    },
    padded: {
      control: 'boolean',
      description: 'Off renders content flush, for a listbox or a calendar that pads itself.',
    },
    autoFocusContent: {
      control: 'boolean',
      description:
        'Off leaves focus where it was. A combobox needs this: its input keeps the caret while the list below is open.',
    },
  },
  args: { side: 'bottom', align: 'center', width: 'md', padded: true, autoFocusContent: true },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

const statuses: [IconName, string][] = [
  ['check', 'Available'],
  ['video', 'In a meeting'],
  ['lock', 'Focus'],
  ['break-room', 'Away'],
]

export const Default: Story = {
  args: { trigger: <Button variant="secondary">Set status</Button> },
  render: (args) => (
    <Popover {...args}>
      <p className="font-medium">Status</p>
      <p className="text-muted">Visible to everyone in your organisation.</p>
    </Popover>
  ),
}

/**
 * **Drive this one from the keyboard and never touch the mouse.**
 *
 * 1. `Tab` to the trigger, then `Enter` to open the panel.
 * 2. Focus moves into the panel. `Tab` through the four status buttons.
 * 3. `Enter` picks one and closes the panel.
 * 4. `Escape` also closes it, and either way focus returns to the trigger.
 *
 * Unlike `Modal`, the page behind stays scrollable and stays readable by a
 * screen reader — that is the whole difference, and it is why a status picker
 * is a popover rather than a dialog.
 */
export const KeyboardOnly: Story = {
  args: { trigger: undefined },
  render: (args) => {
    function Example() {
      const [status, setStatus] = useState('Available')
      return (
        <div className="flex flex-col items-start gap-4">
          <Popover {...args} trigger={<Button variant="secondary">Status: {status}</Button>}>
            <p className="font-medium">Set your status</p>
            <div className="flex flex-col gap-1">
              {statuses.map(([icon, label]) => (
                <Popover.Close key={label}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm justify-start"
                    onClick={() => setStatus(label)}
                  >
                    <Icon name={icon} size="sm" />
                    {label}
                  </button>
                </Popover.Close>
              ))}
            </div>
          </Popover>
          <p className="max-w-prose text-sm text-muted">
            The page behind a popover is never frozen. Scroll it while the panel is open.
          </p>
        </div>
      )
    }
    return <Example />
  },
}

/** A reaction palette: small, anchored, and gone as soon as one is picked. */
export const ReactionPalette: Story = {
  args: {
    trigger: <Button variant="ghost" icon="reactions" aria-label="React" />,
    width: 'auto',
    side: 'top',
  },
  render: (args) => (
    <Popover {...args}>
      <div className="flex gap-1">
        {['👍', '🎉', '😂', '❤️', '👀', '🙌'].map((emoji) => (
          <Popover.Close key={emoji}>
            <button type="button" className="btn btn-ghost btn-sm text-lg" aria-label={emoji}>
              {emoji}
            </button>
          </Popover.Close>
        ))}
      </div>
    </Popover>
  ),
}

/**
 * What `Combobox` (UKIT-13) and the date pickers (UKIT-20, UKIT-21) are built
 * on: the panel opens below the input, supplies its own padding, and leaves
 * the caret in the input so typing carries on uninterrupted.
 */
export const AsAComboboxBase: Story = {
  args: {
    trigger: <input className="input input-bordered" placeholder="Search rooms…" />,
    padded: false,
    autoFocusContent: false,
    align: 'start',
    // Exactly as wide as the input above it, measured by Radix.
    width: 'trigger',
    className: 'p-1',
  },
  render: (args) => (
    <Popover {...args}>
      <ul className="menu w-full">
        {['Reception', 'Break room', 'Focus room 1', 'Focus room 2'].map((room) => (
          <li key={room}>
            <button type="button">{room}</button>
          </li>
        ))}
      </ul>
    </Popover>
  ),
}

/** Where the panel opens from. It flips away from a viewport edge on its own. */
export const Placement: Story = {
  args: { trigger: undefined },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover
          {...args}
          key={side}
          side={side}
          trigger={<Button variant="secondary">{side}</Button>}
        >
          <p>Anchored to the {side} of its trigger.</p>
        </Popover>
      ))}
    </div>
  ),
}
