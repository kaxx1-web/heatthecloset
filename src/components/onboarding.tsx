import chevronLeft from '../assets/figma/chevron-left.svg'

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
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="-ml-1 flex h-11 shrink-0 items-center gap-1 self-start rounded-lg pr-2 pl-1 text-[15px] font-medium text-ink"
    >
      <img src={chevronLeft} width={22} height={22} alt="" />
      {label}
    </a>
  )
}
