import { create } from 'zustand'
import { STEP_DESCRIPTIONS, STEP_TITLES } from '../stepDescriptions'

/** Generic numbered step ids (1–6). */
export type FlowStepId = '1' | '2' | '3' | '4' | '5' | '6'

export const FLOW_STEP_IDS = ['1', '2', '3', '4', '5', '6'] as const satisfies readonly FlowStepId[]

/** Map `#/2` … `#/6` hash segments to step ids; empty hash → step 1. */
export function polarFlowIdFromHash(hash: string): FlowStepId {
  const m = String(hash || '').match(/#\/(\d+)/)
  const segment = m ? m[1] : ''
  if (FLOW_STEP_IDS.includes(segment as FlowStepId)) {
    return segment as FlowStepId
  }
  return '1'
}

export const POLAR_SYS_HASH: Record<FlowStepId, string> = {
  '1': '',
  '2': '#/2',
  '3': '#/3',
  '4': '#/4',
  '5': '#/5',
  '6': '#/6',
}

/** Center-stage iframe origin (polar-sys / steps slot). */
export const STAGE_EMBED_ORIGIN = 'https://steps-project-slot.vercel.app'

export function stageEmbedUrl(polarHash: string): string {
  return `${STAGE_EMBED_ORIGIN}${polarHash}`
}

export const FLOW_STEPS: {
  id: FlowStepId
  title: string
  body: string
}[] = FLOW_STEP_IDS.map((id, i) => ({
  id,
  title: STEP_TITLES[i] ?? STEP_TITLES[0],
  body: STEP_DESCRIPTIONS[i] ?? '',
}))

function initialStepIndexFromLocation(): number {
  if (typeof window === 'undefined') return 0
  const id = polarFlowIdFromHash(window.location.hash)
  const index = FLOW_STEPS.findIndex((s) => s.id === id)
  return index >= 0 ? index : 0
}

type FlowState = {
  stepIndex: number
  next: () => void
  back: () => void
  goToStep: (index: number) => void
  goToStepById: (id: FlowStepId) => void
  reset: () => void
}

export const useFlowStore = create<FlowState>((set, get) => ({
  stepIndex: initialStepIndexFromLocation(),
  next: () => {
    const i = get().stepIndex
    if (i < FLOW_STEPS.length - 1) set({ stepIndex: i + 1 })
  },
  back: () => {
    const i = get().stepIndex
    if (i > 0) set({ stepIndex: i - 1 })
  },
  goToStep: (index) => {
    if (index >= 0 && index < FLOW_STEPS.length) set({ stepIndex: index })
  },
  goToStepById: (id) => {
    const index = FLOW_STEPS.findIndex((s) => s.id === id)
    if (index < 0) return
    set({ stepIndex: index })
    if (typeof window !== 'undefined') {
      const hash = POLAR_SYS_HASH[id]
      if (window.location.hash !== hash) {
        const url = new URL(window.location.href)
        url.hash = hash
        window.history.replaceState(null, '', url)
      }
    }
  },
  reset: () => set({ stepIndex: 0 }),
}))

export function useFlowStep() {
  const stepIndex = useFlowStore((s) => s.stepIndex)
  const step = FLOW_STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === FLOW_STEPS.length - 1
  return { stepIndex, step, isFirst, isLast }
}
