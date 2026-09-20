/**
 * Date arithmetic for the pickers, with no date library and no local time.
 *
 * Every calendar day is a `YYYY-MM-DD` string and every calculation runs on
 * `Date.UTC`, so a day is a day: local-time arithmetic loses or gains an hour
 * across a DST change and a grid built on it skips or repeats a date. Wall
 * clock time only enters at the very edge, in `DateTimePicker`, through
 * `Intl.DateTimeFormat` with an explicit `timeZone`.
 */

/** A calendar date with no time and no zone, as `YYYY-MM-DD`. */
export type ISODate = string
/** A wall-clock time as `HH:mm`, 24-hour. */
export type ISOTime = string

export interface DateParts {
  year: number
  /** 1–12. */
  month: number
  day: number
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const ISO_TIME = /^(\d{2}):(\d{2})$/

const pad = (n: number, width = 2) => String(n).padStart(width, '0')

export const daysInMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate()

export const toISODate = ({ year, month, day }: DateParts): ISODate =>
  `${pad(year, 4)}-${pad(month)}-${pad(day)}`

/** `null` for anything that is not a real calendar date. */
export const parseISODate = (value: string | null | undefined): DateParts | null => {
  if (!value) return null
  const match = ISO_DATE.exec(value)
  if (!match) return null
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null
  return { year, month, day }
}

export const isISODate = (value: string) => parseISODate(value) !== null

/** The UTC instant at midnight of a date, for arithmetic and for Intl with `timeZone: 'UTC'`. */
export const toUTC = (iso: ISODate): Date => {
  const parts = parseISODate(iso)
  if (!parts) throw new Error(`Not a date: ${iso}`)
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
}

export const fromUTC = (date: Date): ISODate =>
  toISODate({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() })

export const addDays = (iso: ISODate, days: number): ISODate => {
  const date = toUTC(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return fromUTC(date)
}

/** Keeps the day where it can and clamps to the month's end where it cannot (31 Jan + 1 = 28 Feb). */
export const addMonths = (iso: ISODate, months: number): ISODate => {
  const { year, month, day } = parseISODate(iso)!
  const total = year * 12 + (month - 1) + months
  const nextYear = Math.floor(total / 12)
  const nextMonth = (total % 12) + 1
  return toISODate({
    year: nextYear,
    month: nextMonth,
    day: Math.min(day, daysInMonth(nextYear, nextMonth)),
  })
}

/** ISO strings of the same shape compare as strings. */
export const compareISO = (a: ISODate, b: ISODate) => (a < b ? -1 : a > b ? 1 : 0)

export const clampISO = (iso: ISODate, min?: ISODate, max?: ISODate) =>
  min && iso < min ? min : max && iso > max ? max : iso

/** Today, as the calendar date where the browser is. */
export const todayISO = (): ISODate => {
  const now = new Date()
  return toISODate({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() })
}

/** 1 = Monday … 7 = Sunday, as Intl counts. */
export const weekdayOf = (iso: ISODate) => {
  const day = toUTC(iso).getUTCDay()
  return day === 0 ? 7 : day
}

export const startOfWeek = (iso: ISODate, firstDay: number) => {
  const diff = (weekdayOf(iso) - firstDay + 7) % 7
  return addDays(iso, -diff)
}

export const firstOfMonth = (iso: ISODate) => iso.slice(0, 8) + '01'

/**
 * Six weeks of days covering a month, from the first week that contains its
 * first day. Always six rows, so the grid keeps one height as months change
 * and nothing below it jumps.
 */
export const monthGrid = (year: number, month: number, firstDay: number): ISODate[][] => {
  const start = startOfWeek(toISODate({ year, month, day: 1 }), firstDay)
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)),
  )
}

// ------------------------------------------------------------------ locale

const resolveLocale = (locale?: string) =>
  locale ?? new Intl.DateTimeFormat().resolvedOptions().locale

/**
 * The locale's first day of the week, 1 = Monday … 7 = Sunday. Read from
 * `Intl.Locale`'s week info where the engine has it (Chrome, Safari, Node),
 * Monday elsewhere — the ISO answer, and right for most of the world.
 */
