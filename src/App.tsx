import { useEffect, useState } from 'react'
import NavBar from './components/NavBar'
import { todayISO } from './data/dates'
import { createDemoData } from './data/demo'
import type { DemoDay } from './data/demo'
import { EMPTY_DATA, clearData, loadData, saveData, setProfile } from './data/storage'
import type { ClosetData } from './data/types'
import { navigate, useFocusHeadingOnChange, useHashRoute } from './navigation'
import ClosetScreen from './screens/ClosetScreen'
import HeatMapScreen from './screens/HeatMapScreen'
import HomeScreen from './screens/HomeScreen'
import LogScreen from './screens/LogScreen'
import SetupScreen from './screens/SetupScreen'

const TITLES = { setup: 'Welcome', home: 'Today', log: 'Log outfit', closet: 'Closet', heatmap: 'Heat map' }

export default function App() {
  // App owns all the data. Screens get it as props and send changes back
  // through `update`, which saves to localStorage at the same time.
  const [data, setData] = useState<ClosetData>(loadData) // loadData runs once, on first render
  const [saveFailed, setSaveFailed] = useState(false)
  const route = useHashRoute()
  const today = todayISO()

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
    navigate('home')
  }

  const { profile } = data
  const screen = profile ? route : 'setup' // no profile yet = always show setup

  useFocusHeadingOnChange(screen)
  useEffect(() => {
    document.title = `${TITLES[screen]} · Closet Map`
  }, [screen])

  return (
    <div className="mx-auto min-h-dvh max-w-[430px] px-4 pb-12">
      {profile && (
        <header className="sticky top-0 z-10 -mx-4 bg-stone-50/95 px-4 py-2 backdrop-blur">
          <NavBar current={route} />
        </header>
      )}

      {saveFailed && (
        <p role="alert" className="mt-4 rounded-xl bg-red-100 p-4 font-medium text-red-900">
          Couldn’t save to this browser. Your changes will be lost when you close the page.
        </p>
      )}

      <main className="pt-6">
        {!profile ? (
          <SetupScreen
            onStart={(name) => update(setProfile(data, { name, startDate: today }))}
            onLoadDemo={loadDemo}
          />
        ) : route === 'log' ? (
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
