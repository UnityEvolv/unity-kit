import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { iconNames, iconSizes } from './icons'
import type { IconName, IconSize } from './icons'

const meta: Meta<typeof Icon> = {
  title: 'Primitives/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { name: 'mic', size: 'md', strokeWidth: 2 },
  argTypes: {
    name: { control: 'select', options: iconNames },
    size: { control: 'inline-radio', options: Object.keys(iconSizes) },
    strokeWidth: { control: { type: 'range', min: 1, max: 3, step: 0.25 } },
    title: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Icon>

const themes: Array<'light' | 'dark'> = ['light', 'dark']
const custom: IconName[] = ['knock', 'raise-hand', 'reception', 'break-room', 'office', 'provider']

function Panel({ theme, children }: { theme: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div
      data-theme={theme}
      className="flex-1 rounded-box border border-base-300 bg-base-100 p-5 text-base-content"
    >
      <h3 className="mb-4 text-lg font-semibold capitalize">{theme}</h3>
      {children}
    </div>
  )
}

/**
 * Each name at every size, ascending. Showing all five together is the point:
 * a glyph with too much detail survives at 32 and turns to mud at 14, and that
 * is only visible side by side.
 */
function Tile({ name }: { name: IconName }) {
  return (
    <div className="flex w-44 flex-col gap-1 py-2">
      <div className="flex h-9 items-end gap-2">
        {(Object.keys(iconSizes) as IconSize[]).map((size) => (
          <Icon key={size} name={name} size={size} />
        ))}
      </div>
      <code className="text-[11px] leading-tight text-muted">{name}</code>
    </div>
  )
}

export const Default: Story = {}

/** Every name the kit defines, at every size, in both themes. */
export const AllNames: Story = {
  parameters: { themes: { disable: true } },
  render: () => (
    <div className="flex gap-4 p-4">
      {themes.map((theme) => (
        <Panel key={theme} theme={theme}>
          <div className="flex flex-wrap">
            {iconNames.map((name) => (
              <Tile key={name} name={name} />
            ))}
          </div>
        </Panel>
      ))}
    </div>
  ),
}

/** Every size, against the type scale they are named for. */
export const EverySize: Story = {
  parameters: { themes: { disable: true } },
  render: () => (
    <div className="flex gap-4 p-4">
      {themes.map((theme) => (
        <Panel key={theme} theme={theme}>
          <div className="space-y-4">
            {(Object.keys(iconSizes) as IconSize[]).map((size) => (
              <div key={size} className="flex items-center gap-4">
                <code className="w-16 text-xs text-muted">
                  {size} {iconSizes[size]}
                </code>
                <Icon name="mic" size={size} />
                <Icon name="users" size={size} />
                <Icon name="knock" size={size} />
                <Icon name="settings" size={size} />
                <span className="text-sm">The quick brown fox</span>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  ),
}

/**
 * The six drawn for this product, each above the nearest Lucide icon at the
 * same size. If one looks foreign next to its neighbour, the grid or the
 * stroke is wrong.
 */
export const CustomSet: Story = {
  parameters: { themes: { disable: true } },
  render: () => (
    <div className="flex gap-4 p-4">
      {themes.map((theme) => (
        <Panel key={theme} theme={theme}>
          <div className="flex flex-wrap">
            {custom.map((name) => (
              <Tile key={name} name={name} />
            ))}
          </div>
          <p className="mt-2 mb-3 text-xs text-muted">Lucide, for comparison</p>
          <div className="flex flex-wrap">
            {(['lock', 'users', 'bell', 'calendar', 'settings', 'plus'] as IconName[]).map(
              (name) => (
                <Tile key={name} name={name} />
              ),
            )}
          </div>
        </Panel>
      ))}
    </div>
  ),
}

/**
 * Colour is always inherited. An icon never sets its own, which is why themes
 * and tokens work without the icon knowing they exist.
 */
export const InheritsColour: Story = {
  parameters: { themes: { disable: true } },
  render: () => (
    <div className="flex gap-4 p-4">
      {themes.map((theme) => (
        <Panel key={theme} theme={theme}>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Icon name="check" size="sm" /> inherits the body colour
            </p>
            <p className="flex items-center gap-2 text-success">
              <Icon name="check" size="sm" /> inherits success
            </p>
            <p className="flex items-center gap-2 text-warning">
              <Icon name="alert" size="sm" /> inherits warning
            </p>
            <p className="flex items-center gap-2 text-error">
              <Icon name="trash" size="sm" /> inherits error
            </p>
            <p className="flex items-center gap-2 text-muted">
              <Icon name="clock" size="sm" /> inherits muted
            </p>
            <div className="flex items-center gap-2 rounded-box bg-primary p-3 text-primary-content">
              <Icon name="record" size="sm" /> and on a filled surface
            </div>
          </div>
        </Panel>
      ))}
    </div>
  ),
}

/**
 * An icon-only button takes its name from the button, so the icon stays
 * decorative. A standalone meaningful icon gets a title instead.
 */
export const Labelling: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      <button className="btn btn-primary" aria-label="Mute microphone">
        <Icon name="mic-off" size="sm" />
      </button>
      <button className="btn btn-secondary">
        <Icon name="invite" size="sm" />
        Invite
      </button>
      <span className="flex items-center gap-2 text-sm">
        <Icon name="record" size="sm" title="Recording" />
        standalone, with a title
      </span>
    </div>
  ),
}
