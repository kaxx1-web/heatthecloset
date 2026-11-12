import type { DemoDay } from '../data/demo'
import { secondaryButton } from './ui'

type Props = {
  hasData: boolean
  onLoadDemo: (day: DemoDay) => void
  onReset?: () => void
}

// Lets you test the app without waiting 30 days. Loading a demo replaces
// whatever is saved, so we ask first if there's anything to lose.
export default function DemoTools({ hasData, onLoadDemo, onReset }: Props) {
  function load(day: DemoDay) {
    if (hasData && !window.confirm('Replace your saved closet and logs with sample data?')) {
      return
    }
    onLoadDemo(day)
  }

  function reset() {
    if (window.confirm('Delete your profile, closet and all logs? This can’t be undone.')) {
      onReset?.()
    }
  }

  return (
    <section aria-labelledby="demo-heading" className="space-y-3">
      <h2 id="demo-heading" className="text-lg font-bold">
        Demo mode
      </h2>
      <p className="text-ink-soft">
        Load a sample closet that’s already partway through the challenge.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className={secondaryButton} onClick={() => load(12)}>
          Jump to day 12
        </button>
        <button type="button" className={secondaryButton} onClick={() => load(30)}>
          Jump to day 30
        </button>
      </div>
      {onReset && (
        <button
          type="button"
          onClick={reset}
          className="min-h-12 w-full rounded-xl font-semibold text-red-700 underline underline-offset-4"
        >
          Reset all data
        </button>
      )}
    </section>
  )
}
