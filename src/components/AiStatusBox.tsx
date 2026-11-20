// The box on the confirm screens that says what the outfit AI is doing
// with your photo. Each screen writes its own sentence (`message`).

// What the AI is doing, shown in the status box.
export type AiStatus =
  | { status: 'off' } // no photo
  | { status: 'starting' }
  | { status: 'downloading'; percent: number }
  | { status: 'analyzing' }
  | { status: 'done'; count: number; matched?: number } // matched: how many were already in your closet
  | { status: 'error' }

// The box that says what the AI is doing. The sentence is a polite live
// region (role="status"), so screen readers hear each step once. The
// percentage isn't inside it: announcing every percent would be noise.
// Screen readers can still read the value from the <progress> bar.
export default function AiStatusBox({ ai, message }: { ai: AiStatus; message: string }) {
  if (ai.status === 'off') return null
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-fog px-3.5 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p id="ai-status" role="status" className="text-sm leading-[1.4] font-semibold text-ink">
          {message}
        </p>
        {ai.status === 'downloading' && (
          <span aria-hidden="true" className="text-sm text-ink-soft tabular-nums">
            {ai.percent}%
          </span>
        )}
      </div>
      {/* Styled like Home's progress bar. appearance-none turns off the
          browser's own look; then each browser's bar part is styled
          separately (-webkit- for Chrome/Safari, -moz- for Firefox), as
          they can't share one rule. overflow-clip rounds the filled part. */}
      {ai.status === 'downloading' && (
        <progress
          aria-labelledby="ai-status"
          max={100}
          value={ai.percent}
          className="h-2.5 w-full appearance-none overflow-clip rounded-[5px] border-0 bg-[#ececec] [&::-moz-progress-bar]:bg-ink [&::-webkit-progress-bar]:bg-[#ececec] [&::-webkit-progress-value]:bg-ink"
        />
      )}
      <p className="text-xs leading-[1.4] text-ink-soft">
        The AI runs on this phone. Your photo is never uploaded.
      </p>
    </div>
  )
}
