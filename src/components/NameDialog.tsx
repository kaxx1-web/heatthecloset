import { useState } from 'react'
import type { FormEvent, RefObject } from 'react'
import { onboardingOutline, onboardingPrimary } from './ui'

type Props = {
  dialogRef: RefObject<HTMLDialogElement | null>
  onSave: (firstName: string) => void
}

// Asks for a first name. There's no real sign-in: the name is saved on
// this device only.
//
// <dialog> opened with showModal() gives us a lot for free: the rest of the
// page can't be clicked or tabbed to, Esc (or the phone's back gesture)
// closes it, and focus returns to the button that opened it.
export default function NameDialog({ dialogRef, onSave }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (name.trim() === '') {
      setError('Enter your first name to continue.')
      return
    }
    dialogRef.current?.close()
    onSave(name.trim())
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="name-dialog-title"
      // "close" fires however the dialog closes (Esc, Cancel, or Continue),
      // so the next time it opens it doesn't show an old error.
      onClose={() => setError('')}
      className="m-auto w-[calc(100%-32px)] max-w-[382px] rounded-2xl bg-white p-6 text-ink"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <h2 id="name-dialog-title" className="text-2xl leading-[1.15] font-extrabold">
          What’s your first name?
        </h2>
        <p className="text-[15px] leading-[1.4] text-ink-soft">
          No password needed. Your name and logs stay on this phone.
        </p>
        <div className="flex flex-col gap-1">
          <label htmlFor="first-name" className="text-sm font-semibold">
            First name
          </label>
          <input
            id="first-name"
            name="firstName"
            autoComplete="given-name"
            enterKeyHint="done"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby="first-name-error"
            className="h-12 rounded-[10px] border-[1.5px] border-[#767676] px-3 text-base font-medium"
          />
          <p id="first-name-error" role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
        <button type="submit" className={onboardingPrimary}>
          Continue
        </button>
        <button
          type="button"
          className={onboardingOutline}
          onClick={() => dialogRef.current?.close()}
        >
          Cancel
        </button>
      </form>
    </dialog>
  )
}
