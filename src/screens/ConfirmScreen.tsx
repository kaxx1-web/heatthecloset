import { useState } from 'react'
import type { FormEvent } from 'react'
import chevronDown from '../assets/figma/chevron-down.svg'
import pantsIcon from '../assets/figma/piece-pants.svg'
import sneakerIcon from '../assets/figma/piece-sneaker.svg'
import teeIcon from '../assets/figma/piece-tee.svg'
import photoPlaceholder from '../assets/figma/photo-placeholder.svg'
import plusIcon from '../assets/figma/plus.svg'
import bagIcon from '../assets/figma/welcome-bag.svg'
import dressIcon from '../assets/figma/welcome-dress.svg'
import jacketIcon from '../assets/figma/welcome-jacket.svg'
import { BackLink, StepDots } from '../components/onboarding'
import { onboardingPrimary } from '../components/ui'
import { suggestPieces } from '../data/stats'
import { addPiece, saveLog, setProfile } from '../data/storage'
import { CATEGORIES } from '../data/types'
import type { Category, ClosetData, ISODate, Profile } from '../data/types'
import { routeHref } from '../navigation'

// Figma: "05 Day 1: name your pieces"

// One editable row. `pieceId` is set when the row was pre-filled from a
// piece already in the closet.
type Row = { key: string; pieceId?: string; name: string; category: Category }

// The Figma frame has Top, Bottom and Shoes icons. For other categories we
// reuse the matching icons from the welcome screen. Accessory has no icon
// in the designs, so its tile stays empty.
const ICONS: Partial<Record<Category, string>> = {
  Top: teeIcon,
  Bottom: pantsIcon,
  Shoes: sneakerIcon,
  Dress: dressIcon,
  Outerwear: jacketIcon,
  Bag: bagIcon,
}

const PLACEHOLDERS: Partial<Record<Category, string>> = {
  Top: 'e.g. H&M Black Tee',
  Bottom: 'e.g. Uniqlo Jeans',
  Shoes: 'e.g. White converse',
}

const SUGGESTED_CATEGORIES: Category[] = ['Top', 'Bottom', 'Shoes']

// One row each for Top, Bottom and Shoes. On day 1 the closet is empty, so
// the names are blank. Later, each row is pre-filled with the most-worn
// piece in that category.
function startingRows(data: ClosetData, today: ISODate): Row[] {
  const suggested = suggestPieces(data.pieces, data.logs, today)
  return SUGGESTED_CATEGORIES.map((category) => {
    const piece = data.pieces.find((p) => p.category === category && suggested.includes(p.id))
    return { key: crypto.randomUUID(), pieceId: piece?.id, name: piece?.name ?? '', category }
  })
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
  const [rows, setRows] = useState<Row[]>(() => startingRows(data, today))
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
      // Reuse the existing piece only if the user left it unchanged.
      // An edited name or category is saved as a new piece.
      const existing = next.pieces.find(
        (p) => p.id === row.pieceId && p.name === row.name.trim() && p.category === row.category,
      )
      if (existing) {
        pieceIds.push(existing.id)
      } else {
        next = addPiece(next, row.name, row.category, today)
        pieceIds.push(next.pieces[next.pieces.length - 1].id)
      }
    }

    // new Set(...) removes duplicates, in case the same piece appears twice.
    onChange(saveLog(next, today, [...new Set(pieceIds)]))
    onSaved()
  }

  return (
    <form
      id="confirm-form"
      onSubmit={handleSave}
      noValidate
      className="flex flex-1 flex-col gap-3.5 bg-white px-5 pt-11 pb-6"
    >
      <BackLink href={routeHref('photo')} label="Retake" />
      <StepDots active={3} />
      <h1 tabIndex={-1} className="text-[28px] leading-[1.15] font-extrabold text-ink">
        This is what you’re wearing
      </h1>

      <div className="flex items-center gap-3">
        <div className="flex h-20 w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-fog">
          {photoUrl ? (
            <img src={photoUrl} alt="Your outfit photo" className="size-full object-cover" />
          ) : (
            <img src={photoPlaceholder} width={24} height={24} alt="" />
          )}
        </div>
        <p className="flex-1 text-[15px] leading-[1.4] text-ink-soft">
          We suggested these from your photo. Check each one and fix anything that’s wrong.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {rows.map((row, i) => (
          // <fieldset> groups the two fields of one piece; the hidden legend
          // tells screen-reader users which piece they're on.
          <fieldset
            key={row.key}
            className="flex items-center gap-3 rounded-2xl border-[1.5px] border-[#e0e0e0] px-3 py-2.5"
          >
            <legend className="sr-only">Piece {i + 1}</legend>
            <div className="flex size-[52px] shrink-0 items-center justify-center rounded-[10px] bg-fog">
              {ICONS[row.category] && (
                <img src={ICONS[row.category]} width={34} height={34} alt="" />
              )}
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
          </fieldset>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex h-12 shrink-0 items-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-[#9a9a9a] px-3.5 text-[15px] font-semibold text-ink"
      >
        <img src={plusIcon} width={20} height={20} alt="" />
        Add another piece
      </button>

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
