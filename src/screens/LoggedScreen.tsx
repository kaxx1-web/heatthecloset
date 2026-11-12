import checkIcon from '../assets/figma/check-white.svg'
import GarmentIcon from '../components/GarmentIcon'
import ProgressBar, { daysToGo } from '../components/ProgressBar'
import { onboardingPrimary } from '../components/ui'
import { formatShortDate } from '../data/dates'
import { CHALLENGE_DAYS, timesPhrase, timesWorn } from '../data/stats'
import type { ClosetData, ISODate, Log } from '../data/types'
import { routeHref } from '../navigation'

type Props = {
  data: ClosetData
  log: Log // today's log, which was just saved
  today: ISODate
  day: number
}

// Figma: "10 Outfit logged"
export default function LoggedScreen({ data, log, today, day }: Props) {
  // Turn the saved ids back into pieces. The filter drops any id whose
  // piece no longer exists (find returns undefined for those).
  const pieces = log.pieceIds.map((id) => data.pieces.find((p) => p.id === id)).filter((p) => p !== undefined)

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 pt-[52px] pb-7">
      <div className="flex flex-col items-center gap-3 pt-9 text-center">
        <div className="flex size-[72px] items-center justify-center rounded-full bg-ink">
          <img src={checkIcon} width={36} height={36} alt="" />
        </div>
        <h1 tabIndex={-1} className="text-[28px] leading-[1.15] font-extrabold text-ink">
          Outfit logged
        </h1>
        <p className="text-[15px] leading-[1.4] text-ink-soft">
          {pieces.length} {pieces.length === 1 ? 'piece' : 'pieces'} updated for {formatShortDate(today)}
        </p>
      </div>

      <ul className="surface flex flex-col gap-1 rounded-2xl border-[1.5px] border-[#e0e0e0] px-3.5 py-1.5">
        {pieces.map((piece) => (
          <li key={piece.id} className="flex items-center gap-3 py-1">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-peach">
              <GarmentIcon category={piece.category} name={piece.name} size={32} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col leading-[1.4]">
              <p className="text-[15px] font-bold text-ink">{piece.name}</p>
              <p className="text-[13px] text-ink-soft">
                Now worn {timesPhrase(timesWorn(data.logs, piece.id, CHALLENGE_DAYS, today))} in the
                last 30 days
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="surface flex flex-col gap-2.5 rounded-2xl p-4">
        <div className="flex items-center justify-between leading-[1.4]">
          <p className="font-bold text-ink">
            Day {day} of {CHALLENGE_DAYS} done
          </p>
          <p className="text-sm text-ink-soft">{daysToGo(day)}</p>
        </div>
        <ProgressBar day={day} />
      </div>

      <div className="flex-1" />

      <a href={routeHref('home')} className={onboardingPrimary}>
        Back to home
      </a>
    </div>
  )
}
