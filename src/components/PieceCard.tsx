import { formatDaysAgo } from '../data/dates'
import { lastWorn, timesPhrase, timesWorn } from '../data/stats'
import type { ISODate, Log, Piece } from '../data/types'
import { routeHref } from '../navigation'
import GarmentIcon from './GarmentIcon'

// e.g. "Worn 8 times • Last worn yesterday"
export function wornSummary(count: number, last: ISODate | null, today: ISODate): string {
  if (!last) return 'Not worn yet'
  const times = count === 0 ? 'Not worn in 30 days' : `Worn ${timesPhrase(count)}`
  return `${times} • Last worn ${formatDaysAgo(last, today)}`
}

// One piece in "My closet" (Figma: Home, "Piece / Uniqlo Jeans").
// Tapping it opens the item detail.
export default function PieceCard({ piece, logs, today }: { piece: Piece; logs: Log[]; today: ISODate }) {
  const count = timesWorn(logs, piece.id, 30, today)
  return (
    <li>
      <a
        href={routeHref('item', piece.id)}
        className="flex items-center gap-2.5 rounded-[14px] border-[1.5px] border-[#e0e0e0] bg-white px-2.5 py-2 hover:bg-[#fafafa]"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-fog">
          <GarmentIcon category={piece.category} name={piece.name} size={30} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-px leading-[1.4]">
          <span className="text-sm font-bold text-ink">{piece.name}</span>
          <span className="text-xs text-ink-soft">{wornSummary(count, lastWorn(logs, piece.id), today)}</span>
        </div>
      </a>
    </li>
  )
}
