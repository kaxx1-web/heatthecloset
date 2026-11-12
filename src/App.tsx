import { useEffect, useState } from 'react'
import NavBar from './components/NavBar'
import { todayISO } from './data/dates'
import { createDemoData } from './data/demo'
import type { DemoDay } from './data/demo'
import { dayNumber } from './data/stats'
import { EMPTY_DATA, clearData, loadData, saveData, setProfile } from './data/storage'
import type { ClosetData } from './data/types'
import { ONBOARDING_ROUTES, navigate, useFocusHeadingOnChange, useHashRoute } from './navigation'
import type { Route } from './navigation'
import ClosetScreen from './screens/ClosetScreen'
import ConfirmScreen from './screens/ConfirmScreen'
import DemoScreen from './screens/DemoScreen'
import HeatMapScreen from './screens/HeatMapScreen'
import HomeScreen from './screens/HomeScreen'
import HowItWorksScreen from './screens/HowItWorksScreen'
import LogScreen from './screens/LogScreen'
import PhotoScreen from './screens/PhotoScreen'
import WelcomeScreen from './screens/WelcomeScreen'

const TITLES: Record<Route, string> = {
  welcome: 'Welcome',
  how: 'How it works',
  photo: 'Take a photo',
  confirm: 'Your pieces',
  demo: 'Demo mode',
  home: 'Today',
  log: 'Log outfit',
  closet: 'Closet',
  heatmap: 'Heat map',
}

export default function App() {
  // App owns all the data. Screens get it as props and send changes back
  // through `update`, which saves to localStorage at the same time.
  const [data, setData] = useState<ClosetData>(loadData) // loadData runs once, on first render
  const [saveFailed, setSaveFailed] = useState(false)
  const route = useHashRoute()
  const today = todayISO()

  // The day-1 photo lives only in memory, so the confirm screen can show
  // it. It's never saved. When it's replaced or cleared, revokeObjectURL
  // frees the memory.
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!photoUrl) return
    return () => URL.revokeObjectURL(photoUrl)
  }, [photoUrl])

  function update(next: ClosetData) {
    setData(next)
    setSaveFailed(!saveData(next))
  }

  function loadDemo(day: DemoDay) {
    update(createDemoData(day))
    navigate('home')
  }

  function reset() {
    clearData()
    setData(EMPTY_DATA)
    navigate('welcome')
  }

  const { profile } = data

  // Without a profile, only the welcome screen (and #/demo) can be shown.
  const screen: Route = profile ? route : route === 'demo' ? 'demo' : 'welcome'
  const fullScreen = ONBOARDING_ROUTES.includes(screen) || screen === 'demo'

  // Until day 1 is saved, the photo screen should say "Day 1".
  const day = !profile || data.logs.length === 0 ? 1 : dayNumber(profile.startDate, today)

  useFocusHeadingOnChange(screen)
  useEffect(() => {
    document.title = `${TITLES[screen]} · Closet Map`
  }, [screen])

  const saveWarning = saveFailed && (
    <p role="alert" className="m-4 rounded-xl bg-red-100 p-4 font-medium text-red-900">
      Couldn’t save to this browser. Your changes will be lost when you close the page.
    </p>
  )

  // Onboarding screens fill the whole phone screen, with no nav bar.
  if (fullScreen || !profile) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-white">
        {saveWarning}
        {screen === 'demo' ? (
          <DemoScreen hasData={profile !== null} onLoadDemo={loadDemo} />
        ) : screen === 'how' ? (
          <HowItWorksScreen />
        ) : screen === 'photo' ? (
          <PhotoScreen
            day={day}
            onPhoto={(photo) => {
              setPhotoUrl(URL.createObjectURL(photo))
              navigate('confirm')
            }}
          />
        ) : screen === 'confirm' && profile ? (
          <ConfirmScreen
            data={data}
            profile={profile}
            today={today}
            day={day}
            photoUrl={photoUrl}
            onChange={update}
            onSaved={() => {
              setPhotoUrl(null)
              navigate('home')
            }}
          />
        ) : (
          <WelcomeScreen
            onNameSaved={(name, newUser) => {
              const startDate = profile?.startDate ?? today
              update(setProfile(data, { name, startDate }))
              navigate(newUser ? 'how' : 'home')
            }}
          />
        )}
      </main>
    )
  }

  return (
    <div className="mx-auto min-h-dvh max-w-[430px] px-4 pb-12">
      <header className="sticky top-0 z-10 -mx-4 bg-stone-50/95 px-4 py-2 backdrop-blur">
        <NavBar current={route} />
      </header>

      {saveWarning}

      <main className="pt-6">
        {route === 'log' ? (
          <LogScreen
            data={data}
            profile={profile}
            today={today}
            onChange={update}
            onSaved={() => navigate('home')}
          />
        ) : route === 'closet' ? (
          <ClosetScreen data={data} today={today} onChange={update} />
        ) : route === 'heatmap' ? (
          <HeatMapScreen data={data} profile={profile} today={today} />
        ) : (
          <HomeScreen
            data={data}
            profile={profile}
            today={today}
            onLoadDemo={loadDemo}
            onReset={reset}
          />
        )}
      </main>
    </div>
  )
}
