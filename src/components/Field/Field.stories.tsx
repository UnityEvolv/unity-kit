import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field } from './Field'
import { Input } from '../Input'
import { Checkbox } from '../Checkbox'

const meta = {
  title: 'Forms/Field',
  component: Field,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    orientation: { control: 'inline-radio', options: ['stacked', 'inline'] },
    as: { control: 'inline-radio', options: ['div', 'fieldset'] },
    label: { control: 'text' },
    help: { control: 'text' },
    error: { control: 'text' },
  },
  args: { label: 'Email', children: <input className="input w-full" /> },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Every control in the kit already renders through this, so it is rarely
 * used directly. Reach for it when wrapping a control the kit does not ship.
 */
export const AroundAnyControl: Story = {
  args: { help: 'We only use it to send the invite.' },
  render: (args) => (
    <Field {...args}>
      {(control) => (
        <input type="email" className="input w-full" placeholder="you@example.com" {...control} />
      )}
    </Field>
  ),
}

/** The wiring is the point: one prop, four things wired. */
export const Error: Story = {
  args: { error: 'That address is already in use.', help: 'We only use it to send the invite.' },
  render: (args) => (
    <Field {...args}>{(control) => <input type="email" className="input w-full" {...control} />}</Field>
  ),
}

/** A group of controls needs a legend, which is what `as="fieldset"` gives it. */
export const AsAFieldset: Story = {
  args: { as: 'fieldset', label: 'Notify me about', help: 'You can change this later.' },
  render: (args) => (
    <Field {...args}>
      <Checkbox label="Mentions" defaultChecked />
      <Checkbox label="Direct messages" />
    </Field>
  ),
}

/** Disabling the fieldset disables everything in it, without a prop each. */
export const FieldsetDisabled: Story = {
  args: { as: 'fieldset', label: 'Managed settings', disabled: true },
  render: (args) => (
    <Field {...args}>
      <Input label="Workspace" defaultValue="UnityEvolv" />
      <Checkbox label="Allow guests" defaultChecked />
    </Field>
  ),
}
