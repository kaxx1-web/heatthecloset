import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { identifyOutfit } from '../ai/identify'
import chevronDown from '../assets/figma/chevron-down.svg'
import GarmentIcon from '../components/GarmentIcon'
import { ConfirmHeader, DashedAddButton } from '../components/onboarding'
import SpellingSuggestions from '../components/SpellingSuggestions'
import { onboardingPrimary } from '../components/ui'
import { addPiece, saveLog, setProfile } from '../data/storage'
import { CATEGORIES } from '../data/types'
import type { Category, ClosetData, ISODate, Profile } from '../data/types'

// Figma: "05 Day 1: name your pieces". Used while the closet is empty.
// (Later days use PickPiecesScreen, which picks from saved pieces.)
//
// If there's a photo, the on-device AI (src/ai/) looks at it and fills in
// the rows. Every guess can be edited, swapped for another guess, or
// deleted by clearing its name.

type Alternative = { name: string; category: Category }

type Row = {
  key: string
  name: string
  category: Category
  // Set while the row still holds the AI's guess. Typing in the row or
  // changing its category removes it.
  ai?: { confidence: number; alternatives: Alternative[] }
}

// What the AI is doing, shown in the status box.
type AiStatus =
  | { status: 'off' } // no photo
  | { status: 'starting' }
  | { status: 'downloading'; percent: number }
  | { status: 'analyzing' }
  | { status: 'done'; count: number }
  | { status: 'error' }

function aiMessage(ai: AiStatus): string {
  switch (ai.status) {
    case 'downloading':
      return 'Getting the outfit AI ready. This only happens the first time.'
    case 'done':
      return ai.count > 0
        ? `Found ${ai.count} ${ai.count === 1 ? 'piece' : 'pieces'}. Check each one and fix anything that’s wrong.`
        : 'We couldn’t spot any pieces in this photo. Add them below.'
    case 'error':
      return 'The outfit AI couldn’t run on this device. Add your pieces below.'
    default:
      return 'Looking at your outfit…'
  }
}

// The box that says what the AI is doing. The sentence is a polite live
// region (role="status"), so screen readers hear each step once. The
// percentage isn't inside it: announcing every percent would be noise.
// Screen readers can still read the value from the <progress> bar.
function AiStatusBox({ ai }: { ai: AiStatus }) {
  if (ai.status === 'off') return null
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-fog px-3.5 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p id="ai-status" role="status" className="text-sm leading-[1.4] font-semibold text-ink">
          {aiMessage(ai)}
        </p>
        {ai.status === 'downloading' && (
          <span aria-hidden="true" className="text-sm text-ink-soft tabular-nums">
            {ai.percent}%
          </span>
        )}
      </div>
      {/* Styled like Home's progress bar. appearance-none turns off the
          browser's own look; then each browser's bar part is styled
          separately (-webkit- for Chrome/Safari, -moz- for Firefox), as
          they can't share one rule. overflow-clip rounds the filled part. */}
      {ai.status === 'downloading' && (
        <progress
          aria-labelledby="ai-status"
          max={100}
          value={ai.percent}
          className="h-2.5 w-full appearance-none overflow-clip rounded-[5px] border-0 bg-[#ececec] [&::-moz-progress-bar]:bg-ink [&::-webkit-progress-bar]:bg-[#ececec] [&::-webkit-progress-value]:bg-ink"
        />
      )}
      <p className="text-xs leading-[1.4] text-ink-soft">
        The AI runs on this phone. Your photo is never uploaded.
      </p>
    </div>
  )
}

const PLACEHOLDERS: Partial<Record<Category, string>> = {
  Top: 'e.g. H&M Black Tee',
  Bottom: 'e.g. Uniqlo Jeans',
  Shoes: 'e.g. White converse',
}

// One blank row each for Top, Bottom and Shoes.
function startingRows(): Row[] {
  return (['Top', 'Bottom', 'Shoes'] as const).map((category) => ({
    key: crypto.randomUUID(),
    name: '',
    category,
  }))
}

type Props = {
  data: ClosetData
  profile: Profile
  today: ISODate
  day: number
  photo: { blob: Blob; url: string } | null
  onChange: (next: ClosetData) => void
  onSaved: () => void
}

