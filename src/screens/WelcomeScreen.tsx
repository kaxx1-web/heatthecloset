import { useRef, useState } from 'react'
import bagIcon from '../assets/figma/welcome-bag.svg'
import dressIcon from '../assets/figma/welcome-dress.svg'
import jacketIcon from '../assets/figma/welcome-jacket.svg'
import pantsIcon from '../assets/figma/welcome-pants.svg'
import sneakerIcon from '../assets/figma/welcome-sneaker.svg'
import teeIcon from '../assets/figma/welcome-tee.svg'
import NameDialog from '../components/NameDialog'
import { onboardingOutline, onboardingPrimary } from '../components/ui'

// Figma: "01 Welcome and sign up"
const TILES = [
  { icon: teeIcon, bg: 'bg-peach' },
  { icon: pantsIcon, bg: 'bg-fog' },
  { icon: dressIcon, bg: 'bg-rust' },
  { icon: sneakerIcon, bg: 'bg-apricot' },
  { icon: jacketIcon, bg: 'bg-peach' },
  { icon: bagIcon, bg: 'bg-rust' },
]

type Props = {
  // newUser = true for the sign-up buttons (go on to "How it works"),
  // false for "I already have an account" (go straight to Today).
  onNameSaved: (firstName: string, newUser: boolean) => void
}

export default function WelcomeScreen({ onNameSaved }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [newUser, setNewUser] = useState(true)

  function askName(isNew: boolean) {
    setNewUser(isNew)
    dialogRef.current?.showModal()
    // Put the cursor in the name field. (React's autoFocus prop only runs
    // when the page first renders, not each time a dialog opens.)
    document.getElementById('first-name')?.focus()
  }

  return (
    <div className="flex flex-1 flex-col gap-4 bg-white px-6 pt-12 pb-7">
      {/* Decorative garment tiles: hidden from screen readers. */}
      <div aria-hidden="true" className="grid grid-cols-3 gap-2.5 pt-5 pb-2">
        {TILES.map(({ icon, bg }, i) => (
          <div key={i} className={`flex h-24 items-center justify-center rounded-2xl ${bg}`}>
            <img src={icon} width={52} height={52} alt="" />
          </div>
        ))}
      </div>

      <h1 tabIndex={-1} className="text-[32px] leading-[1.1] font-extrabold tracking-[-0.5px] text-ink">
        Your closet has more to offer.
      </h1>
      <p className="text-[17px] leading-[1.4] text-ink-soft">
        Log your outfit each day for 30 days. Then see what you’ve stopped wearing, and wear it
        again.
      </p>

      <div className="flex-1" />

      <div className="flex flex-col gap-2.5">
        <button type="button" className={onboardingPrimary} onClick={() => askName(true)}>
          Continue with Apple
        </button>
        <button type="button" className={onboardingOutline} onClick={() => askName(true)}>
          Continue with Google
        </button>
        <button
          type="button"
          className="flex h-11 items-center justify-center rounded-[14px] text-[15px] font-semibold text-ink"
          onClick={() => askName(true)}
        >
          Sign up with email
        </button>
        <button
          type="button"
          className="flex h-9 items-center justify-center rounded-[14px] text-sm font-bold text-ink"
          onClick={() => askName(false)}
        >
          I already have an account
        </button>
      </div>

      <NameDialog dialogRef={dialogRef} onSave={(name) => onNameSaved(name, newUser)} />
    </div>
  )
}
