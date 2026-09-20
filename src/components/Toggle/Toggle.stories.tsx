import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toggle } from './Toggle'

const meta = {
  title: 'Forms/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    label: { control: 'text' },
    help: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Join muted' },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const On: Story = { args: { defaultChecked: true } }

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } }

export const WithHelp: Story = {
  args: { help: 'Takes effect the next time you join a room.' },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Toggle key={size} {...args} size={size} label={size} />
      ))}
    </div>
  ),
}

/**
 * Where a toggle belongs: a setting that takes effect as it is flipped. If
 * the answer is part of a form with a Save button, use `Checkbox` — a toggle
 * beside Save tells two different stories about when the change lands.
 */
export const Settings: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Toggle label="Join muted" defaultChecked />
      <Toggle label="Camera off on join" />
      <Toggle label="Knock before entering" help="People wait until you let them in." />
    </div>
  ),
}
