import type { HeatLevel } from '../data/types'
import { HEAT, HEAT_ORDER } from './heat'

// The 3-color bar from Figma 11. Each segment's width is proportional to
// how many pieces it covers: flex-grow = count, so 3 pieces get 3x the room
// of 1 piece. Empty levels are left out.
// The bar is hidden from screen readers; the sr-only text says the same.
export default function HeatBar({ counts }: { counts: Record<HeatLevel, number> }) {
  return (
    <>
      <div aria-hidden="true" className="flex h-3 w-full gap-0.5 overflow-hidden rounded-md">
        {HEAT_ORDER.filter((level) => counts[level] > 0).map((level) => (
          <div key={level} style={{ flexGrow: counts[level] }} className={`basis-0 ${HEAT[level].bg}`} />
        ))}
      </div>
      <span className="sr-only">
        {counts.hot} worn 3+ times, {counts.warm} once or twice, {counts.cold} not worn.
      </span>
    </>
  )
}
