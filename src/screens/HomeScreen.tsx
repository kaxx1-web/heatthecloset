import DemoTools from '../components/DemoTools'
import { card, primaryButton, secondaryButton } from '../components/ui'
import type { DemoDay } from '../data/demo'
import { CHALLENGE_DAYS, dayNumber } from '../data/stats'
import type { ClosetData, ISODate, Profile } from '../data/types'
import { routeHref } from '../navigation'

type Props = {
  data: ClosetData
  profile: Profile
  today: ISODate
  onLoadDemo: (day: DemoDay) => void
  onReset: () => void
}

export default function HomeScreen({ data, profile, today, onLoadDemo, onReset }: Props) {
  const day = dayNumber(profile.startDate, today)
  const todaysLog = data.logs.find((log) => log.date === today)
  const daysLogged = data.logs.filter((log) => log.date >= profile.startDate).length

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 tabIndex={-1} className="text-3xl font-extrabold">
          Hi, {profile.name}
        </h1>
        <p className="text-stone-700">
          {daysLogged} {daysLogged === 1 ? 'day' : 'days'} logged so far.
        </p>
      </header>

      <section aria-labelledby="progress-heading" className={`${card} space-y-3`}>
        <h2 id="progress-heading" className="text-xl font-bold">
          Day {day} of {CHALLENGE_DAYS}
        </h2>
        {/* <progress> is a built-in progress bar that screen readers understand. */}
        <progress
          value={day}
          max={CHALLENGE_DAYS}
          aria-labelledby="progress-heading"
          className="h-3 w-full"
        />

        {todaysLog ? (
          <>
            <p>
              <span aria-hidden="true">✓ </span>
              Today’s outfit is logged ({todaysLog.pieceIds.length}{' '}
              {todaysLog.pieceIds.length === 1 ? 'piece' : 'pieces'}).
            </p>
            <a href={routeHref('log')} className={secondaryButton}>
              Edit today’s outfit
            </a>
          </>
        ) : (
          <>
            <p>You haven’t logged today’s outfit yet.</p>
            <a href={routeHref('log')} className={primaryButton}>
              Log today’s outfit
            </a>
          </>
        )}
      </section>

      {day === CHALLENGE_DAYS && (
        <section aria-labelledby="ready-heading" className={`${card} space-y-3`}>
          <h2 id="ready-heading" className="text-xl font-bold">
            Your heat map is ready
          </h2>
          <p>See which pieces you haven’t worn in the last 30 days.</p>
          <a href={routeHref('heatmap')} className={primaryButton}>
            Open heat map
          </a>
        </section>
      )}

      <DemoTools hasData onLoadDemo={onLoadDemo} onReset={onReset} />
    </div>
  )
}
