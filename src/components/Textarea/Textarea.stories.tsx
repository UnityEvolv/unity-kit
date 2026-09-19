import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './Textarea'

const meta = {
  title: 'Forms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    rows: { control: 'number' },
    label: { control: 'text' },
    help: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Agenda', placeholder: 'What are we covering?' },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Filled: Story = {
  args: { defaultValue: 'Roadmap, then a look at last week’s numbers.' },
}

export const WithHelp: Story = { args: { help: 'Everyone invited can read this.' } }

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Locked once sent.' } }

export const WithError: Story = { args: { error: 'Say something about the meeting.' } }

export const Taller: Story = { args: { rows: 8 } }

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Textarea key={size} {...args} size={size} label={size} rows={2} />
      ))}
    </div>
  ),
}
