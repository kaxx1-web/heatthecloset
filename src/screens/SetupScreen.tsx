import { useState } from 'react'
import type { FormEvent } from 'react'
import DemoTools from '../components/DemoTools'
import type { DemoDay } from '../data/demo'
import { card, primaryButton, textInput } from '../components/ui'

type Props = {
  onStart: (name: string) => void
  onLoadDemo: (day: DemoDay) => void
}

// The first screen, shown until a profile exists.
export default function SetupScreen({ onStart, onLoadDemo }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (name.trim() === '') {
      setError('Enter your name to start.')
      document.getElementById('profile-name')?.focus()
      return
    }
    onStart(name.trim())
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 tabIndex={-1} className="text-3xl font-extrabold">
          Closet Map
        </h1>
        <p className="text-lg text-stone-700">
          Log your outfit every day for 30 days, then see which pieces you never reach for.
        </p>
      </header>

      <ol className="list-decimal space-y-1 pl-5 text-stone-700">
        <li>Snap a photo of today’s outfit.</li>
        <li>Confirm which pieces you’re wearing.</li>
        <li>On day 30, open your closet heat map.</li>
      </ol>
      <p className="text-sm text-stone-600">
        Photos never leave your phone and aren’t saved. Your logs are stored only in this browser.
      </p>

      <form onSubmit={handleSubmit} noValidate className={`${card} space-y-4`}>
        <div className="space-y-1">
          <label htmlFor="profile-name" className="block font-medium">
            Your name
          </label>
          <input
            id="profile-name"
            name="name"
            autoComplete="given-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby="profile-name-error"
            className={textInput}
          />
          <p id="profile-name-error" className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
        <button type="submit" className={primaryButton}>
          Start day 1
        </button>
      </form>

      <DemoTools hasData={false} onLoadDemo={onLoadDemo} />
    </div>
  )
}
