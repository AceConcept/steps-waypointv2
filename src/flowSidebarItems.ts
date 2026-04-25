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

/** Thumbnails: `public/step_imgs/Step 1.png` … `Step 3.png` */
function stepImageUrl(n: 1 | 2 | 3): string {
  return `/step_imgs/${encodeURIComponent(`Step ${n}.png`)}`
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
    id: 'monitor',
    label: 'Monitor',
    step: 'Monitor',
    title: 'Monitor',
    description: STEP_DESCRIPTIONS[1],
    swatch: '#dcd4ec',
    thumbUrl: stepImageUrl(2),
    heroImageUrl: stepImageUrl(2),
  },
  {
    id: 'incident',
    label: 'Incident',
    step: 'Incident',
    title: 'Incident',
    description: STEP_DESCRIPTIONS[2],
    swatch: '#cab6e0',
    thumbUrl: stepImageUrl(3),
    heroImageUrl: stepImageUrl(3),
  },
]
