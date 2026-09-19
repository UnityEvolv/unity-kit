import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from './Checkbox'
import { Field } from '../Field'

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    label: { control: 'text' },
    help: { control: 'text' },
    error: { control: 'text' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Remember me' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Checked: Story = { args: { defaultChecked: true } }

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } }

export const WithHelp: Story = { args: { help: 'Only on this device.' } }

export const WithError: Story = {
  args: { label: 'Accept the terms', error: 'You have to accept them to continue.' },
}

/** Neither on nor off: a "select all" above a list where some rows are picked. */
export const Indeterminate: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2">
      <Checkbox {...args} label="Everyone" indeterminate />
      <div className="ml-6 flex flex-col gap-2">
        <Checkbox label="Sasha Kim" defaultChecked />
        <Checkbox label="Ana Ruiz" />
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Checkbox key={size} {...args} size={size} label={size} />
      ))}
    </div>
  ),
}

/** A set of checkboxes needs a name of its own, which is what a fieldset is for. */
export const AsAGroup: Story = {
  render: () => (
    <Field as="fieldset" label="Notify me about" help="You can change this later.">
      <Checkbox label="Mentions" defaultChecked />
      <Checkbox label="Direct messages" defaultChecked />
      <Checkbox label="Everything else" />
    </Field>
  ),
}
