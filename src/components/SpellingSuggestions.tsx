import { checkSpelling } from '../data/spelling'

type Props = {
  id: string // the name input points here with aria-describedby
  value: string // what's typed so far
  myNames: string[] // names of pieces already in the closet
  onPick: (suggestion: string) => void
}

// Under a name field:
// - "Did you mean: fuzzy sweater" buttons for words we can correct.
// - "Check the spelling of “xyzzy”" for words that look misspelled but
//   don't match any clothing term or brand we know.
// Nothing changes until a suggestion is tapped, so a brand or personal word
// is never "corrected" without asking.
//
// It isn't a live region on purpose: announcing on every keystroke would
// talk over the user. Instead the name input lists this element in
// aria-describedby, and the buttons come right after the input in tab order.
export default function SpellingSuggestions({ id, value, myNames, onPick }: Props) {
  const { suggestions, unknown } = checkSpelling(value, myNames)
  return (
    <div id={id} className="flex flex-col gap-1.5 empty:hidden">
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] leading-[1.4] font-semibold text-ink-soft">Did you mean:</span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onPick(suggestion)}
              className="flex h-10 items-center rounded-[20px] border-[1.5px] border-[#c8c8c8] bg-white px-3.5 text-sm font-semibold text-ink hover:bg-fog"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      {unknown.length > 0 && (
        <p className="text-[13px] leading-[1.4] text-ink-soft">
          Check the spelling of {unknown.map((word) => `“${word}”`).join(', ')}. We couldn’t match{' '}
          {unknown.length === 1 ? 'it' : 'them'} to a clothing term or brand.
        </p>
      )}
    </div>
  )
}
