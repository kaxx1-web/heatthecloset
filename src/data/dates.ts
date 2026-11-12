import type { ISODate } from './types'

// Why not just use `new Date('2026-11-11')`?
// JavaScript reads that string as midnight in *UTC*, so in New York it
// becomes Nov 10 at 7pm and the user would see the wrong day. Here we only
// ever work with the year, month and day numbers, so time zones can't
// shift a date.

const MS_PER_DAY = 24 * 60 * 60 * 1000

function toISODate(year: number, month: number, day: number): ISODate {
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

// Today's date on the user's own calendar (their local time zone).
export function todayISO(now: Date = new Date()): ISODate {
  return toISODate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

// Turns "YYYY-MM-DD" into a day count since 1970-01-01.
// We use Date.UTC with plain numbers because UTC has no daylight saving:
// every day is exactly 24 hours, so subtracting two counts is always exact.
function dayIndex(date: ISODate): number {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day) / MS_PER_DAY
}

// How many days `to` is after `from`. The result is negative if `to` is
// earlier. Example: daysBetween('2026-11-01', '2026-11-03') === 2
export function daysBetween(from: ISODate, to: ISODate): number {
  return dayIndex(to) - dayIndex(from)
}

// For display, e.g. "Oct 22". We format in UTC on purpose: dayIndex() built
// the date in UTC, so reading it back in UTC gives the same calendar day.
const shortDate = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})
export function formatShortDate(date: ISODate): string {
  return shortDate.format(dayIndex(date) * MS_PER_DAY)
}

// Example: addDays('2026-11-30', 1) === '2026-12-01'. Pass a negative
// number to go back in time.
export function addDays(date: ISODate, days: number): ISODate {
  const d = new Date((dayIndex(date) + days) * MS_PER_DAY)
  return toISODate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())
}
