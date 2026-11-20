import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { identifyOutfit } from '../ai/identify'
import { matchGuesses } from '../ai/matchPieces'
import type { PieceGuess } from '../ai/outfit'
import AddPieceSheet, { openAddPieceSheet } from '../components/AddPieceSheet'
import AiStatusBox from '../components/AiStatusBox'
import type { AiStatus } from '../components/AiStatusBox'
import { ConfirmHeader, DashedAddButton } from '../components/onboarding'
import { onboardingPrimary } from '../components/ui'
import { suggestPieces } from '../data/stats'
import { addPiece, saveLog } from '../data/storage'
import { CATEGORIES } from '../data/types'
import type { Category, ClosetData, ISODate } from '../data/types'

// The confirm screen on later days (Figma 05 layout): your saved pieces as
// tappable chips, with today's suggestions already selected.
//
// With a photo, the on-device outfit AI looks at it, and the pieces it
// recognises from your closet get selected (see ai/matchPieces.ts). Things
// it sees that aren't in your closet yet are offered as one-tap "add"
// buttons. Until it answers (or if it can't run), your most-worn piece in
// each category is selected, as before.

function aiMessage(ai: AiStatus): string {
  switch (ai.status) {
    case 'downloading':
      return 'Getting the outfit AI ready. This only happens the first time.'
    case 'done': {
      const matched = ai.matched ?? 0
      const others = ai.count - matched
      if (ai.count === 0) return 'We couldn’t spot any pieces in this photo. Pick what you’re wearing below.'
      if (matched === 0) {
        return `Spotted ${ai.count} ${ai.count === 1 ? 'piece' : 'pieces'} that ${ai.count === 1 ? 'isn’t' : 'aren’t'} in your closet yet. Add ${ai.count === 1 ? 'it' : 'them'} below, or pick what you’re wearing.`
      }
      return (
        `Selected ${matched} ${matched === 1 ? 'piece' : 'pieces'} from your closet that we spotted in your photo. Check ${matched === 1 ? 'it' : 'them'} and fix anything that’s wrong.` +
        (others > 0 ? ` ${others} new ${others === 1 ? 'piece is' : 'pieces are'} below.` : '')
      )
    }
    case 'error':
      return 'The outfit AI couldn’t run on this device. Pick what you’re wearing below.'
    default:
      return 'Looking at your outfit…'
  }
}

type Props = {
  data: ClosetData
  today: ISODate
  day: number
  photo: { blob: Blob; url: string } | null
  onChange: (next: ClosetData) => void
  onSaved: () => void
}

export default function PickPiecesScreen({ data, today, day, photo, onChange, onSaved }: Props) {
  const todaysLog = data.logs.find((log) => log.date === today)
  const sheetRef = useRef<HTMLDialogElement>(null)

  // Editing today again? Start from what was saved. Otherwise pre-select
  // the most-worn piece in each category. (Runs only on the first render.)
  const [selected, setSelected] = useState<string[]>(
    () => todaysLog?.pieceIds ?? suggestPieces(data.pieces, data.logs, today),
  )
  const [error, setError] = useState('')
  const [ai, setAi] = useState<AiStatus>(photo ? { status: 'starting' } : { status: 'off' })
  // Things in the photo that aren't in your closet yet.
  const [newPieces, setNewPieces] = useState<PieceGuess[]>([])
  // Set once you tap a piece, so a late AI answer doesn't undo your choice.
  const touched = useRef(false)
  // The closet as it was when this screen opened: what the AI's guesses
  // are matched against. (A copy that never changes, so the effect below
  // runs once per photo, not again every time you add a piece.)
  const [closet] = useState(data.pieces)

  // When there's a photo, ask the AI what's in it. `cancelled` stops a
  // late answer from changing the screen after you've left it.
  const blob = photo?.blob
  const editingToday = todaysLog !== undefined
  useEffect(() => {
    if (!blob) return
    let cancelled = false
    identifyOutfit(blob, (progress) => {
      if (cancelled) return
      setAi(progress.phase === 'downloading' ? { status: 'downloading', percent: progress.percent } : { status: 'analyzing' })
    })
      .then((guesses) => {
        if (cancelled) return
        const match = matchGuesses(guesses, closet)
        setAi({ status: 'done', count: guesses.length, matched: match.pieceIds.length })
        setNewPieces(match.newPieces)
        // Select what the AI recognised, unless you've already started
        // choosing, or you're editing what you saved earlier today.
        if (match.pieceIds.length > 0 && !touched.current && !editingToday) setSelected(match.pieceIds)
      })
      .catch(() => {
        if (!cancelled) setAi({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [blob, closet, editingToday])

  function toggle(pieceId: string) {
    touched.current = true
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
    touched.current = true
    setSelected((current) => [...current, newPiece.id])
    setError('')
  }

  // "Add" on something the AI spotted: save it to the closet, select it,
  // and take it off the list.
  function addSpotted(guess: PieceGuess) {
    handleAdd(guess.name, guess.category)
    setNewPieces((current) => current.filter((g) => g !== guess))
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
    <div className="flex flex-1 flex-col">
      <form onSubmit={handleSave} noValidate className="flex flex-1 flex-col gap-3.5 px-5 pt-17 pb-6">
        <ConfirmHeader
          showDots={false}
          photoUrl={photo?.url ?? null}
          note={
            todaysLog
              ? 'Here’s what you saved today. Tap a piece to add or remove it.'
              : photo
                ? 'We select the pieces we spot in your photo. Tap a piece to add or remove it.'
                : 'We picked your most-worn piece in each category. Tap a piece to add or remove it.'
          }
        />

        <AiStatusBox ai={ai} message={aiMessage(ai)} />

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
                  // thing without relying on color. Selected chips are deep
                  // rust, not black: on the dark background "ink" turns
                  // white, so black chips looked like unselected ones.
                  // (#b34c19 gives white text 5.3:1; the theme's rust is
                  // just under the 4.5:1 minimum.)
                  return (
                    <button
                      key={piece.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(piece.id)}
                      className={`flex h-10 items-center gap-1 rounded-[20px] border-[1.5px] px-3.5 text-sm font-semibold ${
                        on ? 'border-[#b34c19] bg-[#b34c19] text-white' : 'border-[#c8c8c8] bg-white text-[#111111]'
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

        {newPieces.length > 0 && (
          <section aria-labelledby="spotted-title" className="flex flex-col gap-2">
            <h2 id="spotted-title" className="text-sm leading-[1.4] font-semibold text-ink-soft">
              Spotted in your photo, not in your closet yet
            </h2>
            <ul className="flex flex-wrap gap-1.5">
              {newPieces.map((guess) => (
                <li key={`${guess.category}-${guess.name}`}>
                  <button
                    type="button"
                    onClick={() => addSpotted(guess)}
                    className="flex h-10 items-center gap-1 rounded-[20px] border-[1.5px] border-dashed border-ink bg-white px-3.5 text-sm font-semibold text-ink hover:bg-fog"
                  >
                    <span aria-hidden="true">+</span>
                    <span className="sr-only">Add</span> {guess.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <DashedAddButton label="Add a new piece" onClick={() => openAddPieceSheet(sheetRef)} />

        <div className="flex-1" />

        {error && (
          <p role="alert" className="surface rounded-xl px-3.5 py-2.5 font-medium text-red-700">
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
