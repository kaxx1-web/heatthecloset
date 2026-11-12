import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import AddPieceSheet, { openAddPieceSheet } from '../components/AddPieceSheet'
import { ConfirmHeader, DashedAddButton } from '../components/onboarding'
import { onboardingPrimary } from '../components/ui'
import { suggestPieces } from '../data/stats'
import { addPiece, saveLog } from '../data/storage'
import { CATEGORIES } from '../data/types'
import type { Category, ClosetData, ISODate } from '../data/types'

// The confirm screen on later days (Figma 05 layout): your saved pieces as
// tappable chips, with today's suggestions already selected.

type Props = {
  data: ClosetData
  today: ISODate
  day: number
  photoUrl: string | null
  onChange: (next: ClosetData) => void
  onSaved: () => void
}

export default function PickPiecesScreen({ data, today, day, photoUrl, onChange, onSaved }: Props) {
  const todaysLog = data.logs.find((log) => log.date === today)
  const sheetRef = useRef<HTMLDialogElement>(null)

  // Editing today again? Start from what was saved. Otherwise pre-select
  // the most-worn piece in each category. (Runs only on the first render.)
  const [selected, setSelected] = useState<string[]>(
    () => todaysLog?.pieceIds ?? suggestPieces(data.pieces, data.logs, today),
  )
  const [error, setError] = useState('')

  function toggle(pieceId: string) {
    setError('')
    setSelected((current) =>
      current.includes(pieceId) ? current.filter((id) => id !== pieceId) : [...current, pieceId],
    )
  }

  function handleAdd(name: string, category: Category) {
    const next = addPiece(data, name, category, today)
    onChange(next)
    // They're wearing it, so select the new piece straight away.
    const newPiece = next.pieces[next.pieces.length - 1]
    setSelected((current) => [...current, newPiece.id])
    setError('')
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (selected.length === 0) {
      setError('Pick at least one piece you’re wearing.')
      return
    }
    onChange(saveLog(data, today, selected))
    onSaved()
  }

  const categoriesInUse = CATEGORIES.filter((c) => data.pieces.some((p) => p.category === c))

  return (
    // The sheet has its own <form>, and forms can't be nested, so it sits
    // next to this form instead of inside it.
    <div className="flex flex-1 flex-col bg-white">
      <form onSubmit={handleSave} noValidate className="flex flex-1 flex-col gap-3.5 px-5 pt-11 pb-6">
        <ConfirmHeader
          showDots={false}
          photoUrl={photoUrl}
          note={
            todaysLog
              ? 'Here’s what you saved today. Tap a piece to add or remove it.'
              : 'We picked your most-worn piece in each category. Tap a piece to add or remove it.'
          }
        />

        {categoriesInUse.map((category) => (
          <fieldset key={category} className="flex flex-col gap-2">
            <legend className="mb-2 text-sm leading-[1.4] font-semibold text-ink-soft">{category}</legend>
            <div className="flex flex-wrap gap-1.5">
              {data.pieces
                .filter((piece) => piece.category === category)
                .map((piece) => {
                  const on = selected.includes(piece.id)
                  // aria-pressed makes this a toggle button: screen readers
                  // say "selected" or "not selected". The ✓ shows the same
                  // thing without relying on color.
                  return (
                    <button
                      key={piece.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(piece.id)}
                      className={`flex h-10 items-center gap-1 rounded-[20px] border-[1.5px] px-3.5 text-sm font-semibold ${
                        on ? 'border-ink bg-ink text-white' : 'border-[#c8c8c8] bg-white text-ink'
                      }`}
                    >
                      {on && <span aria-hidden="true">✓</span>}
                      {piece.name}
                    </button>
                  )
                })}
            </div>
          </fieldset>
        ))}

        <DashedAddButton label="Add a new piece" onClick={() => openAddPieceSheet(sheetRef)} />

        <div className="flex-1" />

        {error && (
          <p role="alert" className="font-medium text-red-700">
            {error}
          </p>
        )}
        <button type="submit" className={onboardingPrimary}>
          Save day {day} ({selected.length} {selected.length === 1 ? 'piece' : 'pieces'})
        </button>
      </form>

      <AddPieceSheet dialogRef={sheetRef} existingNames={data.pieces.map((p) => p.name)} onAdd={handleAdd} />
    </div>
  )
}
