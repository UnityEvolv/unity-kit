import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress } from './Progress'
import type { ProgressVariant } from './Progress'

const meta = {
  title: 'Feedback/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    max: { control: 'number' },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'danger', 'ok', 'warn', 'info'],
    },
    label: { control: 'text' },
    showValue: { control: 'boolean' },
  },
  args: { value: 40 },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

const variants: ProgressVariant[] = ['primary', 'secondary', 'danger', 'ok', 'warn', 'info']

export const Default: Story = {}

export const WithLabel: Story = {
  args: { label: 'Uploading recording', showValue: true },
}

/**
 * Omitting `value` is what makes it indeterminate — in the platform and in
 * daisyUI's animation alike. There is no separate `indeterminate` prop,
 * because two ways of saying the same thing eventually disagree.
 */
export const Indeterminate: Story = {
  args: { value: undefined, label: 'Importing', showValue: true },
}

/** Check this one in both themes; it is the fastest way to spot a token regression. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {variants.map((variant) => (
        <Progress key={variant} {...args} variant={variant} label={variant} showValue />
      ))}
    </div>
  ),
}

/** `max` is whatever the work is counted in; the label still reads as a percentage. */
export const CountingSteps: Story = {
  args: { value: 3, max: 7, label: 'Step 3 of 7', showValue: true },
}

/**
 * A quota is the case for the status colours: the same bar changes meaning as
 * it fills, and the colour is what says so before the number is read.
 */
export const Quota: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Progress {...args} value={18} variant="ok" label="Storage" showValue />
      <Progress {...args} value={74} variant="warn" label="Storage" showValue />
      <Progress {...args} value={96} variant="danger" label="Storage" showValue />
    </div>
  ),
}
