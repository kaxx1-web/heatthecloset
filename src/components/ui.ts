// Shared Tailwind class strings, so buttons and links look the same
// everywhere. min-h-12 = 48px, a comfortable tap target on phones.

export const primaryButton =
  'inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-stone-900 px-5 font-semibold text-white hover:bg-stone-700'

export const secondaryButton =
  'inline-flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-stone-900 px-5 font-semibold text-stone-900 hover:bg-stone-100'

// text-base (16px) stops iOS Safari from zooming in when an input is focused.
export const textInput =
  'min-h-12 w-full rounded-lg border border-stone-500 bg-white px-3 text-base'

// Onboarding buttons, matching the Figma wireframes (52px tall, 14px radius).
export const onboardingPrimary =
  'flex h-[52px] w-full shrink-0 items-center justify-center rounded-[14px] bg-ink text-base font-bold text-white hover:bg-stone-700'

export const onboardingOutline =
  'flex h-[52px] w-full shrink-0 items-center justify-center rounded-[14px] border-[1.5px] border-ink bg-white text-base font-bold text-ink hover:bg-fog'

export const card ='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200'
