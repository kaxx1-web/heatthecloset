/*
 * Custom cursor: two outlined circles that trail the mouse, and warp and
 * fade when you point at something clickable.
 *
 * Ported to React from Codrops Sketch 018 "Custom Cursor (two circles with
 * filter and delays)":
 * https://github.com/codrops/codrops-sketches/tree/main/018-custom-cursor-filter-6
 *
 * MIT License, Copyright (c) 2022 Codrops
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Changes from the original:
 * - No GSAP: the one 1.5s tween is done with requestAnimationFrame and the
 *   same "power1" (ease-out) curve, so there's no extra dependency.
 * - Works with React: it listens on the whole document ("event delegation"),
 *   so buttons and links added later still trigger it. The original only
 *   found the <a> tags that existed when the page loaded.
 * - Triggers on anything clickable (buttons, labels, links…), not just <a>.
 * - Only runs with a mouse/trackpad, and not if the user asked their
 *   device for reduced motion.
 * - Fixes two small bugs: a missing ")" in the filter url(), and the y
 *   position not being set on the first mouse move.
 */
import { useEffect, useRef } from 'react'

// Linear interpolation: move part of the way (n) from a towards b. Doing
// this every frame makes the circles glide after the mouse.
const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b

// Map x from the range [a, b] to the range [c, d].
const map = (x: number, a: number, b: number, c: number, d: number) => ((x - a) * (d - c)) / (b - a) + c

// GSAP's "power1" ease: fast at first, slowing down at the end.
const easeOut = (t: number) => 1 - (1 - t) * (1 - t)

const SIZE = 140 // each cursor SVG is 140×140, centred on the mouse
const RADIUS_ON_ENTER = 50 // how big the circles grow when warping
const TURBULENCE = { from: 0.01, to: 0.04 } // how strong the warp gets
const DURATION = 1500 // ms

// What counts as "something you can click".
const TRIGGERS = 'a, button, label, summary, select, input, textarea, [role="button"]'

// A value that eases from `previous` towards `current` each frame.
type Eased = { previous: number; current: number }

type Layer = {
  svg: SVGSVGElement
  circle: SVGCircleElement
  baseRadius: number
  amt: number // lower = trails further behind the mouse
  x: Eased
  y: Eased
  radius: Eased
  opacity: Eased
}

