import type { Meta, StoryObj } from '@storybook/react-vite'
import { Drawer } from './Drawer'
import { Button } from '../Button'
import { Icon } from '../Icon'

const meta = {
  title: 'Overlays/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'inline-radio',
      options: ['start', 'end', 'top', 'bottom'],
      description:
        '`start` and `end` are inline-relative, so a drawer flips sides in a right-to-left language without the caller thinking about it.',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Width for a side drawer. Ignored for `top` and `bottom`.',
    },
    dismissible: { control: 'boolean' },
    hideCloseButton: { control: 'boolean' },
  },
  args: { title: 'Filters', side: 'end', size: 'md' },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    trigger: <Button variant="secondary">Filters</Button>,
    description: 'Narrow the room list.',
    footer: (
      <>
        <Drawer.Close>
          <Button variant="ghost">Reset</Button>
        </Drawer.Close>
        <Drawer.Close>
          <Button>Apply</Button>
        </Drawer.Close>
      </>
    ),
  },
  render: (args) => (
    <Drawer {...args}>
      <div className="flex flex-col gap-3">
        {['Available', 'In a meeting', 'Focus', 'Away'].map((label) => (
          <label key={label} className="flex items-center gap-2">
            <input type="checkbox" className="checkbox checkbox-sm" />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </Drawer>
  ),
}

/**
 * **Drive this one from the keyboard and never touch the mouse.**
 *
 * 1. `Tab` to the trigger, then `Enter` to open the drawer.
 * 2. `Tab` through the navigation links. Focus stays inside the panel — the
 *    page behind is hidden from assistive technology while it is open.
 * 3. `Escape` closes it, and focus returns to the trigger.
 *
 * A drawer is a dialog anchored to an edge, so it gets the same focus trap,
 * focus return and scroll lock as `Modal` from the same place.
 */
export const KeyboardOnly: Story = {
  args: {
    title: 'Navigation',
    side: 'start',
    trigger: <Button icon="call-view">Menu</Button>,
  },
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <p className="max-w-prose text-sm text-muted">
        Open the drawer, then Tab through it. The link below is outside and stays unreachable.
      </p>
      <Drawer {...args}>
        {/* `menu` is daisyUI's list styling, and it is the right class for
            navigation inside a drawer even though the panel itself is not
            daisyUI's `.drawer`. */}
        <ul className="menu w-full">
          {(
            [
              ['reception', 'Reception'],
              ['office', 'My office'],
              ['break-room', 'Break room'],
              ['users', 'People'],
              ['settings', 'Settings'],
            ] as const
          ).map(([icon, label]) => (
            <li key={label}>
              <a href="#none">
                <Icon name={icon} size="sm" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </Drawer>
      <a className="link text-sm" href="#none">
        Outside the drawer
      </a>
    </div>
  ),
}

/** Every edge daisyUI anchors a sheet to. */
export const Sides: Story = {
  args: { trigger: undefined },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {(['start', 'end', 'top', 'bottom'] as const).map((side) => (
        <Drawer
          {...args}
          key={side}
          side={side}
          title={`Anchored ${side}`}
          trigger={<Button variant="secondary">{side}</Button>}
        >
          <p>
            daisyUI squares off the outer corners for each edge, and flips `start` and `end` in a
            right-to-left language.
          </p>
        </Drawer>
      ))}
    </div>
  ),
}

/** The header and footer stay put while the body scrolls. */
export const ScrollingBody: Story = {
  args: {
    title: 'Participants',
    description: '48 people',
    trigger: <Button variant="secondary">Participants</Button>,
    footer: (
      <Drawer.Close>
        <Button>Done</Button>
      </Drawer.Close>
    ),
  },
  render: (args) => (
    <Drawer {...args}>
      <ul className="flex flex-col gap-2">
        {Array.from({ length: 48 }, (_, index) => (
          <li key={index} className="flex items-center gap-2">
            <Icon name="users" size="sm" />
            Person {index + 1}
          </li>
        ))}
      </ul>
    </Drawer>
  ),
}
