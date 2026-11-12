import { todayISO } from './dates'
import type { Category, ClosetData, ISODate, Piece, Profile } from './types'

// Bump the "v1" if the data shape ever changes, so old saved data
// doesn't get read as if it had the new shape.
const STORAGE_KEY = 'closet-map:v1'

export const EMPTY_DATA: ClosetData = { profile: null, pieces: [], logs: [] }

// localStorage can throw: in private browsing, when storage is full, or
// when the user has blocked site data. Every call is wrapped in try/catch,
// so the app keeps working without saving instead of crashing.

export function loadData(): ClosetData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_DATA
    const parsed: unknown = JSON.parse(raw)
    return isClosetData(parsed) ? parsed : EMPTY_DATA
  } catch {
    return EMPTY_DATA
  }
}

// Returns false if saving failed, so the UI can show a warning.
export function saveData(data: ClosetData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function clearData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to do. If we can't access storage, there's nothing to clear.
  }
}

// A quick shape check, in case saved data was corrupted or hand-edited.
function isClosetData(value: unknown): value is ClosetData {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    Array.isArray(v.pieces) &&
    Array.isArray(v.logs) &&
    (v.profile === null || typeof v.profile === 'object')
  )
}

// ---- Updates ----
// Each helper returns a *new* ClosetData object and never changes the old
// one. React only notices a state change when it gets a new object.

export function setProfile(data: ClosetData, profile: Profile): ClosetData {
  return { ...data, profile }
}

export function addPiece(
  data: ClosetData,
  name: string,
  category: Category,
  today: ISODate = todayISO(),
): ClosetData {
  const piece: Piece = {
    id: crypto.randomUUID(), // a built-in random unique id
    name: name.trim(),
    category,
    createdAt: today,
  }
  return { ...data, pieces: [...data.pieces, piece] }
}

// Saves the outfit for a date. If that date already has a log, it's replaced.
export function saveLog(
  data: ClosetData,
  date: ISODate,
  pieceIds: string[],
): ClosetData {
  const otherDays = data.logs.filter((log) => log.date !== date)
  return { ...data, logs: [...otherDays, { date, pieceIds }] }
}
