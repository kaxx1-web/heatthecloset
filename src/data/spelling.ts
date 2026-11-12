// "Did you mean…?" for piece names. No AI and no server: we compare each
// word you type against a list of clothing terms and clothing brands, and
// suggest the closest matches. Nothing changes unless you tap a suggestion.

// Clothing brands, written the way the brand writes them.
const BRANDS = [
  'Abercrombie', 'Adidas', 'Aerie', 'Anthropologie', "Arc'teryx", 'Aritzia', 'ASOS', 'Athleta',
  'Banana Republic', 'Bershka', 'Birkenstock', 'Burberry', 'Calvin Klein', 'Canada Goose',
  'Carhartt', 'Champion', 'Chanel', 'Club Monaco', 'Coach', 'Columbia', 'Converse', 'Crocs',
  'Dior', 'Dr. Martens', 'Everlane', 'Fila', 'Forever 21', 'Free People', 'Ganni', 'Gap',
  'Gucci', 'Guess', 'H&M', 'Hoka', 'Hollister', 'J.Crew', 'Kate Spade', 'Lacoste', "Levi's",
  'Loewe', 'Longchamp', 'Lululemon', 'Madewell', 'Mango', 'Marc Jacobs', 'Massimo Dutti',
  'Mejuri', 'Michael Kors', 'New Balance', 'Nike', 'Old Navy', 'Patagonia', 'Prada',
  'Pull&Bear', 'Puma', 'Quince', 'Ralph Lauren', 'Ray-Ban', 'Reebok', 'Reformation',
  'Saint Laurent', 'Sézane', 'Shein', 'Skechers', 'Skims', 'Sorel', 'Steve Madden', 'Stussy',
  'Superga', 'Telfar', 'The North Face', 'Theory', 'Timberland', 'Tommy Hilfiger', 'Tory Burch',
  'Ugg', 'Uniqlo', 'Urban Outfitters', 'Vans', 'Veja', 'Vince', 'Wilfred', 'Zara',
]

