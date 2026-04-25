import { useEffect, useRef } from 'react'
import 'stepscreen/src/styles.css'

const ARTBOARD_WIDTH = 2560
const ARTBOARD_HEIGHT = 1440

type WaypointStepsScreenProps = {
  polarHash: string
}

export default function WaypointStepsScreen({ polarHash }: WaypointStepsScreenProps) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void import('stepscreen')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash !== polarHash) {
      window.location.hash = polarHash
    }
  }, [polarHash])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let rafId = 0
    const scheduleScale = () => {
      if (rafId !== 0) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const frame = host.querySelector<HTMLElement>('#scale-frame')
        const board = host.querySelector<HTMLElement>('#artboard')
        if (!frame || !board) return

        const width = host.clientWidth
        const height = host.clientHeight
        if (width <= 0 || height <= 0) return

        const scale = Math.min(width / ARTBOARD_WIDTH, height / ARTBOARD_HEIGHT)
        board.style.transform = `scale(${scale})`
        frame.style.width = `${Math.ceil(ARTBOARD_WIDTH * scale)}px`
        frame.style.height = `${Math.ceil(ARTBOARD_HEIGHT * scale)}px`
      })
    }

    scheduleScale()

    const ro = new ResizeObserver(scheduleScale)
    ro.observe(host)
    window.addEventListener('resize', scheduleScale)

    const frame = host.querySelector<HTMLElement>('#scale-frame')
    const board = host.querySelector<HTMLElement>('#artboard')
    const mo =
      frame && board
        ? new MutationObserver(scheduleScale)
        : null
    if (frame && mo) mo.observe(frame, { attributes: true, attributeFilter: ['style'] })
    if (board && mo) mo.observe(board, { attributes: true, attributeFilter: ['style'] })

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId)
      ro.disconnect()
      mo?.disconnect()
      window.removeEventListener('resize', scheduleScale)
    }
  }, [])

  return (
    <div ref={hostRef} className="viewport">
      <div id="scale-frame" className="scale-frame">
        <div id="artboard" className="artboard">
          <div id="app" className="app" />
        </div>
      </div>
    </div>
  )
}
