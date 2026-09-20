import { useId } from 'react'
import type { ReactNode } from 'react'
import { DatePicker } from './DatePicker'
import type { DatePickerProps } from './DatePicker'
import { TimePicker } from './TimePicker'
import type { TimePickerProps } from './TimePicker'
import {
  browserTimeZone,
  parseInstant,
  toISOWithOffset,
  zoneLabel,
  zonedInstant,
  zonedParts,
} from './date'

export interface DateTimePickerProps
  extends
    Pick<DatePickerProps, 'min' | 'max' | 'isDateDisabled' | 'locale' | 'disabled' | 'size'>,
    Pick<TimePickerProps, 'hourCycle' | 'minuteStep'> {
  /**
   * An ISO 8601 instant, e.g. `2026-03-08T09:30:00+05:30`, or `null`. Out it
   * always carries the explicit offset of `timeZone` at that instant.
   */
  value?: string | null
  onChange?: (value: string | null) => void
  /**
   * The IANA zone the date and time are shown and edited in. Defaults to the
   * browser's. A scheduler for an office in another city sets it, and what
   * the user types is that city's wall clock.
   */
  timeZone?: string
  /** The time used when a date is picked before a time. Defaults to `09:00`. */
  defaultTime?: string
  label?: ReactNode
  help?: ReactNode
  error?: ReactNode
  required?: boolean
  className?: string
}

/**
 * A date and a time that together name one instant.
 *
 * The two pickers underneath know nothing about zones: the date is
 * `YYYY-MM-DD` and the time is `HH:mm`, both as a clock on the wall in
 * `timeZone` would show them. This component is where they meet an instant,
 * through `Intl.DateTimeFormat` with that zone — never through the browser's
 * local time, which would make the same value mean different moments on
 * different machines.
 */
export function DateTimePicker({
  value = null,
  onChange,
  timeZone = browserTimeZone(),
  defaultTime = '09:00',
  min,
  max,
  isDateDisabled,
  locale,
  hourCycle,
  minuteStep,
  label,
  help,
  error,
  required,
  disabled,
  size = 'md',
  className,
}: DateTimePickerProps) {
  const instant = parseInstant(value)
  const wall = instant ? zonedParts(instant, timeZone) : null
  const id = useId()

  const emit = (date: string | null, time: string | null) => {
    if (date === null) {
      onChange?.(null)
      return
    }
    onChange?.(toISOWithOffset(zonedInstant(date, time ?? defaultTime, timeZone), timeZone))
  }

  const zone = zoneLabel(instant ?? new Date(), timeZone, locale)

  return (
    <fieldset
      className={['flex flex-col gap-1', className ?? ''].join(' ').trim()}
      aria-describedby={help || error ? `${id}-desc` : undefined}
    >
      {label === undefined ? null : (
        <legend className="mb-1 text-sm font-medium text-base-content">
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-0.5 text-error">
              *
            </span>
          ) : null}
        </legend>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-40 flex-1">
          <DatePicker
            label="Date"
            value={wall?.date ?? null}
            onChange={(date) => emit(date, wall?.time ?? null)}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            locale={locale}
            required={required}
            disabled={disabled}
            size={size}
            error={error ? '' : undefined}
          />
        </div>
        <TimePicker
          label="Time"
          value={wall?.time ?? null}
          onChange={(time) => {
            if (wall) emit(wall.date, time)
          }}
          hourCycle={hourCycle}
          minuteStep={minuteStep}
          locale={locale}
          required={required}
          disabled={disabled || wall === null}
          size={size}
        />
        <span className="pb-2.5 text-xs text-muted" title={timeZone}>
          {zone}
        </span>
      </div>
      {help || error ? (
        <div id={`${id}-desc`} className="text-sm">
          {help ? <p className="text-muted">{help}</p> : null}
          {error ? (
            <p role="alert" className="text-error">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  )
}

/** One valid set of props for the blind install test. */
DateTimePicker.sampleProps = {
  label: 'Starts',
  locale: 'en-US',
  timeZone: 'UTC',
} satisfies DateTimePickerProps
