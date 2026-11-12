import { useRef, useState } from 'react'
import searchIcon from '../assets/figma/search.svg'
import AddPieceSheet, { openAddPieceSheet } from '../components/AddPieceSheet'
import GarmentIcon from '../components/GarmentIcon'
import { CATEGORY_PLURALS, HEAT } from '../components/heat'
import { DashedAddButton } from '../components/onboarding'
import { CHALLENGE_DAYS, heatLevel, timesWorn } from '../data/stats'
import { addPiece } from '../data/storage'
import { CATEGORIES } from '../data/types'
import type { Category, ClosetData, ISODate } from '../data/types'
import { routeHref } from '../navigation'

type Props = {
  data: ClosetData
  today: ISODate
  onChange: (next: ClosetData) => void
}

type Filter = 'All' | Category

// "7 times", "Twice", "Not worn" (last 30 days)
function wornLabel(count: number): string {
  if (count === 0) return 'Not worn'
  if (count === 1) return 'Once'
  if (count === 2) return 'Twice'
  return `${count} times`
}

// Figma: "15 Closet"
export default function ClosetScreen({ data, today, onChange }: Props) {
  const sheetRef = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('All')

  // Only show chips for categories that have pieces.
  const categoriesInUse = CATEGORIES.filter((c) => data.pieces.some((p) => p.category === c))
  // If the chosen category no longer has pieces (e.g. after "Let it go"), show all.
  const activeFilter: Filter = filter !== 'All' && categoriesInUse.includes(filter) ? filter : 'All'

  const search = query.trim().toLowerCase()
  const shown = data.pieces
    .filter((p) => activeFilter === 'All' || p.category === activeFilter)
    .filter((p) => p.name.toLowerCase().includes(search))
    .map((piece) => ({ piece, count: timesWorn(data.logs, piece.id, CHALLENGE_DAYS, today) }))
    .sort((a, b) => b.count - a.count || a.piece.name.localeCompare(b.piece.name)) // most worn first

  const total = data.pieces.length
  const filtered = shown.length !== total

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-[52px] pb-4">
      <header className="flex items-end justify-between">
        <h1 tabIndex={-1} className="text-[28px] leading-[1.15] font-extrabold text-ink">
          Closet
        </h1>
        {/* aria-live: screen readers hear the new count as you search or filter. */}
        <p aria-live="polite" className="text-sm leading-[1.4] text-ink-soft">
          {filtered ? `${shown.length} of ${total}` : total} {total === 1 ? 'piece' : 'pieces'}
        </p>
      </header>

      {/* <search> marks this as a search area for assistive technology. The
          list filters as you type, so there's no submit button. */}
      <search>
        <label className="flex h-12 items-center gap-2.5 rounded-[13px] bg-fog px-3.5 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-700">
          <img src={searchIcon} width={20} height={20} alt="" />
          <span className="sr-only">Search your closet</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your closet"
            enterKeyHint="search"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-[#595959]"
          />
        </label>
      </search>

      {/* Category chips: radio buttons (pick one) styled as pills. The row
          scrolls sideways when the chips don't fit, like in Figma. */}
      {categoriesInUse.length > 0 && (
        <fieldset className="-mx-5 min-w-0">
          <legend className="sr-only">Filter by category</legend>
          <div className="flex gap-2 overflow-x-auto px-5 pb-1">
            {(['All', ...categoriesInUse] as Filter[]).map((option) => (
              <label
                key={option}
                // `relative` keeps the hidden (absolutely positioned) radio
                // inside its chip, so it can't stretch the page sideways.
                className="relative flex h-[38px] shrink-0 cursor-pointer items-center rounded-[19px] border-[1.5px] border-[#c8c8c8] bg-white px-3.5 text-sm font-semibold text-ink has-checked:border-ink has-checked:bg-ink has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-700"
              >
                <input
                  type="radio"
                  name="closet-filter"
                  value={option}
                  checked={activeFilter === option}
                  onChange={() => setFilter(option)}
                  className="sr-only"
                />
                {option === 'All' ? 'All' : CATEGORY_PLURALS[option]}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {total === 0 ? (
        <p className="text-sm text-ink-soft">No pieces yet. Add one below, or tap + to log an outfit.</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-ink-soft">No pieces match “{query.trim()}”.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-x-2.5 gap-y-3">
          {shown.map(({ piece, count }) => (
            <li key={piece.id}>
              <a href={routeHref('item', piece.id)} className="flex flex-col gap-1 rounded-xl">
                {/* Tile color = heat level; the text below gives the count. */}
                <div
                  className={`flex h-[84px] items-center justify-center rounded-xl ${HEAT[heatLevel(data.logs, piece.id, today)].bg}`}
                >
                  <GarmentIcon category={piece.category} name={piece.name} size={44} />
                </div>
                <span className="text-[13px] leading-[1.4] font-bold text-ink">{piece.name}</span>
                <span className="text-xs leading-[1.4] text-ink-soft">{wornLabel(count)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Not in the Figma frame, but this is the only place to add pieces
          you own and haven't worn, which is what the heat map is for. */}
      <DashedAddButton label="Add a new piece" onClick={() => openAddPieceSheet(sheetRef)} />

      <AddPieceSheet
        dialogRef={sheetRef}
        existingNames={data.pieces.map((p) => p.name)}
        onAdd={(name, category) => onChange(addPiece(data, name, category, today))}
      />
    </div>
  )
}
