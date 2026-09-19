import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './Skeleton'

const meta = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    shape: { control: 'inline-radio', options: ['text', 'circle', 'rect'] },
    lines: { control: { type: 'number', min: 1, max: 8 } },
    width: { control: 'text' },
    height: { control: 'text' },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: (args) => <Skeleton {...args} /> }

export const Shapes: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton shape="circle" />
        <Skeleton shape="text" lines={2} className="flex-1" />
      </div>
      <Skeleton shape="rect" height={120} />
    </div>
  ),
}

/** The last line stops short, which is what a paragraph does. */
export const TextLines: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-8">
      {[1, 2, 3, 5].map((lines) => (
        <Skeleton key={lines} shape="text" lines={lines} />
      ))}
    </div>
  ),
}

/**
 * Sketching a card is these nested in ordinary layout, which is why there is
 * no `SkeletonCard`: the kit would be guessing at a card it has not shipped.
 */
export const CardSketch: Story = {
  render: () => (
    <div className="w-80 rounded-box border border-base-300 p-4">
      <Skeleton shape="rect" height={140} className="mb-4" />
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" width={32} />
        <Skeleton shape="text" lines={2} className="flex-1" />
      </div>
    </div>
  ),
}

/** A list of rows, which is what most screens are actually waiting for. */
export const RowSketch: Story = {
  render: () => (
    <div className="flex w-[28rem] flex-col gap-4">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex items-center gap-3">
          <Skeleton shape="circle" width={36} />
          <Skeleton shape="text" lines={2} className="flex-1" />
          <Skeleton shape="rect" width={64} height={24} className="shrink-0" />
        </div>
      ))}
    </div>
  ),
}

/**
 * The skeleton is `aria-hidden` — grey bars say nothing worth reading aloud.
 * The region being filled is what carries `aria-busy`, so the state is
 * announced once, by the thing that knows what is loading.
 */
export const AnnouncedByItsContainer: Story = {
  render: () => (
    <section aria-busy="true" aria-label="Rooms" className="w-96 rounded-box border border-base-300 p-4">
      <Skeleton shape="text" lines={3} />
    </section>
  ),
}
