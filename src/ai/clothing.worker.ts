// Runs the clothing AI in a Web Worker: a separate background thread, so
// the model's heavy maths never freezes the page while it works.
//
// The page sends messages in ("load", "identify") and this file sends
// messages back ("progress", "result", "error"). See identify.ts for the
// other side.
//
// Model: Marqo-FashionSigLIP (Apache License 2.0), downloaded from Hugging
// Face on first use: https://huggingface.co/Marqo/marqo-fashionSigLIP
import { AutoProcessor, RawImage, SiglipVisionModel, env } from '@huggingface/transformers'
import type { PreTrainedModel, Processor } from '@huggingface/transformers'
import dictionary from './clothing-embeddings.json'
import { REGIONS, guessOutfit } from './outfit'
import type { Dictionary, Region } from './outfit'

// Only download from the model hub; there are no model files in our app.
env.allowLocalModels = false

const dict = dictionary as Dictionary

// Loaded once, then reused for every photo. The browser also caches the
// downloaded files, so the second visit doesn't download them again.
let ready: Promise<{ processor: Processor; model: PreTrainedModel }> | null = null

// Download progress for each file, added up into one percentage.
const files = new Map<string, { loaded: number; total: number }>()

function load() {
  ready ??= (async () => {
    const onProgress = (event: { status: string; file?: string; loaded?: number; total?: number }) => {
      if (event.status === 'progress' && event.file && event.total) {
        files.set(event.file, { loaded: event.loaded ?? 0, total: event.total })
        let loaded = 0
        let total = 0
        for (const f of files.values()) {
          loaded += f.loaded
          total += f.total
        }
        self.postMessage({ type: 'progress', loaded, total })
      }
    }
    const processor = await AutoProcessor.from_pretrained(dict.model, { progress_callback: onProgress })
    // bnb4: 4-bit weights, about 55 MB instead of 372 MB. On our 24 test
    // photos it was as accurate as the larger versions.
    const model = await SiglipVisionModel.from_pretrained(dict.model, {
      dtype: 'bnb4',
      progress_callback: onProgress,
    })
    return { processor, model }
  })()
  // If loading fails (e.g. offline), forget it so the next try starts fresh.
  ready.catch(() => (ready = null))
  return ready
}

async function identify(photo: Blob) {
  const { processor, model } = await load()
  self.postMessage({ type: 'analyzing' })

  // Cut the photo into the top / bottom / shoes areas.
  const image = await RawImage.fromBlob(photo)
  const regions = Object.keys(REGIONS) as Region[]
  const crops = await Promise.all(
    regions.map((region) => {
      const [left, top, right, bottom] = REGIONS[region]
      return image.crop([
        Math.round(left * image.width),
        Math.round(top * image.height),
        Math.round(right * image.width) - 1,
        Math.round(bottom * image.height) - 1,
      ])
    }),
  )

  // One run of the model for all three crops; each comes back as 512
  // numbers describing what's in it.
  const inputs = await processor(crops)
  const { image_embeds } = await model(inputs)
  const vectors = image_embeds.normalize().tolist() as number[][]
  const embeddings = Object.fromEntries(regions.map((region, i) => [region, vectors[i]])) as Record<Region, number[]>

  self.postMessage({ type: 'result', pieces: guessOutfit(embeddings, dict) })
}

self.addEventListener('message', async (event: MessageEvent<{ type: 'load' } | { type: 'identify'; photo: Blob }>) => {
  try {
    if (event.data.type === 'load') {
      await load()
      self.postMessage({ type: 'loaded' })
    } else {
      await identify(event.data.photo)
    }
  } catch (error) {
    self.postMessage({ type: 'error', message: String(error) })
  }
})
