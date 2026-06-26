import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { StageEmbedFrame } from '../luna/StageEmbedFrame'
import {
  STAGE_EMBED_HANDOFF_MS,
  useLunaStageEmbed,
} from '../luna/LunaStageEmbedContext'
import {
  polarFlowIdFromHash,
  stageEmbedUrlForStep,
  useFlowStep,
  useFlowStore,
} from '../store/flowStore'

const embedTransition = {
  duration: STAGE_EMBED_HANDOFF_MS / 1000,
  ease: 'easeOut' as const,
}

export default function WaypointStepsScreen({
  onEmbedReady,
}: {
  onEmbedReady?: () => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const { step } = useFlowStep()
  const { stageEmbedVisible } = useLunaStageEmbed()
  const embedSrc = stageEmbedUrlForStep(step.id)

  useEffect(() => {
    const onHashChange = () => {
      useFlowStore.getState().goToStepById(polarFlowIdFromHash(window.location.hash))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <div ref={hostRef} className="viewport">
      <div id="artboard" className="artboard">
        <AnimatePresence mode="wait">
          {stageEmbedVisible ? (
            <motion.div
              key="stage-embed"
              className="stepscreen-embed-shell"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={embedTransition}
            >
              <StageEmbedFrame
                className="stepscreen-embed"
                src={embedSrc}
                title="Atencium steps"
                onEmbedLoad={onEmbedReady}
              />
            </motion.div>
          ) : (
            <motion.div
              key="stage-placeholder"
              className="stepscreen-embed-placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={embedTransition}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