export const firstDayOfWeek = (locale?: string): number => {
  try {
    const info = new Intl.Locale(resolveLocale(locale)) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number }
      weekInfo?: { firstDay: number }
    }
    const week = info.getWeekInfo?.() ?? info.weekInfo
    if (week && week.firstDay >= 1 && week.firstDay <= 7) return week.firstDay
  } catch {
    // An unknown locale tag: fall through.
  }
  return 1
}

/** Weekday names in grid order, starting from `firstDay`. Monday 5 Jan 2026 is the anchor. */
export const weekdayNames = (
  locale: string | undefined,
  firstDay: number,
  width: 'short' | 'long' | 'narrow' = 'short',
) => {
  const format = new Intl.DateTimeFormat(resolveLocale(locale), { weekday: width, timeZone: 'UTC' })
  return Array.from({ length: 7 }, (_, index) => {
    const weekday = ((firstDay - 1 + index) % 7) + 1
    return format.format(new Date(Date.UTC(2026, 0, 4 + weekday)))
  })
}

export const monthNames = (locale?: string, width: 'long' | 'short' = 'long') => {
  const format = new Intl.DateTimeFormat(resolveLocale(locale), { month: width, timeZone: 'UTC' })
  return Array.from({ length: 12 }, (_, index) => format.format(new Date(Date.UTC(2026, index, 1))))
}

/** A date rendered in the locale, with no zone shift because the instant is UTC midnight. */
export const formatISODate = (
  iso: ISODate,
  locale?: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
) =>
  new Intl.DateTimeFormat(resolveLocale(locale), { ...options, timeZone: 'UTC' }).format(toUTC(iso))

/** The order the locale writes day, month and year in, e.g. `['month', 'day', 'year']`. */
export const dateFieldOrder = (locale?: string): Array<'day' | 'month' | 'year'> =>
  new Intl.DateTimeFormat(resolveLocale(locale), {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .formatToParts(new Date(Date.UTC(2026, 0, 5)))
    .filter((part) => part.type === 'day' || part.type === 'month' || part.type === 'year')
    .map((part) => part.type as 'day' | 'month' | 'year')

/** What the locale's short date looks like, for a placeholder: `MM/DD/YYYY`, `DD.MM.YYYY`. */
export const datePlaceholder = (locale?: string) =>
  new Intl.DateTimeFormat(resolveLocale(locale), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .formatToParts(new Date(Date.UTC(2026, 0, 5)))
    .map((part) =>
      part.type === 'day'
        ? 'DD'
        : part.type === 'month'
          ? 'MM'
          : part.type === 'year'
            ? 'YYYY'
            : part.value,
    )
    .join('')

/**
 * Reads a date typed in the locale's order, or in ISO. Any run of digits is a
 * field; separators are whatever the user used. A two-digit year is taken as
 * this century. `null` when it is not a date.
 */
export const parseLocaleDate = (text: string, locale?: string): ISODate | null => {
  const trimmed = text.trim()
  if (!trimmed) return null
  if (isISODate(trimmed)) return trimmed
  const numbers = trimmed.match(/\d+/g)
  if (!numbers || numbers.length !== 3) return null
  const parts: Partial<DateParts> = {}
  dateFieldOrder(locale).forEach((field, index) => {
    parts[field] = Number(numbers[index])
  })
  if (parts.year === undefined || parts.month === undefined || parts.day === undefined) return null
  const year =
    numbers[dateFieldOrder(locale).indexOf('year')].length <= 2 ? 2000 + parts.year : parts.year
  const iso = toISODate({ year, month: parts.month, day: parts.day })
  return isISODate(iso) ? iso : null
}

// -------------------------------------------------------------------- time

export interface TimeParts {
  hour: number
  minute: number
}

export const parseISOTime = (value: string | null | undefined): TimeParts | null => {
  if (!value) return null
  const match = ISO_TIME.exec(value)
  if (!match) return null
  const [hour, minute] = [Number(match[1]), Number(match[2])]
  if (hour > 23 || minute > 59) return null
  return { hour, minute }
}

export const toISOTime = ({ hour, minute }: TimeParts): ISOTime => `${pad(hour)}:${pad(minute)}`

/** Whether the locale writes the hour on a 12-hour clock. */
export const usesTwelveHourClock = (locale?: string) =>
  new Intl.DateTimeFormat(resolveLocale(locale), { hour: 'numeric' }).resolvedOptions().hour12 ===
  true

/** The locale's day-period labels, e.g. `['AM', 'PM']` or `['vorm.', 'nachm.']`. */
export const dayPeriods = (locale?: string): [string, string] => {
  const format = new Intl.DateTimeFormat(resolveLocale(locale), {
    hour: 'numeric',
    hour12: true,
    timeZone: 'UTC',
  })
  const periodOf = (hour: number) =>
    format
      .formatToParts(new Date(Date.UTC(2026, 0, 5, hour)))
      .find((part) => part.type === 'dayPeriod')?.value
  return [periodOf(9) ?? 'AM', periodOf(21) ?? 'PM']
}

export const formatISOTime = (time: ISOTime, locale?: string, hour12?: boolean) => {
  const parts = parseISOTime(time)
  if (!parts) return ''
  return new Intl.DateTimeFormat(resolveLocale(locale), {
    hour: 'numeric',
    minute: '2-digit',
    hour12,
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2026, 0, 5, parts.hour, parts.minute)))
}

// -------------------------------------------------------------------- zones

const OFFSET = /GMT([+-])(\d{1,2})(?::?(\d{2}))?/

/**
 * The zone's UTC offset in minutes at an instant, read from Intl's
 * `longOffset` name ("GMT+05:30"). "GMT" alone is zero.
 */
export const offsetMinutes = (instant: Date, timeZone: string): number => {
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(instant)
      .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT'
  const match = OFFSET.exec(name)
  if (!match) return 0
  const sign = match[1] === '-' ? -1 : 1
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0))
}

