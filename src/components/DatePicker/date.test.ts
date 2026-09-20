import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  datePlaceholder,
  dateFieldOrder,
  dayPeriods,
  firstDayOfWeek,
  formatISODate,
  formatOffset,
  monthGrid,
  monthNames,
  offsetMinutes,
  parseISODate,
  parseISOTime,
  parseLocaleDate,
  startOfWeek,
  toISOWithOffset,
  usesTwelveHourClock,
  weekdayNames,
  weekdayOf,
  zonedInstant,
  zonedParts,
} from './date'

describe('ISO dates', () => {
  it('parses real dates and rejects the rest', () => {
    expect(parseISODate('2026-02-28')).toEqual({ year: 2026, month: 2, day: 28 })
    expect(parseISODate('2026-02-29')).toBeNull()
    expect(parseISODate('2024-02-29')).not.toBeNull()
    expect(parseISODate('2026-13-01')).toBeNull()
    expect(parseISODate('26-1-5')).toBeNull()
    expect(parseISODate('')).toBeNull()
  })

  it('adds days and months in UTC, clamping the day', () => {
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
    expect(addMonths('2026-12-15', 1)).toBe('2027-01-15')
    expect(addMonths('2026-01-15', -13)).toBe('2024-12-15')
  })

  it('knows weekdays with Monday as 1', () => {
    expect(weekdayOf('2026-01-05')).toBe(1)
    expect(weekdayOf('2026-01-04')).toBe(7)
    expect(startOfWeek('2026-01-07', 1)).toBe('2026-01-05')
    expect(startOfWeek('2026-01-07', 7)).toBe('2026-01-04')
  })

  it('builds a six-week grid from the first week of the month', () => {
    const grid = monthGrid(2026, 2, 1)
    expect(grid).toHaveLength(6)
    expect(grid[0][0]).toBe('2026-01-26')
    expect(grid[0][6]).toBe('2026-02-01')
    expect(grid[5][6]).toBe('2026-03-08')
    expect(monthGrid(2026, 2, 7)[0][0]).toBe('2026-02-01')
  })
})

describe('locale', () => {
  it('reads the first day of the week from Intl', () => {
    expect(firstDayOfWeek('en-US')).toBe(7)
    expect([1, 7]).toContain(firstDayOfWeek('en-GB'))
    expect(firstDayOfWeek('zz-ZZ')).toBe(1)
  })

  it('names weekdays in grid order and months in full', () => {
    expect(weekdayNames('en-US', 7)[0]).toBe('Sun')
    expect(weekdayNames('en-US', 1)[0]).toBe('Mon')
    expect(weekdayNames('fr-FR', 1)[0]).toMatch(/^lun/)
    expect(monthNames('en-US')[0]).toBe('January')
    expect(monthNames('de-DE')[2]).toBe('März')
  })

  it('formats without a zone shift', () => {
    expect(formatISODate('2026-01-05', 'en-US')).toBe('Jan 5, 2026')
    expect(formatISODate('2026-01-05', 'en-GB')).toBe('5 Jan 2026')
  })

  it('knows the field order and placeholder', () => {
    expect(dateFieldOrder('en-US')).toEqual(['month', 'day', 'year'])
    expect(dateFieldOrder('en-GB')).toEqual(['day', 'month', 'year'])
    expect(datePlaceholder('en-US')).toBe('MM/DD/YYYY')
    expect(datePlaceholder('de-DE')).toBe('DD.MM.YYYY')
  })

  it('parses typed dates in the locale order, or ISO', () => {
    expect(parseLocaleDate('3/8/2026', 'en-US')).toBe('2026-03-08')
    expect(parseLocaleDate('8/3/2026', 'en-GB')).toBe('2026-03-08')
    expect(parseLocaleDate('08.03.26', 'de-DE')).toBe('2026-03-08')
    expect(parseLocaleDate('2026-03-08', 'en-US')).toBe('2026-03-08')
    expect(parseLocaleDate('31/2/2026', 'en-GB')).toBeNull()
    expect(parseLocaleDate('tomorrow', 'en-US')).toBeNull()
    expect(parseLocaleDate('', 'en-US')).toBeNull()
  })
})

describe('time', () => {
  it('parses HH:mm', () => {
    expect(parseISOTime('09:05')).toEqual({ hour: 9, minute: 5 })
    expect(parseISOTime('24:00')).toBeNull()
    expect(parseISOTime('9:05')).toBeNull()
  })

  it('knows the clock and the day periods of a locale', () => {
    expect(usesTwelveHourClock('en-US')).toBe(true)
    expect(usesTwelveHourClock('de-DE')).toBe(false)
    expect(dayPeriods('en-US')).toEqual(['AM', 'PM'])
  })
})

describe('zones', () => {
  it('reads offsets, including half hours and negatives', () => {
    const instant = new Date('2026-01-15T12:00:00Z')
    expect(offsetMinutes(instant, 'Asia/Kolkata')).toBe(330)
    expect(offsetMinutes(instant, 'America/New_York')).toBe(-300)
    expect(offsetMinutes(instant, 'UTC')).toBe(0)
    expect(formatOffset(330)).toBe('+05:30')
    expect(formatOffset(-300)).toBe('-05:00')
  })

  it('converts wall time to an instant and back, across DST', () => {
    const instant = zonedInstant('2026-07-04', '09:30', 'America/New_York')
    expect(instant.toISOString()).toBe('2026-07-04T13:30:00.000Z')
    expect(zonedParts(instant, 'America/New_York')).toEqual({ date: '2026-07-04', time: '09:30' })
    expect(toISOWithOffset(instant, 'America/New_York')).toBe('2026-07-04T09:30:00-04:00')
    expect(toISOWithOffset(instant, 'Asia/Kolkata')).toBe('2026-07-04T19:00:00+05:30')
  })

  it('lands a skipped spring-forward hour an hour later, like a clock', () => {
    // 2:30 does not exist on 8 March 2026 in New York.
    const instant = zonedInstant('2026-03-08', '02:30', 'America/New_York')
    expect(zonedParts(instant, 'America/New_York').time).toBe('03:30')
  })
})
