import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from './AppShell'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import type { SidebarItem } from './Sidebar'
import { Avatar } from '../Avatar'
import { Badge } from '../Badge'
import { Brand } from '../Brand'
import { Breadcrumbs } from '../Breadcrumbs'
import { Button } from '../Button'
import { Card } from '../Card'

const items: SidebarItem[] = [
  { key: 'home', label: 'Home', icon: 'office', href: '#' },
  { key: 'rooms', label: 'Rooms', icon: 'reception', href: '#', badge: <Badge size="sm">3</Badge> },
  { key: 'people', label: 'People', icon: 'users', href: '#' },
  { key: 'calendar', label: 'Calendar', icon: 'calendar', href: '#' },
  {
    key: 'admin',
    label: 'Admin',
    children: [
      { key: 'settings', label: 'Settings', icon: 'settings', href: '#' },
      { key: 'billing', label: 'Billing', icon: 'lock', href: '#', disabled: true },
    ],
  },
]

const meta = {
  title: 'Navigation/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Resize below `lg`: the sidebar column goes and the navbar grows a menu
 * button that opens the same sidebar as a drawer.
 */
export const Default: Story = {
  render: () => (
    <AppShell
      navbar={
        <Navbar
          brand={<Brand product="unityofis" size="sm" />}
          actions={
            <>
              <Button variant="ghost" size="sm" icon="bell" aria-label="Notifications" />
              <Avatar name="Sasha Kim" size="sm" status="online" />
            </>
          }
        />
      }
      sidebar={
        <Sidebar
          items={items}
          activeKey="rooms"
          footer={<span className="text-xs text-muted">v0.1.0</span>}
        />
      }
    >
      <div className="flex flex-col gap-4 p-6">
        <Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Rooms' }]} />
        <h1 className="text-2xl font-semibold">Rooms</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {['Reception', 'Boardroom', 'Break room'].map((room) => (
            <Card key={room} header={room}>
              Six seats and a door that closes.
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  ),
}

export const NavbarOnly: Story = {
  render: () => (
    <AppShell navbar={<Navbar brand={<Brand product="unityevolv" size="sm" />} />}>
      <div className="p-6">A sign-in page: no sidebar, so no menu button.</div>
    </AppShell>
  ),
}

export const SidebarAlone: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="h-96 w-64 overflow-hidden rounded-box border border-base-300">
      <Sidebar items={items} activeKey="people" header={<Brand product="unityofis" size="sm" />} />
    </div>
  ),
}