export const formatOffset = (minutes: number) => {
  const sign = minutes < 0 ? '-' : '+'
  const abs = Math.abs(minutes)
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

/** The wall-clock date and time an instant shows on a clock in `timeZone`. */
export const zonedParts = (instant: Date, timeZone: string): { date: ISODate; time: ISOTime } => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant)
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  return {
    date: toISODate({ year: get('year'), month: get('month'), day: get('day') }),
    time: toISOTime({ hour: get('hour') % 24, minute: get('minute') }),
  }
}

/**
 * The instant at which a clock in `timeZone` reads this date and time.
 *
 * Guess the instant as if the wall time were UTC and read the zone's offset
 * there; apply it and read again. Away from a DST change the two agree.
 * Across one they differ, and the smaller offset is used: for a wall time
 * that does not exist (the skipped hour in spring) that lands an hour later,
 * which is what clocks do, and for one that happens twice (autumn) it picks
 * the first.
 */
export const zonedInstant = (date: ISODate, time: ISOTime, timeZone: string): Date => {
  const { year, month, day } = parseISODate(date)!
  const { hour, minute } = parseISOTime(time)!
  const guess = Date.UTC(year, month - 1, day, hour, minute)
  const first = offsetMinutes(new Date(guess), timeZone)
  const second = offsetMinutes(new Date(guess - first * 60_000), timeZone)
  return new Date(guess - Math.min(first, second) * 60_000)
}

/** `2026-03-08T09:30:00+05:30`: an ISO 8601 instant with the zone's offset spelled out. */
export const toISOWithOffset = (instant: Date, timeZone: string): string => {
  const { date, time } = zonedParts(instant, timeZone)
  return `${date}T${time}:00${formatOffset(offsetMinutes(instant, timeZone))}`
}

/** Anything `Date` can parse as an instant, else `null`. */
export const parseInstant = (value: string | null | undefined): Date | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const browserTimeZone = () => new Intl.DateTimeFormat().resolvedOptions().timeZone

/** A short label for the zone at an instant: "GMT+5:30", "PDT". */
export const zoneLabel = (instant: Date, timeZone: string, locale?: string) =>
  new Intl.DateTimeFormat(resolveLocale(locale), { timeZone, timeZoneName: 'short' })
    .formatToParts(instant)
    .find((part) => part.type === 'timeZoneName')?.value ?? timeZone
