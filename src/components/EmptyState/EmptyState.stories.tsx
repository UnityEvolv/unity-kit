import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState } from './EmptyState'
import { Button } from '../Button'
import { iconNames } from '../Icon'

const meta = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'select', options: [undefined, ...iconNames] },
    titleAs: { control: 'inline-radio', options: ['p', 'h2', 'h3', 'h4'] },
    title: { control: 'text' },
    description: { control: 'text' },
  },
  args: { title: 'No rooms yet' },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithIcon: Story = {
  args: { icon: 'office', description: 'Rooms you create will show up here.' },
}

/** The whole thing: what is missing, why, and the way out. */
export const WithAction: Story = {
  args: {
    icon: 'office',
    title: 'No rooms yet',
    description: 'Create a room and invite your team to join it.',
    action: <Button icon="plus">New room</Button>,
  },
}

/** Two ways out is the limit; a third is a menu. */
export const TwoActions: Story = {
  args: {
    icon: 'invite',
    title: 'Nobody here yet',
    description: 'Invite someone, or share the link to this office.',
    action: (
      <>
        <Button icon="invite">Invite people</Button>
        <Button variant="ghost" icon="share">
          Copy link
        </Button>
      </>
    ),
  },
}

/** A search that found nothing is an empty state, not an error. */
export const NoResults: Story = {
  args: {
    icon: 'search',
    title: 'No matches for "standup"',
    description: 'Check the spelling, or search a different room.',
    action: (
      <Button variant="ghost" icon="close">
        Clear search
      </Button>
    ),
  },
}

/**
 * Where it actually lives: inside the panel whose content is missing. The
 * title is a paragraph by default, because heading level depends on the page
 * — pass `titleAs` when the panel is a section of its own.
 */
export const InContext: Story = {
  render: (args) => (
    <div className="w-[28rem] overflow-hidden rounded-box border border-base-300">
      <div className="border-b border-base-300 px-4 py-3 text-sm font-semibold">Recordings</div>
      <EmptyState
        {...args}
        icon="record"
        title="No recordings"
        titleAs="h3"
        description="Recordings from your meetings will appear here for 30 days."
      />
    </div>
  ),
}
