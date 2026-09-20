import { useState } from 'react'
import { Button } from '../Button'
import { Field } from '../Field'
import type { FieldProps } from '../Field'
import { Icon } from '../Icon'
import { Popover } from '../Popover'
import { Calendar } from './Calendar'
import type { CalendarProps } from './Calendar'
import { addMonths, clampISO, firstOfMonth, formatISODate, todayISO, toUTC } from './date'
import type { ISODate } from './date'

/** Start and end, either of which may still be unset. */
export type DateRange = [start: ISODate | null, end: ISODate | null]

export interface DateRangePreset {
  label: string
  range: [ISODate, ISODate]
}

export interface DateRangePickerProps
  extends
    Pick<FieldProps, 'label' | 'help' | 'error' | 'required' | 'disabled' | 'size' | 'id'>,
    Pick<CalendarProps, 'min' | 'max' | 'isDateDisabled' | 'locale'> {
  value?: DateRange
  defaultValue?: DateRange
  onChange?: (value: DateRange) => void
  /**
   * Shortcuts the consumer defines — Today, Last 7 days, This month. The kit
   * ships none, since what counts as a useful window is the product's.
   */
  presets?: DateRangePreset[]
  placeholder?: string
  /** A clear button while there is a value. Defaults to `true`. */
  clearable?: boolean
  /** Field names for a plain form, one per end. */
  names?: [string, string]
  className?: string
}

const frame: Record<NonNullable<FieldProps['size']>, string> = {
  xs: 'input input-xs w-full gap-1 pr-1',
  sm: 'input input-sm w-full gap-1 pr-1',
  md: 'input input-md w-full gap-1 pr-1',
  lg: 'input input-lg w-full gap-1 pr-1.5',
}

const EMPTY: DateRange = [null, null]

/** "Mar 8 – 14, 2026" where the engine can, "Mar 8, 2026 – Mar 14, 2026" where it cannot. */
const formatRange = (start: ISODate, end: ISODate, locale?: string) => {
  const format = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' })
  if (typeof format.formatRange === 'function') return format.formatRange(toUTC(start), toUTC(end))
  return `${format.format(toUTC(start))} – ${format.format(toUTC(end))}`
}

/** What a screen reader hears: full dates, joined by the word the story asks for. */
const spokenRange = (start: ISODate, end: ISODate, locale?: string) =>
  `${formatISODate(start, locale, { dateStyle: 'long' })} to ${formatISODate(end, locale, { dateStyle: 'long' })}`

/**
 * Start and end in one control, on the `Calendar` grid.
 *
 * Pick a start, then an end: the second click closes the range; a click
 * before the start begins again from there; pointing or arrowing across the
 * grid previews the band before the end is chosen. Two months side by side
 * where there is room, one where there is not — the second grid is the same
 * component a month on, so keyboard and locale behaviour are identical.
 *
 * Value in and out is a pair of `YYYY-MM-DD` strings. Time ranges are out of
 * scope; compose two `DateTimePicker`s for one.
 */
