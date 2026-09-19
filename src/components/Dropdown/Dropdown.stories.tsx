import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dropdown } from './Dropdown'
import { Button } from '../Button'

const meta = {
  title: 'Overlays/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
  args: { side: 'bottom', align: 'start' },
} satisfies Meta<typeof Dropdown>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { trigger: <Button variant="secondary" icon="more" iconPosition="end">Actions</Button> },
  render: (args) => (
    <Dropdown {...args}>
      <Dropdown.Item icon="edit">Rename</Dropdown.Item>
      <Dropdown.Item icon="copy">Duplicate</Dropdown.Item>
      <Dropdown.Item icon="external-link">Open in new tab</Dropdown.Item>
      <Dropdown.Separator />
      <Dropdown.Item icon="trash" variant="danger">
        Delete
      </Dropdown.Item>
    </Dropdown>
  ),
}

/**
 * **Drive this one from the keyboard and never touch the mouse.**
 *
 * 1. `Tab` to the trigger.
 * 2. `Enter`, `Space` or `↓` opens the menu and highlights the first item.
 * 3. `↓` and `↑` move between items and skip the separator and the heading.
 *    Typing a letter jumps to the next item starting with it.
 * 4. `Enter` picks the highlighted item — watch the line below change.
 * 5. `Escape` closes the menu and returns focus to the trigger.
 *
 * Radix marks the highlighted item with `data-highlighted`, which is the same
 * state whether it was reached by arrow key or by cursor — so keyboard and
 * mouse cannot drift apart.
 */
export const KeyboardOnly: Story = {
  args: { trigger: <Button>Room actions</Button> },
  render: (args) => {
    function Example() {
      const [chosen, setChosen] = useState('nothing yet')
      return (
        <div className="flex flex-col items-start gap-4">
          <Dropdown {...args}>
            <Dropdown.Label>Room</Dropdown.Label>
            <Dropdown.Item icon="edit" hint="⌘R" onSelect={() => setChosen('Rename')}>
              Rename
            </Dropdown.Item>
            <Dropdown.Item icon="copy" hint="⌘D" onSelect={() => setChosen('Duplicate')}>
              Duplicate
            </Dropdown.Item>
            <Dropdown.Item icon="lock" onSelect={() => setChosen('Lock')}>
              Lock room
            </Dropdown.Item>
            <Dropdown.Separator />
            <Dropdown.Item icon="trash" variant="danger" onSelect={() => setChosen('Delete')}>
              Delete
            </Dropdown.Item>
          </Dropdown>
          <p className="text-sm text-muted">Chosen: {chosen}</p>
        </div>
      )
    }
    return <Example />
  },
}

/** A disabled item is skipped by the arrow keys and cannot be picked. */
export const WithDisabledItem: Story = {
  args: { trigger: <Button variant="secondary">Actions</Button> },
  render: (args) => (
    <Dropdown {...args}>
      <Dropdown.Item icon="edit">Rename</Dropdown.Item>
      <Dropdown.Item icon="share" disabled>
        Share (needs a paid plan)
      </Dropdown.Item>
      <Dropdown.Item icon="copy">Duplicate</Dropdown.Item>
    </Dropdown>
  ),
}

/**
 * Where the menu opens from. It flips and shifts on its own when a viewport
 * edge is in the way, which is the part daisyUI's CSS-only dropdown cannot do.
 */
export const Placement: Story = {
  args: { trigger: undefined },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Dropdown
          {...args}
          key={side}
          side={side}
          trigger={<Button variant="secondary">{side}</Button>}
        >
          <Dropdown.Item icon="edit">Rename</Dropdown.Item>
          <Dropdown.Item icon="copy">Duplicate</Dropdown.Item>
        </Dropdown>
      ))}
    </div>
  ),
}

/** An icon-only trigger still needs its own label; the menu does not supply one. */
export const IconTrigger: Story = {
  args: { trigger: <Button variant="ghost" icon="more" aria-label="Room actions" />, align: 'end' },
  render: (args) => (
    <div className="flex justify-end">
      <Dropdown {...args}>
        <Dropdown.Item icon="edit">Rename</Dropdown.Item>
        <Dropdown.Separator />
        <Dropdown.Item icon="trash" variant="danger">
          Delete
        </Dropdown.Item>
      </Dropdown>
    </div>
  ),
}
