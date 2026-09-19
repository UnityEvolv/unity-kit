import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { iconNames } from '../Icon'

/**
 * Story template. Every component in the kit follows this shape:
 *
 *  - `title` is `Category/Component`, so the sidebar groups by role rather than folder
 *  - `tags: ['autodocs']` generates the docs page from props and JSDoc
 *  - `argTypes` for anything with a fixed set of values, so controls are pickers
 *  - a `Default` story with no args, showing the component's own defaults
 *  - one story per meaningful state, not one per prop combination
 *  - an `AllVariants` story rendering them together, which is what makes a broken token
 *    obvious the moment the toolbar switches to dark
 */
const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'danger', 'ghost', 'link'],
      description: 'Brand and status colours, plus the two unfilled styles.',
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    icon: {
      control: 'select',
      options: [undefined, ...iconNames],
      description: 'An icon name from the kit. The button sizes and places it.',
    },
    iconPosition: { control: 'inline-radio', options: ['start', 'end'] },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Save' },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Primary: Story = { args: { variant: 'primary' } }

export const Secondary: Story = { args: { variant: 'secondary' } }

/** Destructive actions: delete, remove, revoke, end, leave call. */
export const Danger: Story = { args: { variant: 'danger', children: 'Delete' } }

export const Disabled: Story = { args: { disabled: true } }

/** An icon is a prop, not a child, so the button sizes and places it. */
export const WithIcon: Story = {
  args: { icon: 'invite', children: 'Invite' },
}

/** `end` reads better for anything that moves the user forward. */
export const IconAtEnd: Story = {
  args: { icon: 'chevron-right', iconPosition: 'end', children: 'Next' },
}

/**
 * With no label, the button takes its name from `aria-label` — which the type
 * requires, so an unnamed icon-only button will not compile. The square shape
 * comes from the kit rather than the call site.
 */
export const IconOnly: Story = {
  args: { icon: 'mic-off', children: undefined, 'aria-label': 'Mute microphone' },
}

/** Every variant with and without an icon, which is where spacing shows up. */
export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary" icon="invite">
        Invite
      </Button>
      <Button {...args} variant="secondary" icon="share">
        Share
      </Button>
      <Button {...args} variant="danger" icon="trash">
        Delete
      </Button>
      <Button {...args} variant="primary" icon="chevron-right" iconPosition="end">
        Next
      </Button>
      <Button {...args} variant="primary" icon="mic" aria-label="Mute" children={undefined} />
      <Button {...args} variant="danger" icon="leave-call" aria-label="Leave" children={undefined} />
      <Button {...args} icon="invite" disabled>
        Disabled
      </Button>
    </div>
  ),
}

/** Every size, with the icon scaling to match the label rather than the button. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-3">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Button key={size} {...args} size={size} icon="invite">
          {size}
        </Button>
      ))}
    </div>
  ),
}

/**
 * The spinner takes the icon's place rather than joining it, so the button
 * keeps its width. A loading button is disabled and `aria-busy`, which is what
 * says the state is temporary rather than the control broken.
 */
export const Loading: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} loading>
        Saving
      </Button>
      <Button {...args} loading variant="secondary" icon="invite">
        Inviting
      </Button>
      <Button {...args} loading variant="danger" size="sm">
        Deleting
      </Button>
      <Button {...args} loading icon="mic" aria-label="Connecting" children={undefined} />
    </div>
  ),
}

export const FullWidth: Story = {
  args: { fullWidth: true, children: 'Join the office' },
}

/** Check this one in both themes; it is the fastest way to spot a token regression. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {(['primary', 'secondary', 'danger', 'ghost', 'link'] as const).map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
      <Button {...args} disabled>
        Disabled
      </Button>
      <Button {...args} loading>
        Loading
      </Button>
    </div>
  ),
}
