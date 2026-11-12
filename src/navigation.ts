import { useEffect, useRef, useState } from 'react'

// Navigation with #hash links instead of real page routes.
// Everything after "#" stays in the browser and is never sent to the server,
// so refreshing "/closet-map/#/log" still loads index.html on GitHub Pages.
// A real route like "/closet-map/log" would ask the server for a page that
// doesn't exist and show a 404.

export type Route =
  | 'home'
  | 'log'
  | 'closet'
  | 'heatmap'
  // Onboarding: full-screen, no nav bar.
  | 'welcome'
  | 'how'
  | 'photo'
  | 'confirm'
  | 'demo'

const ROUTES: Route[] = ['home', 'log', 'closet', 'heatmap', 'welcome', 'how', 'photo', 'confirm', 'demo']

export const ONBOARDING_ROUTES: Route[] = ['welcome', 'how', 'photo', 'confirm']

// "#/closet" -> "closet". Anything unknown falls back to home.
function readRoute(): Route {
  const name = window.location.hash.replace(/^#\/?/, '')
  return ROUTES.find((route) => route === name) ?? 'home'
}

export function routeHref(route: Route): string {
  return route === 'home' ? '#/' : `#/${route}`
}

export function navigate(route: Route): void {
  window.location.hash = routeHref(route)
}

// Gives the current route and re-renders whenever the hash changes
// (clicking a link, the back button, or navigate()).
export function useHashRoute(): Route {
  const [route, setRoute] = useState(readRoute)
  useEffect(() => {
    const onHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  return route
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