// Clothing terms only: garments, fabrics and textures, cuts and details,
// patterns and colors.
const WORDS = [
  // tops
  't-shirt', 'tee', 'tank', 'top', 'blouse', 'shirt', 'button-down', 'button-up', 'polo', 'henley', 'sweater',
  'cardigan', 'hoodie', 'sweatshirt', 'crewneck', 'turtleneck', 'pullover', 'vest', 'camisole',
  'cami', 'bodysuit', 'tunic', 'jersey', 'rugby', 'quarter-zip', 'half-zip', 'zip-up', 'jumper',
  // bottoms and one-pieces
  'jeans', 'pants', 'trousers', 'chinos', 'joggers', 'sweatpants', 'leggings', 'shorts', 'skirt',
  'skort', 'culottes', 'overalls', 'jumpsuit', 'romper', 'dress', 'gown', 'sundress', 'slip',
  'mom', 'boyfriend', 'baggy', 'barrel', 'tapered', 'a-line', 'bodycon',
  // outerwear
  'jacket', 'blazer', 'coat', 'trench', 'parka', 'puffer', 'anorak', 'windbreaker', 'raincoat',
  'peacoat', 'bomber', 'shacket', 'gilet', 'poncho', 'cape', 'shawl', 'kimono', 'varsity',
  'trucker', 'chore', 'duffle', 'shearling', 'moto', 'biker', 'overcoat', 'teddy',
  // shoes
  'sneakers', 'trainers', 'loafers', 'boots', 'booties', 'sandals', 'heels', 'pumps', 'flats',
  'mules', 'slippers', 'espadrilles', 'oxfords', 'moccasins', 'clogs', 'wedges', 'stilettos',
  'slingbacks', 'slides', 'flip-flops', 'high-tops', 'chelsea', 'combat', 'cowboy', 'ballet',
  'mary-janes', 'kitten', 'running', 'hiking', 'rain',
  // bags and accessories
  'bag', 'tote', 'backpack', 'crossbody', 'clutch', 'purse', 'handbag', 'satchel', 'wallet',
  'belt', 'scarf', 'hat', 'beanie', 'cap', 'beret', 'bucket', 'gloves', 'mittens', 'sunglasses',
  'earrings', 'hoops', 'studs', 'necklace', 'bracelet', 'ring', 'watch', 'socks', 'tights',
  'headband', 'bandana', 'pajamas', 'robe', 'swimsuit', 'bikini', 'bra', 'bralette',
  // fabrics and textures
  'cotton', 'linen', 'silk', 'satin', 'wool', 'woolen', 'cashmere', 'merino', 'denim', 'leather', 'suede',
  'corduroy', 'velvet', 'flannel', 'fleece', 'knit', 'knitted', 'cable', 'ribbed', 'chiffon',
  'lace', 'mesh', 'nylon', 'polyester', 'sherpa', 'tweed', 'canvas', 'chambray', 'quilted',
  'faux', 'sequin', 'crochet', 'mohair', 'alpaca', 'fuzzy', 'fluffy', 'cozy', 'soft', 'waffle',
  'boucle', 'terry', 'thermal', 'jersey', 'organza', 'tulle', 'gauze', 'poplin', 'twill',
  // cuts and details
  'oversized', 'cropped', 'fitted', 'slim', 'straight', 'wide', 'wide-leg', 'flared', 'bootcut',
  'skinny', 'relaxed', 'high-waisted', 'low-rise', 'pleated', 'sleeveless', 'short-sleeve',
  'long-sleeve', 'puff-sleeve', 'cargo', 'platform', 'chunky', 'ankle', 'knee-high', 'wrap',
  'halter', 'strapless', 'off-shoulder', 'v-neck', 'scoop', 'mock-neck', 'collared', 'hooded',
  'button', 'zip', 'belted', 'ruffle', 'smocked', 'embroidered', 'beaded', 'distressed',
  'washed', 'vintage', 'midi', 'maxi', 'mini', 'athletic', 'lounge', 'utility',
  // patterns
  'striped', 'plaid', 'checked', 'gingham', 'houndstooth', 'argyle', 'paisley', 'herringbone',
  'floral', 'polka', 'dot', 'graphic', 'tie-dye', 'camo', 'leopard', 'zebra', 'animal',
  // colors
  'light', 'dark', 'black', 'white', 'grey', 'gray', 'navy', 'blue', 'red', 'green', 'olive', 'khaki', 'beige',
  'cream', 'ivory', 'tan', 'brown', 'camel', 'burgundy', 'maroon', 'pink', 'blush', 'purple',
  'lavender', 'lilac', 'yellow', 'mustard', 'orange', 'rust', 'teal', 'turquoise', 'silver',
  'gold', 'charcoal', 'mint', 'coral', 'emerald', 'chocolate', 'oatmeal', 'ecru', 'taupe',
]

type Entry = {
  display: string // how the word should be written, e.g. "Levi's"
  key: string // simplified form used for matching, e.g. "levis"
  brand: boolean
  // For one word of a longer brand ("Spade" in "Kate Spade"): the other
  // words of that brand. Such a word is only suggested next to them, so
  // "suade" never turns into "Spade".
  brandMates: string[]
  mine: boolean // comes from a piece already in your closet
}

// Lowercase, keep only letters, digits and "&" ("Levi's" -> "levis",
// "T-Shirt" -> "tshirt"). Accented letters are kept as-is.
function simplify(word: string): string {
  return word.toLowerCase().replace(/[^\p{L}\p{N}&]/gu, '')
}

function addWords(map: Map<string, Entry>, text: string, brand: boolean, mine: boolean) {
  const words = text.split(/\s+/)
  const keys = words.map(simplify)
  words.forEach((display, i) => {
    const key = keys[i]
    const brandMates = brand ? keys.filter((_, j) => j !== i) : []
    if (key.length >= 2 && !map.has(key)) map.set(key, { display, key, brand, brandMates, mine })
  })
}

