import chevronLeft from '../assets/figma/chevron-left.svg'
import photoPlaceholder from '../assets/figma/photo-placeholder.svg'
import plusIcon from '../assets/figma/plus.svg'
import { routeHref } from '../navigation'

// Small pieces shared by the onboarding screens.

// The row of dots showing progress through onboarding. The active dot is a
// wider pill. It's decorative (aria-hidden), because the heading already
// tells screen-reader users where they are.
export function StepDots({ active, dark = false }: { active: number; dark?: boolean }) {
  const on = dark ? 'bg-paper' : 'bg-ink'
  const off = dark ? 'bg-[#5a5a5a]' : 'bg-[#d0d0d0]'
  return (
    <div aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-2 rounded-[4px] ${i === active ? `w-[22px] ${on}` : `w-2 ${off}`}`}
        />
      ))}
    </div>
  )
}

// "< Back" / "< Retake". A link, because it goes to another screen.
// With `historyBack`, it acts like the browser's back button when there's a
// previous page in this tab, so you return to wherever you came from
// (Home, Closet or the heat map). `href` is the fallback, e.g. after a refresh.
export function BackLink({ href, label, historyBack = false }: { href: string; label: string; historyBack?: boolean }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        if (historyBack && window.history.length > 1) {
          event.preventDefault()
          window.history.back()
        }
      }}
      className="-ml-1 flex h-11 shrink-0 items-center gap-1 self-start rounded-lg pr-2 pl-1 text-[15px] font-medium text-ink"
    >
      <img src={chevronLeft} width={22} height={22} alt="" />
      {label}
    </a>
  )
}

// The top of the "This is what you're wearing" screen (Figma 05), shared by
// day 1 (name your pieces) and later days (pick from your pieces).
export function ConfirmHeader({
  showDots,
  photoUrl,
  note,
}: {
  showDots: boolean
  photoUrl: string | null
  note: string
}) {
  return (
    <>
      <BackLink href={routeHref('photo')} label="Retake" />
      {showDots && <StepDots active={3} />}
      <h1 tabIndex={-1} className="text-[28px] leading-[1.15] font-extrabold text-ink">
        This is what you’re wearing
      </h1>
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-fog">
          {photoUrl ? (
            <img src={photoUrl} alt="Your outfit photo" className="size-full object-cover" />
          ) : (
            <img src={photoPlaceholder} width={24} height={24} alt="" />
          )}
        </div>
        <p className="flex-1 text-[15px] leading-[1.4] text-ink-soft">{note}</p>
      </div>
    </>
  )
}

// The dashed "+ Add another piece" button from Figma 05.
export function DashedAddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 shrink-0 items-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-[#9a9a9a] px-3.5 text-[15px] font-semibold text-ink"
    >
      <img src={plusIcon} width={20} height={20} alt="" />
      {label}
    </button>
  )
}
