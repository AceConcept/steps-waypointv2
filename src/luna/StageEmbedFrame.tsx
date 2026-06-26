import { useEffect, useRef } from 'react'
import { postStageEmbedStep, registerStageEmbedFrame } from '../store/stageEmbedBridge'
import { useFlowStore } from '../store/flowStore'

type StageEmbedFrameProps = {
  src: string
  title: string
  className?: string
  onEmbedLoad?: () => void
}

/** iframe points at steps-project-slot; src updates navigate #/1 … #/6 without remounting. */
export function StageEmbedFrame({
  src,
  title,
  className,
  onEmbedLoad,
}: StageEmbedFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    registerStageEmbedFrame(iframeRef.current)
    return () => registerStageEmbedFrame(null)
  }, [])

  useEffect(() => {
    const frame = iframeRef.current
    if (!frame) return
    try {
      const target = new URL(src, window.location.href).href
      if (frame.src !== target) {
        frame.src = src
      }
    } catch {
      frame.src = src
    }
  }, [src])

  return (
    <iframe
      ref={iframeRef}
      className={className}
      src={src}
      title={title}
      allow="fullscreen"
      loading="eager"
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={() => {
        const { stepIndex } = useFlowStore.getState()
        postStageEmbedStep(stepIndex + 1)
        onEmbedLoad?.()
      }}
    />
  )
}
