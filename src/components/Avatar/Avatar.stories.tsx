import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './Avatar'
import { AvatarGroup } from './AvatarGroup'
import type { AvatarSize, AvatarStatus } from './Avatar'

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    status: {
      control: 'inline-radio',
      options: [undefined, 'online', 'busy', 'away', 'offline'],
      description: 'The kit’s four. Consuming apps map their own states onto them.',
    },
    name: { control: 'text' },
    src: { control: 'text' },
    statusLabel: { control: 'text' },
  },
  args: { name: 'Sasha Kim' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const statuses: AvatarStatus[] = ['online', 'busy', 'away', 'offline']

/** A real portrait, from a service that returns one for any seed. */
const photo = 'https://i.pravatar.cc/128?img=32'

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-4">
      {sizes.map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </div>
  ),
}

export const WithImage: Story = { args: { src: photo } }

/**
 * The same six tints, assigned by name. Two people with the same name get the
 * same colour, which is the point — it is derived, not stored, so it matches
 * across apps without anything being written down.
 */
export const EveryTint: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {['Ana Ruiz', 'Ben Hale', 'Cleo Mensah', 'Dev Patel', 'Eve Lindqvist', 'Femi Okoro'].map(
        (name) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <Avatar name={name} size="lg" />
            <span className="text-xs text-muted">{name}</span>
          </div>
        ),
      )}
    </div>
  ),
}

/** No image, or an image that failed: the initials are the fallback either way. */
export const Fallback: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar {...args} name="Sasha Kim" />
      <Avatar {...args} name="Prince" />
      <Avatar {...args} name="Ana Maria Ruiz Vega" />
      <Avatar {...args} name="Tom Fry" src="https://example.invalid/missing.jpg" />
    </div>
  ),
}

/**
 * The dot is `aria-hidden` and the word goes into the accessible name, so the
 * avatar reads as "Sasha Kim, busy" rather than as a colour nobody can see.
 */
export const EveryStatus: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      {statuses.map((status) => (
        <div key={status} className="flex flex-col items-center gap-2">
          <Avatar {...args} status={status} size="lg" />
          <span className="text-xs text-muted">{status}</span>
        </div>
      ))}
    </div>
  ),
}

/** Status at every size, which is where a dot that does not scale shows up. */
export const StatusAtEverySize: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-4">
      {sizes.map((size) => (
        <Avatar key={size} {...args} size={size} status="online" src={photo} />
      ))}
    </div>
  ),
}

/** When the app has its own word for a state, it wins. */
export const OwnStatusWording: Story = {
  args: { status: 'busy', statusLabel: 'in a meeting', size: 'lg' },
}

export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <AvatarGroup>
        {['Sasha Kim', 'Ana Ruiz', 'Tom Fry'].map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>

      <AvatarGroup max={3}>
        {['Sasha Kim', 'Ana Ruiz', 'Tom Fry', 'Mia Oduya', 'Ben Hale', 'Cleo Mensah'].map(
          (name) => (
            <Avatar key={name} name={name} />
          ),
        )}
      </AvatarGroup>
    </div>
  ),
}

/** The group sets the size once; the overlap follows it. */
export const GroupSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      {sizes.map((size) => (
        <AvatarGroup key={size} size={size} max={4}>
          {['Sasha Kim', 'Ana Ruiz', 'Tom Fry', 'Mia Oduya', 'Ben Hale', 'Cleo Mensah'].map(
            (name) => (
              <Avatar key={name} name={name} />
            ),
          )}
        </AvatarGroup>
      ))}
    </div>
  ),
}

/** Where they actually turn up: a row of people in a room. */
export const InContext: Story = {
  render: () => (
    <div className="flex w-80 items-center justify-between rounded-box border border-base-300 p-4">
      <div className="flex items-center gap-3">
        <Avatar name="Sasha Kim" status="online" src={photo} />
        <div className="flex flex-col">
          <span className="text-sm font-medium">Sasha Kim</span>
          <span className="text-xs text-muted">Product design</span>
        </div>
      </div>
      <AvatarGroup size="xs" max={3}>
        {['Ana Ruiz', 'Tom Fry', 'Mia Oduya', 'Ben Hale'].map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
    </div>
  ),
}
