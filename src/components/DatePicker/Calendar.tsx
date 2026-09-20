import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Button } from '../Button'
import {
  addDays,
  addMonths,
  clampISO,
  compareISO,
  firstDayOfWeek,
  firstOfMonth,
  formatISODate,
  monthGrid,
  monthNames,
  parseISODate,
  startOfWeek,
  todayISO,
  weekdayNames,
} from './date'
import type { ISODate } from './date'

export interface CalendarProps {
  /** The selected day. */
  value?: ISODate | null
  onChange?: (value: ISODate) => void
  /** Which month is showing, as any day in it. Controlled; leave off to let the calendar hold it. */
  month?: ISODate
  defaultMonth?: ISODate
  onMonthChange?: (firstOfMonth: ISODate) => void
  min?: ISODate
  max?: ISODate
  /** Consumer rules: "no weekends", "not a holiday". */
  isDateDisabled?: (date: ISODate) => boolean
  /** A BCP 47 tag. Defaults to the browser's. Drives names, first weekday and formats. */
  locale?: string
  /** Called on Escape, so a popover around the grid can close. */
  onEscape?: () => void
  /** Puts focus on the active day when the grid mounts, for use inside a popover. */
  autoFocus?: boolean
  /** Names the grid. Defaults to the visible month, e.g. "March 2026". */
  label?: string
  /**
   * A span to draw as a band, for `DateRangePicker`. Both ends are marked
   * selected; days between get the band. Either end may be missing.
   */
  range?: { start: ISODate | null; end: ISODate | null }
  /** The day under the pointer or focus, so a range can be previewed. `null` on leave. */
  onHoverDate?: (date: ISODate | null) => void
  /** Leaves adjacent-month cells empty, for two months side by side. */
  hideOutsideDays?: boolean
  /** Which month arrows to draw. Defaults to `both`. */
  navigation?: 'both' | 'previous' | 'next' | 'none'
  className?: string
}

/**
 * Class names in full, as everywhere in the kit. The cells are plain
 * buttons styled with Tailwind's `aria-*` variants, so the state a screen
 * reader hears and the state a sighted user sees come from the same
 * attribute. daisyUI has no calendar of its own worth borrowing here.
 */
const CELL =
  'flex size-9 items-center justify-center rounded-full text-sm text-base-content hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary aria-selected:bg-primary aria-selected:text-primary-content aria-selected:hover:bg-primary aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent aria-[current=date]:font-bold aria-[current=date]:underline aria-[current=date]:underline-offset-4'

const OUTSIDE = 'text-muted'

/** The band between two ends of a range, drawn on the cell rather than the button. */
const IN_RANGE = 'bg-primary/10'
const RANGE_START = 'rounded-l-full'
const RANGE_END = 'rounded-r-full'

const YEARS_AROUND = 60

/**
 * The month grid every date picker in the kit is built on.
 *
 * It is the ARIA grid pattern: one tab stop, roving focus, arrows by day and
 * week, PageUp and PageDown by month (with Shift, by year), Home and End to
 * the edges of the week, Enter or Space to pick. Everything is `YYYY-MM-DD`
 * and every step is UTC arithmetic, so a DST change cannot skip or double a
 * day. Names and the first weekday come from `Intl` for the locale.
 */
