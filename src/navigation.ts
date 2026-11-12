import { useEffect, useRef, useState } from 'react'

// Navigation with #hash links instead of real page routes.
// Everything after "#" stays in the browser and is never sent to the server,
// so refreshing "/closet-map/#/closet" still loads index.html on GitHub
// Pages. A real route like "/closet-map/closet" would ask the server for a
// page that doesn't exist and show a 404.
//
// Some routes take a parameter after a second slash:
//   #/heatmap/Top   -> one category of the heat map
//   #/item/abc123   -> the item detail for piece "abc123"

export type Route =
  // Tabs (shown with the bottom tab bar)
  | 'home'
  | 'closet'
  | 'heatmap'
  | 'profile'
  // Full-screen steps (no tab bar)
  | 'welcome'
  | 'how'
  | 'photo'
  | 'confirm'
  | 'logged'
  | 'item'
  | 'demo'

const ROUTES: Route[] = [
  'home',
  'closet',
  'heatmap',
  'profile',
  'welcome',
  'how',
  'photo',
  'confirm',
  'logged',
  'item',
  'demo',
]

export const FULL_SCREEN_ROUTES: Route[] = ['welcome', 'how', 'photo', 'confirm', 'logged', 'item', 'demo']

export type Location = { route: Route; param: string | null }

// "#/item/abc123" -> { route: 'item', param: 'abc123' }. Unknown -> home.
function readLocation(): Location {
  const [name, param] = window.location.hash.replace(/^#\/?/, '').split('/')
  const route = ROUTES.find((r) => r === name) ?? 'home'
  // decodeURIComponent undoes the encoding done in routeHref (e.g. spaces).
  return { route, param: param ? decodeURIComponent(param) : null }
}

export function routeHref(route: Route, param?: string): string {
  if (route === 'home') return '#/'
  return param ? `#/${route}/${encodeURIComponent(param)}` : `#/${route}`
}

export function navigate(route: Route, param?: string): void {
  window.location.hash = routeHref(route, param)
}

// Gives the current route (and parameter) and re-renders whenever the hash
// changes (clicking a link, the back button, or navigate()).
export function useHashRoute(): Location {
  const [location, setLocation] = useState(readLocation)
  useEffect(() => {
    const onHashChange = () => setLocation(readLocation())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  return location
}

// When the screen (or a step) changes, a screen reader would otherwise stay
// on the link that was just clicked, with no hint that new content
// appeared. Moving focus to the new <h1> announces the new screen and puts
// keyboard users at the top. We skip the first render so the page doesn't
// grab focus on load.
export function useFocusHeadingOnChange(key: string): void {
  const previousKey = useRef(key)
  useEffect(() => {
    if (previousKey.current === key) return
    previousKey.current = key
    document.querySelector<HTMLElement>('main h1')?.focus()
  }, [key])
}
