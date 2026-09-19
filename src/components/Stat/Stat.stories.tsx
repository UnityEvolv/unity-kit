import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stat } from './Stat'
import type { StatDirection } from './Stat'
import { StatGroup } from './StatGroup'
import { Card } from '../Card'
import { iconNames } from '../Icon'

const meta = {
  title: 'Primitives/Stat',
  component: Stat,
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'inline-radio',
      options: ['up', 'down', 'flat'],
      description: 'Chooses the arrow, and the colour unless tone overrides it.',
    },
    tone: {
      control: 'inline-radio',
      options: [undefined, 'positive', 'negative', 'neutral'],
      description: 'For a metric where up is bad news, or down is good.',
    },
    icon: { control: 'select', options: [undefined, ...iconNames] },
  },
  args: { label: 'Active rooms', value: '24' },
} satisfies Meta<typeof Stat>

export default meta
type Story = StoryObj<typeof meta>

const directions: StatDirection[] = ['up', 'down', 'flat']

export const Default: Story = {}

/** Check this in both themes; it is the fastest way to spot a token regression. */
export const Deltas: Story = {
  render: (args) => (
    <StatGroup>
      {directions.map((direction) => (
        <Stat
          key={direction}
          {...args}
          delta="+12%"
          direction={direction}
          description="since Monday"
        />
      ))}
    </StatGroup>
  ),
}

/**
 * Up is not always good news. A metric where rising is bad — dropped calls,
 * latency, cost — keeps the arrow pointing up and sets the tone to say the
 * number got worse.
 */
export const ToneOverridesDirection: Story = {
  render: () => (
    <StatGroup>
      <Stat label="Active rooms" value="24" delta="+12%" direction="up" />
      <Stat label="Dropped calls" value="18" delta="+4" direction="up" tone="negative" />
      <Stat label="Join time" value="1.2s" delta="-0.4s" direction="down" tone="positive" />
    </StatGroup>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <StatGroup>
      <Stat label="Rooms" value="24" icon="office" delta="+3" direction="up" />
      <Stat label="People in a call" value="112" icon="users" description="right now" />
      <Stat label="Locked" value="6" icon="lock" delta="0" direction="flat" />
    </StatGroup>
  ),
}

/**
 * daisyUI's stats grid flows in columns and scrolls rather than wrapping, so
 * `responsive` — the default — stacks below `sm` and sits in a row above it.
 * The other two pin it, for a sidebar that is always narrow or a strip that is
 * always wide. Drag the viewport to see the default change.
 */
export const Directions: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <StatGroup direction="responsive">
        <Stat label="Rooms" value="24" />
        <Stat label="In a call" value="112" />
      </StatGroup>
      <StatGroup direction="horizontal">
        <Stat label="Rooms" value="24" />
        <Stat label="In a call" value="112" />
      </StatGroup>
      <StatGroup direction="vertical">
        <Stat label="Rooms" value="24" />
        <Stat label="In a call" value="112" />
      </StatGroup>
    </div>
  ),
}

/**
 * A dashboard row: metrics across the top, then whatever the app wants to show
 * underneath. The chart is the app's — charts are deliberately not in the kit,
 * so one goes inside a Card the app renders itself.
 */
export const Dashboard: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-4">
      <StatGroup className="w-full border border-base-300">
        <Stat
          label="Active rooms"
          value="24"
          icon="office"
          delta="+12%"
          direction="up"
          description="since Monday"
        />
        <Stat
          label="People in a call"
          value="112"
          icon="users"
          delta="+8"
          direction="up"
          description="peak 140"
        />
        <Stat
          label="Dropped calls"
          value="18"
          icon="leave-call"
          delta="+4"
          direction="up"
          tone="negative"
          description="worth a look"
        />
        <Stat label="Join time" value="1.2s" icon="clock" delta="-0.4s" direction="down" tone="positive" />
      </StatGroup>
      <Card header={<h3>Calls this week</h3>}>
        <div className="flex h-40 items-center justify-center rounded-box bg-base-200 text-xs text-muted">
          the app renders its own chart here
        </div>
      </Card>
    </div>
  ),
}
