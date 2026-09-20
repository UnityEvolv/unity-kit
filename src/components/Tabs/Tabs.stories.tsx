import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs } from './Tabs'

const items = [
  { value: 'people', label: 'People', icon: 'users' as const, content: 'Who is in the room.' },
  { value: 'chat', label: 'Chat', icon: 'message' as const, content: 'Messages in this room.' },
  {
    value: 'files',
    label: 'Files',
    icon: 'copy' as const,
    content: 'Shared files.',
    disabled: true,
  },
]

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['border', 'lift', 'box'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
  args: { items, label: 'Room' },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Border: Story = {}
export const Lift: Story = { args: { variant: 'lift' } }
export const Box: Story = { args: { variant: 'box' } }

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Tabs key={size} {...args} size={size} />
      ))}
    </div>
  ),
}
