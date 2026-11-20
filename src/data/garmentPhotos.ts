import { kindOf } from './garmentKinds'
import type { Category, Piece } from './types'

// Stock photos for pieces that don't have a photo of their own.
//
// There are several photos per category, each tagged with the kind of
// garment it shows ("loafers", "tote") and its colors. Every piece in the
// closet gets its own photo: the best match for its name that no other
// piece is using yet. The files are public-domain (CC0) photos, cropped to
// 200px squares; see src/assets/garments/CREDITS.md for sources.

// import.meta.glob is a Vite feature: it finds every matching file when the
// app is built and gives back { "../assets/garments/tee-white.jpg": url }.
// With eager: true the URLs are ready immediately (no await). Only URLs are
// imported, so a photo downloads when a screen actually shows it.
const FILES = import.meta.glob<string>('../assets/garments/*.jpg', {
  eager: true,
  import: 'default',
})

function url(file: string): string {
  const src = FILES[`../assets/garments/${file}.jpg`]
  // Only happens if a file below is renamed or deleted: fail loudly in
  // development instead of showing a broken image.
  if (!src) throw new Error(`Missing garment photo: ${file}.jpg`)
  return src
}

type StockPhoto = { file: string; category: Category; kind: string; tags: string[] }

// Within a category, earlier photos are picked first when nothing in a
// piece's name decides between them.
const PHOTOS: StockPhoto[] = [
  { file: 'tee-white', category: 'Top', kind: 'tee', tags: ['white'] },
  { file: 'shirt-striped', category: 'Top', kind: 'shirt', tags: ['blue', 'white', 'striped', 'stripe'] },
  { file: 'sweater-cream', category: 'Top', kind: 'sweater', tags: ['cream', 'beige', 'white'] },
  { file: 'blouse-white', category: 'Top', kind: 'blouse', tags: ['white'] },
  { file: 'tee-stack', category: 'Top', kind: 'tee', tags: ['red', 'gray', 'grey', 'navy'] },
  { file: 'shirt-plaid', category: 'Top', kind: 'shirt', tags: ['red', 'plaid', 'flannel', 'check'] },
  { file: 'blouse-yellow', category: 'Top', kind: 'blouse', tags: ['yellow', 'mustard'] },
  { file: 'sweater-gray', category: 'Top', kind: 'sweater', tags: ['gray', 'grey'] },
  { file: 'hoodie-gray', category: 'Top', kind: 'hoodie', tags: ['gray', 'grey', 'blue'] },

  { file: 'jeans-light', category: 'Bottom', kind: 'jeans', tags: ['blue', 'light'] },
  { file: 'trousers-black', category: 'Bottom', kind: 'trousers', tags: ['black'] },
  { file: 'skirt-black', category: 'Bottom', kind: 'skirt', tags: ['black', 'pleated'] },
  { file: 'jeans-dark', category: 'Bottom', kind: 'jeans', tags: ['blue', 'dark'] },
  { file: 'trousers-khaki', category: 'Bottom', kind: 'trousers', tags: ['khaki', 'beige', 'tan'] },
  { file: 'skirt-red', category: 'Bottom', kind: 'skirt', tags: ['red', 'burgundy', 'pleated'] },
  { file: 'shorts-teal', category: 'Bottom', kind: 'shorts', tags: ['teal', 'green', 'blue'] },
  { file: 'trousers-striped', category: 'Bottom', kind: 'trousers', tags: ['brown', 'striped', 'stripe'] },

  { file: 'dress-floral', category: 'Dress', kind: 'dress', tags: ['navy', 'blue', 'floral', 'flower'] },
  { file: 'dress-white', category: 'Dress', kind: 'dress', tags: ['white', 'linen'] },
  { file: 'dress-orange', category: 'Dress', kind: 'dress', tags: ['orange'] },

  { file: 'jacket-denim', category: 'Outerwear', kind: 'jacket', tags: ['blue', 'denim', 'jean'] },
  { file: 'coat-tweed', category: 'Outerwear', kind: 'coat', tags: ['brown', 'tweed', 'wool'] },
  { file: 'blazer-pink', category: 'Outerwear', kind: 'blazer', tags: ['pink'] },
  { file: 'coat-black', category: 'Outerwear', kind: 'coat', tags: ['black'] },
  { file: 'jacket-puffer', category: 'Outerwear', kind: 'jacket', tags: ['black', 'puffer'] },
  { file: 'coat-brown', category: 'Outerwear', kind: 'coat', tags: ['brown', 'trench'] },

  { file: 'sneakers-white', category: 'Shoes', kind: 'sneakers', tags: ['white'] },
  { file: 'loafers-brown', category: 'Shoes', kind: 'flats', tags: ['brown', 'loafer', 'loafers'] },
  { file: 'heels-red', category: 'Shoes', kind: 'heels', tags: ['red'] },
  { file: 'boots-tan', category: 'Shoes', kind: 'boots', tags: ['tan', 'brown'] },
  { file: 'sneakers-navy', category: 'Shoes', kind: 'sneakers', tags: ['navy', 'blue'] },
  { file: 'heels-black', category: 'Shoes', kind: 'heels', tags: ['black'] },
  { file: 'oxfords-brown', category: 'Shoes', kind: 'flats', tags: ['brown', 'tan', 'oxford', 'oxfords'] },
  { file: 'boots-brown', category: 'Shoes', kind: 'boots', tags: ['brown', 'orange'] },
  { file: 'sandals', category: 'Shoes', kind: 'sandals', tags: ['beige', 'brown'] },

  { file: 'tote-red', category: 'Bag', kind: 'tote', tags: ['red', 'canvas'] },
  { file: 'crossbody-pink', category: 'Bag', kind: 'crossbody', tags: ['pink'] },
  { file: 'bag-leather', category: 'Bag', kind: 'bag', tags: ['brown', 'leather'] },
  { file: 'backpack-green', category: 'Bag', kind: 'backpack', tags: ['green'] },
  { file: 'tote-tan', category: 'Bag', kind: 'tote', tags: ['tan', 'brown', 'leather'] },
  { file: 'crossbody-floral', category: 'Bag', kind: 'crossbody', tags: ['black', 'floral', 'flower'] },
  { file: 'backpack-yellow', category: 'Bag', kind: 'backpack', tags: ['yellow', 'mustard'] },

  { file: 'sunglasses', category: 'Accessory', kind: 'sunglasses', tags: ['yellow'] },
  { file: 'earrings', category: 'Accessory', kind: 'earrings', tags: ['gold'] },
  { file: 'belt-brown', category: 'Accessory', kind: 'belt', tags: ['brown', 'leather'] },
  { file: 'hat-straw', category: 'Accessory', kind: 'hat', tags: ['straw', 'beige'] },
  { file: 'scarf-knit', category: 'Accessory', kind: 'scarf', tags: ['green', 'gray', 'grey', 'knit', 'wool'] },
  { file: 'watch', category: 'Accessory', kind: 'watch', tags: ['black', 'silver'] },
  { file: 'necklace-pearl', category: 'Accessory', kind: 'necklace', tags: ['white', 'pearl', 'pearls'] },
  { file: 'belt-tan', category: 'Accessory', kind: 'belt', tags: ['tan', 'brown', 'leather'] },
  { file: 'hat-felt', category: 'Accessory', kind: 'hat', tags: ['brown', 'felt'] },
  { file: 'scarf-plaid', category: 'Accessory', kind: 'scarf', tags: ['blue', 'plaid'] },
  { file: 'necklace-gold', category: 'Accessory', kind: 'necklace', tags: ['gold'] },
]