// The built-in list, built once when the app loads.
const BASE = new Map<string, Entry>()
BRANDS.forEach((brand) => addWords(BASE, brand, true, false))
WORDS.forEach((word) => addWords(BASE, word, false, false))

// Where each letter sits on a QWERTY keyboard. Rows are shifted a little,
// like real keys, so "a" sits between "q" and "w".
const KEY_POSITIONS = new Map<string, { x: number; y: number }>()
;['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].forEach((row, y) => {
  const shift = [0, 0.25, 0.75][y]
  ;[...row].forEach((letter, i) => KEY_POSITIONS.set(letter, { x: i + shift, y }))
})

// True if two letters are next to each other on the keyboard (i and u,
// x and z): an easy slip of the finger.
function neighbouringKeys(a: string, b: string): boolean {
  const p = KEY_POSITIONS.get(a)
  const q = KEY_POSITIONS.get(b)
  return !!p && !!q && Math.abs(p.y - q.y) <= 1 && Math.abs(p.x - q.x) <= 1
}

// How many mistakes it takes to turn `a` into `b`: a missing, extra, wrong
// or swapped letter each count as 1. Hitting the key next to the right one
// counts as only half a mistake, so "fixxy" is 1.5 away from "fuzzy"
// (i/u and x/z are neighbours). This is a weighted "edit distance".
function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const x = a[i - 1]
      const y = b[j - 1]
      const swapCost = x === y ? 0 : neighbouringKeys(x, y) ? 0.5 : 1
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // extra letter
        d[i][j - 1] + 1, // missing letter
        d[i - 1][j - 1] + swapCost, // wrong letter
      )
      // Two neighbouring letters typed in the wrong order ("jaens").
      if (i > 1 && j > 1 && x === b[j - 2] && a[i - 2] === y) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }
  return d[a.length][b.length]
}

// Longer words can have more mistakes and still be recognisable.
function allowedMistakes(length: number): number {
  if (length <= 4) return 1
  if (length <= 6) return 1.5
  if (length <= 9) return 2
  return 3
}

// Possible replacements for one word, best first.
// `typing`: you're still typing this word, so also offer completions
// ("swea" -> "sweater"). `nearby`: the other words in the name.
function candidatesFor(key: string, vocab: Map<string, Entry>, typing: boolean, nearby: string[]): Entry[] {
  const scored: { entry: Entry; score: number }[] = []
  for (const entry of vocab.values()) {
    if (entry.key === key) continue
    // Half a brand only makes sense next to the rest of it ("kate spdae").
    if (entry.brandMates.length > 0 && !entry.brandMates.some((mate) => nearby.includes(mate))) continue

    let score = Infinity
    if (typing && entry.key.startsWith(key)) {
      score = 0.5 + (entry.key.length - key.length) * 0.01 // completion: shortest first
    } else {
      const mistakes = editDistance(key, entry.key)
      // People rarely get the first letter wrong, so a different first
      // letter is only allowed for one slip onto a neighbouring key
      // ("qool" -> "wool") or the first two letters swapped ("ejans").
      // This stops wild guesses like "nikee" -> "biker".
      const sameStart = key[0] === entry.key[0]
      const swappedStart = key[0] === entry.key[1] && key[1] === entry.key[0]
      const startOk = sameStart || swappedStart || mistakes <= 0.5
      if (mistakes <= allowedMistakes(key.length) && startOk) score = 1 + mistakes
      // A completion with a slip in it: "birkin" -> "Birkenstock"
      else if (typing && key.length >= 4 && sameStart && editDistance(key, entry.key.slice(0, key.length)) <= 1) score = 2.5
    }
    if (score === Infinity) continue
    if (entry.mine) score -= 0.2 // prefer words you've used before
    scored.push({ entry, score })
  }
  // If the word is the start of real words ("swea" -> "sweater"), don't
  // also offer completions that assume a typo ("shearling").
  const hasExactCompletion = scored.some((s) => s.score < 1)
  return scored
    .filter((s) => !hasExactCompletion || s.score < 2.5 - 0.2)
    .sort((a, b) => a.score - b.score)
    .map((s) => s.entry)
}

