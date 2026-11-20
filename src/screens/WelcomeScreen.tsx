import { useRef, useState } from 'react'
import { stockPhotoFor } from '../data/garmentPhotos'
import NameDialog from '../components/NameDialog'
import { signupOutline, signupPrimary } from '../components/ui'

// Figma: "01 Welcome and sign up"
const TILES = [
  { icon: stockPhotoFor('Top', 'tee'), bg: 'bg-peach' },
  { icon: stockPhotoFor('Bottom', 'jeans'), bg: 'bg-fog' },
  { icon: stockPhotoFor('Dress', 'floral'), bg: 'bg-rust' },
  { icon: stockPhotoFor('Shoes', 'navy sneakers'), bg: 'bg-apricot' },
  { icon: stockPhotoFor('Outerwear', 'pink blazer'), bg: 'bg-peach' },
  { icon: stockPhotoFor('Bag', 'leather duffel'), bg: 'bg-rust' },
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
    <div className="flex flex-1 flex-col gap-4 px-6 pt-18 pb-7">
      {/* Decorative garment tiles: hidden from screen readers. */}
      <div aria-hidden="true" className="grid grid-cols-3 gap-2 pt-5 pb-1">
        {TILES.map(({ icon, bg }, i) => (
          // The tile color shows while the photo loads.
          <div key={i} className={`h-20 overflow-hidden rounded-xl ${bg}`}>
            <img src={icon} width={200} height={200} alt="" className="size-full object-cover" />
          </div>
        ))}
      </div>

      <h1 tabIndex={-1} className="text-[28px] leading-[1.15] font-extrabold tracking-[-0.4px] text-ink">
        Your closet has more to offer.
      </h1>
      <p className="text-[16px] leading-[1.45] text-ink-soft">
        Log your outfit each day for 30 days. Then see what you’ve stopped wearing, and wear it
        again.
      </p>

      <div className="flex-1" />

      <div className="flex flex-col gap-2">
        <button type="button" className={signupPrimary} onClick={() => askName(true)}>
          Continue with Apple
        </button>
        <button type="button" className={signupOutline} onClick={() => askName(true)}>
          Continue with Google
        </button>
        <button
          type="button"
          className="flex h-11 items-center justify-center rounded-xl text-[15px] font-semibold text-ink"
          onClick={() => askName(true)}
        >
          Sign up with email
        </button>
        <button
          type="button"
          className="flex h-10 items-center justify-center rounded-xl text-sm font-bold text-ink"
          onClick={() => askName(false)}
        >
          I already have an account
        </button>
      </div>

      <NameDialog dialogRef={dialogRef} onSave={(name) => onNameSaved(name, newUser)} />
    </div>
  )
}
