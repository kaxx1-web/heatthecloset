import { card } from '../components/ui'
import { formatShortDate } from '../data/dates'
import { CHALLENGE_DAYS, dayNumber, heatLevel, lastWorn, timesWorn } from '../data/stats'
import type { ClosetData, HeatLevel, ISODate, Profile } from '../data/types'

type Props = {
  data: ClosetData
  profile: Profile
  today: ISODate
}

// Cold comes first because unworn pieces are the point of the heat map.
// Every group has a text heading, so the colors are never the only clue
// (important for color-blind users and screen readers).
const GROUPS: { level: HeatLevel; title: string; tile: string }[] = [
  { level: 'cold', title: 'Not worn in 30 days', tile: 'bg-sky-100 ring-sky-300 text-sky-950' },
  { level: 'warm', title: 'Worn once or twice', tile: 'bg-amber-100 ring-amber-300 text-amber-950' },
  { level: 'hot', title: 'Worn 3+ times', tile: 'bg-rose-200 ring-rose-400 text-rose-950' },
]

export default function HeatMapScreen({ data, profile, today }: Props) {
  const day = dayNumber(profile.startDate, today)

  if (day < CHALLENGE_DAYS) {
    const left = CHALLENGE_DAYS - day
    return (
      <div className="space-y-6">
        <h1 tabIndex={-1} className="text-3xl font-extrabold">
          Heat map
        </h1>
        <div className={`${card} space-y-2`}>
          <p className="text-lg font-semibold">
            Unlocks on day {CHALLENGE_DAYS}, {left} {left === 1 ? 'day' : 'days'} to go.
          </p>
          <p className="text-stone-700">Keep logging every day so the map is accurate.</p>
        </div>
      </div>
    )
  }

  const withLevel = data.pieces.map((piece) => ({
    piece,
    level: heatLevel(data.logs, piece.id, today),
    count: timesWorn(data.logs, piece.id, CHALLENGE_DAYS, today),
    last: lastWorn(data.logs, piece.id),
  }))
  const coldCount = withLevel.filter((p) => p.level === 'cold').length

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 tabIndex={-1} className="text-3xl font-extrabold">
          Your closet heat map
        </h1>
        <p className="text-lg text-stone-700">
          {coldCount} of {data.pieces.length} pieces weren’t worn in the last 30 days.
        </p>
      </header>

      {GROUPS.map(({ level, title, tile }) => {
        const items = withLevel.filter((p) => p.level === level)
        if (items.length === 0) return null
        return (
          <section key={level} aria-labelledby={`heat-${level}`} className="space-y-2">
            <h2 id={`heat-${level}`} className="text-lg font-bold">
              {title} ({items.length})
            </h2>
            <ul className="grid grid-cols-2 gap-2">
              {items.map(({ piece, count, last }) => (
                <li key={piece.id} className={`rounded-xl p-3 ring-1 ${tile}`}>
                  <span className="block font-semibold">{piece.name}</span>
                  <span className="block text-sm">{piece.category}</span>
                  <span className="mt-1 block text-sm">
                    {count > 0
                      ? `${count}× · last ${formatShortDate(last!)}`
                      : last
                        ? `Last worn ${formatShortDate(last)}`
                        : 'Never logged'}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
