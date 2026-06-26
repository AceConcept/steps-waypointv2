/** Dev/preview: freeze load screen via URL query (no sweep or fade). */
export type LoadscreenPreview = {
  hold: boolean
  /** Fixed progress when hold is true; default matches reference mockup. */
  progress: number
}

const DEFAULT_HOLD_PROGRESS = 56

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function getLoadscreenPreview(): LoadscreenPreview {
  if (typeof window === 'undefined') {
    return { hold: false, progress: 0 }
  }

  const raw = new URLSearchParams(window.location.search).get('loadscreen')
  if (!raw) return { hold: false, progress: 0 }

  const key = raw.trim().toLowerCase()
  if (key === 'hold' || key === 'pause' || key === 'preview') {
    return { hold: true, progress: DEFAULT_HOLD_PROGRESS }
  }

  const n = Number(key)
  if (Number.isFinite(n)) {
    return { hold: true, progress: clampPercent(n) }
  }

  return { hold: false, progress: 0 }
}
