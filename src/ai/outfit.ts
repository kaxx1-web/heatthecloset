// Turns a photo's numbers (embeddings) into named clothing guesses.
// This file is plain math: no model, no browser APIs. The Web Worker
// (clothing.worker.ts) runs the model and calls guessOutfit().
import type { Category } from '../data/types'

export type Region = 'whole' | 'upper' | 'lower' | 'feet'

// Where to look, as fractions of the photo: [left, top, right, bottom].
// upper / lower / feet are a rough guess at where tops, bottoms and shoes
// are in a full-length mirror selfie (checked on 24 labelled street-style
// photos from Fashionpedia: 50 of 56 garments found). `whole` is the full
// photo, so a waist-up selfie, where the "upper" area is mostly face,
// still gets its top named.
export const REGIONS: Record<Region, [number, number, number, number]> = {
  whole: [0, 0, 1, 1],
  upper: [0.15, 0.12, 0.85, 0.5],
  lower: [0.2, 0.45, 0.8, 0.82],
  feet: [0.1, 0.68, 0.9, 0.98],
}

// What each area chooses from, besides the "no clothing here" labels (face,
// wall, floor…). The feet area also considers tops, bottoms and dresses,
// so a sweater that fills the bottom of a waist-up selfie is recognised as
// a sweater. (When it could only choose between shoes, it had to call a
// black knit "black heels".) Only answers that can't be right for an area
// are left out: shoes are only looked for in the feet area, and trousers
// or skirts never in the upper one.
const ALLOWED: Record<Region, Category[]> = {
  whole: ['Top', 'Outerwear', 'Dress', 'Bottom'],
  upper: ['Top', 'Outerwear', 'Dress'],
  lower: ['Top', 'Outerwear', 'Dress', 'Bottom'],
  feet: ['Top', 'Outerwear', 'Dress', 'Bottom', 'Shoes'],
}

export type Label = { name: string; category?: Category; none?: boolean; vector: number[] }
// The labels are stored in groups (built by scripts/build-clothing-embeddings.mjs);
// guessOutfit pools the garment groups into one list.
export type Dictionary = { model: string; groups: Record<'upper' | 'lower' | 'feet' | 'color', Label[]> }

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

// Rank labels for one image, most likely first.
function rank(image: number[], labels: Label[]) {
  const probs = softmax(labels.map((label) => dot(image, label.vector)))
  return labels.map((label, i) => ({ label, p: probs[i] })).sort((a, b) => b.p - a.p)
}

// Every garment and "no clothing" label, once each ("dress" and "wall"
// appear in more than one group).
function allLabels(dict: Dictionary): Label[] {
  const byName = new Map<string, Label>()
  for (const group of [dict.groups.upper, dict.groups.lower, dict.groups.feet]) {
    for (const label of group) if (!byName.has(label.name)) byName.set(label.name, label)
  }
  return [...byName.values()]
}

const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1)

// Below this, a garment guess is too unsure to show.
const MIN_CONFIDENCE = 0.2

function guessRegion(region: Region, image: number[], labels: Label[], dict: Dictionary): PieceGuess | null {
  const choices = labels.filter((label) => label.none || (label.category && ALLOWED[region].includes(label.category)))
  const ranked = rank(image, choices)
  const best = ranked[0]
  // Most likely no clothing (just a face, floor, wall…) or too unsure: skip.
  if (best.label.none || best.p < MIN_CONFIDENCE || !best.label.category) return null

  const color = rank(image, dict.groups.color)[0].label.name
  const named = (label: Label) => ({ name: capitalize(`${color} ${label.name}`), category: label.category! })
  return {
    ...named(best.label),
    confidence: best.p,
    alternatives: ranked
      .slice(1)
      .filter((r) => !r.label.none && r.label.category === best.label.category && r.p >= 0.08)
      .slice(0, 2)
      .map((r) => named(r.label)),
  }
}

// One guess per kind of piece (top, outerwear, bottom or dress, shoes).
// `images` holds each area's embedding, already normalized to length 1.
export function guessOutfit(images: Record<Region, number[]>, dict: Dictionary): PieceGuess[] {
  const labels = allLabels(dict)
  const guesses = (Object.keys(REGIONS) as Region[])
    .map((region) => guessRegion(region, images[region], labels, dict))
    .filter((g): g is PieceGuess => g !== null)

  // Several areas often see the same garment (the whole photo and the
  // upper area both see the top). Keep the surest guess of each category.
  const best = new Map<Category, PieceGuess>()
  for (const guess of guesses) {
    const current = best.get(guess.category)
    if (!current || guess.confidence > current.confidence) best.set(guess.category, guess)
  }

  // A dress covers the top and bottom areas, which then often look like a
  // top and a skirt. Keep the dress if it's surer than at least one of
  // them (or than the only one); then it replaces both.
  const dress = best.get('Dress')
  if (dress) {
    const rivals = [best.get('Top'), best.get('Bottom')].filter((g) => g !== undefined)
    if (rivals.length === 0 || rivals.some((g) => dress.confidence > g.confidence)) {
      best.delete('Top')
      best.delete('Bottom')
    } else {
      best.delete('Dress')
    }
  }

  // Head-to-toe order, as on the confirm screen.
  const order: Category[] = ['Outerwear', 'Top', 'Dress', 'Bottom', 'Shoes']
  return order.map((category) => best.get(category)).filter((g) => g !== undefined)
}
