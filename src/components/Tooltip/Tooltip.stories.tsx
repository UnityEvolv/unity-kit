import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tooltip, TooltipProvider } from './Tooltip'
import { Button } from '../Button'

const meta = {
  title: 'Overlays/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    delayDuration: { control: { type: 'number', min: 0, step: 100 } },
  },
  args: {
    content: 'Mute your microphone',
    side: 'top',
    align: 'center',
    // `children` is the control the tooltip describes, and it is required, so
    // the default lives here rather than being repeated in every story.
    children: <Button icon="mic" aria-label="Microphone" />,
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <Button icon="mic" aria-label="Microphone" />
    </Tooltip>
  ),
}

/**
 * **Drive this one from the keyboard and never touch the mouse.**
 *
 * 1. `Tab` along the toolbar. Each button shows its tooltip the moment it
 *    takes focus — no hover required.
 * 2. `Escape` dismisses the one that is showing without moving focus.
 *
 * A tooltip is never the only label. Every button here also carries its own
 * `aria-label`, which is what a screen reader announces and what a touch user
 * relies on; the tooltip is a second, visual copy for people using a pointer
 * or a keyboard.
 */
export const KeyboardOnly: Story = {
  render: (args) => (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col items-start gap-4">
        <div className="flex gap-2 rounded-box border border-base-300 bg-base-100 p-2">
          {(
            [
              ['mic', 'Mute'],
              ['video', 'Stop video'],
              ['share', 'Share your screen'],
              ['reactions', 'React'],
              ['users', 'Participants'],
              ['leave-call', 'Leave the call'],
            ] as const
          ).map(([icon, label]) => (
            <Tooltip {...args} key={label} content={label}>
              <Button variant="ghost" icon={icon} aria-label={label} />
            </Tooltip>
          ))}
        </div>
        <p className="max-w-prose text-sm text-muted">
          One <code>TooltipProvider</code> wraps the toolbar, so the first tooltip waits and moving
          straight to the next one skips the wait.
        </p>
      </div>
    </TooltipProvider>
  ),
}

/** Where the bubble sits. It moves away from a viewport edge on its own. */
export const Placement: Story = {
  render: (args) => (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-wrap gap-8 p-8">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Tooltip {...args} key={side} side={side} content={`Anchored ${side}`}>
            <Button variant="secondary">{side}</Button>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
}

/**
 * A lone tooltip needs no setup: it mounts the provider it needs when there is
 * not one above it, and defers to an app-level provider when there is.
 */
export const WithoutAProvider: Story = {
  args: { content: 'No provider above this one' },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary">Hover or focus me</Button>
    </Tooltip>
  ),
}

/** Longer text wraps rather than stretching off the screen. */
export const LongText: Story = {
  args: {
    content: 'Screen sharing is unavailable while someone else is presenting to the room.',
  },
  render: (args) => (
    <Tooltip {...args}>
      {/* Not `disabled`: a disabled button fires no pointer events and takes
          no focus, so its tooltip can never open. A control that needs to
          explain why it is unavailable has to stay enabled and refuse the
          action instead. */}
      <Button variant="ghost" icon="share" aria-label="Share your screen" />
    </Tooltip>
  ),
}
