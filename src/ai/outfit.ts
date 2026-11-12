// Turns a photo's numbers (embeddings) into named clothing guesses.
// This file is plain math: no model, no browser APIs. The Web Worker
// (clothing.worker.ts) runs the model and calls guessOutfit().
import type { Category } from '../data/types'

export type Region = 'upper' | 'lower' | 'feet'

// Where to look in a full-length mirror selfie, as fractions of the photo:
// [left, top, right, bottom]. A rough guess at where tops, bottoms and shoes
// usually are when someone stands in the middle of the frame. Checked on 24
// labelled street-style photos (Fashionpedia): with these boxes it found
// 50 of 56 garments.
export const REGIONS: Record<Region, [number, number, number, number]> = {
  upper: [0.15, 0.12, 0.85, 0.5],
  lower: [0.2, 0.45, 0.8, 0.82],
  feet: [0.1, 0.68, 0.9, 0.98],
}

export type Label = { name: string; category?: Category; none?: boolean; vector: number[] }
export type Dictionary = { model: string; groups: Record<Region | 'color', Label[]> }

export type PieceGuess = {
  name: string // e.g. "Black t-shirt"
  category: Category
  confidence: number // 0–1, how sure the model is about the garment
  alternatives: { name: string; category: Category }[] // next-best guesses
}

const dot = (a: number[], b: number[]) => a.reduce((sum, x, i) => sum + x * b[i], 0)

// Similarity scores -> probabilities that add up to 1. The ×100 makes the
// best match stand out, as in the model's own example code.
function softmax(scores: number[]): number[] {
  const scaled = scores.map((s) => s * 100)
  const max = Math.max(...scaled)
  const exps = scaled.map((s) => Math.exp(s - max))
  const total = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / total)
}

// Rank one group's labels for one image, most likely first.
function rank(image: number[], labels: Label[]) {
  const probs = softmax(labels.map((label) => dot(image, label.vector)))
  return labels.map((label, i) => ({ label, p: probs[i] })).sort((a, b) => b.p - a.p)
}

const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1)

// Below this, a garment guess is too unsure to show.
const MIN_CONFIDENCE = 0.2

function guessRegion(region: Region, image: number[], dict: Dictionary): PieceGuess | null {
  const ranked = rank(image, dict.groups[region])
  const best = ranked[0]
  // The crop most likely shows no clothing (just floor, wall…): skip it.
  if (best.label.none || best.p < MIN_CONFIDENCE || !best.label.category) return null

  const color = rank(image, dict.groups.color)[0].label.name
  const named = (label: Label) => ({ name: capitalize(`${color} ${label.name}`), category: label.category! })
  return {
    ...named(best.label),
    confidence: best.p,
    alternatives: ranked
      .slice(1)
      .filter((r) => !r.label.none && r.label.category && r.p >= 0.08)
      .slice(0, 2)
      .map((r) => named(r.label)),
  }
}

// One guess per region (top, bottom, shoes). `images` holds each region's
// embedding, already normalized to length 1.
export function guessOutfit(images: Record<Region, number[]>, dict: Dictionary): PieceGuess[] {
  const upper = guessRegion('upper', images.upper, dict)
  const lower = guessRegion('lower', images.lower, dict)
  const feet = guessRegion('feet', images.feet, dict)

  // A dress covers both the top and bottom crops. If either crop looks like
  // a dress, keep a single dress (the surer guess) instead of two pieces.
  const dressGuesses = [upper, lower].filter((g) => g?.category === 'Dress')
  const body =
    dressGuesses.length > 0
      ? [dressGuesses.sort((a, b) => b!.confidence - a!.confidence)[0]]
      : [upper, lower]

  return [...body, feet].filter((g): g is PieceGuess => g !== null)
}
