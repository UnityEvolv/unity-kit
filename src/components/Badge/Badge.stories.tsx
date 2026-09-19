import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'
import type { BadgeSize, BadgeVariant } from './Badge'
import { iconNames } from '../Icon'

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'danger', 'ghost'],
      description: 'Brand and status colours. There is no link variant; that is a button style.',
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    outline: { control: 'boolean' },
    icon: { control: 'select', options: [undefined, ...iconNames] },
  },
  args: { children: 'New' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

const variants: BadgeVariant[] = ['primary', 'secondary', 'danger', 'ghost']
const sizes: BadgeSize[] = ['xs', 'sm', 'md', 'lg']

export const Default: Story = {}

/** Check this in both themes; it is the fastest way to spot a token regression. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {variants.map((variant) => (
          <Badge key={variant} {...args} variant={variant}>
            {variant}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {variants.map((variant) => (
          <Badge key={variant} {...args} variant={variant} outline>
            {variant}
          </Badge>
        ))}
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {sizes.map((size) => (
        <Badge key={size} {...args} size={size}>
          {size}
        </Badge>
      ))}
    </div>
  ),
}

/** The icon scales with the badge, so a caller never picks a size. */
export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args} icon="record" variant="danger">
        Recording
      </Badge>
      <Badge {...args} icon="raise-hand" variant="secondary">
        Hand up
      </Badge>
      <Badge {...args} icon="lock" variant="ghost">
        Private
      </Badge>
      <Badge {...args} icon="check" variant="primary">
        Ready
      </Badge>
    </div>
  ),
}

/**
 * What a badge is actually for: a count or a state beside something else. A
 * badge is not a control — if it needs to be clicked, it is a Button.
 */
export const InContext: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span>Messages</span>
        <Badge size="sm" aria-label="3 unread">
          3
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Meeting room</span>
        <Badge size="sm" variant="danger" icon="record">
          Recording
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Focus room</span>
        <Badge size="sm" variant="ghost" outline icon="break-room">
          Do not disturb
        </Badge>
      </div>
    </div>
  ),
}
