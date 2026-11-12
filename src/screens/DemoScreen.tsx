import DemoTools from '../components/DemoTools'
import type { DemoDay } from '../data/demo'
import { routeHref } from '../navigation'

type Props = {
  hasData: boolean
  onLoadDemo: (day: DemoDay) => void
}

// Reached at #/demo. The welcome design has no spot for demo mode, so it
// lives here (and on the Today screen) for testing.
export default function DemoScreen({ hasData, onLoadDemo }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-6 bg-white px-6 pt-12 pb-7">
      <a href={routeHref('welcome')} className="self-start font-medium underline underline-offset-4">
        Back to welcome
      </a>
      <h1 tabIndex={-1} className="text-[30px] leading-[1.15] font-extrabold text-ink">
        Try Closet Map
      </h1>
      <DemoTools hasData={hasData} onLoadDemo={onLoadDemo} />
    </div>
  )
}
