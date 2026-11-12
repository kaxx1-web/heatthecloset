import { useRef, useState } from 'react'
import avatarIcon from '../assets/figma/avatar.svg'
import bellIcon from '../assets/figma/bell.svg'
import chevronRight from '../assets/figma/chevron-right.svg'
import imageIcon from '../assets/figma/image.svg'
import ConfirmDialog, { openConfirmDialog } from '../components/ConfirmDialog'
import GarmentIcon from '../components/GarmentIcon'
import type { DemoDay } from '../data/demo'
import { daysBetween, formatShortDate } from '../data/dates'
import { CHALLENGE_DAYS, FORGOTTEN_DAYS, dayNumber, rediscoveries, timesWorn } from '../data/stats'
import type { ClosetData, ISODate, Profile } from '../data/types'
import { routeHref } from '../navigation'

type Props = {
  data: ClosetData
  profile: Profile
  today: ISODate
  onLoadDemo: (day: DemoDay) => void
  onReset: () => void
}

// The 61% ring from Figma, drawn from real numbers. It's an SVG circle
// whose dashed stroke covers `percent` of the way round:
// strokeDasharray = full circumference, strokeDashoffset = the part left empty.
// rotate(-90) starts the arc at 12 o'clock instead of 3 o'clock.
function Ring({ percent }: { percent: number }) {
  const r = 30
  const circumference = 2 * Math.PI * r
  return (
    <svg aria-hidden="true" width={76} height={76} viewBox="0 0 76 76" className="shrink-0">
      <circle cx={38} cy={38} r={r} fill="none" stroke="#ececec" strokeWidth={8} />
      {percent > 0 && (
        <circle
          cx={38}
          cy={38}
          r={r}
          fill="none"
          stroke="#111111"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          transform="rotate(-90 38 38)"
        />
      )}
    </svg>
  )
}

const rowClass = 'flex h-[50px] w-full items-center gap-3 border-b border-[#ececec] text-[15px] leading-[1.4] text-ink'

