// Matches what the outfit AI saw in a photo ("Black sweater", "Blue jeans")
// to the pieces already saved in your closet. Plain text matching on the
// names; no model involved. Used by the confirm screen on later days.
import { kindOf } from '../data/garmentKinds'
import type { Piece } from '../data/types'
import type { PieceGuess } from './outfit'

// The AI's color words, plus a few common ones people use in names.
const COLORS = [
  'light blue', 'black', 'white', 'grey', 'gray', 'navy', 'blue', 'red', 'pink', 'green', 'olive',
  'beige', 'brown', 'yellow', 'purple', 'orange', 'cream', 'tan', 'khaki',
]

// The first color word in a name, with "gray" and "grey" treated as one.
function colorOf(name: string): string | undefined {
  const lower = name.toLowerCase()
  const color = COLORS.find((c) => new RegExp(`\\b${c}\\b`).test(lower))
  return color === 'gray' ? 'grey' : color
}

// Which saved piece a guess most likely is, or undefined if none fits.
//
// A piece fits if it's the same kind of garment: "Straight jeans" fits the
// guess "Blue jeans", "Tan loafers" fits "Brown loafers". (Dresses only
// have one kind, so any dress fits.) If the AI's first guess fits nothing,
// its other guesses are tried, e.g. "sweater" then "cardigan".
//
// Among pieces that fit, the AI's color decides: same color first, then
// pieces with no color in their name, then other colors. Other colors
// still count, because the AI often gets colors wrong (it once called a
// denim jacket brown).
function bestMatch(guess: PieceGuess, pieces: Piece[]): Piece | undefined {
  const color = colorOf(guess.name)
  const colorRank = (piece: Piece) => {
    const pieceColor = colorOf(piece.name)
    if (pieceColor === color) return 2
    return pieceColor === undefined ? 1 : 0
  }

  for (const option of [guess, ...guess.alternatives]) {
    const kind = kindOf(option.category, option.name)
    const fits = pieces.filter(
      (piece) => piece.category === option.category && kindOf(piece.category, piece.name) === kind,
    )
    if (fits.length > 0) {
      // reduce keeps the first of equal ranks, so closet order breaks ties.
      return fits.reduce((best, piece) => (colorRank(piece) > colorRank(best) ? piece : best))
    }
  }
  return undefined
}

export type MatchResult = {
  pieceIds: string[] // saved pieces the photo shows, to select
  newPieces: PieceGuess[] // things in the photo that aren't in the closet yet
}

// Each saved piece is matched at most once, so two guesses can't both
// select the same pair of jeans.
export function matchGuesses(guesses: PieceGuess[], pieces: Piece[]): MatchResult {
  const pieceIds: string[] = []
  const newPieces: PieceGuess[] = []
  for (const guess of guesses) {
    const available = pieces.filter((piece) => !pieceIds.includes(piece.id))
    const match = bestMatch(guess, available)
    if (match) pieceIds.push(match.id)
    else newPieces.push(guess)
  }
  return { pieceIds, newPieces }
}
