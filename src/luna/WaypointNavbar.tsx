import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { FLOW_SIDEBAR_ITEMS } from '../flowSidebarItems'
import {
  FLOW_STEPS,
  useFlowStep,
  useFlowStore,
  type FlowStepId,
} from '../store/flowStore'
import { WaypointManagerMenu } from './WaypointManagerMenu'
import './waypointSidebar.css'

const PRIMARY_NAV_STEPS: {
  className: string
  label: string
  flowId: FlowStepId
}[] = [
  { className: 'step-1', label: 'Step One', flowId: FLOW_STEPS[0]?.id ?? '1' },
  { className: 'step-2', label: 'Step Two', flowId: FLOW_STEPS[1]?.id ?? '2' },
  { className: 'step-3', label: 'Step Three', flowId: FLOW_STEPS[2]?.id ?? '3' },
  { className: 'step-4', label: 'Step Four', flowId: FLOW_STEPS[3]?.id ?? '4' },
]

const MANAGER_ONLY_STEPS = new Set<FlowStepId>(['5', '6'])

type StepTabProps = {
  className: string
  label: string
  flowId: FlowStepId
  isCurrent: boolean
  onSelect: (id: FlowStepId) => void
}

function StepTab({ className, label, flowId, isCurrent, onSelect }: StepTabProps) {
  return (
    <button
      type="button"
      className={`step-tab ${className}`}
      aria-current={isCurrent ? 'step' : undefined}
      onClick={() => onSelect(flowId)}
    >
      <span className="step-label">
        <span className="step-label-inner">
          <span className="step-diamond" aria-hidden="true" />
          <span className="step-label-text">{label}</span>
        </span>
      </span>
    </button>
  )
}

export function WaypointNavbar() {
  const { step } = useFlowStep()
  const goToStepById = useFlowStore((s) => s.goToStepById)
  const [managerOpen, setManagerOpen] = useState(false)
  const managerRef = useRef<HTMLDivElement>(null)
  const managerPanelId = useId()

  const isManagerGroupActive = MANAGER_ONLY_STEPS.has(step.id)

  const selectStep = useCallback(
    (id: FlowStepId) => {
      goToStepById(id)
      setManagerOpen(false)
    },
    [goToStepById],
  )

  useEffect(() => {
    if (!managerOpen) return
    const onPointerDown = (event: PointerEvent) => {
      const root = managerRef.current
      if (root && !root.contains(event.target as Node)) {
        setManagerOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setManagerOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [managerOpen])

  const onManagerTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setManagerOpen((open) => !open)
    }
    if (event.key === 'ArrowDown' && !managerOpen) {
      event.preventDefault()
      setManagerOpen(true)
    }
  }

  return (
    <div className="luna-absolute-pad">
      <div className="waypoint-navbar">
        <div className="navbar-left">
          <div className="navbar-left-brand">
            <a
              className="navbar-left-label"
              href="https://www.atencium-ui.com/"
            >
              atencium-ui.com
            </a>
          </div>
        </div>
        <div className="navbar-steps">
          {PRIMARY_NAV_STEPS.map(({ className, label, flowId }) => (
            <StepTab
              key={className}
              className={className}
              label={label}
              flowId={flowId}
              isCurrent={step.id === flowId}
              onSelect={selectStep}
            />
          ))}
          <div
            ref={managerRef}
            className={`step-tab-dropdown navbar-manager-dropdown${
              managerOpen ? ' is-open' : ''
            }`}
          >
            <button
              type="button"
              className={`step-tab step-manager step-tab-dropdown__trigger${
                isManagerGroupActive ? ' is-active' : ''
              }`}
              aria-expanded={managerOpen}
              aria-haspopup="menu"
              aria-controls={managerPanelId}
              aria-current={isManagerGroupActive ? 'step' : undefined}
              onClick={() => setManagerOpen((open) => !open)}
              onKeyDown={onManagerTriggerKeyDown}
            >
              <span className="step-label step-label--manager">
                <span className="navbar-manager-trigger">
                  <span className="navbar-manager-label">
                    <span className="navbar-manager-label-line">Waypoint</span>
                    <span className="navbar-manager-label-line">Manager</span>
                  </span>
                  <span className="navbar-manager-icon" aria-hidden="true">
                    <span className="navbar-manager-icon__plus" />
                  </span>
                </span>
              </span>
            </button>
            {managerOpen ? (
              <div
                id={managerPanelId}
                className="step-tab-dropdown__panel"
                role="menu"
              >
                <WaypointManagerMenu
                  items={FLOW_SIDEBAR_ITEMS}
                  activeId={step.id}
                  onSelect={selectStep}
                />
              </div>
            ) : null}
          </div>
        </div>
        <div className="navbar-right" />
      </div>
    </div>
  )
}
