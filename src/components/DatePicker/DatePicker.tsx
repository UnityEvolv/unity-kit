import { useRef, useState } from 'react'
import { Button } from '../Button'
import { Field } from '../Field'
import type { FieldProps } from '../Field'
import { Popover } from '../Popover'
import { Calendar } from './Calendar'
import type { CalendarProps } from './Calendar'
import { datePlaceholder, formatISODate, parseLocaleDate } from './date'
import type { ISODate } from './date'

export interface DatePickerProps
  extends
    Pick<FieldProps, 'label' | 'help' | 'error' | 'required' | 'disabled' | 'size' | 'id'>,
    Pick<CalendarProps, 'min' | 'max' | 'isDateDisabled' | 'locale'> {
  /** `YYYY-MM-DD` or `null`. Never a `Date`: a date-only value has no zone to be wrong in. */
  value?: ISODate | null
  defaultValue?: ISODate | null
  onChange?: (value: ISODate | null) => void
  /** Defaults to the locale's pattern, e.g. `MM/DD/YYYY`. */
  placeholder?: string
  /** A clear button while there is a value. Defaults to `true`. */
  clearable?: boolean
  name?: string
  className?: string
}

/**
 * Class names in full, as everywhere in the kit; the frame is daisyUI's
 * `input` so it matches every other field, holding a bare text input and
 * the buttons.
 */
const frame: Record<NonNullable<FieldProps['size']>, string> = {
  xs: 'input input-xs w-full gap-1 pr-1',
  sm: 'input input-sm w-full gap-1 pr-1',
  md: 'input input-md w-full gap-1 pr-1',
  lg: 'input input-lg w-full gap-1 pr-1.5',
}

/**
 * A date in a text input, with a calendar a click away.
 *
 * Typing works: a date in the locale's order (or ISO) is accepted on Enter
 * or blur and anything else leaves the field invalid with the pattern shown.
 * The calendar opens from its own button in a `Popover` and puts focus on
 * the active day, so keyboard users get the grid too; picking a day closes
 * it and returns focus to the input.
 *
 * Value in and out is `YYYY-MM-DD`. A `Date` for a date-only value carries a
 * time and a zone it never had, and "the 8th" becomes the 7th somewhere.
 */
export function DatePicker({
  value,
  defaultValue = null,
  onChange,
  placeholder,
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
  name,
  className,
}: DatePickerProps) {
  const [internal, setInternal] = useState<ISODate | null>(defaultValue)
  const selected = value === undefined ? internal : value
  const [text, setText] = useState(() => (selected ? formatISODate(selected, locale) : ''))
  const [invalid, setInvalid] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // The text follows the value while the user is not editing it. Derived
  // during render from the last value seen, which is React's pattern for
  // state that resets when a prop changes and needs no effect.
  const [seen, setSeen] = useState({ selected, locale })
  if (seen.selected !== selected || seen.locale !== locale) {
    setSeen({ selected, locale })
    setText(selected ? formatISODate(selected, locale) : '')
    setInvalid(false)
  }

  const commit = (next: ISODate | null) => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  const submitText = () => {
    if (text.trim() === '') {
      setInvalid(false)
      if (selected !== null) commit(null)
      return
    }
    const parsed = parseLocaleDate(text, locale)
    if (parsed === null) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    if (parsed !== selected) commit(parsed)
    else setText(formatISODate(parsed, locale))
  }

  const pattern = placeholder ?? datePlaceholder(locale)
  const typedError = invalid ? `Enter a date as ${pattern}` : undefined

  return (
    <Field
      label={label}
      help={help}
      error={error ?? typedError}
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
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent outline-none"
            placeholder={pattern}
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setInvalid(false)
            }}
            onBlur={submitText}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                submitText()
              } else if (event.key === 'ArrowDown' && event.altKey) {
                event.preventDefault()
                setOpen(true)
              }
            }}
            {...control}
          />
          {name === undefined ? null : <input type="hidden" name={name} value={selected ?? ''} />}
          {clearable && selected !== null && !disabled ? (
            <Button
              variant="ghost"
              size="xs"
              icon="close"
              aria-label="Clear date"
              onClick={() => {
                commit(null)
                inputRef.current?.focus()
              }}
            />
          ) : null}
          <Popover
            open={open && !disabled}
            onOpenChange={setOpen}
            padded={false}
            width="auto"
            align="end"
            trigger={
              <Button
                variant="ghost"
                size="xs"
                icon="calendar"
                aria-label="Choose date"
                disabled={disabled}
              />
            }
          >
            <Calendar
              value={selected}
              min={min}
              max={max}
              isDateDisabled={isDateDisabled}
              locale={locale}
              autoFocus
              onEscape={() => {
                setOpen(false)
                inputRef.current?.focus()
              }}
              onChange={(next) => {
                commit(next)
                setOpen(false)
                inputRef.current?.focus()
              }}
            />
          </Popover>
        </div>
      )}
    </Field>
  )
}

/** One valid set of props for the blind install test. */
DatePicker.sampleProps = { label: 'Start date', locale: 'en-US' } satisfies DatePickerProps
