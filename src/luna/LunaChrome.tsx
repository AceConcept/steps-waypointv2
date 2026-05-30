import { AnimatePresence, motion } from 'framer-motion'
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { stageEmbedUrlForStep, useFlowStep } from '../store/flowStore'
import { getCanvasContainScale } from 'waypoint-sidebar/src/luna-sidebar/canvasScale.js'
import {
  applyLunaDocumentScale,
  getLunaScaleViewportSize,
  resetLunaDocumentScale,
} from './applyLunaDocumentScale'
import {
  LunaStageEmbedContext,
  STAGE_EMBED_HANDOFF_MS,
} from './LunaStageEmbedContext'
import { StageEmbedFrame } from './StageEmbedFrame'
import { LunaGutterVideoBg } from './LunaGutterVideoBg'
import { WaypointNavbar } from './WaypointNavbar'
import './lunaChrome.css'

type LunaChromeProps = {
  children?: ReactNode
  footerBackgroundUrl?: string
}

export function LunaChrome({ children, footerBackgroundUrl }: LunaChromeProps) {
  const layoutRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [stageEmbedVisible, setStageEmbedVisible] = useState(true)
  const [fullscreenEmbedMounted, setFullscreenEmbedMounted] = useState(false)
  const { step } = useFlowStep()
  const fullscreenEmbedSrc = stageEmbedUrlForStep(step.id)

  const openFullscreen = useCallback(() => {
    setFullscreenOpen(true)
    setStageEmbedVisible(false)
  }, [])

  const closeFullscreen = useCallback(() => {
    setFullscreenEmbedMounted(false)
    setFullscreenOpen(false)
  }, [])

  useEffect(() => {
    if (!fullscreenOpen || stageEmbedVisible) {
      if (!fullscreenOpen) {
        setFullscreenEmbedMounted(false)
      }
      return
    }
    const timer = window.setTimeout(
      () => setFullscreenEmbedMounted(true),
      STAGE_EMBED_HANDOFF_MS,
    )
    return () => window.clearTimeout(timer)
  }, [fullscreenOpen, stageEmbedVisible])

  const onFullscreenOverlayExitComplete = useCallback(() => {
    if (!fullscreenOpen) {
      setStageEmbedVisible(true)
    }
  }, [fullscreenOpen])

  useLayoutEffect(() => {
    const update = () => {
      const size = getLunaScaleViewportSize()
      if (size.width <= 0 || size.height <= 0) {
        setScale(1)
        setViewport(size)
        return
      }
      const nextScale = getCanvasContainScale(size.width, size.height)
      setViewport(size)
      setScale(nextScale)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useLayoutEffect(() => {
    if (viewport.width <= 0 || viewport.height <= 0) return
    applyLunaDocumentScale(scale, viewport)
  }, [scale, viewport])

  useLayoutEffect(() => {
    return () => resetLunaDocumentScale()
  }, [])

  useLayoutEffect(() => {
    if (!fullscreenOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreenOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [fullscreenOpen])

  const footerSlotStyle =
    footerBackgroundUrl != null && footerBackgroundUrl !== ''
      ? { backgroundImage: `url(${footerBackgroundUrl})` }
      : undefined

  return (
    <LunaStageEmbedContext.Provider value={{ fullscreenOpen, stageEmbedVisible }}>
    <div ref={layoutRef} className="luna-root">
      <div className="luna-canvas-row">
        <WaypointNavbar />
        <div className="waypoint-horizontal">
          <div className="luna-space-left">
            <LunaGutterVideoBg />
            <div className="content-pos">
              <div className="graphic">
                <div className="graphic-positioner">
                  <img
                    className="graphic-img"
                    src="/bg-img/story-graphic.svg"
                    alt=""
                    aria-hidden
                  />
                </div>
              </div>
              <div className="content">
              <div className="content-flex-strt">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.id}
                    className="content-story"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                  <div className="content-story-heading">
                    <span className="content-story-bar" aria-hidden="true" />
                    <h2 className="content-story-title">{step.title}</h2>
                  </div>
                  <div className="description">
                    <p className="description-text">{step.body}</p>
                  </div>
                  </motion.div>
                </AnimatePresence>
                <div className="content-buttons">
                  <button
                    type="button"
                    className="content-button content-button--fullscreen"
                    onClick={openFullscreen}
                  >
                    Full screen
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
          <div className="luna-center-column">
            <div className="luna-design-surface">
              {children}
            </div>
          </div>
          <div className="luna-space-right" aria-hidden="true">
            <LunaGutterVideoBg />
          </div>
        </div>
      </div>
      <div className="luna-footer-slot" style={footerSlotStyle}>
        <div className="luna-footer-artboard" aria-hidden="true" />
      </div>

      <AnimatePresence onExitComplete={onFullscreenOverlayExitComplete}>
        {fullscreenOpen ? (
          <motion.div
            className="luna-fullscreen-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Full screen preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <button
              type="button"
              className="luna-fullscreen-overlay__backdrop"
              aria-label="Close full screen"
              onClick={closeFullscreen}
            />
            <div className="luna-fullscreen-overlay__layout">
              <div className="luna-fullscreen-overlay__frame">
                {fullscreenEmbedMounted ? (
                  <motion.div
                    className="luna-fullscreen-overlay__embed-wrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                  >
                    <StageEmbedFrame
                      className="luna-fullscreen-overlay__embed"
                      src={fullscreenEmbedSrc}
                      title="Full screen steps"
                    />
                  </motion.div>
                ) : null}
              </div>
              <button
                type="button"
                className="luna-fullscreen-overlay__close"
                aria-label="Close"
                onClick={closeFullscreen}
              >
                <span className="luna-fullscreen-overlay__close-icon" aria-hidden="true">
                  ×
                </span>
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
    </LunaStageEmbedContext.Provider>
  )
}
