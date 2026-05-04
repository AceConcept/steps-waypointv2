import type { FlowStepId } from './store/flowStore'
import { STEP_DESCRIPTIONS } from './stepDescriptions'

/**
 * Luna drawer + preview rail — titles, descriptions, optional **thumbUrl** / **heroImageUrl** (`public/` paths).
 */
export type FlowSidebarItem = {
  id: FlowStepId
  label: string
  step: string
  title: string
  description: string
  swatch: string
  thumbUrl?: string
  heroImageUrl?: string
}

/** Thumbnails in `public/step_imgs/` (note: step 1 is `Step-1.png`). */
function stepImageUrl(n: 1 | 2 | 3): string {
  const file =
    n === 1 ? 'Step-1.png' : n === 2 ? 'Step 2.png' : 'Step 3.png'
  const base = `/step_imgs/${encodeURIComponent(file)}`
  const v = typeof __STEP_IMG_VER__ !== 'undefined' && __STEP_IMG_VER__
    ? __STEP_IMG_VER__
    : ''
  return v ? `${base}?v=${encodeURIComponent(v)}` : base
}

export const FLOW_SIDEBAR_ITEMS: FlowSidebarItem[] = [
  {
    id: 'anomaly',
    label: 'Anomaly',
    step: 'Anomaly',
    title: 'Anomaly',
    description: STEP_DESCRIPTIONS[0],
    swatch: '#e8e4f0',
    thumbUrl: stepImageUrl(1),
    heroImageUrl: stepImageUrl(1),
  },
  {
    id: 'incident',
    label: 'Incident',
    step: 'Incident',
    title: 'Incident',
    description: STEP_DESCRIPTIONS[1],
    swatch: '#cab6e0',
    thumbUrl: stepImageUrl(2),
    heroImageUrl: stepImageUrl(2),
  },
  {
    id: 'monitor',
    label: 'Monitor',
    step: 'Monitor',
    title: 'Monitor',
    description: STEP_DESCRIPTIONS[2],
    swatch: '#dcd4ec',
    thumbUrl: stepImageUrl(3),
    heroImageUrl: stepImageUrl(3),
  },
]
