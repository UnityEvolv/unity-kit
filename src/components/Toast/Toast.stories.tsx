import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toaster } from './Toaster'
import { toast } from './toast'
import { Button } from '../Button'

const meta = {
  title: 'Feedback/Toast',
  component: Toaster,
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
    },
  },
  args: { position: 'bottom-right', duration: 5000, visibleToasts: 3, closeButton: false },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * The Toaster is mounted once, here as part of the story; the buttons call
 * `toast` the way any screen would. Switch the theme: the toasts follow.
 */
export const Playground: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => toast('Settings saved')}>
          Plain
        </Button>
        <Button
          onClick={() =>
            toast.success('Room created', { description: 'Reception is ready to use.' })
          }
        >
          Success
        </Button>
        <Button
          variant="danger"
          onClick={() =>
            toast.error('Could not join the office', {
              description: 'The connection dropped. Try again.',
              action: { label: 'Retry', onClick: () => toast.success('Joined') },
            })
          }
        >
          Error with action
        </Button>
        <Button variant="secondary" onClick={() => toast.warning('Storage almost full')}>
          Warning
        </Button>
        <Button variant="secondary" onClick={() => toast.info('Sasha joined the call')}>
          Info
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            toast.promise(
              wait(1500).then(() => 'Boardroom'),
              {
                loading: 'Booking the room…',
                success: (room) => `${room} is yours`,
                error: 'Could not book',
              },
            )
          }
        >
          Promise
        </Button>
        <Button variant="ghost" onClick={() => toast.dismiss()}>
          Dismiss all
        </Button>
      </div>
    </>
  ),
}

export const WithCloseButton: Story = {
  args: { closeButton: true },
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button onClick={() => toast.info('Dismiss me from the corner', { duration: 60000 })}>
        Show
      </Button>
    </>
  ),
}

export const TopCenter: Story = {
  args: { position: 'top-center' },
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button onClick={() => toast.success('Saved')}>Show</Button>
    </>
  ),
}
