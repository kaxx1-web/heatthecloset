import { daysBetween, todayISO } from './dates'
import { CATEGORIES } from './types'
import type { Category, ClosetData, HeatLevel, ISODate, Log, Piece } from './types'

// "once", "twice", "5 times"
export function timesPhrase(count: number): string {
  if (count === 1) return 'once'
  if (count === 2) return 'twice'
  return `${count} times`
}

// How many *different* pieces appear in the logs since a date.
// A Set only keeps one copy of each value, so its size is the unique count.
export function piecesWornCount(logs: Log[], since: ISODate): number {
  const ids = new Set<string>()
  for (const log of logs) {
    if (log.date >= since) log.pieceIds.forEach((id) => ids.add(id))
  }
  return ids.size
}

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

// Order pieces appear in an outfit, top to bottom.
const OUTFIT_ORDER: Category[] = ['Top', 'Bottom', 'Dress', 'Shoes', 'Outerwear', 'Bag', 'Accessory']

// A dress replaces a top and bottom, so they're never suggested together.
function clashesWith(category: Category): Category[] {
  if (category === 'Dress') return ['Top', 'Bottom']
  if (category === 'Top' || category === 'Bottom') return ['Dress']
  return []
}

export type OutfitSuggestion = {
  focus: Piece // the least-worn piece, the one we want you to wear again
  focusCount: number
  outfit: Piece[] // focus + favourites, in OUTFIT_ORDER
}

// Home's "Suggested outfit": the least-worn piece, paired with the most-worn
// piece from up to (maxPieces - 1) other categories. Returns null when
// there isn't enough data to suggest anything.
export function suggestOutfit(
  pieces: Piece[],
  logs: Log[],
  today: ISODate = todayISO(),
  maxPieces = 4,
): OutfitSuggestion | null {
  const stats = pieces.map((piece) => ({
    piece,
    count: timesWorn(logs, piece.id, CHALLENGE_DAYS, today),
    last: lastWorn(logs, piece.id) ?? '', // '' sorts first = never worn
  }))

  // Fewest wears first; on a tie, the one worn longest ago.
  const focus = [...stats].sort((a, b) => a.count - b.count || a.last.localeCompare(b.last))[0]
  if (!focus) return null

  const partners = goesWith(focus.piece, pieces, logs, today, maxPieces - 1)
  if (partners.length === 0) return null
  const outfit = [focus.piece, ...partners]
  outfit.sort((a, b) => OUTFIT_ORDER.indexOf(a.category) - OUTFIT_ORDER.indexOf(b.category))
  return { focus: focus.piece, focusCount: focus.count, outfit }
}

// "Goes with what you wear most": the most-worn piece from each other
// category that can be worn with `piece` (no dress with a top, etc.),
// up to `max` pieces. Only pieces worn in the last 30 days count.
export function goesWith(
  piece: Piece,
  pieces: Piece[],
  logs: Log[],
  today: ISODate = todayISO(),
  max = 3,
): Piece[] {
  const result: Piece[] = []
  const blocked = new Set<Category>([piece.category, ...clashesWith(piece.category)])
  for (const category of OUTFIT_ORDER) {
    if (result.length >= max) break
    if (blocked.has(category)) continue
    const favourite = pieces
      .filter((p) => p.category === category)
      .map((p) => ({
        piece: p,
        count: timesWorn(logs, p.id, CHALLENGE_DAYS, today),
        last: lastWorn(logs, p.id) ?? '',
      }))
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count || b.last.localeCompare(a.last))[0]
    if (!favourite) continue
    result.push(favourite.piece)
    blocked.add(category)
    clashesWith(category).forEach((c) => blocked.add(c))
  }
  return result
}

// Every day the piece was ever logged (not just the last 30 days).
export function timesWornEver(logs: Log[], pieceId: string): number {
  return logs.filter((log) => log.pieceIds.includes(pieceId)).length
}

// "Wear it this week" plans that should still show on Home: added in the
// last 7 days, piece still exists, and not worn since the plan was added.
export function activePlans(data: ClosetData, today: ISODate = todayISO()): Piece[] {
  return (data.plans ?? [])
    .filter((plan) => daysBetween(plan.addedOn, today) < 7)
    .filter((plan) => !data.logs.some((log) => log.date >= plan.addedOn && log.pieceIds.includes(plan.pieceId)))
    .map((plan) => data.pieces.find((p) => p.id === plan.pieceId))
    .filter((piece) => piece !== undefined)
}

// A piece is "forgotten" after this many days without being worn.
export const FORGOTTEN_DAYS = 14

export type Rediscovery = { piece: Piece; date: ISODate }

// Pieces that were forgotten and then worn again ("rediscovered"), most
// recent first. The gap is counted from the previous wear, or from the
// day the piece was added if it had never been worn.
export function rediscoveries(data: ClosetData): Rediscovery[] {
  const result: Rediscovery[] = []
  for (const piece of data.pieces) {
    const dates = data.logs
      .filter((log) => log.pieceIds.includes(piece.id))
      .map((log) => log.date)
      .sort()
    let previous = piece.createdAt
    let found: ISODate | null = null
    for (const date of dates) {
      if (daysBetween(previous, date) >= FORGOTTEN_DAYS) found = date
      previous = date
    }
    if (found) result.push({ piece, date: found })
  }
  return result.sort((a, b) => b.date.localeCompare(a.date))
}
