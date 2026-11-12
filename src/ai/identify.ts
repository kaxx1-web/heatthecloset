// The page's side of the clothing AI. It starts the Web Worker (once) and
// turns its messages into a simple promise:
//
//   const pieces = await identifyOutfit(photo, (percent) => …)
//
// Everything runs on this device. The photo is never uploaded. The only
// network use is downloading the model files (about 60 MB, once; the
// browser caches them).
import type { PieceGuess } from './outfit'

export type { PieceGuess }

type WorkerMessage =
  | { type: 'progress'; loaded: number; total: number }
  | { type: 'loaded' }
  | { type: 'analyzing' }
  | { type: 'result'; pieces: PieceGuess[] }
  | { type: 'error'; message: string }

let worker: Worker | null = null

// `new URL(..., import.meta.url)` lets Vite find and bundle the worker file,
// and keeps the path right under GitHub Pages' /repo-name/ base path.
function getWorker(): Worker {
  worker ??= new Worker(new URL('./clothing.worker.ts', import.meta.url), { type: 'module' })
  return worker
}

// Start downloading the model early (e.g. while the camera is open), so
// it's ready by the time there's a photo. Safe to call more than once.
export function preloadClothingModel(): void {
  try {
    getWorker().postMessage({ type: 'load' })
  } catch {
    // Workers unavailable: identifyOutfit will report the error later.
  }
}

export type Progress = { phase: 'downloading'; percent: number } | { phase: 'analyzing' }

// Names the pieces in an outfit photo. `onProgress` reports the model
// download (first time only) and when the photo itself is being analysed.
export function identifyOutfit(photo: Blob, onProgress: (progress: Progress) => void): Promise<PieceGuess[]> {
  return new Promise((resolve, reject) => {
    let w: Worker
    try {
      w = getWorker()
    } catch (error) {
      reject(error)
      return
    }
    const onMessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data
      if (message.type === 'progress') {
        onProgress({ phase: 'downloading', percent: Math.round((message.loaded / message.total) * 100) })
      } else if (message.type === 'analyzing') {
        onProgress({ phase: 'analyzing' })
      } else if (message.type === 'result') {
        w.removeEventListener('message', onMessage)
        resolve(message.pieces)
      } else if (message.type === 'error') {
        w.removeEventListener('message', onMessage)
        reject(new Error(message.message))
      }
    }
    w.addEventListener('message', onMessage)
    w.postMessage({ type: 'identify', photo })
  })
}
