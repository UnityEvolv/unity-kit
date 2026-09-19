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
      options: ['primary', 'secondary', 'danger'],
      description: 'daisyUI colour variant.',
    },
    icon: {
      control: 'select',
      options: [undefined, ...iconNames],
      description: 'An icon name from the kit. The button sizes and places it.',
    },
    iconPosition: { control: 'inline-radio', options: ['start', 'end'] },
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

/** Check this one in both themes; it is the fastest way to spot a token regression. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
    </div>
  ),
}