// Figma: "16 Profile"
export default function ProfileScreen({ data, profile, today, onLoadDemo, onReset }: Props) {
  const resetRef = useRef<HTMLDialogElement>(null)
  const demoRef = useRef<HTMLDialogElement>(null)
  const [demoDay, setDemoDay] = useState<DemoDay>(12)

  const day = dayNumber(profile.startDate, today)
  // Days logged inside the 30-day challenge.
  const daysLogged = data.logs.filter((log) => {
    const d = daysBetween(profile.startDate, log.date)
    return d >= 0 && d < CHALLENGE_DAYS
  }).length

  const total = data.pieces.length
  const wornCount = data.pieces.filter((p) => timesWorn(data.logs, p.id, CHALLENGE_DAYS, today) > 0).length
  const percent = total === 0 ? 0 : Math.round((wornCount / total) * 100)
  const rediscovered = rediscoveries(data)

  function askDemo(day: DemoDay) {
    setDemoDay(day)
    openConfirmDialog(demoRef)
  }

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-[52px] pb-4">
      <header className="flex items-center gap-3">
        <div className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-peach">
          <img src={avatarIcon} width={28} height={28} alt="" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 tabIndex={-1} className="text-[26px] leading-[1.15] font-extrabold text-ink">
            Your progress
          </h1>
          <p className="text-sm leading-[1.4] text-ink-soft">
            {profile.name}, {day >= CHALLENGE_DAYS ? '30 days done' : `day ${day} of ${CHALLENGE_DAYS}`}
          </p>
        </div>
      </header>

      <div className="flex gap-2">
        <div className="flex flex-1 flex-col rounded-2xl bg-apricot p-3.5 text-ink">
          <p className="text-[26px] leading-[1.15] font-bold">{rediscovered.length}</p>
          <p className="text-[13px] leading-[1.4]">forgotten {rediscovered.length === 1 ? 'piece' : 'pieces'} worn again</p>
        </div>
        <div className="flex flex-1 flex-col rounded-2xl bg-fog p-3.5">
          <p className="text-[26px] leading-[1.15] font-bold text-ink">
            {daysLogged} of {CHALLENGE_DAYS}
          </p>
          <p className="text-[13px] leading-[1.4] text-ink-soft">days logged</p>
        </div>
      </div>

      <div className="surface flex items-center gap-4 rounded-2xl border-[1.5px] border-[#e0e0e0] p-3.5">
        <Ring percent={percent} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-[26px] leading-[1.15] font-bold text-ink">{percent}%</p>
          <p className="text-sm leading-[1.4] text-ink-soft">
            of your logged pieces worn in the last 30 days ({wornCount} of {total})
          </p>
        </div>
      </div>

      <section aria-labelledby="rediscovered-title" className="flex flex-col gap-2">
        <h2 id="rediscovered-title" className="text-base leading-[1.4] font-extrabold text-ink">
          Recently rediscovered
        </h2>
        {rediscovered.length === 0 ? (
          <p className="text-sm leading-[1.4] text-ink-soft">
            Pieces you haven’t worn for {FORGOTTEN_DAYS} days show up here when you wear them again.
          </p>
        ) : (
          <ul className="flex gap-2">
            {rediscovered.slice(0, 3).map(({ piece, date }) => (
              <li key={piece.id} className="min-w-0 flex-1">
                <a href={routeHref('item', piece.id)} className="flex flex-col gap-1 rounded-xl">
                  <div className="flex h-[62px] items-center justify-center rounded-xl bg-peach">
                    <GarmentIcon category={piece.category} name={piece.name} size={32} />
                  </div>
                  <span className="text-[13px] leading-[1.4] font-bold text-ink">{piece.name}</span>
                  <span className="text-xs leading-[1.4] text-ink-soft">worn again {formatShortDate(date)}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Settings" className="surface flex flex-col rounded-2xl border-[1.5px] border-[#e0e0e0] px-3.5 [&>*:last-child]:border-b-0">
        {/* Not built yet, so these rows aren't buttons. */}
        <div className={rowClass}>
          <img src={imageIcon} width={22} height={22} alt="" />
          <span className="flex-1">Upload photos</span>
          <span className="text-[13px] text-[#595959]">Coming soon</span>
        </div>
        <div className={rowClass}>
          <img src={bellIcon} width={22} height={22} alt="" />
          <span className="flex-1">Reminders</span>
          <span className="text-[13px] text-[#595959]">Coming soon</span>
        </div>

        {/* <details> is a built-in show/hide: the summary row toggles it,
            and the chevron turns when it's open (group-open:rotate-90). */}
        <details className="group border-b border-[#ececec]">
          <summary className="flex h-[50px] cursor-pointer list-none items-center gap-3 text-[15px] leading-[1.4] text-ink [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="size-[22px]" />
            <span className="flex-1">Demo mode</span>
            <img src={chevronRight} width={20} height={20} alt="" className="transition-transform group-open:rotate-90" />
          </summary>
          <div className="flex flex-col gap-2 pb-4 pl-[34px]">
            <p className="text-sm leading-[1.4] text-ink-soft">Load a sample closet that’s partway through.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => askDemo(12)}
                className="h-11 flex-1 rounded-xl border-[1.5px] border-ink text-sm font-bold text-ink"
              >
                Jump to day 12
              </button>
              <button
                type="button"
                onClick={() => askDemo(30)}
                className="h-11 flex-1 rounded-xl border-[1.5px] border-ink text-sm font-bold text-ink"
              >
                Jump to day 30
              </button>
            </div>
          </div>
        </details>

        <button type="button" onClick={() => openConfirmDialog(resetRef)} className={`${rowClass} text-left`}>
          <span aria-hidden="true" className="size-[22px]" />
          <span className="flex-1 font-semibold text-red-700">Reset data</span>
        </button>
      </section>

      <p className="text-[13px] leading-[1.4] text-ink-soft">
        Your name and logs are stored only in this browser. Photos are never saved.
      </p>

      <ConfirmDialog
        dialogRef={demoRef}
        title={`Load demo day ${demoDay}?`}
        message="This replaces your closet and logs with sample data. Your current data will be lost."
        confirmLabel="Load demo"
        onConfirm={() => onLoadDemo(demoDay)}
      />
      <ConfirmDialog
        dialogRef={resetRef}
        title="Reset all data?"
        message="This deletes your profile, closet and every log from this browser. It can’t be undone."
        confirmLabel="Reset data"
        onConfirm={onReset}
      />
    </div>
  )
}
