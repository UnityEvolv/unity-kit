import type { Meta, StoryObj } from '@storybook/react-vite'
import { Breadcrumbs } from './Breadcrumbs'

const meta = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'Home', href: '#', icon: 'office' },
      { label: 'Rooms', href: '#' },
      { label: 'Reception' },
    ],
  },
} satisfies Meta<typeof Breadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A router's Link goes through renderLink; the kit never imports one. */
export const CustomLink: Story = {
  args: {
    renderLink: ({ href, children, className }) => (
      <a href={href} className={className} onClick={(e) => e.preventDefault()}>
        {children}
      </a>
    ),
  },
}
