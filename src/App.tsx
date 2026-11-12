import { useEffect, useState } from 'react'
import TabBar from './components/TabBar'
import { todayISO } from './data/dates'
import { createDemoData } from './data/demo'
import type { DemoDay } from './data/demo'
import { CHALLENGE_DAYS, dayNumber } from './data/stats'
import { EMPTY_DATA, clearData, loadData, saveData, setProfile } from './data/storage'
import { CATEGORIES } from './data/types'
import type { ClosetData } from './data/types'
import { FULL_SCREEN_ROUTES, navigate, useFocusHeadingOnChange, useHashRoute } from './navigation'
import type { Route } from './navigation'
import ClosetScreen from './screens/ClosetScreen'
import ConfirmScreen from './screens/ConfirmScreen'
import DemoScreen from './screens/DemoScreen'
import HeatCategoryScreen from './screens/HeatCategoryScreen'
import HeatMapScreen from './screens/HeatMapScreen'
import ItemScreen from './screens/ItemScreen'
import HomeScreen from './screens/HomeScreen'
import HowItWorksScreen from './screens/HowItWorksScreen'
import LoggedScreen from './screens/LoggedScreen'
import PhotoScreen from './screens/PhotoScreen'
import PickPiecesScreen from './screens/PickPiecesScreen'
import ProfileScreen from './screens/ProfileScreen'
import WelcomeScreen from './screens/WelcomeScreen'

const TITLES: Record<Route, string> = {
  welcome: 'Welcome',
  how: 'How it works',
  photo: 'Take a photo',
  confirm: 'Your pieces',
  logged: 'Outfit logged',
  item: 'Item',
  demo: 'Demo mode',
  home: 'Home',
  closet: 'Closet',
  heatmap: 'Heat map',
  profile: 'Profile',
}

export default function App() {
  // App owns all the data. Screens get it as props and send changes back
  // through `update`, which saves to localStorage at the same time.
  const [data, setData] = useState<ClosetData>(loadData) // loadData runs once, on first render
  const [saveFailed, setSaveFailed] = useState(false)
  const { route, param } = useHashRoute()
  const today = todayISO()

  // Today's photo lives only in memory: the image itself (blob, for the
  // on-device AI) and a temporary URL (for showing it). It's never saved or
  // uploaded. When it's replaced or cleared, revokeObjectURL frees the memory.
  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null)
  const photoUrl = photo?.url ?? null
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

  // Called by both confirm screens after saving today's log.
  function finishLogging() {
    setPhoto(null)
    navigate('logged')
  }

  const { profile } = data
  const todaysLog = data.logs.find((log) => log.date === today)

  // Which screen to show. Without a profile, only welcome (and #/demo).
  // "Outfit logged" needs today's log, e.g. after a refresh the next day.
  let screen: Route = profile ? route : route === 'demo' ? 'demo' : 'welcome'
  if (screen === 'logged' && !todaysLog) screen = 'home'

  // #/item/<id>: the piece to show. If it was just deleted ("Let it go"),
  // show the heat map until the navigation to its category lands.
  const itemPiece = screen === 'item' ? data.pieces.find((p) => p.id === param) : undefined
  if (screen === 'item' && !itemPiece) screen = 'heatmap'

  // #/heatmap/<Category>: one category of the heat map.
  const heatCategory = screen === 'heatmap' ? CATEGORIES.find((c) => c === param) : undefined

  // Day 1 isn't saved until the first log, so until then it's always day 1.
  const firstDay = data.logs.length === 0
  const day = !profile || firstDay ? 1 : dayNumber(profile.startDate, today)

  // Include the parameter, so moving from one item or category to another
  // also moves focus to the new heading.
  useFocusHeadingOnChange(`${screen}/${param ?? ''}`)
  useEffect(() => {
    document.title = `${TITLES[screen]} · Closet Map`
  }, [screen])

  const saveWarning = saveFailed && (
    <p role="alert" className="m-4 rounded-xl bg-red-100 p-4 font-medium text-red-900">
      Couldn’t save to this browser. Your changes will be lost when you close the page.
    </p>
  )

  // Full-screen steps: onboarding, taking a photo, confirming, "Outfit logged".
  if (!profile || FULL_SCREEN_ROUTES.includes(screen)) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col">
        {saveWarning}
        {screen === 'demo' ? (
          <DemoScreen hasData={profile !== null} onLoadDemo={loadDemo} />
        ) : !profile || screen === 'welcome' ? (
          <WelcomeScreen
            onNameSaved={(name, newUser) => {
              const startDate = profile?.startDate ?? today
              update(setProfile(data, { name, startDate }))
              navigate(newUser ? 'how' : 'home')
            }}
          />
        ) : screen === 'how' ? (
          <HowItWorksScreen />
        ) : screen === 'photo' ? (
          <PhotoScreen
            day={day}
            firstDay={firstDay}
            onPhoto={(blob) => {
              setPhoto({ blob, url: URL.createObjectURL(blob) })
              navigate('confirm')
            }}
          />
        ) : screen === 'confirm' && data.pieces.length === 0 ? (
          // Empty closet: name your pieces (day 1).
          <ConfirmScreen
            data={data}
            profile={profile}
            today={today}
            day={day}
            photo={photo}
            onChange={update}
            onSaved={finishLogging}
          />
        ) : screen === 'confirm' ? (
          // Later days: pick from your saved pieces.
          <PickPiecesScreen
            data={data}
            today={today}
            day={day}
            photoUrl={photoUrl}
            onChange={update}
            onSaved={finishLogging}
          />
        ) : screen === 'item' && itemPiece ? (
          <ItemScreen data={data} piece={itemPiece} today={today} onChange={update} />
        ) : todaysLog ? (
          <LoggedScreen data={data} log={todaysLog} today={today} day={day} />
        ) : null}
      </main>
    )
  }

  // Tabs: Home, Closet, Heat map, Profile, with the tab bar at the bottom.
  // pb-[92px] keeps the last content above the fixed 76px tab bar.
  return (
    <div className="mx-auto min-h-dvh max-w-[430px] pb-[92px]">
      {saveWarning}
      <main>
        {screen === 'closet' ? (
          <ClosetScreen data={data} today={today} onChange={update} />
        ) : screen === 'heatmap' && heatCategory && dayNumber(profile.startDate, today) >= CHALLENGE_DAYS ? (
          <HeatCategoryScreen data={data} category={heatCategory} today={today} />
        ) : screen === 'heatmap' ? (
          <HeatMapScreen data={data} profile={profile} today={today} />
        ) : screen === 'profile' ? (
          <ProfileScreen
            data={data}
            profile={profile}
            today={today}
            onLoadDemo={loadDemo}
            onReset={reset}
          />
        ) : (
          <HomeScreen data={data} profile={profile} today={today} />
        )}
      </main>
      <TabBar current={screen} />
    </div>
  )
}
