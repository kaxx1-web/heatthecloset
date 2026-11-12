// Builds src/ai/clothing-embeddings.json, the "dictionary" the on-device AI
// uses to name clothing in a photo.
//
// How it works: models like this one turn both pictures and sentences into
// lists of numbers (embeddings). A photo of jeans ends up with numbers close
// to the sentence "a photo of jeans". Our sentences never change, so we turn
// them into numbers once, here, and ship only the results. The phone then
// needs just the image half of the model.
//
// Model: Marqo-FashionSigLIP (Apache License 2.0), trained on fashion photos.
// https://huggingface.co/Marqo/marqo-fashionSigLIP
//
// Run it again only if you change the labels below:
//   node scripts/build-clothing-embeddings.mjs
import { writeFileSync } from 'node:fs'
import { AutoTokenizer, SiglipTextModel } from '@huggingface/transformers'

export const MODEL_ID = 'Marqo/marqo-fashionSigLIP'

// Each region of a mirror selfie gets its own list of possible garments.
// `none: true` labels mean "there's no clothing here" (e.g. the crop for
// shoes only shows floor), so we can skip that row instead of guessing.
const GROUPS = {
  upper: [
    { name: 't-shirt', category: 'Top' },
    { name: 'tank top', category: 'Top' },
    { name: 'blouse', category: 'Top' },
    { name: 'button-up shirt', category: 'Top' },
    { name: 'sweater', category: 'Top' },
    { name: 'hoodie', category: 'Top' },
    { name: 'sweatshirt', category: 'Top' },
    { name: 'cardigan', category: 'Top' },
    { name: 'jacket', category: 'Outerwear' },
    { name: 'blazer', category: 'Outerwear' },
    { name: 'coat', category: 'Outerwear' },
    { name: 'puffer jacket', category: 'Outerwear' },
    { name: 'dress', category: 'Dress' },
    { name: 'face', none: true },
    { name: 'wall', none: true },
  ],
  lower: [
    { name: 'jeans', category: 'Bottom' },
    { name: 'trousers', category: 'Bottom' },
    { name: 'shorts', category: 'Bottom' },
    { name: 'skirt', category: 'Bottom' },
    { name: 'leggings', category: 'Bottom' },
    { name: 'sweatpants', category: 'Bottom' },
    { name: 'dress', category: 'Dress' },
    { name: 'floor', none: true },
    { name: 'wall', none: true },
  ],
  feet: [
    { name: 'sneakers', category: 'Shoes' },
    { name: 'boots', category: 'Shoes' },
    { name: 'sandals', category: 'Shoes' },
    { name: 'heels', category: 'Shoes' },
    { name: 'loafers', category: 'Shoes' },
    { name: 'flats', category: 'Shoes' },
    { name: 'floor', none: true },
    { name: 'bare feet', none: true },
  ],
  color: [
    'black', 'white', 'grey', 'navy', 'blue', 'light blue', 'red', 'pink', 'green', 'olive',
    'beige', 'brown', 'yellow', 'purple', 'orange',
  ].map((name) => ({ name })),
}

// Several phrasings per label, averaged: a well-known trick that makes the
// guesses steadier than using a single sentence.
function sentences(group, name) {
  if (group === 'color') return [`a photo of ${name} clothing`, `${name} clothes`, `a ${name} garment`]
  return [`a photo of ${name}`, `a photo of a person wearing ${name}`, `${name}, clothing`]
}

const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID)
const textModel = await SiglipTextModel.from_pretrained(MODEL_ID, { dtype: 'fp16' })

async function embed(texts) {
  const inputs = tokenizer(texts, { padding: 'max_length', truncation: true })
  const { text_embeds } = await textModel(inputs)
  return text_embeds.normalize().tolist()
}

// Average the phrasings, then scale the result back to length 1.
function average(vectors) {
  const sum = vectors[0].map((_, i) => vectors.reduce((s, v) => s + v[i], 0))
  const length = Math.hypot(...sum)
  return sum.map((x) => Math.round((x / length) * 1e5) / 1e5) // 5 decimals keeps the file small
}

const output = { model: MODEL_ID, groups: {} }
for (const [group, labels] of Object.entries(GROUPS)) {
  output.groups[group] = []
  for (const label of labels) {
    const vector = average(await embed(sentences(group, label.name)))
    output.groups[group].push({ ...label, vector })
  }
  console.log(`${group}: ${labels.length} labels`)
}

const path = new URL('../src/ai/clothing-embeddings.json', import.meta.url)
writeFileSync(path, JSON.stringify(output))
console.log(`Wrote ${path.pathname} (${(JSON.stringify(output).length / 1024).toFixed(0)} KB)`)
