import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { CATEGORIES } from '../data/types'
import type { Category } from '../data/types'
import { secondaryButton, textInput } from './ui'

type Props = {
  onAdd: (name: string, category: Category) => void
}

export default function AddPieceForm({ onAdd }: Props) {
  // useId makes unique ids, so this form can appear on two screens without
  // two inputs sharing the same id (which would break the <label for>).
  const id = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('Top')
  const [error, setError] = useState('')
  const [added, setAdded] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // stop the browser from reloading the page
    if (name.trim() === '') {
      setError('Enter a name for the piece.')
      nameRef.current?.focus()
      return
    }
    onAdd(name, category)
    setAdded(`Added ${name.trim()}.`)
    setName('')
    nameRef.current?.focus() // ready to add the next one
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1">
        <label htmlFor={`${id}-name`} className="block font-medium">
          Piece name
        </label>
        <input
          ref={nameRef}
          id={`${id}-name`}
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('') // clear the error as soon as they start fixing it
          }}
          maxLength={60}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-hint ${id}-error`}
          className={textInput}
        />
        <p id={`${id}-hint`} className="text-sm text-stone-600">
          For example, “Blue linen shirt”.
        </p>
        <p id={`${id}-error`} className="text-sm font-medium text-red-700">
          {error}
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor={`${id}-category`} className="block font-medium">
          Category
        </label>
        <select
          id={`${id}-category`}
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className={textInput}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <button type="submit" className={secondaryButton}>
        Add piece
      </button>

      {/* role="status" makes screen readers announce the text when it changes. */}
      <p role="status" className="text-sm text-stone-600">
        {added}
      </p>
    </form>
  )
}