export default function ConfirmScreen({ data, profile, today, day, photo, onChange, onSaved }: Props) {
  const [rows, setRows] = useState<Row[]>(startingRows)
  const [newRowKey, setNewRowKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [ai, setAi] = useState<AiStatus>(photo ? { status: 'starting' } : { status: 'off' })

  // When there's a photo, ask the AI what's in it. `cancelled` stops a
  // late answer from changing the screen after you've left it.
  const blob = photo?.blob
  useEffect(() => {
    if (!blob) return
    let cancelled = false
    identifyOutfit(blob, (progress) => {
      if (cancelled) return
      setAi(progress.phase === 'downloading' ? { status: 'downloading', percent: progress.percent } : { status: 'analyzing' })
    })
      .then((pieces) => {
        if (cancelled) return
        setAi({ status: 'done', count: pieces.length })
        if (pieces.length === 0) return
        // Replace the blank starter rows with the guesses, but keep any row
        // you've already typed in.
        setRows((current) => [
          ...pieces.map((piece) => ({
            key: crypto.randomUUID(),
            name: piece.name,
            category: piece.category,
            ai: { confidence: piece.confidence, alternatives: piece.alternatives },
          })),
          ...current.filter((row) => row.name.trim() !== ''),
        ])
      })
      .catch(() => {
        if (!cancelled) setAi({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [blob])

  // Updates one field of one row and leaves the others alone.
  function updateRow(key: string, change: Partial<Row>) {
    setError('')
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...change } : row)))
  }

  // "Other guesses": swap in another guess. The current one becomes an
  // option, so you can swap back.
  function pickAlternative(row: Row, choice: Alternative) {
    if (!row.ai) return
    const others = row.ai.alternatives.filter((alt) => alt !== choice)
    updateRow(row.key, {
      name: choice.name,
      category: choice.category,
      ai: { ...row.ai, alternatives: [{ name: row.name, category: row.category }, ...others] },
    })
  }

  function addRow() {
    const key = crypto.randomUUID()
    setRows((current) => [...current, { key, name: '', category: 'Top' }])
    setNewRowKey(key) // so the new row's name field gets focus
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const named = rows.filter((row) => row.name.trim() !== '')
    if (named.length === 0) {
      setError('Name at least one piece you’re wearing.')
      document.querySelector<HTMLInputElement>('#confirm-form input')?.focus()
      return
    }

    let next = data
    // "This starts your 30 days": if nothing has been logged yet, day 1 is today.
    if (next.logs.length === 0) next = setProfile(next, { ...profile, startDate: today })

    const pieceIds: string[] = []
    for (const row of named) {
      next = addPiece(next, row.name, row.category, today)
      pieceIds.push(next.pieces[next.pieces.length - 1].id)
    }
    onChange(saveLog(next, today, pieceIds))
    onSaved()
  }

  return (
    <form
      id="confirm-form"
      onSubmit={handleSave}
      noValidate
      className="flex flex-1 flex-col gap-3.5 px-5 pt-11 pb-6"
    >
      <ConfirmHeader
        showDots
        photoUrl={photo?.url ?? null}
        note={
          photo
            ? 'We suggested these from your photo. Check each one and fix anything that’s wrong.'
            : 'No photo this time, so add what you’re wearing below.'
        }
      />

      <AiStatusBox ai={ai} />

      <div className="flex flex-col gap-2.5">
        {rows.map((row, i) => (
          // <fieldset> groups the two fields of one piece; the hidden legend
          // tells screen-reader users which piece they're on.
          <fieldset
            key={row.key}
            className="surface flex flex-col gap-2 rounded-2xl border-[1.5px] border-[#e0e0e0] px-3 py-2.5"
          >
            <legend className="sr-only">Piece {i + 1}</legend>
            <div className="flex items-center gap-3">
              <div className="flex size-[52px] shrink-0 items-center justify-center rounded-[10px] bg-fog">
                <GarmentIcon category={row.category} name={row.name} size={34} />
              </div>

              <div className="flex min-w-0 flex-1 gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <label htmlFor={`${row.key}-name`} className="text-xs leading-[1.4] font-semibold text-ink-soft">
                    Name
                  </label>
                  <input
                    id={`${row.key}-name`}
                    value={row.name}
                    onChange={(e) => updateRow(row.key, { name: e.target.value, ai: undefined })}
                    placeholder={PLACEHOLDERS[row.category] ?? 'e.g. Denim jacket'}
                    autoFocus={row.key === newRowKey}
                    maxLength={60}
                    enterKeyHint="next"
                    spellCheck
                    aria-describedby={`${row.key}-suggestions`}
                    className="h-10 w-full min-w-0 rounded-[10px] border-[1.5px] border-[#d6d6d6] bg-white px-2.5 text-base font-medium text-ink placeholder:font-normal placeholder:text-stone-500"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <label htmlFor={`${row.key}-category`} className="text-xs leading-[1.4] font-semibold text-ink-soft">
                    Category
                  </label>
                  {/* appearance-none hides the browser's own arrow so we can
                      show the Figma chevron instead. It's still a real <select>. */}
                  <div className="relative">
                    <select
                      id={`${row.key}-category`}
                      value={row.category}
                      onChange={(e) => updateRow(row.key, { category: e.target.value as Category, ai: undefined })}
                      className="h-10 w-full appearance-none rounded-[10px] border-[1.5px] border-[#d6d6d6] bg-white pr-8 pl-2.5 text-base font-medium text-ink"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <img
                      src={chevronDown}
                      width={16}
                      height={16}
                      alt=""
                      className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* The AI's guess, labelled as such, with one-tap alternatives. */}
            {row.ai && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-peach px-2.5 py-1 text-xs leading-[1.4] font-semibold text-ink">
                  AI guess{row.ai.confidence < 0.5 ? ' · not sure' : ''}
                </span>
                {row.ai.alternatives.length > 0 && (
                  <>
                    <span className="text-[13px] leading-[1.4] font-semibold text-ink-soft">Other guesses:</span>
                    {row.ai.alternatives.map((alt) => (
                      <button
                        key={alt.name}
                        type="button"
                        onClick={() => pickAlternative(row, alt)}
                        className="flex h-10 items-center rounded-[20px] border-[1.5px] border-[#c8c8c8] bg-white px-3.5 text-sm font-semibold text-ink hover:bg-fog"
                      >
                        {alt.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            <SpellingSuggestions
              id={`${row.key}-suggestions`}
              value={row.name}
              myNames={rows.filter((r) => r.key !== row.key).map((r) => r.name)}
              onPick={(suggestion) => {
                updateRow(row.key, { name: suggestion })
                document.getElementById(`${row.key}-name`)?.focus() // keep typing
              }}
            />
          </fieldset>
        ))}
      </div>

      <DashedAddButton label="Add another piece" onClick={addRow} />

      <div className="flex-1" />

      {error && (
        <p role="alert" className="surface rounded-xl px-3.5 py-2.5 font-medium text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className={onboardingPrimary}>
        Save day {day}
      </button>
    </form>
  )
}
