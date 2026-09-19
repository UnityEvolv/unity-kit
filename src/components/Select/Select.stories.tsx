import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from './Select'

const rooms = (
  <>
    <option value="standup">Standup</option>
    <option value="focus">Focus room</option>
    <option value="break">Break room</option>
  </>
)

const meta = {
  title: 'Forms/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    help: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Room', children: rooms },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * The placeholder is disabled so it cannot be chosen back — and the select
 * starts on it, which a disabled option alone does not do: the browser skips
 * disabled options when picking the first selection, so without an empty
 * starting value the user silently "answers" a question they never saw.
 */
export const WithPlaceholder: Story = { args: { placeholder: 'Choose a room' } }

export const Filled: Story = { args: { defaultValue: 'focus' } }

export const Disabled: Story = { args: { disabled: true, defaultValue: 'focus' } }

export const WithError: Story = {
  args: { placeholder: 'Choose a room', error: 'Pick a room to continue.' },
}

export const WithHelp: Story = {
  args: { placeholder: 'Choose a room', help: 'You can move rooms once you are in.' },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Select key={size} {...args} size={size} label={size} />
      ))}
    </div>
  ),
}
