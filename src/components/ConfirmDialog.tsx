import { useId } from 'react'
import type { RefObject } from 'react'
import { onboardingOutline } from './ui'

type Props = {
  dialogRef: RefObject<HTMLDialogElement | null>
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
}

// Opens the dialog with focus on "Cancel", the safe choice, so pressing
// Enter by accident doesn't delete anything.
export function openConfirmDialog(dialogRef: RefObject<HTMLDialogElement | null>) {
  dialogRef.current?.showModal()
  dialogRef.current?.querySelector<HTMLButtonElement>('[data-cancel]')?.focus()
}

// A yes/no question for destructive actions, using a modal <dialog>.
// useId gives each copy its own ids, so two dialogs on one screen don't clash.
export default function ConfirmDialog({ dialogRef, title, message, confirmLabel, onConfirm }: Props) {
  const id = useId()
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-message`}
      className="m-auto w-[calc(100%-32px)] max-w-[382px] rounded-2xl bg-white p-6 text-ink"
    >
      <div className="flex flex-col gap-4">
        <h2 id={`${id}-title`} className="text-[22px] leading-[1.2] font-extrabold">
          {title}
        </h2>
        <p id={`${id}-message`} className="text-[15px] leading-[1.4] text-ink-soft">
          {message}
        </p>
        <button
          type="button"
          onClick={() => {
            dialogRef.current?.close()
            onConfirm()
          }}
          className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-red-700 text-base font-bold text-white hover:bg-red-800"
        >
          {confirmLabel}
        </button>
        <button type="button" data-cancel className={onboardingOutline} onClick={() => dialogRef.current?.close()}>
          Cancel
        </button>
      </div>
    </dialog>
  )
}
