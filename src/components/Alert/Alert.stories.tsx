import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert } from './Alert'
import type { AlertProps, AlertVariant } from './Alert'
import { Button } from '../Button'
import { iconNames } from '../Icon'

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['info', 'ok', 'warn', 'danger'],
      description: 'The kit’s names, not daisyUI’s. Each brings its own icon and urgency.',
    },
    banner: { control: 'boolean' },
    showIcon: { control: 'boolean' },
    icon: { control: 'select', options: [undefined, ...iconNames] },
    title: { control: 'text' },
    onDismiss: { control: false },
    action: { control: false },
  },
  args: { children: 'Your recording will be deleted after 30 days.' },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

const variants: AlertVariant[] = ['info', 'ok', 'warn', 'danger']

export const Default: Story = {}

/** Check this one in both themes; it is the fastest way to spot a token regression. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex w-[34rem] flex-col gap-3">
      {variants.map((variant) => (
        <Alert key={variant} {...args} variant={variant}>
          {variant} — every variant draws its own glyph, so the colour is not doing the work
          alone.
        </Alert>
      ))}
    </div>
  ),
}

/** A title turns a sentence into a notice with a subject. */
export const WithTitle: Story = {
  args: {
    variant: 'warn',
    title: 'Storage almost full',
    children: 'Recordings older than 30 days will be removed to make room.',
  },
}

export const WithoutIcon: Story = {
  args: { showIcon: false, children: 'A notice that is all words.' },
}

/** Any icon from the kit replaces the variant’s own. */
export const CustomIcon: Story = {
  args: { variant: 'ok', icon: 'record', children: 'Recording started.' },
}

export const WithAction: Story = {
  args: {
    variant: 'warn',
    title: 'Storage almost full',
    children: 'You are using 96% of your plan.',
    action: (
      <Button size="sm" variant="secondary">
        Upgrade
      </Button>
    ),
  },
}

export const WithTitleActionAndDismiss: Story = {
  args: {
    variant: 'danger',
    title: 'Could not join the office',
    children: 'The room is full. Try again in a moment, or ask the host for a seat.',
    action: (
      <Button size="sm" variant="danger">
        Retry
      </Button>
    ),
    onDismiss: () => {},
  },
}

/**
 * **The kit does not remember dismissals.** `onDismiss` fires and nothing
 * else happens — whether the notice comes back on the next page load is the
 * app’s decision, and the kit has no way to know the right answer.
 */
function DismissibleExample(args: AlertProps) {
  const [shown, setShown] = useState(true)

  return (
    <div className="flex w-[34rem] flex-col gap-3">
      {shown ? (
        <Alert {...args} variant="info" onDismiss={() => setShown(false)}>
          The office closes at 18:00 today.
        </Alert>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setShown(true)}>
          Bring it back
        </Button>
      )}
    </div>
  )
}

export const Dismissible: Story = {
  render: (args) => <DismissibleExample {...args} />,
}

/** Full width, square corners: the top of a page, above everything else. */
export const AsBanner: Story = {
  render: (args) => (
    <div className="w-[40rem] overflow-hidden rounded-box border border-base-300">
      <Alert {...args} banner variant="warn" onDismiss={() => {}}>
        Scheduled maintenance tonight from 22:00 to 23:00 UTC.
      </Alert>
      <div className="p-6 text-sm text-muted">The page underneath, unaffected.</div>
    </div>
  ),
}

/** Every variant as a banner, stacked the way an app actually shows them. */
export const BannerStack: Story = {
  render: (args) => (
    <div className="w-[40rem] overflow-hidden rounded-box border border-base-300">
      {variants.map((variant) => (
        <Alert key={variant} {...args} banner variant={variant}>
          A {variant} banner.
        </Alert>
      ))}
      <div className="p-6 text-sm text-muted">The page underneath.</div>
    </div>
  ),
}
