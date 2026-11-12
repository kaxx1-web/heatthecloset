import { addDays, todayISO } from './dates'
import type { ClosetData, ISODate, Log, Piece } from './types'

// Demo mode: sample data so you can test the app without waiting a month.
// Instead of faking the clock, we move the start date back, so today really
// is day 12 or day 30. Every day before today gets a log, and today is left
// empty so you can still try logging an outfit.
//
// Usage (once screens exist):  saveData(createDemoData(12))

export type DemoDay = 12 | 30

const SAMPLE_PIECES: Omit<Piece, 'createdAt'>[] = [
  { id: 'demo-white-tee', name: 'White tee', category: 'Top' },
  { id: 'demo-striped-shirt', name: 'Striped shirt', category: 'Top' },
  { id: 'demo-silk-blouse', name: 'Silk blouse', category: 'Top' },
  { id: 'demo-jeans', name: 'Straight jeans', category: 'Bottom' },
  { id: 'demo-trousers', name: 'Black trousers', category: 'Bottom' },
  { id: 'demo-pleated-skirt', name: 'Pleated skirt', category: 'Bottom' },
  { id: 'demo-linen-dress', name: 'Linen dress', category: 'Dress' },
  { id: 'demo-denim-jacket', name: 'Denim jacket', category: 'Outerwear' },
  { id: 'demo-wool-coat', name: 'Wool coat', category: 'Outerwear' },
  { id: 'demo-sneakers', name: 'White sneakers', category: 'Shoes' },
  { id: 'demo-loafers', name: 'Loafers', category: 'Shoes' },
  { id: 'demo-red-heels', name: 'Red heels', category: 'Shoes' },
  { id: 'demo-tote', name: 'Canvas tote', category: 'Bag' },
  { id: 'demo-crossbody', name: 'Crossbody bag', category: 'Bag' },
  { id: 'demo-hoops', name: 'Gold hoops', category: 'Accessory' },
  { id: 'demo-belt', name: 'Leather belt', category: 'Accessory' },
]

// A weekly rotation of outfits (piece ids without the "demo-" prefix).
const WEEKLY_OUTFITS: string[][] = [
  ['white-tee', 'jeans', 'sneakers', 'tote'],
  ['striped-shirt', 'trousers', 'loafers', 'tote'],
  ['white-tee', 'jeans', 'sneakers', 'denim-jacket'],
  ['linen-dress', 'sneakers', 'crossbody'],
  ['striped-shirt', 'jeans', 'sneakers', 'tote'],
  ['white-tee', 'trousers', 'loafers', 'hoops'],
  ['striped-shirt', 'jeans', 'loafers', 'crossbody'],
]

// A few one-off changes so the heat map shows all three colors, and
// Profile has some "forgotten pieces worn again" (14+ days unworn):
// - Days 10 and 27: the silk blouse (warm; rediscovered on day 27).
// - Days 21 and 26: the belt (warm at day 30; rediscovered on day 21).
// - Day 25: the wool coat (warm; rediscovered after 24 days).
// - Skirt and heels are never worn, so they show as cold.
function outfitForDay(dayIndex: number): string[] {
  const outfit = [...WEEKLY_OUTFITS[dayIndex % WEEKLY_OUTFITS.length]]
  if (dayIndex === 9 || dayIndex === 26) outfit[0] = 'silk-blouse'
  if (dayIndex === 20 || dayIndex === 25) outfit.push('belt')
  if (dayIndex === 24) outfit.push('wool-coat')
  return outfit.map((name) => `demo-${name}`)
}

export function createDemoData(day: DemoDay, today: ISODate = todayISO()): ClosetData {
  const startDate = addDays(today, -(day - 1))

  const pieces: Piece[] = SAMPLE_PIECES.map((p) => ({ ...p, createdAt: startDate }))

  // One log for each day before today: indexes 0 through day - 2.
  const logs: Log[] = []
  for (let i = 0; i < day - 1; i++) {
    logs.push({ date: addDays(startDate, i), pieceIds: outfitForDay(i) })
  }

  return { profile: { name: 'Demo', startDate }, pieces, logs }
}
