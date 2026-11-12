import { CHALLENGE_DAYS, heatLevel, lastWorn, timesWorn } from '../data/stats'
import type { Category, HeatLevel, ISODate, Log, Piece } from '../data/types'

// Heat map colors from Figma 11. The darkest color (rust) marks the pieces
// that need attention: not worn in the last 30 days.
export const HEAT: Record<HeatLevel, { label: string; bg: string; text: string }> = {
  hot: { label: 'Worn 3+ times', bg: 'bg-peach', text: 'text-ink' },
  warm: { label: 'Once or twice', bg: 'bg-apricot', text: 'text-ink' },
  // White text on rust: black on rust is too low-contrast for small text.
  cold: { label: 'Not worn', bg: 'bg-rust', text: 'text-white' },
}

// Bar segments go from most worn to not worn, left to right.
export const HEAT_ORDER: HeatLevel[] = ['hot', 'warm', 'cold']

export const CATEGORY_PLURALS: Record<Category, string> = {
  Top: 'Tops',
  Bottom: 'Bottoms',
  Dress: 'Dresses',
  Outerwear: 'Outerwear',
  Shoes: 'Shoes',
  Bag: 'Bags',
  Accessory: 'Accessories',
}

export type PieceHeat = { piece: Piece; level: HeatLevel; count: number; last: ISODate | null }

// Heat details for a list of pieces, least worn first (never-worn pieces,
// then the ones worn longest ago).
export function piecesByHeat(pieces: Piece[], logs: Log[], today: ISODate): PieceHeat[] {
  return pieces
    .map((piece) => ({
      piece,
      level: heatLevel(logs, piece.id, today),
      count: timesWorn(logs, piece.id, CHALLENGE_DAYS, today),
      last: lastWorn(logs, piece.id),
    }))
    .sort((a, b) => a.count - b.count || (a.last ?? '').localeCompare(b.last ?? ''))
}

// How many pieces are at each level, e.g. { hot: 3, warm: 1, cold: 2 }.
export function countLevels(items: PieceHeat[]): Record<HeatLevel, number> {
  const counts = { hot: 0, warm: 0, cold: 0 }
  for (const item of items) counts[item.level] += 1
  return counts
}
