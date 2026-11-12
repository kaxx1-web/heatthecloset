import GarmentIcon from '../components/GarmentIcon'
import HeatBar from '../components/HeatBar'
import { CATEGORY_PLURALS, HEAT, countLevels, piecesByHeat } from '../components/heat'
import { BackLink } from '../components/onboarding'
import { formatShortDate } from '../data/dates'
import { timesPhrase } from '../data/stats'
import type { Category, ClosetData, ISODate } from '../data/types'
import { routeHref } from '../navigation'

type Props = {
  data: ClosetData
  category: Category
  today: ISODate
}

// One heat map category, opened by tapping its card. There's no Figma
// frame, so it reuses the heat map's colors and Home's card shapes.
export default function HeatCategoryScreen({ data, category, today }: Props) {
  const items = piecesByHeat(
    data.pieces.filter((p) => p.category === category),
    data.logs,
    today,
  )
  const counts = countLevels(items)

  return (
    <div className="flex flex-col gap-4 px-5 pt-11 pb-4">
      <BackLink href={routeHref('heatmap')} label="Heat map" />
      <div className="flex flex-col gap-1">
        <h1 tabIndex={-1} className="text-[28px] leading-[1.15] font-extrabold text-ink">
          {CATEGORY_PLURALS[category]}
        </h1>
        <p className="text-[15px] leading-[1.4] text-ink-soft">
          {counts.cold} of {items.length} not worn in the last 30 days. Least worn first.
        </p>
      </div>
      <HeatBar counts={counts} />

      <ul className="flex flex-col gap-2.5">
        {items.map(({ piece, level, count, last }) => (
          <li key={piece.id}>
            <a
              href={routeHref('item', piece.id)}
              className="flex items-center gap-2.5 rounded-[14px] border-[1.5px] border-[#e0e0e0] bg-white px-2.5 py-2 hover:bg-[#fafafa]"
            >
              {/* The tile color shows the heat level; the text says it too. */}
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-[10px] ${HEAT[level].bg}`}>
                <GarmentIcon category={category} name={piece.name} size={30} slot="heat" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-px leading-[1.4]">
                <span className="text-sm font-bold text-ink">{piece.name}</span>
                <span className="text-xs text-ink-soft">
                  {count === 0 ? 'Not worn in 30 days' : `Worn ${timesPhrase(count)} in 30 days`}
                  {last ? ` • Last worn ${formatShortDate(last)}` : ' • Never logged'}
                </span>
              </div>
              <span aria-hidden="true" className="text-xl text-[#9a9a9a]">
                ›
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
