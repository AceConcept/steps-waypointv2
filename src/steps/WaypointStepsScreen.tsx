import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { StageEmbedFrame } from '../luna/StageEmbedFrame'
import {
  STAGE_EMBED_HANDOFF_MS,
  useLunaStageEmbed,
} from '../luna/LunaStageEmbedContext'
import {
  polarFlowIdFromHash,
  stageEmbedUrl,
  useFlowStore,
} from '../store/flowStore'

const embedTransition = {
  duration: STAGE_EMBED_HANDOFF_MS / 1000,
  ease: 'easeOut' as const,
}

type WaypointStepsScreenProps = {
  polarHash: string
}

export default function WaypointStepsScreen({ polarHash }: WaypointStepsScreenProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const { stageEmbedVisible } = useLunaStageEmbed()
  const embedSrc = stageEmbedUrl(polarHash)

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
