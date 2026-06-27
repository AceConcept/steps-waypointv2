import '@fontsource/manrope/700.css'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import {
  lockAppBehindShutter,
  unlockAppBehindShutter,
} from './loadscreenShutter'
import './loadingScreen.css'

/**
 * LOADING SCREEN — HOW IT WORKS (plain language)
 * ---------------------------------------------
 * The app (navbar + iframe) always mounts and loads immediately. This file is
 * only a full-screen curtain on top so the user sees a designed intro first.
 *
 * Hard refresh (F5) used to break the sweep because React tried to “start” the
 * animation with timers and state changes. On refresh the browser resets
 * everything, so that timing often failed and the screen jumped straight to black.
 *
 * Fix: treat the curtain like a theater show with a fixed schedule:
 *   1. index.html sets “hide the app” before React loads (loadscreen-active).
 *   2. This component is drawn on document.body (outside the app tree) so the
 *      app cannot cover it or interfere with it.
 *   3. The sweep and fade use CSS animation-delay — the browser runs them on a
 *      clock from first paint. React only updates the 0–100% progress number.
 *   4. When the fade begins, we show the app behind the curtain so the fade
 *      reveals the already-loaded page instead of a white background.
 *   5. When the fade ends, this component unmounts and the curtain is gone.
 *
 * Preview mode (?loadscreen=hold): frozen frame for design review, no sweep.
 */

type LoadingScreenProps = {  hold?: boolean
  progress?: number
  onComplete?: () => void
}

const PROGRESS_MS = 3000
const PAUSE_MS = 120
const SWEEP_MS_MIN = 400
const SWEEP_MS_MAX = 650
const SWEEP_MS_PER_PX = 0.35
const HOLD_MS = 250
const FADE_MS = 400

function sweepMsForViewport() {
  if (typeof window === 'undefined') return 500
  return Math.round(
    Math.min(SWEEP_MS_MAX, Math.max(SWEEP_MS_MIN, window.innerWidth * SWEEP_MS_PER_PX)),
  )
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

/**
 * Global shutter for hard refresh: CSS-timed sweep/fade from first paint.
 */
export function LoadingScreen({  hold = false,
  progress: holdProgress = 56,
  onComplete,
}: LoadingScreenProps) {
  const [simProgress, setSimProgress] = useState(0)
  const shutterRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  const finishedRef = useRef(false)
  const sweepMs = useMemo(sweepMsForViewport, [])

  onCompleteRef.current = onComplete

  const progressEndMs = PROGRESS_MS + PAUSE_MS
  const fadeDelayMs = progressEndMs + sweepMs + HOLD_MS
  const totalMs = fadeDelayMs + FADE_MS

  const progress = hold ? clampPercent(holdProgress) : simProgress

  const shutterStyle = {
    '--loadscreen-progress-end': `${progressEndMs}ms`,
    '--loadscreen-sweep-ms': `${sweepMs}ms`,
    '--loadscreen-fade-ms': `${FADE_MS}ms`,
    '--loadscreen-fade-delay': `${fadeDelayMs}ms`,
  } as CSSProperties

  useLayoutEffect(() => {
    if (hold) {
      unlockAppBehindShutter()
      return
    }
    lockAppBehindShutter()
  }, [hold])

  useEffect(() => {
    if (hold) return

    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / PROGRESS_MS)
      const eased = 1 - (1 - t) ** 2.2
      setSimProgress(clampPercent(eased * 100))
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [hold])

  useEffect(() => {
    if (hold) return

    const finish = () => {
      if (finishedRef.current) return
      finishedRef.current = true
      unlockAppBehindShutter()
      onCompleteRef.current?.()
    }

    const el = shutterRef.current

    const onAnimationStart = (event: AnimationEvent) => {
      if (event.target !== el) return
      if (event.animationName !== 'loadscreen-shutter-fade') return
      unlockAppBehindShutter()
      el?.classList.add('loadscreen--releasing')
    }

    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target !== el) return
      if (event.animationName !== 'loadscreen-shutter-fade') return
      finish()
    }

    el?.addEventListener('animationstart', onAnimationStart)
    el?.addEventListener('animationend', onAnimationEnd)

    const revealTimer = window.setTimeout(() => {
      unlockAppBehindShutter()
      el?.classList.add('loadscreen--releasing')
    }, fadeDelayMs)

    const fallback = window.setTimeout(finish, totalMs + 80)

    return () => {
      el?.removeEventListener('animationstart', onAnimationStart)
      el?.removeEventListener('animationend', onAnimationEnd)
      window.clearTimeout(revealTimer)
      window.clearTimeout(fallback)
    }
  }, [hold, fadeDelayMs, totalMs])

  const shutter = (
    <div
      ref={shutterRef}
      className={`loadscreen${hold ? '' : ' loadscreen--sequence'}`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading Waypoint"
      style={shutterStyle}
    >
      <div className="loadscreen__bg" aria-hidden="true" />

      <div className="loadscreen__chrome">
        <div className="loadscreen__progress" aria-hidden="true">
          <div className="loadscreen__bar-track">
            <div
              className="loadscreen__bar"
              style={{ height: `${progress}%` }}
            />
          </div>

          <div
            className="loadscreen__marker"
            style={{ top: `${progress}%` }}
          >
            <div className="loadscreen__percent-stack">
              <img
                className="loadscreen__tracker"
                src="/loadingscrn/tracker-rect.svg"
                alt=""
                width={11}
                height={30}
                draggable={false}
              />
              <p className="loadscreen__percent">[{progress}%:]</p>
              <img
                className="loadscreen__smollwrd"
                src="/loadingscrn/smollwrd.png"
                alt=""
                width={176}
                height={35}
                draggable={false}
              />
            </div>
            <div className="loadscreen__hline" />
          </div>
        </div>

        <div className="loadscreen__brand">
          <div className="loadscreen__icons" aria-hidden="true">
            <img
              className="loadscreen__icon-img"
              src="/loadingscrn/website-icon.svg"
              alt=""
              width={36}
              height={36}
              draggable={false}
            />
            <img
              className="loadscreen__icon-img"
              src="/loadingscrn/waypoint-icon.svg"
              alt=""
              width={36}
              height={36}
              draggable={false}
            />
          </div>
          <p className="loadscreen__status">// Loading Waypoint...</p>
        </div>
      </div>

      {!hold ? <div className="loadscreen__sweep" aria-hidden="true" /> : null}
    </div>
  )

  return createPortal(shutter, document.body)
}
