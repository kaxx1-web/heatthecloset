import { routeHref } from '../navigation'
import type { Route } from '../navigation'

const LINKS: { route: Route; label: string }[] = [
  { route: 'home', label: 'Today' },
  { route: 'log', label: 'Log' },
  { route: 'closet', label: 'Closet' },
  { route: 'heatmap', label: 'Heat map' },
]

// These are real <a> links (not buttons) because they change the URL, so
// they work with the back button, "open in new tab" and screen-reader link
// lists. aria-current="page" tells screen readers which link is active.
export default function NavBar({ current }: { current: Route }) {
  return (
    <nav aria-label="Main">
      <ul className="grid grid-cols-4 gap-1">
        {LINKS.map(({ route, label }) => (
          <li key={route}>
            <a
              href={routeHref(route)}
              aria-current={route === current ? 'page' : undefined}
              className="flex min-h-12 items-center justify-center rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-200 aria-[current=page]:bg-stone-900 aria-[current=page]:text-white"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
