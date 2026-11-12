import { daysBetween, todayISO } from './dates'
import { CATEGORIES } from './types'
import type { HeatLevel, ISODate, Log, Piece } from './types'

export const CHALLENGE_DAYS = 30

// How many days in the last `sinceDays` days (today included) the piece
// was worn. With sinceDays = 30, that's today plus the 29 days before it.
export function timesWorn(
  logs: Log[],
  pieceId: string,
  sinceDays: number = CHALLENGE_DAYS,
  today: ISODate = todayISO(),
): number {
  return logs.filter((log) => {
    const daysAgo = daysBetween(log.date, today)
    return daysAgo >= 0 && daysAgo < sinceDays && log.pieceIds.includes(pieceId)
  }).length
}

// The most recent date the piece was worn, or null if never.
// "YYYY-MM-DD" strings sort in date order, so a plain `>` comparison
// between two of them works.
export function lastWorn(logs: Log[], pieceId: string): ISODate | null {
  let latest: ISODate | null = null
  for (const log of logs) {
    if (log.pieceIds.includes(pieceId) && (latest === null || log.date > latest)) {
      latest = log.date
    }
  }
  return latest
}

// "Day X of 30". The start date is day 1. The result stays between 1 and 30,
// so it never shows "day 0" or "day 31 of 30".
export function dayNumber(startDate: ISODate, today: ISODate = todayISO()): number {
  const day = daysBetween(startDate, today) + 1
  return Math.min(CHALLENGE_DAYS, Math.max(1, day))
}

// The color for one piece on the heat map.
export function heatLevel(
  logs: Log[],
  pieceId: string,
  today: ISODate = todayISO(),
): HeatLevel {
  const count = timesWorn(logs, pieceId, CHALLENGE_DAYS, today)
  if (count >= 3) return 'hot'
  if (count >= 1) return 'warm'
  return 'cold'
}

// The "suggestion" after a photo. There's no image recognition: we just
// pre-check the most-worn piece in each category (last 30 days). If two
// pieces tie, the one worn more recently wins. Categories nobody has worn
// yet get no suggestion. The user always confirms or edits the result.
export function suggestPieces(
  pieces: Piece[],
  logs: Log[],
  today: ISODate = todayISO(),
): string[] {
  const suggested: string[] = []
  for (const category of CATEGORIES) {
    let best: { id: string; count: number; last: ISODate } | null = null
    for (const piece of pieces) {
      if (piece.category !== category) continue
      const count = timesWorn(logs, piece.id, CHALLENGE_DAYS, today)
      const last = lastWorn(logs, piece.id) ?? ''
      if (count === 0) continue
      if (!best || count > best.count || (count === best.count && last > best.last)) {
        best = { id: piece.id, count, last }
      }
    }
    if (best) suggested.push(best.id)
  }
  return suggested
}
