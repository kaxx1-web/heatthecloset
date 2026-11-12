import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import AddPieceForm from '../components/AddPieceForm'
import { card, primaryButton, secondaryButton } from '../components/ui'
import { formatShortDate } from '../data/dates'
import { dayNumber, suggestPieces, timesWorn } from '../data/stats'
import { addPiece, saveLog } from '../data/storage'
import { CATEGORIES } from '../data/types'
import type { Category, ClosetData, ISODate, Profile } from '../data/types'
import { useFocusHeadingOnChange } from '../navigation'

type Props = {
  data: ClosetData
  profile: Profile
  today: ISODate
  onChange: (next: ClosetData) => void
  onSaved: () => void
}

// Two steps on one screen: 1) photo, 2) confirm the pieces.
export default function LogScreen({ data, profile, today, onChange, onSaved }: Props) {
  const existingLog = data.logs.find((log) => log.date === today)

  // When editing, skip the photo step and start from what was saved.
  const [step, setStep] = useState<'photo' | 'pieces'>(existingLog ? 'pieces' : 'photo')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  // The function form of useState runs only on the first render. Later
  // changes to `data` (like adding a piece) won't reset the checkboxes.
  const [selected, setSelected] = useState<string[]>(
    () => existingLog?.pieceIds ?? suggestPieces(data.pieces, data.logs, today),
  )
  const [error, setError] = useState('')

  useFocusHeadingOnChange(step)

  // URL.createObjectURL gives the photo a temporary in-memory address so
  // <img> can show it. It's never uploaded or saved. revokeObjectURL frees
  // that memory when the photo changes or the screen closes.
  useEffect(() => {
    if (!photoUrl) return
    return () => URL.revokeObjectURL(photoUrl)
  }, [photoUrl])

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return // the user cancelled the picker
    setPhotoUrl(URL.createObjectURL(file))
    setStep('pieces')
  }

  function toggle(pieceId: string) {
    setError('')
    setSelected((current) =>
      current.includes(pieceId) ? current.filter((id) => id !== pieceId) : [...current, pieceId],
    )
  }

  function handleAddPiece(name: string, category: Category) {
    const next = addPiece(data, name, category, today)
    onChange(next)
    // The new piece is last in the list. Tick it, since they're wearing it.
    const newPiece = next.pieces[next.pieces.length - 1]
    setSelected((current) => [...current, newPiece.id])
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (selected.length === 0) {
      setError('Pick at least one piece you’re wearing today.')
      return
    }
    onChange(saveLog(data, today, selected))
    onSaved()
  }

  const day = dayNumber(profile.startDate, today)
  const isSuggested = (id: string) => !existingLog && selected.includes(id)

  if (step === 'photo') {
    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <p className="font-medium text-stone-600">
            Day {day} · {formatShortDate(today)}
          </p>
          <h1 tabIndex={-1} className="text-3xl font-extrabold">
            Today’s outfit photo
          </h1>
        </header>
        <p className="text-stone-700">
          Take a mirror photo to help you remember what you’re wearing. It’s only shown on
          the next step and is never saved.
        </p>

        {/* The real file input is visually hidden (sr-only) but still focusable;
            the label is styled like a button and opens the picker. On phones
            this offers the camera or the photo library. has-focus-visible shows
            the focus ring on the label when the hidden input has focus. */}
        <label
          className={`${primaryButton} cursor-pointer has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-700`}
        >
          Take or choose a photo
          <input type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
        </label>
        <button type="button" className={secondaryButton} onClick={() => setStep('pieces')}>
          Skip photo
        </button>
      </div>
    )
  }

  const categoriesInUse = CATEGORIES.filter((c) => data.pieces.some((p) => p.category === c))

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="font-medium text-stone-600">
          Day {day} · {formatShortDate(today)}
        </p>
        <h1 tabIndex={-1} className="text-3xl font-extrabold">
          What are you wearing?
        </h1>
      </header>

      {photoUrl && (
        // aspect-[3/4] reserves space before the image loads, so the page doesn't jump.
        <img
          src={photoUrl}
          alt="Your outfit photo for today"
          className="aspect-[3/4] w-full rounded-2xl object-cover"
        />
      )}

      {data.pieces.length === 0 ? (
        <p className="text-stone-700">
          Your closet is empty. Add the pieces you’re wearing below and they’ll be ticked
          automatically.
        </p>
      ) : (
        <p className="text-stone-700">
          {existingLog
            ? 'Here’s what you saved earlier. Change anything that’s wrong.'
            : 'We’ve ticked your most-worn piece in each category. Untick anything you’re not wearing and tick what you are.'}
        </p>
      )}

      {/* id="log-form" lets the Save button below sit outside this <form>
          (after the add-piece form) and still submit it, via form="log-form".
          Forms can't be nested, so this keeps them separate. */}
      <form id="log-form" onSubmit={handleSave} noValidate className="space-y-5">
        {categoriesInUse.map((category) => (
          <fieldset key={category} className="space-y-2">
            <legend className="mb-2 text-lg font-bold">{category}</legend>
            {data.pieces
              .filter((piece) => piece.category === category)
              .map((piece) => {
                const count = timesWorn(data.logs, piece.id, 30, today)
                return (
                  <label
                    key={piece.id}
                    className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 border-stone-300 bg-white px-4 py-2 has-checked:border-stone-900 has-checked:bg-stone-100"
                  >
                    <input
                      type="checkbox"
                      name="pieces"
                      value={piece.id}
                      checked={selected.includes(piece.id)}
                      onChange={() => toggle(piece.id)}
                      className="size-5 shrink-0"
                    />
                    <span className="flex-1">
                      <span className="block font-medium">{piece.name}</span>
                      <span className="block text-sm text-stone-600">
                        Worn {count} {count === 1 ? 'time' : 'times'} in 30 days
                        {isSuggested(piece.id) && ' · Suggested'}
                      </span>
                    </span>
                  </label>
                )
              })}
          </fieldset>
        ))}
      </form>

      <details open={data.pieces.length === 0} className={card}>
        <summary className="min-h-12 cursor-pointer content-center font-semibold">
          Missing a piece? Add it to your closet
        </summary>
        <div className="mt-4">
          <AddPieceForm onAdd={handleAddPiece} />
        </div>
      </details>

      <div className="space-y-2">
        <p role="alert" className="font-medium text-red-700">
          {error}
        </p>
        <button type="submit" form="log-form" className={primaryButton}>
          Save today’s outfit ({selected.length})
        </button>
      </div>
    </div>
  )
}
