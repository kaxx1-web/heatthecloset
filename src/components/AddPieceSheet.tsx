import { useState } from 'react'
import type { FormEvent, RefObject } from 'react'
import closeIcon from '../assets/figma/close.svg'
import { CATEGORIES } from '../data/types'
import type { Category } from '../data/types'
import GarmentIcon from './GarmentIcon'
import SpellingSuggestions from './SpellingSuggestions'
import { onboardingPrimary } from './ui'

type Props = {
  dialogRef: RefObject<HTMLDialogElement | null>
  // Names already in the closet: their words count as spelled correctly.
  existingNames: string[]
  onAdd: (name: string, category: Category) => void
}

// Opens the sheet and puts the cursor in the name field. (When a dialog
// opens, browsers focus its first control, which here is the close button.)
export function openAddPieceSheet(dialogRef: RefObject<HTMLDialogElement | null>) {
  dialogRef.current?.showModal()
  document.getElementById('add-piece-name')?.focus()
}

// Figma: "09 Add a new piece". A bottom sheet: a modal <dialog> pinned to
// the bottom of the screen (mt-auto mb-0), so it gets Esc-to-close, focus
// trapping and the dimmed backdrop for free.
export default function AddPieceSheet({ dialogRef, existingNames, onAdd }: Props) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('Top')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (name.trim() === '') {
      setError('Give this piece a name.')
      document.getElementById('add-piece-name')?.focus()
      return
    }
    onAdd(name.trim(), category)
    setName('')
    dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="add-piece-title"
      onClose={() => setError('')}
      className="mx-auto mt-auto mb-0 max-h-[92dvh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-white px-5 pt-3 pb-7 text-ink"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* The grab handle is only a visual cue. */}
        <div aria-hidden="true" className="flex justify-center">
          <span className="h-[5px] w-10 rounded-[3px] bg-[#d0d0d0]" />
        </div>

        <div className="flex items-center">
          <h2 id="add-piece-title" className="flex-1 text-[22px] leading-[1.4] font-extrabold">
            Add a new piece
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-fog"
          >
            <img src={closeIcon} width={20} height={20} alt="" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-fog">
            <GarmentIcon category={category} name={name} size={36} />
          </div>
          <p className="flex-1 text-sm leading-[1.4] text-ink-soft">
            You only do this once. Next time it’s one tap.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="add-piece-name" className="text-sm leading-[1.4] font-semibold">
            Name
          </label>
          <input
            id="add-piece-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="e.g. Suede sneakers"
            maxLength={60}
            enterKeyHint="done"
            spellCheck
            aria-invalid={error ? true : undefined}
            aria-describedby="add-piece-error add-piece-suggestions"
            className="h-12 rounded-xl border-[1.5px] border-[#d6d6d6] px-3.5 text-base font-medium placeholder:font-normal placeholder:text-stone-400"
          />
          <SpellingSuggestions
            id="add-piece-suggestions"
            value={name}
            myNames={existingNames}
            onPick={(suggestion) => {
              setName(suggestion)
              document.getElementById('add-piece-name')?.focus() // keep typing
            }}
          />
          <p id="add-piece-error" role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>

        {/* Category chips are real radio buttons (pick exactly one), styled
            as pills. has-checked: fills the pill when its radio is selected. */}
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm leading-[1.4] font-semibold">Category</legend>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <label
                key={c}
                className="flex h-10 cursor-pointer items-center rounded-[20px] border-[1.5px] border-[#c8c8c8] bg-white px-3.5 text-sm font-semibold text-ink has-checked:border-ink has-checked:bg-ink has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-700"
              >
                <input
                  type="radio"
                  name="add-piece-category"
                  value={c}
                  checked={category === c}
                  onChange={() => setCategory(c)}
                  className="sr-only"
                />
                {c}
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className={onboardingPrimary}>
          Add piece
        </button>
      </form>
    </dialog>
  )
}