// How well a photo fits a piece: the right kind of garment counts most,
// then each color or material word in the name that the photo has.
function score(photo: StockPhoto, kind: string | undefined, words: string[]): number {
  const kindPoints = photo.kind === kind ? 10 : 0
  return kindPoints + photo.tags.filter((tag) => words.includes(tag)).length
}

// The best photo for a piece, skipping any in `taken` while others remain.
// Plain text matching on the name, no image recognition.
function bestPhoto(category: Category, name: string, taken: Set<string> = new Set()): StockPhoto {
  const kind = kindOf(category, name)
  const words = name.toLowerCase().split(/[^a-z]+/)
  const all = PHOTOS.filter((photo) => photo.category === category)
  const free = all.filter((photo) => !taken.has(photo.file))
  // Every photo in the category is used (a big closet): share the best one.
  const options = free.length > 0 ? free : all
  // reduce keeps the first of equal scores, so list order breaks ties.
  return options.reduce((best, photo) => (score(photo, kind, words) > score(best, kind, words) ? photo : best))
}

// A photo for a piece that isn't saved yet (or a whole category on the heat
// map). It might match a photo another piece already uses.
export function stockPhotoFor(category: Category, name = ''): string {
  return url(bestPhoto(category, name).file)
}

// One photo per saved piece, as { pieceId: url }, all different while the
// category has photos left. Pieces are handled in closet order, so adding a
// piece never changes the photos of the pieces before it.
export function assignStockPhotos(pieces: Piece[]): Record<string, string> {
  const taken = new Set<string>()
  const result: Record<string, string> = {}
  for (const piece of pieces) {
    const photo = bestPhoto(piece.category, piece.name, taken)
    taken.add(photo.file)
    result[piece.id] = url(photo.file)
  }
  return result
}
