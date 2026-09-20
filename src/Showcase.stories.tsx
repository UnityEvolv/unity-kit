import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert } from './components/Alert'
import { Avatar, AvatarGroup } from './components/Avatar'
import { Badge } from './components/Badge'
import { Brand } from './components/Brand'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { Checkbox } from './components/Checkbox'
import { Input } from './components/Input'
import { Progress } from './components/Progress'
import { Select } from './components/Select'
import { Stat, StatGroup } from './components/Stat'
import { Table } from './components/Table'
import { Toggle } from './components/Toggle'

/**
 * One screen made of the kit, for the README screenshot and for a visitor's
 * first look. Nothing here is an app; it is the components side by side in
 * the theme, so switching light and dark in the toolbar shows the palette
 * holding up.
 */
const meta = {
  title: 'Overview/Showcase',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface Room {
  id: number
  name: string
  floor: string
  seats: number
  status: 'open' | 'busy' | 'closed'
}

const rooms: Room[] = [
  { id: 1, name: 'Reception', floor: 'Ground', seats: 4, status: 'open' },
  { id: 2, name: 'Boardroom', floor: 'First', seats: 12, status: 'busy' },
  { id: 3, name: 'Break room', floor: 'Ground', seats: 8, status: 'open' },
  { id: 4, name: 'Focus pod', floor: 'Second', seats: 1, status: 'closed' },
]

const tone = { open: 'primary', busy: 'danger', closed: 'ghost' } as const

export const Showcase: Story = {
  render: () => (
    <div className="min-h-screen bg-base-200 p-6 text-base-content">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between rounded-box border border-base-300 bg-base-100 px-4 py-3">
          <Brand product="unityofis" size="sm" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon="bell" aria-label="Notifications" />
            <Button size="sm" icon="plus">
              New room
            </Button>
            <Avatar name="Sasha Kim" size="sm" status="online" />
          </div>
        </header>

        <Alert
          variant="ok"
          title="Reception is ready"
          action={
            <Button variant="ghost" size="sm">
              Open
            </Button>
          }
        >
          Six seats, a whiteboard and a door that closes.
        </Alert>

        <StatGroup>
          <Stat label="People online" value="24" delta="+6" direction="up" icon="users" />
          <Stat
            label="Rooms in use"
            value="7 / 12"
            description="Busiest at 10:00"
            icon="reception"
          />
          <Stat label="Dropped calls" value="0.4%" delta="-0.2" direction="down" tone="positive" />
        </StatGroup>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card header={<h2>Rooms</h2>}>
            <Table
              caption="Rooms"
              layout="table"
              size="sm"
              columns={[
                { key: 'name', header: 'Room', sortable: true },
                { key: 'floor', header: 'Floor' },
                { key: 'seats', header: 'Seats', align: 'end' },
                {
                  key: 'status',
                  header: 'Status',
                  cell: (room) => (
                    <Badge variant={tone[room.status]} size="sm">
                      {room.status}
                    </Badge>
                  ),
                },
              ]}
              rows={rooms}
              rowKey={(room) => room.id}
              sort={{ key: 'name', direction: 'asc' }}
              selectable
              selected={[2]}
            />
          </Card>

          <Card header={<h2>Invite someone</h2>}>
            <div className="flex flex-col gap-3">
              <Input label="Email" placeholder="name@company.com" required />
              <Select label="Role" defaultValue="member">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </Select>
              <Checkbox label="Send a welcome message" defaultChecked />
              <Toggle label="Can create rooms" />
              <Progress value={66} label="Seats used" showValue />
              <div className="flex items-center justify-between pt-1">
                <AvatarGroup size="sm" max={3}>
                  <Avatar name="Sasha Kim" />
                  <Avatar name="Jo Ortega" />
                  <Avatar name="Amir Haddad" />
                  <Avatar name="Lena Fischer" />
                </AvatarGroup>
                <Button size="sm">Send invite</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  ),
}
