import bellIcon from '../assets/figma/bell.svg'
import lockIcon from '../assets/figma/lock.svg'
import GarmentIcon from '../components/GarmentIcon'
import PieceCard from '../components/PieceCard'
import ProgressBar, { daysToGo } from '../components/ProgressBar'
import { formatLongDate } from '../data/dates'
import { CHALLENGE_DAYS, activePlans, dayNumber, piecesWornCount, suggestOutfit, timesPhrase, timesWorn } from '../data/stats'
import type { ClosetData, ISODate, Profile } from '../data/types'
import { routeHref } from '../navigation'

type Props = {
  data: ClosetData
  profile: Profile
  today: ISODate
}

const CLOSET_PREVIEW = 5 // how many pieces to show on Home

// Figma: "06 Home, day 12 of 30"
export default function HomeScreen({ data, profile, today }: Props) {
  const day = dayNumber(profile.startDate, today)
  const daysLogged = data.logs.filter((log) => log.date >= profile.startDate).length
  const piecesWorn = piecesWornCount(data.logs, profile.startDate)
  const suggestion = suggestOutfit(data.pieces, data.logs, today)
  const plans = activePlans(data, today)

  // Most-worn first.
  const byWear = [...data.pieces].sort(
    (a, b) => timesWorn(data.logs, b.id, 30, today) - timesWorn(data.logs, a.id, 30, today),
  )

  return (
    <div className="flex flex-col gap-[18px] px-5 pt-[52px] pb-4">
      <header className="flex items-start">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-sm leading-[1.4] text-ink-soft">{formatLongDate(today)}</p>
          <h1 tabIndex={-1} className="text-[28px] leading-[1.15] font-extrabold text-ink">
            Hello, {profile.name}.
          </h1>
        </div>
        {/* Notifications aren't built yet, so the bell is only decoration. */}
        <div aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-fog">
          <img src={bellIcon} width={22} height={22} alt="" />
        </div>
      </header>

      <section aria-labelledby="progress-title" className="surface flex flex-col gap-2.5 rounded-[18px] border-[1.5px] border-[#e0e0e0] p-4">
        <div className="flex items-center justify-between leading-[1.4]">
          <h2 id="progress-title" className="text-lg font-bold text-ink">
            Day {day} of {CHALLENGE_DAYS}
          </h2>
          <p className="text-sm text-ink-soft">{daysToGo(day)}</p>
        </div>
        <ProgressBar day={day} />
        <p className="text-sm leading-[1.4] text-ink-soft">
          {piecesWorn} different {piecesWorn === 1 ? 'piece' : 'pieces'} worn so far
        </p>
      </section>

      {/* Pieces saved with "Wear it this week" on the item detail screen.
          Each one drops off after 7 days, or once it's been worn. */}
      {plans.length > 0 && (
        <section aria-labelledby="plans-title" className="flex flex-col gap-2.5 rounded-[18px] bg-peach p-4">
          <h2 id="plans-title" className="text-lg leading-[1.4] font-bold text-ink">
            Wear it this week
          </h2>
          <ul className="flex flex-col gap-2">
            {plans.map((piece) => (
              <li key={piece.id}>
                <a href={routeHref('item', piece.id)} className="flex items-center gap-2.5 rounded-xl bg-white px-2.5 py-2">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-fog">
                    <GarmentIcon category={piece.category} name={piece.name} size={30} />
                  </div>
                  <span className="flex-1 text-sm font-bold text-ink">{piece.name}</span>
                  <span aria-hidden="true" className="text-xl text-[#9a9a9a]">
                    ›
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="suggested-title" className="surface flex flex-col gap-2.5 rounded-[18px] border-[1.5px] border-[#e0e0e0] p-4">
        <div className="flex items-center justify-between leading-[1.4]">
          <h2 id="suggested-title" className="text-lg font-bold text-ink">
            Suggested outfit
          </h2>
          <p className="text-sm text-ink-soft">
            From your {daysLogged} {daysLogged === 1 ? 'day' : 'days'}
          </p>
        </div>
        {suggestion ? (
          <>
            <ul className="flex gap-2">
              {suggestion.outfit.map((piece) => (
                <li key={piece.id} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  {/* The forgotten piece gets a peach tile so it stands out. */}
                  <div
                    className={`flex h-[60px] w-full items-center justify-center rounded-xl ${
                      piece.id === suggestion.focus.id ? 'bg-peach' : 'bg-fog'
                    }`}
                  >
                    <GarmentIcon category={piece.category} name={piece.name} size={30} />
                  </div>
                  <span className="line-clamp-2 text-center text-xs leading-[1.3] text-ink">{piece.name}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm leading-[1.4] text-ink-soft">
              Your {suggestion.focus.name}{' '}
              {suggestion.focusCount === 0
                ? 'hasn’t been worn in 30 days.'
                : `has only been worn ${timesPhrase(suggestion.focusCount)}.`}{' '}
              Try it with what you wear most.
            </p>
          </>
        ) : (
          <p className="text-sm leading-[1.4] text-ink-soft">
            Log a few outfits and we’ll suggest one here.
          </p>
        )}
      </section>

      <section aria-labelledby="closet-title" className="flex flex-col gap-2.5">
        <h2 id="closet-title" className="text-lg leading-[1.4] font-extrabold text-ink">
          My closet
        </h2>
        {data.pieces.length === 0 ? (
          <p className="text-sm text-ink-soft">No pieces yet. Tap + to log your first outfit.</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {byWear.slice(0, CLOSET_PREVIEW).map((piece) => (
              <PieceCard key={piece.id} piece={piece} logs={data.logs} today={today} />
            ))}
          </ul>
        )}
        {data.pieces.length > CLOSET_PREVIEW && (
          <a href={routeHref('closet')} className="inline-flex min-h-11 items-center self-start text-sm font-semibold text-ink underline underline-offset-4">
            See all {data.pieces.length} pieces
          </a>
        )}

        {day < CHALLENGE_DAYS ? (
          <div className="flex items-center gap-2.5">
            <img src={lockIcon} width={20} height={20} alt="" />
            <p className="flex-1 text-sm leading-[1.4] text-ink-soft">Your heat map unlocks on day 30.</p>
          </div>
        ) : (
          <a href={routeHref('heatmap')} className="flex min-h-11 items-center text-sm font-semibold text-ink underline underline-offset-4">
            Your heat map is ready. Take a look.
          </a>
        )}
      </section>
    </div>
  )
}
