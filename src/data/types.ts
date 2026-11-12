// The shapes of everything Closet Map saves.

// `as const` makes TypeScript treat this as a fixed list of exact strings,
// so we can build the `Category` type from it and loop over it in the UI.
export const CATEGORIES = [
  'Top',
  'Bottom',
  'Dress',
  'Outerwear',
  'Shoes',
  'Bag',
  'Accessory',
] as const

// "Any one value from CATEGORIES", e.g. 'Top' | 'Bottom' | ...
export type Category = (typeof CATEGORIES)[number]

// A calendar day written as "YYYY-MM-DD". It's still a plain string; the
// alias just makes function signatures easier to read.
export type ISODate = string

export type Piece = {
  id: string
  name: string
  category: Category
  createdAt: ISODate
}

// One outfit per day. No photo is stored, only which pieces were worn.
export type Log = {
  date: ISODate
  pieceIds: string[]
}

export type Profile = {
  name: string
  startDate: ISODate // Day 1 of the 30-day challenge
}

// "Wear it this week": a reminder shown on Home for 7 days, or until the
// piece is worn.
export type Plan = {
  pieceId: string
  addedOn: ISODate
}

// Everything the app saves, kept together under one localStorage key.
export type ClosetData = {
  profile: Profile | null // null until the user finishes setup
  pieces: Piece[]
  logs: Log[]
  // Optional (?) because data saved before this feature doesn't have it.
  // Read it as `data.plans ?? []`.
  plans?: Plan[]
}

// The three colors on the heat map:
// hot = worn 3+ times, warm = worn once or twice, cold = not worn
// (all counted over the last 30 days).
export type HeatLevel = 'hot' | 'warm' | 'cold'