export default function CustomCursor() {
  const firstRef = useRef<SVGSVGElement>(null)
  const secondRef = useRef<SVGSVGElement>(null)
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null)

  useEffect(() => {
    // Only for a mouse or trackpad, and only if motion is welcome.
    const finePointer = window.matchMedia('(any-pointer: fine)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const first = firstRef.current
    const second = secondRef.current
    const turbulence = turbulenceRef.current
    if (!finePointer || reducedMotion || !first || !second || !turbulence) return

    const makeLayer = (svg: SVGSVGElement, amt: number): Layer => {
      const circle = svg.querySelector('circle')!
      const baseRadius = Number(circle.getAttribute('r'))
      return {
        svg,
        circle,
        baseRadius,
        amt,
        x: { previous: 0, current: 0 },
        y: { previous: 0, current: 0 },
        radius: { previous: baseRadius, current: baseRadius },
        opacity: { previous: 1, current: 1 },
      }
    }
    // The second, bigger circle follows a little more slowly (0.13 vs 0.15).
    const layers = [makeLayer(first, 0.15), makeLayer(second, 0.13)]

    let mouse = { x: 0, y: 0 }
    let started = false
    let frame = 0
    let warpStart: number | null = null // when the warp animation began
    let hovered: Element | null = null

    // Every frame: ease each circle towards the mouse and draw it.
    function render(now: number) {
      if (warpStart !== null) {
        const t = Math.min(1, (now - warpStart) / DURATION)
        const amount = lerp(TURBULENCE.from, TURBULENCE.to, easeOut(t))
        turbulence!.setAttribute('baseFrequency', String(amount))
        for (const layer of layers) {
          // As the warp grows, the circles grow and fade out.
          layer.opacity.current = layer.opacity.previous = map(amount, TURBULENCE.from, TURBULENCE.to, 1, 0)
          layer.radius.current = layer.radius.previous = map(amount, TURBULENCE.from, TURBULENCE.to, layer.baseRadius, RADIUS_ON_ENTER)
        }
        if (t === 1) {
          warpStart = null
          for (const layer of layers) {
            layer.circle.style.filter = 'none'
            layer.radius.current = layer.radius.previous = layer.baseRadius
          }
        }
      }

      for (const layer of layers) {
        layer.x.current = mouse.x - SIZE / 2
        layer.y.current = mouse.y - SIZE / 2
        for (const value of [layer.x, layer.y, layer.radius, layer.opacity]) {
          value.previous = lerp(value.previous, value.current, layer.amt)
        }
        // transform and opacity are cheap for the browser to animate.
        layer.svg.style.transform = `translate(${layer.x.previous}px, ${layer.y.previous}px)`
        layer.svg.style.opacity = String(layer.opacity.previous)
        layer.circle.setAttribute('r', String(layer.radius.previous))
      }
      frame = requestAnimationFrame(render)
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType === 'touch') return
      mouse = { x: event.clientX, y: event.clientY }
      if (!started) {
        // First move: jump straight to the mouse, then start the loop.
        started = true
        for (const layer of layers) {
          layer.x.previous = layer.x.current = mouse.x - SIZE / 2
          layer.y.previous = layer.y.current = mouse.y - SIZE / 2
        }
        frame = requestAnimationFrame(render)
      }
    }

    // Pointing at something clickable: start (or restart) the warp.
    function enter() {
      warpStart = performance.now()
      turbulence!.setAttribute('seed', String(Math.round(1 + Math.random() * 19)))
      for (const layer of layers) {
        layer.circle.style.filter = 'url(#cursor-filter)'
        layer.opacity.current = 1
      }
    }

    // Left it: stop the warp and fade the circles back in.
    function leave() {
      warpStart = null
      for (const layer of layers) {
        layer.circle.style.filter = 'none'
        layer.radius.current = layer.baseRadius
        layer.opacity.current = 1
      }
    }

    // One listener on the whole document catches every button and link,
    // even ones React adds later. closest() finds the clickable element
    // the pointer is inside, if any.
    function onOver(event: PointerEvent) {
      if (event.pointerType === 'touch') return
      const target = (event.target as Element).closest(TRIGGERS)
      if (target && target !== hovered) {
        hovered = target
        enter()
      }
    }
    function onOut(event: PointerEvent) {
      if (!hovered) return
      const next = event.relatedTarget as Node | null
      if (next && hovered.contains(next)) return // still inside it
      hovered = null
      leave()
    }

    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      cancelAnimationFrame(frame)
    }
  }, [])

  // Hidden unless there's a mouse/trackpad (any-pointer-fine) and motion
  // is welcome (motion-safe). pointer-events-none lets clicks pass through.
  // mix-blend-difference + white stroke: dark on light screens, light on
  // the dark camera screen.
  const svgClass =
    'pointer-events-none fixed top-0 left-0 z-[10000] hidden text-white opacity-0 mix-blend-difference any-pointer-fine:motion-safe:block'

  return (
    <>
      <svg ref={firstRef} aria-hidden="true" width={SIZE} height={SIZE} viewBox="0 0 140 140" className={svgClass}>
        <defs>
          {/* The warp: noise (feTurbulence) pushes the circle's pixels
              around (feDisplacementMap). baseFrequency is animated. */}
          <filter id="cursor-filter" x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox">
            <feTurbulence ref={turbulenceRef} type="fractalNoise" seed="3" baseFrequency="0" numOctaves={1} result="warp" />
            <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale={15} in="SourceGraphic" in2="warp" />
          </filter>
        </defs>
        <circle cx={70} cy={70} r={20} fill="none" stroke="currentColor" strokeWidth={1.2} />
      </svg>
      <svg ref={secondRef} aria-hidden="true" width={SIZE} height={SIZE} viewBox="0 0 140 140" className={svgClass}>
        <circle cx={70} cy={70} r={24} fill="none" stroke="currentColor" strokeWidth={1.2} />
      </svg>
    </>
  )
}
