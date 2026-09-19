import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './Input'

const meta = {
  title: 'Forms/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    label: { control: 'text' },
    help: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: { label: 'Room name', placeholder: 'Standup' },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Filled: Story = { args: { defaultValue: 'Monday standup' } }

export const WithHelp: Story = { args: { help: 'Shown to everyone who joins.' } }

export const Required: Story = { args: { required: true } }

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Monday standup' } }

/**
 * One prop shows the message, wires `aria-describedby`, sets `aria-invalid`
 * and turns the border red. There is no way to get three of the four.
 */
export const WithError: Story = {
  args: { defaultValue: 'x', error: 'Room names are at least three characters.' },
}

/** Help stays when there is an error: it is the rule, the error is the breach. */
export const HelpAndError: Story = {
  args: {
    defaultValue: 'x',
    help: 'Between 3 and 40 characters.',
    error: 'That is too short.',
  },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Input key={size} {...args} size={size} label={size} />
      ))}
    </div>
  ),
}

/** Nothing here knows about a form library; everything passes through. */
export const InAForm: Story = {
  render: () => (
    <form className="flex flex-col gap-4" noValidate>
      <Input label="Your name" name="name" required autoComplete="name" />
      <Input label="Email" name="email" type="email" required autoComplete="email" />
      <Input label="Invite code" name="code" help="Six characters, from the host." />
    </form>
  ),
}
