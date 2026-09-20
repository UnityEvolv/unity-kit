import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Field } from '../Field'
import type { FieldProps } from '../Field'
import { dayPeriods, parseISOTime, toISOTime, usesTwelveHourClock } from './date'
import type { ISOTime } from './date'

export type MinuteStep = 1 | 5 | 15 | 30

export interface TimePickerProps extends Pick<
  FieldProps,
  'label' | 'help' | 'error' | 'required' | 'disabled' | 'size' | 'id'
> {
  /** `HH:mm`, 24-hour, or `null`. */
  value?: ISOTime | null
  defaultValue?: ISOTime | null
  onChange?: (value: ISOTime | null) => void
  /** Overrides the locale's clock. */
  hourCycle?: 12 | 24
  /** How far the arrows move the minutes. Defaults to 5. */
  minuteStep?: MinuteStep
  /** Drives the clock and the AM/PM labels. Defaults to the browser's. */
  locale?: string
  name?: string
  className?: string
}

const frame: Record<NonNullable<FieldProps['size']>, string> = {
  xs: 'input input-xs w-fit gap-0.5',
  sm: 'input input-sm w-fit gap-0.5',
  md: 'input input-md w-fit gap-1',
  lg: 'input input-lg w-fit gap-1',
}

const SEGMENT =
  'w-[2ch] bg-transparent text-center tabular-nums outline-none focus:rounded-field focus:bg-primary focus:text-primary-content'

const pad = (n: number) => String(n).padStart(2, '0')
const wrap = (n: number, max: number) => ((n % max) + max) % max

/**
 * Hour and minute segments, and a day period on a 12-hour clock.
 *
 * Each segment is an input of its own: arrows step it (minutes by
 * `minuteStep`), typed digits jump to the value and move on to the next
 * segment once it is unambiguous, and the whole thing sits in a daisyUI
 * `input` frame so it looks like one field. The value is always `HH:mm`
 * 24-hour regardless of how it is shown; the clock is presentation.
 *
 * The frame is a `fieldset` through `Field` so the label names the group,
 * and each segment has its own name for a screen reader.
 */
export function TimePicker({
  value,
  defaultValue = null,
  onChange,
  hourCycle,
  minuteStep = 5,
  locale,
  label,
  help,
  error,
  required,
  disabled,
  size = 'md',
  id,
  name,
  className,
}: TimePickerProps) {
  const [internal, setInternal] = useState<ISOTime | null>(defaultValue)
  const selected = value === undefined ? internal : value
  const twelve = hourCycle ? hourCycle === 12 : usesTwelveHourClock(locale)
  const [am, pm] = dayPeriods(locale)

  const parts = parseISOTime(selected)
  const hour24 = parts?.hour ?? null
  const minute = parts?.minute ?? null
  const period: 0 | 1 = hour24 !== null && hour24 >= 12 ? 1 : 0
  const hourShown = hour24 === null ? null : twelve ? hour24 % 12 || 12 : hour24

  const [hourText, setHourText] = useState(hourShown === null ? '' : pad(hourShown))
  const [minuteText, setMinuteText] = useState(minute === null ? '' : pad(minute))
  // The segments follow the value while the user is not typing in them:
  // derived during render from the last value seen, so no effect is needed.
  const [seen, setSeen] = useState(selected)
  if (seen !== selected) {
    setSeen(selected)
    setHourText(hourShown === null ? '' : pad(hourShown))
    setMinuteText(minute === null ? '' : pad(minute))
  }

  const hourRef = useRef<HTMLInputElement>(null)
  const minuteRef = useRef<HTMLInputElement>(null)
  const periodRef = useRef<HTMLSelectElement>(null)

  const commit = (nextHour: number, nextMinute: number) => {
    const next = toISOTime({ hour: nextHour, minute: nextMinute })
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  const setHourShown = (shown: number) => {
    const h = twelve ? (shown % 12) + period * 12 : shown
    commit(h, minute ?? 0)
  }
  const setMinute = (m: number) => commit(hour24 ?? 0, m)

  const hourMax = twelve ? 12 : 23

  const onHourKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const delta = event.key === 'ArrowUp' ? 1 : -1
      const current = hourShown ?? (twelve ? 12 : 0)
      setHourShown(twelve ? wrap(current - 1 + delta, 12) + 1 : wrap(current + delta, 24))
    } else if (
      event.key === 'ArrowRight' &&
      event.currentTarget.selectionStart === hourText.length
    ) {
      minuteRef.current?.focus()
    }
  }

  const onMinuteKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const delta = event.key === 'ArrowUp' ? minuteStep : -minuteStep
      const current = minute ?? 0
      setMinute(wrap(Math.round(current / minuteStep) * minuteStep + delta, 60))
    } else if (event.key === 'ArrowLeft' && event.currentTarget.selectionStart === 0) {
      hourRef.current?.focus()
    } else if (event.key === 'ArrowRight' && twelve) {
      periodRef.current?.focus()
    }
  }

  /** Digits typed into the hour: a digit that cannot start a valid pair moves on. */
  const onHourInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(-2)
    setHourText(digits)
    if (digits === '') return
    const n = Number(digits)
    const min = twelve ? 1 : 0
    if (n < min || n > hourMax) return
    setHourShown(n)
    if (digits.length === 2 || n * 10 > hourMax) minuteRef.current?.focus()
  }

  const onMinuteInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(-2)
    setMinuteText(digits)
    if (digits === '') return
    const n = Number(digits)
    if (n > 59) return
    setMinute(n)
    if ((digits.length === 2 || n > 5) && twelve) periodRef.current?.focus()
  }

  const blurFormat = () => {
    setHourText(hourShown === null ? '' : pad(hourShown))
    setMinuteText(minute === null ? '' : pad(minute))
  }

  return (
    <Field
      as="fieldset"
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
          aria-describedby={control['aria-describedby']}
        >
          <input
            ref={hourRef}
            id={control.id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            aria-label="Hour"
            aria-invalid={control['aria-invalid']}
            className={SEGMENT}
            placeholder={twelve ? 'hh' : 'HH'}
            value={hourText}
            disabled={disabled}
            onChange={(event) => onHourInput(event.target.value)}
            onKeyDown={onHourKey}
            onBlur={blurFormat}
            onFocus={(event) => event.target.select()}
          />
          <span aria-hidden="true">:</span>
          <input
            ref={minuteRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            aria-label="Minute"
            className={SEGMENT}
            placeholder="mm"
            value={minuteText}
            disabled={disabled}
            onChange={(event) => onMinuteInput(event.target.value)}
            onKeyDown={onMinuteKey}
            onBlur={blurFormat}
            onFocus={(event) => event.target.select()}
          />
          {twelve ? (
            <select
              ref={periodRef}
              aria-label="AM or PM"
              className="select select-ghost select-xs w-auto pl-1"
              value={period}
              disabled={disabled}
              onChange={(event) => {
                const next = Number(event.target.value) as 0 | 1
                const base = (hour24 ?? 0) % 12
                commit(base + next * 12, minute ?? 0)
              }}
            >
              <option value={0}>{am}</option>
              <option value={1}>{pm}</option>
            </select>
          ) : null}
          {name === undefined ? null : <input type="hidden" name={name} value={selected ?? ''} />}
        </div>
      )}
    </Field>
  )
}

/** One valid set of props for the blind install test. */
TimePicker.sampleProps = { label: 'Starts at', locale: 'en-US' } satisfies TimePickerProps