export function Calendar({
  value = null,
  onChange,
  month,
  defaultMonth,
  onMonthChange,
  min,
  max,
  isDateDisabled,
  locale,
  onEscape,
  autoFocus = false,
  label,
  range,
  onHoverDate,
  hideOutsideDays = false,
  navigation = 'both',
  className,
}: CalendarProps) {
  const today = todayISO()
  const [internalMonth, setInternalMonth] = useState(() =>
    firstOfMonth(defaultMonth ?? value ?? clampISO(today, min, max)),
  )
  const visible = firstOfMonth(month ?? internalMonth)
  const { year, month: monthNumber } = parseISODate(visible)!

  const setVisible = (iso: ISODate) => {
    const first = firstOfMonth(iso)
    if (month === undefined) setInternalMonth(first)
    onMonthChange?.(first)
  }

  const firstDay = useMemo(() => firstDayOfWeek(locale), [locale])
  const weekdays = useMemo(() => weekdayNames(locale, firstDay), [locale, firstDay])
  const weekdaysLong = useMemo(() => weekdayNames(locale, firstDay, 'long'), [locale, firstDay])
  const months = useMemo(() => monthNames(locale), [locale])
  const grid = useMemo(() => monthGrid(year, monthNumber, firstDay), [year, monthNumber, firstDay])

  const disabled = (iso: ISODate) =>
    (min !== undefined && compareISO(iso, min) < 0) ||
    (max !== undefined && compareISO(iso, max) > 0) ||
    (isDateDisabled?.(iso) ?? false)

  const rangeStart = range?.start ?? null
  const rangeEnd = range?.end ?? null
  const inRange = (iso: ISODate) =>
    rangeStart !== null && rangeEnd !== null && iso >= rangeStart && iso <= rangeEnd
  const isSelected = (iso: ISODate) =>
    range ? iso === rangeStart || iso === rangeEnd : value === iso

  // The one focusable cell: the selection if it is showing, else today if it
  // is showing, else the first of the month.
  const [focused, setFocused] = useState<ISODate>(() =>
    value && firstOfMonth(value) === visible
      ? value
      : today.startsWith(visible.slice(0, 7))
        ? today
        : visible,
  )
  const inMonth = focused.slice(0, 7) === visible.slice(0, 7)
  const active = inMonth ? focused : visible

  const gridRef = useRef<HTMLDivElement>(null)
  // Focus follows the active cell after a key move, and lands there on mount
  // when asked. A ref rather than state: it is an instruction to the next
  // commit, not something that should render.
  const pendingFocus = useRef(autoFocus)
  useEffect(() => {
    if (!pendingFocus.current) return
    pendingFocus.current = false
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${active}"]`)?.focus()
  }, [active])

  const moveTo = (iso: ISODate) => {
    const next = clampISO(iso, min, max)
    onHoverDate?.(next)
    pendingFocus.current = true
    setFocused(next)
    if (firstOfMonth(next) !== visible) setVisible(next)
  }

  const pick = (iso: ISODate) => {
    if (disabled(iso)) return
    onChange?.(iso)
    setFocused(iso)
    if (firstOfMonth(iso) !== visible) setVisible(iso)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, () => ISODate> = {
      ArrowLeft: () => addDays(active, -1),
      ArrowRight: () => addDays(active, 1),
      ArrowUp: () => addDays(active, -7),
      ArrowDown: () => addDays(active, 7),
      Home: () => startOfWeek(active, firstDay),
      End: () => addDays(startOfWeek(active, firstDay), 6),
      PageUp: () => addMonths(active, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(active, event.shiftKey ? 12 : 1),
    }
    if (event.key in step) {
      event.preventDefault()
      moveTo(step[event.key]())
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      pick(active)
    } else if (event.key === 'Escape' && onEscape) {
      event.preventDefault()
      onEscape()
    }
  }

  const monthLabel = formatISODate(visible, locale, { month: 'long', year: 'numeric' })
  const minYear = min ? parseISODate(min)!.year : year - YEARS_AROUND
  const maxYear = max ? parseISODate(max)!.year : year + YEARS_AROUND
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index)
  const selectId = useId()

  const canGo = (delta: number) => {
    const target = addMonths(visible, delta)
    if (delta < 0 && min) return compareISO(addMonths(target, 1), min) > 0
    if (delta > 0 && max) return compareISO(target, max) <= 0
    return true
  }

  return (
    <div className={['inline-flex w-72 flex-col gap-2 p-3', className ?? ''].join(' ').trim()}>
      <div className="flex items-center gap-1">
        {navigation === 'both' || navigation === 'previous' ? (
          <Button
            variant="ghost"
            size="sm"
            icon="chevron-left"
            aria-label="Previous month"
            disabled={!canGo(-1)}
            onClick={() => setVisible(addMonths(visible, -1))}
          />
        ) : (
          <span className="size-8" aria-hidden="true" />
        )}
        <label className="sr-only" htmlFor={`${selectId}-month`}>
          Month
        </label>
        <select
          id={`${selectId}-month`}
          className="select select-ghost select-sm flex-1"
          value={monthNumber}
          onChange={(event) =>
            setVisible(`${year}-${String(event.target.value).padStart(2, '0')}-01`)
          }
        >
          {months.map((name, index) => (
            <option key={name} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`${selectId}-year`}>
          Year
        </label>
        <select
          id={`${selectId}-year`}
          className="select select-ghost select-sm w-24"
          value={year}
          onChange={(event) =>
            setVisible(`${event.target.value}-${String(monthNumber).padStart(2, '0')}-01`)
          }
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {navigation === 'both' || navigation === 'next' ? (
          <Button
            variant="ghost"
            size="sm"
            icon="chevron-right"
            aria-label="Next month"
            disabled={!canGo(1)}
            onClick={() => setVisible(addMonths(visible, 1))}
          />
        ) : (
          <span className="size-8" aria-hidden="true" />
        )}
      </div>

      <div
        ref={gridRef}
        role="grid"
        aria-label={label ?? monthLabel}
        onKeyDown={onKeyDown}
        onMouseLeave={onHoverDate ? () => onHoverDate(null) : undefined}
        className="grid grid-cols-7 gap-y-1"
      >
        <div role="row" className="contents">
          {weekdays.map((name, index) => (
            <div
              key={name}
              role="columnheader"
              aria-label={weekdaysLong[index]}
              className="flex h-8 items-center justify-center text-xs font-medium text-muted"
            >
              {name}
            </div>
          ))}
        </div>
        {grid.map((week, weekIndex) => (
          <div key={weekIndex} role="row" className="contents">
            {week.map((iso) => {
              const outside = iso.slice(0, 7) !== visible.slice(0, 7)
              if (outside && hideOutsideDays) {
                return <div key={iso} role="gridcell" aria-hidden="true" className="size-9" />
              }
              const isDisabled = disabled(iso)
              const banded = inRange(iso)
              const cellClass = [
                'flex justify-center',
                banded ? IN_RANGE : '',
                banded && iso === rangeStart ? RANGE_START : '',
                banded && iso === rangeEnd ? RANGE_END : '',
              ]
                .join(' ')
                .trim()
              return (
                <div key={iso} role="gridcell" className={cellClass}>
                  <button
                    type="button"
                    data-date={iso}
                    tabIndex={iso === active ? 0 : -1}
                    aria-selected={isSelected(iso)}
                    aria-disabled={isDisabled || undefined}
                    aria-current={iso === today ? 'date' : undefined}
                    aria-label={formatISODate(iso, locale, { dateStyle: 'full' })}
                    className={outside ? `${CELL} ${OUTSIDE}` : CELL}
                    onClick={() => pick(iso)}
                    onFocus={() => setFocused(iso)}
                    onMouseEnter={onHoverDate ? () => onHoverDate(iso) : undefined}
                  >
                    {Number(iso.slice(8))}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/** One valid set of props for the blind install test. */
Calendar.sampleProps = { value: '2026-03-08', locale: 'en-US' } satisfies CalendarProps