export function DateRangePicker({
  value,
  defaultValue = EMPTY,
  onChange,
  presets,
  placeholder = 'Start – End',
  clearable = true,
  min,
  max,
  isDateDisabled,
  locale,
  label,
  help,
  error,
  required,
  disabled,
  size = 'md',
  id,
  names,
  className,
}: DateRangePickerProps) {
  const [internal, setInternal] = useState<DateRange>(defaultValue)
  const [start, end] = value ?? internal
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState<ISODate | null>(null)
  const [visible, setVisible] = useState(() =>
    firstOfMonth(start ?? clampISO(todayISO(), min, max)),
  )
  const [announce, setAnnounce] = useState('')

  const commit = (next: DateRange) => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  const pick = (iso: ISODate) => {
    if (start !== null && end === null && iso >= start) {
      commit([start, iso])
      setAnnounce(spokenRange(start, iso, locale))
      setOpen(false)
      return
    }
    // No start yet, a complete range, or a day before the start: begin again.
    commit([iso, null])
  }

  // While an end is pending, the band follows the pointer or the focus.
  const preview = start !== null && end === null && hover !== null && hover >= start ? hover : end

  const calendar = (
    month: ISODate,
    navigation: CalendarProps['navigation'],
    hideOutsideDays: boolean,
  ) => (
    <Calendar
      month={month}
      onMonthChange={(first) => setVisible(month === visible ? first : addMonths(first, -1))}
      range={{ start, end: preview }}
      onChange={pick}
      onHoverDate={setHover}
      min={min}
      max={max}
      isDateDisabled={isDateDisabled}
      locale={locale}
      navigation={navigation}
      hideOutsideDays={hideOutsideDays}
      autoFocus={month === visible}
      onEscape={() => setOpen(false)}
      label={`${formatISODate(month, locale, { month: 'long', year: 'numeric' })}${start !== null && end === null ? ', choose an end date' : ''}`}
    />
  )

  const text =
    start !== null && end !== null
      ? formatRange(start, end, locale)
      : start !== null
        ? `${formatISODate(start, locale)} – …`
        : ''
  const spoken =
    start !== null && end !== null
      ? spokenRange(start, end, locale)
      : start !== null
        ? `${formatISODate(start, locale, { dateStyle: 'long' })}, no end date yet`
        : 'No dates chosen'

  return (
    <Field
      label={label}
      help={help}
      error={error}
      size={size}
      required={required}
      disabled={disabled}
      id={id}
      className={className}
    >
      {(control) => (
        <div
          className={[frame[size], control['aria-invalid'] ? 'input-error' : ''].join(' ').trim()}
        >
          <Popover
            open={open && !disabled}
            onOpenChange={setOpen}
            padded={false}
            width="auto"
            align="start"
            trigger={
              <button
                type="button"
                id={control.id}
                aria-describedby={control['aria-describedby']}
                aria-invalid={control['aria-invalid']}
                aria-label={
                  label !== undefined && typeof label === 'string' ? `${label}, ${spoken}` : spoken
                }
                disabled={disabled}
                className="flex min-w-0 flex-1 items-center gap-2 text-start outline-none"
              >
                <Icon name="calendar" size="sm" className="shrink-0 text-muted" />
                <span className={text ? 'truncate' : 'truncate text-muted'}>
                  {text || placeholder}
                </span>
              </button>
            }
          >
            <div className="flex">
              {presets && presets.length > 0 ? (
                <ul aria-label="Presets" className="menu w-40 border-r border-base-300 p-2">
                  {presets.map((preset) => (
                    <li key={preset.label}>
                      <button
                        type="button"
                        onClick={() => {
                          commit(preset.range)
                          setVisible(firstOfMonth(preset.range[0]))
                          setAnnounce(spokenRange(preset.range[0], preset.range[1], locale))
                          setOpen(false)
                        }}
                      >
                        {preset.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {calendar(visible, 'both', false)}
              <div className="hidden border-l border-base-300 sm:block">
                {calendar(addMonths(visible, 1), 'next', true)}
              </div>
            </div>
          </Popover>
          {names === undefined ? null : (
            <>
              <input type="hidden" name={names[0]} value={start ?? ''} />
              <input type="hidden" name={names[1]} value={end ?? ''} />
            </>
          )}
          {clearable && start !== null && !disabled ? (
            <Button
              variant="ghost"
              size="xs"
              icon="close"
              aria-label="Clear dates"
              onClick={() => {
                commit(EMPTY)
                setAnnounce('Dates cleared')
              }}
            />
          ) : null}
          <span role="status" className="sr-only">
            {announce}
          </span>
        </div>
      )}
    </Field>
  )
}

/** One valid set of props for the blind install test. */
DateRangePicker.sampleProps = {
  label: 'Dates',
  locale: 'en-US',
  defaultValue: ['2026-03-08', '2026-03-14'],
} satisfies DateRangePickerProps
