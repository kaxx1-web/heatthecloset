import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

// Shows the app inside an iPhone 17 Pro Max on large screens (laptops,
// tablets), with the phone's status bar, Dynamic Island and home
// indicator. On a real phone the frame isn't drawn and the app fills the
// screen as before.
//
// How it works:
// - All the drawing is CSS (.device… in index.css), only applied inside
//   @media (min-width: 700px) and (min-height: 560px). Below that, every
//   wrapper here is `display: contents` (no box at all), so the app
//   behaves exactly as it did without the frame.
// - Inside the frame, .device__screen is the containing block for
//   position: fixed (via `contain: layout`), so the fixed tab bar and
//   moving background stay inside the phone instead of the browser window.
//   The app scrolls inside .device__scroll.
// - The phone is 992px tall, taller than most laptop windows, so this
//   component scales it down to fit (see fit() below).

// Keep in sync with the media query in index.css.
const FRAMED = '(min-width: 700px) and (min-height: 560px)'

// The outer size of the drawn phone (screen 440×956 points, the iPhone 17
// Pro Max's real size, plus bezel and frame) and the space kept around it.
const DEVICE_WIDTH = 476
const DEVICE_HEIGHT = 992
const SCREEN_RADIUS = 64
const MARGIN = 24

export default function PhoneFrame({ children }: { children: ReactNode }) {
  const screenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const media = window.matchMedia(FRAMED)
    const root = document.documentElement
    const screen = screenRef.current

    // Shrinks the phone to fit the window, and tells the CSS where its
    // screen is. Dialogs (the add-piece sheet, confirm boxes) open in the
    // browser's "top layer", above the whole page, so they need these
    // numbers to line up with the phone screen instead of the window.
    function fit() {
      if (!media.matches || !screen) {
        root.style.removeProperty('--device-scale')
        return
      }
      const scale = Math.min(
        1,
        (window.innerHeight - MARGIN * 2) / DEVICE_HEIGHT,
        (window.innerWidth - MARGIN * 2) / DEVICE_WIDTH,
      )
      root.style.setProperty('--device-scale', String(scale))
      // Read after setting the scale, so the size is the scaled one.
      const rect = screen.getBoundingClientRect()
      root.style.setProperty('--screen-left', `${rect.left}px`)
      root.style.setProperty('--screen-width', `${rect.width}px`)
      root.style.setProperty('--screen-height', `${rect.height}px`)
      root.style.setProperty('--screen-bottom-gap', `${window.innerHeight - rect.bottom}px`)
      root.style.setProperty('--screen-radius', `${SCREEN_RADIUS * scale}px`)
    }

    fit()
    window.addEventListener('resize', fit)
    media.addEventListener('change', fit)
    return () => {
      window.removeEventListener('resize', fit)
      media.removeEventListener('change', fit)
    }
  }, [])

  return (
    <div className="device-stage">
      <div className="device">
        {/* The side buttons, drawn on the frame: action button and volume
            on the left, side button and Camera Control on the right. */}
        <span aria-hidden="true" className="device__button device__button--action" />
        <span aria-hidden="true" className="device__button device__button--volume-up" />
        <span aria-hidden="true" className="device__button device__button--volume-down" />
        <span aria-hidden="true" className="device__button device__button--side" />
        <span aria-hidden="true" className="device__button device__button--camera" />
        <div className="device__bezel">
          <div ref={screenRef} className="device__screen">
            <div className="device__scroll">{children}</div>
            <StatusBar />
            <span aria-hidden="true" className="device__home-indicator" />
          </div>
        </div>
      </div>
    </div>
  )
}

// The current time as the iPhone status bar shows it: "9:41", no AM/PM.
function clockTime(): string {
  return new Date()
    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    .replace(/\s?[AP]\.?M\.?$/i, '')
}

// The phone's status bar: the time, the Dynamic Island, and the signal,
// Wi-Fi and battery icons. Decoration only, so screen readers skip it
// (aria-hidden); the battery is always shown full.
function StatusBar() {
  const [time, setTime] = useState(clockTime)
  useEffect(() => {
    // Check every 10 seconds, so the minute changes close to on time.
    const timer = window.setInterval(() => setTime(clockTime()), 10_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div aria-hidden="true" className="device__status">
      <span className="device__time">{time}</span>
      <span className="device__island" />
      <span className="device__icons">
        {/* Cellular signal: four bars. */}
        <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="1" />
          <rect x="5" y="5" width="3.2" height="7" rx="1" />
          <rect x="10" y="2.5" width="3.2" height="9.5" rx="1" />
          <rect x="15" y="0" width="3.2" height="12" rx="1" />
        </svg>
        {/* Wi-Fi: a dot and two arcs. */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <path d="M8.5 2.3c2.4 0 4.6.9 6.3 2.5.2.2.5.2.7 0l1.1-1.1c.2-.2.2-.5 0-.7A11.4 11.4 0 0 0 8.5 0C5.4 0 2.5 1.2.4 3.3c-.2.2-.2.5 0 .7l1.1 1.1c.2.2.5.2.7 0A9 9 0 0 1 8.5 2.3Z" />
          <path d="M8.5 6c1.3 0 2.6.5 3.6 1.4.2.2.5.2.7 0l1.1-1.1c.2-.2.2-.5 0-.7a7.6 7.6 0 0 0-10.8 0c-.2.2-.2.5 0 .7l1.1 1.1c.2.2.5.2.7 0C5.9 6.5 7.2 6 8.5 6Z" />
          <path d="M10.6 9.4c.2-.2.2-.5 0-.7a3 3 0 0 0-4.2 0c-.2.2-.2.5 0 .7l1.8 1.8c.2.2.5.2.7 0l1.7-1.8Z" />
        </svg>
        {/* Battery: outline, full charge, and the little cap. */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke="currentColor" strokeOpacity="0.4" />
          <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </span>
    </div>
  )
}
