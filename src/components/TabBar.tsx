import type { CSSProperties } from 'react'
import closetActiveIcon from '../assets/figma/tab-closet-active.svg'
import closetIcon from '../assets/figma/tab-closet.svg'
import profileActiveIcon from '../assets/figma/tab-profile-active.svg'
import heatmapActiveIcon from '../assets/figma/tab-heatmap-active.svg'
import heatmapIcon from '../assets/figma/tab-heatmap.svg'
import homeActiveIcon from '../assets/figma/tab-home-active.svg'
import homeIcon from '../assets/figma/tab-home.svg'
import plusIcon from '../assets/figma/tab-plus.svg'
import profileIcon from '../assets/figma/tab-profile.svg'
import { routeHref } from '../navigation'
import type { Route } from '../navigation'

// In Figma the active tab's icon has a thicker stroke, so each tab has two
// drawings: `icon` (inactive) and `activeIcon`.
type Tab = { route: Route; label: string; icon: string; activeIcon: string }

const LEFT: Tab[] = [
  { route: 'home', label: 'Home', icon: homeIcon, activeIcon: homeActiveIcon },
  { route: 'closet', label: 'Closet', icon: closetIcon, activeIcon: closetActiveIcon },
]
const RIGHT: Tab[] = [
  { route: 'heatmap', label: 'Heat map', icon: heatmapIcon, activeIcon: heatmapActiveIcon },
  { route: 'profile', label: 'Profile', icon: profileIcon, activeIcon: profileActiveIcon },
]

function TabLink({ tab, current }: { tab: Tab; current: Route }) {
  const active = tab.route === current
  const icon = active ? tab.activeIcon : tab.icon
  return (
    <li className="flex-1">
      <a
        href={routeHref(tab.route)}
        aria-current={active ? 'page' : undefined}
        className={`flex h-14 flex-col items-center justify-center gap-[3px] rounded-xl text-[11px] leading-[1.4] ${
          active ? 'font-bold text-ink' : 'font-medium text-[#595959]'
        }`}
      >
        {/* The Figma icon is used as a *mask*: its shape is cut out of a
            block filled with the text color (bg-current). That way the same
            icon turns dark when its tab is active and grey when it isn't. */}
        <span
          aria-hidden="true"
          style={{ '--icon': `url("${icon}")` } as CSSProperties}
          className="size-6 bg-current [mask:var(--icon)_center/contain_no-repeat]"
        />
        {tab.label}
      </a>
    </li>
  )
}

// The bottom tab bar, fixed to the bottom of the screen.
export default function TabBar({ current }: { current: Route }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] border-t border-[#e3e3e3] bg-white"
    >
      <ul className="flex h-[76px] items-center px-2 pb-3">
        {LEFT.map((tab) => (
          <TabLink key={tab.route} tab={tab} current={current} />
        ))}
        <li className="shrink-0">
          <a
            href={routeHref('photo')}
            className="flex size-14 items-center justify-center rounded-full bg-ink hover:bg-stone-700"
          >
            <img src={plusIcon} width={28} height={28} alt="" />
            <span className="sr-only">Log today’s outfit</span>
          </a>
        </li>
        {RIGHT.map((tab) => (
          <TabLink key={tab.route} tab={tab} current={current} />
        ))}
      </ul>
    </nav>
  )
}
