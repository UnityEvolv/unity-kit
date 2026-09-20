import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Calendar } from './Calendar'
import { DatePicker } from './DatePicker'
import { TimePicker } from './TimePicker'
import { DateTimePicker } from './DateTimePicker'
import { weekdayOf } from './date'

const meta = {
  title: 'Forms/Date and time',
  component: DatePicker,
  tags: ['autodocs'],
  argTypes: {
    locale: { control: 'select', options: ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP', 'ar-EG'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
  args: { label: 'Start date', locale: 'en-US' },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

const Controlled = (args: Story['args']) => {
  const [value, setValue] = useState<string | null>('2026-03-08')
  return (
    <div className="flex flex-col gap-2">
      <DatePicker {...args} value={value} onChange={setValue} />
      <p className="text-xs text-muted">value: {value ?? 'null'}</p>
    </div>
  )
}

/** Type a date in the locale's order, or open the calendar. Value is always YYYY-MM-DD. */
export const Date_: Story = { name: 'DatePicker', render: (args) => <Controlled {...args} /> }

/** Switch the locale control: names, first weekday, placeholder and parsing all follow. */
export const Locales: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['en-US', 'en-GB', 'de-DE', 'ja-JP'] as const).map((locale) => (
        <DatePicker
          key={locale}
          {...args}
          label={locale}
          locale={locale}
          defaultValue="2026-03-08"
        />
      ))}
    </div>
  ),
}

/** Bounds and a "no weekends" rule. */
export const BoundsAndDisabledDates: Story = {
  args: {
    min: '2026-03-02',
    max: '2026-04-15',
    isDateDisabled: (iso: string) => weekdayOf(iso) >= 6,
    help: 'Weekdays between 2 March and 15 April.',
  },
  render: (args) => <Controlled {...args} />,
}

/**
 * The grid on its own. Tab to it, then: arrows by day and week, Home and End
 * to the week's edges, PageUp and PageDown by month (Shift for a year),
 * Enter to pick.
 */
const CalendarExample = ({ locale }: { locale?: string }) => {
  const [value, setValue] = useState<string | null>('2026-03-08')
  return <Calendar value={value} onChange={setValue} locale={locale} />
}

export const CalendarGrid: Story = {
  render: (args) => <CalendarExample locale={args.locale} />,
}

const TimeExample = (args: { locale?: string }) => {
  const [value, setValue] = useState<string | null>('09:30')
  return (
    <div className="flex flex-col gap-4">
      <TimePicker label="Starts at" locale={args.locale} value={value} onChange={setValue} />
      <TimePicker
        label="24-hour, 15-minute steps"
        hourCycle={24}
        minuteStep={15}
        value={value}
        onChange={setValue}
      />
      <p className="text-xs text-muted">value: {value ?? 'null'}</p>
    </div>
  )
}

/** Arrows step, digits jump. Value is HH:mm however the clock is shown. */
export const Time: Story = {
  name: 'TimePicker',
  render: (args) => <TimeExample locale={args.locale} />,
}

const DateTimeExample = (args: { locale?: string }) => {
  const [value, setValue] = useState<string | null>('2026-03-08T04:00:00Z')
  return (
    <div className="flex flex-col gap-6">
      <DateTimePicker
        label="Meeting in Bengaluru"
        timeZone="Asia/Kolkata"
        locale={args.locale}
        value={value}
        onChange={setValue}
      />
      <DateTimePicker
        label="Same instant in New York"
        timeZone="America/New_York"
        locale={args.locale}
        value={value}
        onChange={setValue}
      />
      <p className="text-xs text-muted">value: {value ?? 'null'}</p>
    </div>
  )
}

/** Two zones editing the same instant. The value carries its offset. */
export const DateTime: Story = {
  name: 'DateTimePicker',
  render: (args) => <DateTimeExample locale={args.locale} />,
}

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <DatePicker {...args} label="Required" required />
      <DatePicker
        {...args}
        label="With error"
        defaultValue="2026-03-08"
        error="Must be after the end date"
      />
      <DatePicker {...args} label="Disabled" defaultValue="2026-03-08" disabled />
      <DatePicker {...args} label="Small" size="sm" defaultValue="2026-03-08" />
    </div>
  ),
}
