import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateRangePicker } from './DateRangePicker'
import type { DateRange, DateRangePreset } from './DateRangePicker'
import { addDays, firstOfMonth, todayISO, weekdayOf } from './date'

const meta = {
  title: 'Forms/Date range',
  component: DateRangePicker,
  tags: ['autodocs'],
  argTypes: {
    locale: { control: 'select', options: ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
  args: { label: 'Dates', locale: 'en-US' },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DateRangePicker>

export default meta
type Story = StoryObj<typeof meta>

const Controlled = (args: Story['args']) => {
  const [value, setValue] = useState<DateRange>(['2026-03-08', '2026-03-14'])
  return (
    <div className="flex flex-col gap-2">
      <DateRangePicker {...args} value={value} onChange={setValue} />
      <p className="text-xs text-muted">value: {JSON.stringify(value)}</p>
    </div>
  )
}

/** Pick a start, then an end. Pointing or arrowing across the grid previews the band. */
export const Selection: Story = { render: (args) => <Controlled {...args} /> }

const today = todayISO()
const presets: DateRangePreset[] = [
  { label: 'Today', range: [today, today] },
  { label: 'Last 7 days', range: [addDays(today, -6), today] },
  { label: 'Last 30 days', range: [addDays(today, -29), today] },
  { label: 'This month', range: [firstOfMonth(today), today] },
]

/** Presets are the consumer's. These are the story's, not the kit's. */
export const Presets: Story = { args: { presets }, render: (args) => <Controlled {...args} /> }

export const Bounds: Story = {
  args: {
    min: '2026-03-02',
    max: '2026-04-15',
    isDateDisabled: (iso: string) => weekdayOf(iso) >= 6,
    help: 'Weekdays between 2 March and 15 April.',
  },
  render: (args) => <Controlled {...args} />,
}

/** Below `sm` the second month goes and one grid does the work. Resize to see it. */
export const NarrowLayout: Story = {
  render: (args) => (
    <div className="w-72">
      <Controlled {...args} />
    </div>
  ),
}

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <DateRangePicker {...args} label="Empty, required" required />
      <DateRangePicker
        {...args}
        label="With error"
        defaultValue={['2026-03-08', '2026-03-14']}
        error="Longer than the plan allows"
      />
      <DateRangePicker
        {...args}
        label="Disabled"
        defaultValue={['2026-03-08', '2026-03-14']}
        disabled
      />
    </div>
  ),
}
