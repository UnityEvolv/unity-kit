import type { Meta, StoryObj } from '@storybook/react-vite'
import { Radio } from './Radio'
import { Field } from '../Field'

const meta = {
  title: 'Forms/Radio',
  component: Radio,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    label: { control: 'text' },
    help: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: { name: 'notify', value: 'all', label: 'Everything' },
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Checked: Story = { args: { defaultChecked: true } }

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } }

export const WithError: Story = { args: { error: 'Pick one to continue.' } }

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Radio key={size} {...args} name={`size-${size}`} size={size} label={size} />
      ))}
    </div>
  ),
}

/**
 * How a radio is actually used. The legend names the question and the radios
 * answer it — without it a screen reader reads three unrelated options and
 * never says what they are options for.
 */
export const AsAGroup: Story = {
  render: () => (
    <Field as="fieldset" label="Notify me about" help="You can change this later.">
      <Radio name="notify" value="all" label="Everything" defaultChecked />
      <Radio name="notify" value="mentions" label="Mentions only" />
      <Radio name="notify" value="none" label="Nothing" />
    </Field>
  ),
}

export const GroupDisabled: Story = {
  render: () => (
    <Field as="fieldset" label="Notify me about" disabled help="Managed by your administrator.">
      <Radio name="managed" value="all" label="Everything" defaultChecked />
      <Radio name="managed" value="none" label="Nothing" />
    </Field>
  ),
}
