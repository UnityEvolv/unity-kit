import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

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
