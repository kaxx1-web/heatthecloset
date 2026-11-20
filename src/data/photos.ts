// Piece photos, saved in this browser only (never uploaded).
//
// Why not localStorage like everything else? localStorage holds about 5 MB
// of *text*, so a handful of photos would fill it. IndexedDB is the
// browser's built-in database: it stores image files (Blobs) directly and
// has much more room. Its API is old and callback-based, so the helpers
// below wrap each request in a Promise.
//
// Like localStorage, IndexedDB can be unavailable (some private browsing
// modes, blocked site data). Every helper catches errors, so the app keeps
// working and pieces simply show their stock photos.

const DB_NAME = 'closet-map-photos'
const STORE = 'photos' // key: piece id, value: the photo as a JPEG Blob

// The longest side of a saved photo, in pixels. Icons are at most ~140px on
// screen, so 600px stays sharp on high-density phone screens while keeping
// each photo around 50-100 KB.
const MAX_SIZE = 600

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    // Runs the first time (or when the version number goes up).
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Runs one request in a transaction and waits for the transaction to finish,
// so a write has really been saved before the promise resolves.
async function run<T>(mode: IDBTransactionMode, makeRequest: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const request = makeRequest(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(request.result)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

// Every saved photo, as { pieceId: Blob }. Empty if storage isn't available.
export async function loadPhotos(): Promise<Record<string, Blob>> {
  try {
    const db = await openDb()
    try {
      return await new Promise((resolve, reject) => {
        const photos: Record<string, Blob> = {}
        const tx = db.transaction(STORE, 'readonly')
        const request = tx.objectStore(STORE).openCursor()
        request.onsuccess = () => {
          const cursor = request.result
          if (!cursor) return
          if (cursor.value instanceof Blob) photos[String(cursor.key)] = cursor.value
          cursor.continue()
        }
        tx.oncomplete = () => resolve(photos)
        tx.onerror = () => reject(tx.error)
      })
    } finally {
      db.close()
    }
  } catch {
    return {}
  }
}

// Returns false if saving failed, so the UI can say so.
export async function savePhoto(pieceId: string, photo: Blob): Promise<boolean> {
  try {
    await run('readwrite', (store) => store.put(photo, pieceId))
    return true
  } catch {
    return false
  }
}

export async function deletePhoto(pieceId: string): Promise<void> {
  try {
    await run('readwrite', (store) => store.delete(pieceId))
  } catch {
    // Nothing to do: if storage isn't available, there's no photo to delete.
  }
}

export async function clearPhotos(): Promise<void> {
  try {
    await run('readwrite', (store) => store.clear())
  } catch {
    // Same as above.
  }
}

// Turns a phone photo (often 3-12 MB) into a small square JPEG: crops the
// middle square, then scales it down to MAX_SIZE. Icons are square, so
// cropping here means every screen can show the photo without stretching.
// Throws if the file isn't an image the browser can read.
export async function preparePhoto(file: Blob): Promise<Blob> {
  // createImageBitmap decodes the file and, by default, applies the photo's
  // rotation (EXIF orientation), so portrait phone photos stay upright.
  const image = await createImageBitmap(file)
  try {
    const side = Math.min(image.width, image.height)
    const size = Math.min(side, MAX_SIZE)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is not available')
    const x = (image.width - side) / 2
    const y = (image.height - side) / 2
    context.drawImage(image, x, y, side, side, 0, 0, size, size)
    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not save the image'))), 'image/jpeg', 0.85)
    })
  } finally {
    image.close() // frees the decoded image's memory right away
  }
}
