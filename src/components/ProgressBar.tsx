import type { CSSProperties } from 'react'
import { CHALLENGE_DAYS } from '../data/stats'

// "18 to go"
export function daysToGo(day: number): string {
  const left = CHALLENGE_DAYS - day
  return left > 0 ? `${left} to go` : 'Final day'
}

// The 30-day bar. It's hidden from screen readers because the text next to
// it ("Day 12 of 30") already says the same thing.
// The fill width is passed as a CSS variable (--progress) and used by the
// w-(--progress) class, so the style itself stays in Tailwind.
export default function ProgressBar({ day }: { day: number }) {
  const percent = `${(day / CHALLENGE_DAYS) * 100}%`
  return (
    <div aria-hidden="true" className="h-2.5 w-full overflow-hidden rounded-[5px] bg-[#ececec]">
      <div style={{ '--progress': percent } as CSSProperties} className="h-full w-(--progress) bg-ink" />
    </div>
  )
}
