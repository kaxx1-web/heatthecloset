import type { Category } from './types'

// The kinds of garment we tell apart, and how to recognise each from words
// in a piece's name. Plain text matching, no image recognition. Used to
// pick a stock photo for a piece (garmentPhotos.ts) and to match what the
// outfit AI sees in a photo to your saved pieces (ai/matchPieces.ts).

// The kinds of garment, per category, and the words in a piece's name that
// mean that kind. Order matters: the first kind whose words match wins, so
// "sweatshirt" is a sweater (not a shirt) and "t-shirt" is a tee.
export const KINDS: Record<Category, { kind: string; words: RegExp }[]> = {
  Top: [
    { kind: 'tee', words: /\btees?\b|t-shirt|tank|cami/i },
    { kind: 'hoodie', words: /hood/i },
    { kind: 'sweater', words: /sweat|knit|crewneck|turtleneck|jumper|cardigan|pullover|fleece/i },
    { kind: 'blouse', words: /blouse|silk|satin/i },
    { kind: 'shirt', words: /shirt|button|flannel|polo/i },
  ],
  Bottom: [
    { kind: 'jeans', words: /jean|denim/i },
    { kind: 'skirt', words: /skirt/i },
    { kind: 'shorts', words: /short/i },
    { kind: 'trousers', words: /trouser|pant|slack|chino|legging/i },
  ],
  Dress: [],
  Outerwear: [
    { kind: 'blazer', words: /blazer|suit/i },
    { kind: 'coat', words: /coat|trench|parka/i },
    { kind: 'jacket', words: /jacket|bomber|puffer|windbreaker/i },
  ],
  Shoes: [
    { kind: 'sneakers', words: /sneaker|trainer|running|tennis/i },
    { kind: 'boots', words: /boot/i },
    { kind: 'heels', words: /heel|pump|stiletto/i },
    { kind: 'sandals', words: /sandal|slide|flip/i },
    { kind: 'flats', words: /loafer|oxford|flat|brogue|mule|derby/i },
  ],
  Bag: [
    { kind: 'backpack', words: /backpack|rucksack/i },
    { kind: 'tote', words: /tote|shopper/i },
    { kind: 'crossbody', words: /cross|shoulder|purse|clutch|handbag/i },
    { kind: 'bag', words: /duffel|weekender|travel/i },
  ],
  Accessory: [
    { kind: 'sunglasses', words: /sunglass|glasses|shades/i },
    { kind: 'earrings', words: /earring|hoop|stud/i },
    { kind: 'necklace', words: /necklace|pendant|chain|pearl/i },
    { kind: 'watch', words: /watch/i },
    { kind: 'belt', words: /belt/i },
    { kind: 'hat', words: /\bhat|\bcap\b|beanie|beret/i },
    { kind: 'scarf', words: /scarf|shawl/i },
  ],
}

// The kind of garment a name describes, e.g. kindOf('Shoes', 'Tan loafers')
// is 'flats'. Undefined if no word matches (or for dresses, which have only
// one kind).
export function kindOf(category: Category, name: string): string | undefined {
  return KINDS[category].find(({ words }) => words.test(name))?.kind
}
