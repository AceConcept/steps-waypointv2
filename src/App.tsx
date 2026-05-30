import { LunaChrome } from './luna/LunaChrome'
import WaypointStepsScreen from './steps/WaypointStepsScreen'
import { useEffect } from 'react'
import {
  FLOW_STEP_IDS,
  FLOW_STEPS,
  useFlowStep,
  useFlowStore,
  type FlowStepId,
} from './store/flowStore'
import {
  requestStageEmbedStep,
  STAGE_EMBED_STEP_CHANGED,
} from './store/stageEmbedBridge'
import { getStageEmbedOrigin } from './store/stageEmbedConfig'
import './App.css'

function App() {
  const { stepIndex } = useFlowStep()
  const goToStepById = useFlowStore((s) => s.goToStepById)
  const syncStepFromEmbed = useFlowStore((s) => s.syncStepFromEmbed)

  useEffect(() => {
    const { stepIndex } = useFlowStore.getState()
    const initial = FLOW_STEPS[stepIndex]
    if (initial) goToStepById(initial.id)
  }, [goToStepById])

  useEffect(() => {
    const embedOrigin = getStageEmbedOrigin()
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== embedOrigin) return
      if (event.data?.type !== STAGE_EMBED_STEP_CHANGED) return
      const n = Number(event.data.step)
      if (!Number.isFinite(n) || n < 1 || n > 6) return
      const id = String(n) as FlowStepId
      if (!FLOW_STEP_IDS.includes(id)) return
      syncStepFromEmbed(id)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [syncStepFromEmbed])

  useEffect(() => {
    const poll = window.setInterval(() => requestStageEmbedStep(), 400)
    return () => window.clearInterval(poll)
  }, [])

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('atencium-step', String(stepIndex + 1))
    } catch {
      /* ignore */
    }
  }

  return (
    <LunaChrome footerBackgroundUrl="/news_bg.jpg">
      <WaypointStepsScreen />
    </LunaChrome>
  )
}

export default App
