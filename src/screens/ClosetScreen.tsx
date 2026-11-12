import AddPieceForm from '../components/AddPieceForm'
import { card } from '../components/ui'
import { formatShortDate } from '../data/dates'
import { lastWorn, timesWorn } from '../data/stats'
import { addPiece } from '../data/storage'
import { CATEGORIES } from '../data/types'
import type { ClosetData, ISODate } from '../data/types'

type Props = {
  data: ClosetData
  today: ISODate
  onChange: (next: ClosetData) => void
}

export default function ClosetScreen({ data, today, onChange }: Props) {
  const categoriesInUse = CATEGORIES.filter((c) => data.pieces.some((p) => p.category === c))

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 tabIndex={-1} className="text-3xl font-extrabold">
          Your closet
        </h1>
        <p className="text-stone-700">
          {data.pieces.length} {data.pieces.length === 1 ? 'piece' : 'pieces'} saved.
        </p>
      </header>

      <section aria-labelledby="add-heading" className={`${card} space-y-4`}>
        <h2 id="add-heading" className="text-xl font-bold">
          Add a piece
        </h2>
        <AddPieceForm onAdd={(name, category) => onChange(addPiece(data, name, category, today))} />
      </section>

      {categoriesInUse.map((category) => (
        <section key={category} aria-labelledby={`cat-${category}`} className="space-y-2">
          <h2 id={`cat-${category}`} className="text-lg font-bold">
            {category}
          </h2>
          <ul className="divide-y divide-stone-200 rounded-2xl bg-white ring-1 ring-stone-200">
            {data.pieces
              .filter((piece) => piece.category === category)
              .map((piece) => {
                const count = timesWorn(data.logs, piece.id, 30, today)
                const last = lastWorn(data.logs, piece.id)
                return (
                  <li key={piece.id} className="flex items-baseline justify-between gap-3 px-4 py-3">
                    <span className="font-medium">{piece.name}</span>
                    <span className="text-right text-sm text-stone-600">
                      {last ? `${count}× · last ${formatShortDate(last)}` : 'Not worn yet'}
                    </span>
                  </li>
                )
              })}
          </ul>
        </section>
      ))}
    </div>
  )
}
