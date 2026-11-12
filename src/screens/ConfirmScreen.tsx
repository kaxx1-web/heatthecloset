import { useState } from 'react'
import type { FormEvent } from 'react'
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

type Row = { key: string; name: string; category: Category }

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
  photoUrl: string | null
  onChange: (next: ClosetData) => void
  onSaved: () => void
}

export default function ConfirmScreen({ data, profile, today, day, photoUrl, onChange, onSaved }: Props) {
  const [rows, setRows] = useState<Row[]>(startingRows)
  const [newRowKey, setNewRowKey] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Updates one field of one row and leaves the others alone.
  function updateRow(key: string, change: Partial<Row>) {
    setError('')
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...change } : row)))
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
      className="flex flex-1 flex-col gap-3.5 bg-white px-5 pt-11 pb-6"
    >
      <ConfirmHeader
        showDots
        photoUrl={photoUrl}
        note="We suggested these from your photo. Check each one and fix anything that’s wrong."
      />

      <div className="flex flex-col gap-2.5">
        {rows.map((row, i) => (
          // <fieldset> groups the two fields of one piece; the hidden legend
          // tells screen-reader users which piece they're on.
          <fieldset
            key={row.key}
            className="flex flex-col gap-2 rounded-2xl border-[1.5px] border-[#e0e0e0] px-3 py-2.5"
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
                    onChange={(e) => updateRow(row.key, { name: e.target.value })}
                    placeholder={PLACEHOLDERS[row.category] ?? 'e.g. Denim jacket'}
                    autoFocus={row.key === newRowKey}
                    maxLength={60}
                    enterKeyHint="next"
                    spellCheck
                    aria-describedby={`${row.key}-suggestions`}
                    className="h-10 w-full min-w-0 rounded-[10px] border-[1.5px] border-[#d6d6d6] bg-white px-2.5 text-base font-medium text-ink placeholder:font-normal placeholder:text-stone-400"
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
                      onChange={(e) => updateRow(row.key, { category: e.target.value as Category })}
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
        <p role="alert" className="font-medium text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className={onboardingPrimary}>
        Save day {day}
      </button>
    </form>
  )
}
