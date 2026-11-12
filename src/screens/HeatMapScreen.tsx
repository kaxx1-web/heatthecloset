import lockIcon from '../assets/figma/lock.svg'
import GarmentIcon from '../components/GarmentIcon'
import HeatBar from '../components/HeatBar'
import { CATEGORY_PLURALS, HEAT, HEAT_ORDER, countLevels, piecesByHeat } from '../components/heat'
import { CHALLENGE_DAYS, dayNumber } from '../data/stats'
import { CATEGORIES } from '../data/types'
import type { ClosetData, ISODate, Profile } from '../data/types'
import { routeHref } from '../navigation'

type Props = {
  data: ClosetData
  profile: Profile
  today: ISODate
}

// Figma: "11 Heat map". Counts the pieces saved in your closet.
export default function HeatMapScreen({ data, profile, today }: Props) {
  const day = dayNumber(profile.startDate, today)

  if (day < CHALLENGE_DAYS) {
    const left = CHALLENGE_DAYS - day
    return (
      <div className="flex flex-col gap-[18px] px-5 pt-[52px] pb-4">
        <h1 tabIndex={-1} className="text-[28px] leading-[1.15] font-extrabold text-ink">
          Heat map
        </h1>
        <div className="surface flex items-start gap-3 rounded-[18px] border-[1.5px] border-[#e0e0e0] p-4">
          <img src={lockIcon} width={20} height={20} alt="" className="mt-0.5" />
          <div className="flex flex-1 flex-col gap-1 leading-[1.4]">
            <p className="font-bold text-ink">Your heat map unlocks on day {CHALLENGE_DAYS}.</p>
            <p className="text-sm text-ink-soft">
              {left} {left === 1 ? 'day' : 'days'} to go. Keep logging every day so the map is
              accurate.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // One card per category that has pieces, the most "not worn" first.
  const groups = CATEGORIES.map((category) => {
    const items = piecesByHeat(
      data.pieces.filter((p) => p.category === category),
      data.logs,
      today,
    )
    return { category, total: items.length, counts: countLevels(items) }
  })
    .filter((group) => group.total > 0)
    .sort((a, b) => b.counts.cold / b.total - a.counts.cold / a.total || b.total - a.total)

  const notWorn = groups.reduce((sum, g) => sum + g.counts.cold, 0)

  return (
    <div className="flex flex-col gap-4 px-5 pt-[52px] pb-4">
      <h1 tabIndex={-1} className="text-[28px] leading-[1.15] font-extrabold text-ink">
        Closet heat
      </h1>
      <div className="flex flex-col gap-0.5 leading-[1.4] text-ink-soft">
        <p className="text-base">
          {notWorn} of {data.pieces.length} logged pieces not worn in the last 30 days
        </p>
        <p className="text-[13px]">Pieces show up here once you’ve logged them</p>
      </div>

      {/* Legend: a list, so screen readers say "list, 3 items". */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {HEAT_ORDER.map((level) => (
          <li key={level} className="flex items-center gap-1.5 text-[13px] leading-[1.4] text-ink">
            <span aria-hidden="true" className={`size-3.5 rounded border border-[#d9d9d9] ${HEAT[level].bg}`} />
            {HEAT[level].label}
          </li>
        ))}
      </ul>

      {data.pieces.length === 0 ? (
        <p className="text-sm text-ink-soft">No pieces yet. Tap + to log an outfit.</p>
      ) : (
        // odd:last:col-span-2 = if the last card is alone in its row,
        // stretch it across both columns (like "Bottoms" in Figma).
        <ul className="grid grid-cols-2 gap-2.5">
          {groups.map(({ category, total, counts }) => (
            <li key={category} className="odd:last:col-span-2">
              <a
                href={routeHref('heatmap', category)}
                className="surface flex h-full flex-col gap-2.5 rounded-2xl border-[1.5px] border-[#e0e0e0] p-3 hover:bg-white"
              >
                <div className="flex items-center gap-2">
                  <GarmentIcon category={category} size={30} slot="heat" />
                  <div className="flex min-w-0 flex-1 flex-col leading-[1.4]">
                    <span className="text-[15px] font-bold text-ink">{CATEGORY_PLURALS[category]}</span>
                    <span className="text-[13px] text-ink-soft">
                      {counts.cold} of {total} not worn
                    </span>
                  </div>
                </div>
                <HeatBar counts={counts} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
