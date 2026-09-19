import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from './Spinner'

const meta = {
  title: 'Feedback/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    label: { control: 'text' },
    block: { control: 'boolean' },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Spinner key={size} {...args} size={size} label={size} />
      ))}
    </div>
  ),
}

/**
 * The label is what a screen reader reads when the spinner appears. Without
 * one it still reads "Loading" — the word is there either way, and only its
 * visibility changes.
 */
export const WithLabel: Story = {
  args: { label: 'Joining the office' },
}

/** Inline, in a sentence, which is where a spinner usually ends up. */
export const Inline: Story = {
  render: (args) => (
    <p className="text-sm">
      Saving your changes <Spinner {...args} size="xs" /> — this will only take a moment.
    </p>
  ),
}

/** Block mode centres it, for a panel or a page that has nothing else in it yet. */
export const Block: Story = {
  render: (args) => (
    <div className="w-96 rounded-box border border-base-300">
      <Spinner {...args} block label="Loading rooms" />
    </div>
  ),
}

/** It inherits `currentColor`, so it takes the colour of whatever it sits in. */
export const OnColour: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      <span className="text-primary">
        <Spinner {...args} />
      </span>
      <span className="text-secondary">
        <Spinner {...args} />
      </span>
      <span className="text-muted">
        <Spinner {...args} />
      </span>
      <div className="rounded-box bg-primary px-6 py-3 text-primary-content">
        <Spinner {...args} />
      </div>
    </div>
  ),
}
