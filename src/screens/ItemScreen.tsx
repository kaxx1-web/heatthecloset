import { useRef, useState } from 'react'
import calendarIcon from '../assets/figma/calendar-white.svg'
import checkIcon from '../assets/figma/check-dark.svg'
import ConfirmDialog, { openConfirmDialog } from '../components/ConfirmDialog'
import GarmentIcon from '../components/GarmentIcon'
import { HEAT } from '../components/heat'
import { BackLink } from '../components/onboarding'
import { onboardingOutline, onboardingPrimary } from '../components/ui'
import { formatShortDate } from '../data/dates'
import { CHALLENGE_DAYS, activePlans, goesWith, heatLevel, lastWorn, timesPhrase, timesWorn, timesWornEver } from '../data/stats'
import { cancelPlan, markWornToday, planThisWeek, removePiece } from '../data/storage'
import type { ClosetData, ISODate, Piece } from '../data/types'
import { navigate, routeHref } from '../navigation'

type Props = {
  data: ClosetData
  piece: Piece
  today: ISODate
  onChange: (next: ClosetData) => void
}

const STATUS = {
  cold: 'Not worn in 30 days',
  warm: 'Worn once or twice',
  hot: 'Worn 3+ times',
}

// Figma: "14 Item detail"
export default function ItemScreen({ data, piece, today, onChange }: Props) {
  const confirmRef = useRef<HTMLDialogElement>(null)
  const [message, setMessage] = useState('')

  const level = heatLevel(data.logs, piece.id, today)
  const last = lastWorn(data.logs, piece.id)
  const ever = timesWornEver(data.logs, piece.id)
  const partners = goesWith(piece, data.pieces, data.logs, today)
  const planned = activePlans(data, today).some((p) => p.id === piece.id)
  const wornToday = data.logs.some((log) => log.date === today && log.pieceIds.includes(piece.id))
  const backHref = routeHref('heatmap', piece.category)

  function togglePlan() {
    if (planned) {
      onChange(cancelPlan(data, piece.id))
      setMessage('Removed from this week.')
    } else {
      onChange(planThisWeek(data, piece.id, today))
      setMessage('Saved. You’ll see it on Home this week.')
    }
  }

  function wearToday() {
    onChange(markWornToday(data, piece.id, today))
    setMessage(`Added to today’s outfit. Worn ${timesPhrase(timesWorn(data.logs, piece.id, CHALLENGE_DAYS, today) + 1)} in 30 days.`)
  }

  function letGo() {
    onChange(removePiece(data, piece.id))
    navigate('heatmap', piece.category)
  }

  // Capitalized for the stat card: "Once", "Twice", "5 times", "Never".
  const timesLabel = ever === 0 ? 'Never' : timesPhrase(ever).replace(/^./, (c) => c.toUpperCase())

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-5 pt-11 pb-6">
      <BackLink href={backHref} label="Back" historyBack />

      <div className={`flex h-40 shrink-0 items-center justify-center rounded-[20px] ${HEAT[level].bg}`}>
        <GarmentIcon category={piece.category} name={piece.name} size={96} />
      </div>

      <div className="flex flex-col items-start gap-2">
        <h1 tabIndex={-1} className="text-[27px] leading-[1.15] font-extrabold text-ink">
          {piece.name}
        </h1>
        <p className={`flex h-[30px] items-center rounded-[15px] px-3 text-sm font-bold ${HEAT[level].bg} ${HEAT[level].text}`}>
          {STATUS[level]}
        </p>
      </div>

      {/* <dl> pairs each label with its value for screen readers. */}
      <dl className="flex gap-2 leading-[1.4]">
        <div className="surface flex flex-1 flex-col gap-0.5 rounded-[14px] border-[1.5px] border-[#e0e0e0] p-3">
          <dt className="text-[13px] text-ink-soft">Last worn</dt>
          <dd className="text-[17px] font-bold text-ink">{last ? formatShortDate(last) : 'Not yet'}</dd>
        </div>
        <div className="surface flex flex-1 flex-col gap-0.5 rounded-[14px] border-[1.5px] border-[#e0e0e0] p-3">
          <dt className="text-[13px] text-ink-soft">Times worn</dt>
          <dd className="text-[17px] font-bold text-ink">{timesLabel}</dd>
        </div>
      </dl>

      <section aria-labelledby="goes-with" className="flex flex-col gap-2">
        <h2 id="goes-with" className="text-[15px] leading-[1.4] font-bold text-ink">
          Goes with what you wear most
        </h2>
        {partners.length > 0 ? (
          <ul className="flex gap-2">
            {partners.map((p) => (
              <li key={p.id} className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex h-[58px] items-center justify-center rounded-xl bg-peach">
                  <GarmentIcon category={p.category} name={p.name} size={32} />
                </div>
                <span className="text-[13px] leading-[1.4] text-ink">{p.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft">Log a few more outfits to see what it pairs with.</p>
        )}
      </section>

      <div className="flex-1" />

      {/* role="status" announces the result of each button to screen readers. */}
      <p role="status" className="text-center text-sm font-medium text-ink-soft">
        {message}
      </p>

      <div className="flex flex-col gap-2">
        <button type="button" onClick={togglePlan} className={`${onboardingPrimary} gap-2`}>
          <img src={calendarIcon} width={20} height={20} alt="" />
          {planned ? 'Planned for this week (undo)' : 'Wear it this week'}
        </button>
        <button
          type="button"
          onClick={wearToday}
          disabled={wornToday}
          className={`${onboardingOutline} gap-2 disabled:border-[#c8c8c8] disabled:text-ink-soft disabled:hover:bg-white`}
        >
          <img src={checkIcon} width={20} height={20} alt="" />
          {wornToday ? 'Worn today' : 'Mark as worn today'}
        </button>
        {/* An external link: target="_blank" opens a new tab, and
            rel="noopener noreferrer" stops that site from controlling this tab. */}
        <a href="https://poshmark.com/sell" target="_blank" rel="noopener noreferrer" className={onboardingOutline}>
          Sell it on Poshmark
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <button
          type="button"
          onClick={() => openConfirmDialog(confirmRef)}
          className="flex h-11 items-center justify-center rounded-[14px] text-[15px] font-semibold text-ink"
        >
          Let it go
        </button>
      </div>

      <ConfirmDialog
        dialogRef={confirmRef}
        title={`Let go of ${piece.name}?`}
        message="It will be removed from your closet and from every outfit it was logged in. This can’t be undone."
        confirmLabel="Remove piece"
        onConfirm={letGo}
      />
    </div>
  )
}