// Match the typed word's capitalisation ("Jaens" -> "Jeans"), except for
// brands and your own words, which keep their own spelling.
function withCase(entry: Entry, typed: string): string {
  if (entry.brand || entry.mine) return entry.display
  const capital = /\p{Lu}/u.test(typed[0] ?? '')
  return capital ? entry.display[0].toUpperCase() + entry.display.slice(1) : entry.display
}

type WordCheck =
  | { status: 'ok' } // spelled right, or too short / a number
  | { status: 'fix'; fixes: string[] } // best guesses, best first
  | { status: 'unknown' } // looks misspelled, but nothing close enough

function checkWord(word: string, vocab: Map<string, Entry>, typing: boolean, nearby: string[], max: number): WordCheck {
  const key = simplify(word)
  if (key.length < 3 || /^\d+$/.test(key)) return { status: 'ok' }

  const known = vocab.get(key)
  if (known) {
    // The letters are right. Only fix a brand's capitals or missing
    // punctuation: "uniqlo" -> "Uniqlo", "levis" -> "Levi's".
    if (known.display === word) return { status: 'ok' }
    const hasPunctuation = /[^\p{L}\p{N}]/u.test(known.display)
    return known.brand || hasPunctuation ? { status: 'fix', fixes: [known.display] } : { status: 'ok' }
  }

  const fixes = [...new Set(candidatesFor(key, vocab, typing, nearby).map((e) => withCase(e, word)))]
  if (fixes.length > 0) return { status: 'fix', fixes: fixes.slice(0, max) }
  // Still typing it? Don't complain yet.
  return typing ? { status: 'ok' } : { status: 'unknown' }
}

export type SpellingResult = {
  suggestions: string[] // whole corrected names, best first
  unknown: string[] // words that look misspelled but match nothing we know
}

// Checks a whole name, e.g. "fixxy swea" -> suggestions ["fuzzy sweater", …].
// The first suggestion fixes every word that looks wrong at once; the
// others try different fixes for the first such word.
// `myNames`: names of pieces already in the closet. Their words count as
// spelled correctly and are suggested first.
export function checkSpelling(text: string, myNames: string[] = [], max = 4): SpellingResult {
  const vocab = new Map(BASE)
  myNames.forEach((name) => addWords(vocab, name, false, true))

  // split(/(\s+)/) keeps the spaces, so words are at even positions and the
  // name can be put back together exactly.
  const parts = text.split(/(\s+)/)
  const keys = parts.map(simplify)
  const stillTyping = !/\s$/.test(text)
  let lastWord = parts.length - 1
  while (lastWord > 0 && parts[lastWord] === '') lastWord -= 2

  const flagged: { index: number; fixes: string[] }[] = []
  const unknown: string[] = []
  for (let i = 0; i < parts.length; i += 2) {
    const nearby = keys.filter((_, j) => j !== i && j % 2 === 0)
    const result = checkWord(parts[i], vocab, stillTyping && i === lastWord, nearby, max)
    if (result.status === 'fix') flagged.push({ index: i, fixes: result.fixes })
    if (result.status === 'unknown') unknown.push(parts[i])
  }
  if (flagged.length === 0) return { suggestions: [], unknown }

  // Best guess: every flagged word replaced by its top fix.
  const best = [...parts]
  flagged.forEach(({ index, fixes }) => (best[index] = fixes[0]))
  const suggestions = [best.join('')]
  // Alternatives for the first flagged word.
  for (const alternative of flagged[0].fixes.slice(1)) {
    const copy = [...best]
    copy[flagged[0].index] = alternative
    suggestions.push(copy.join(''))
  }
  return {
    suggestions: [...new Set(suggestions)].filter((s) => s !== text).slice(0, max),
    unknown,
  }
}
