import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import {
  FLOW_STEPS,
  useFlowStep,
  useFlowStore,
  type FlowStepId,
} from '../store/flowStore'

const PRIMARY_NAV_STEPS: {
  className: string
  label: string
  flowId: FlowStepId
}[] = [
  { className: 'step-1', label: 'Step One', flowId: FLOW_STEPS[0]?.id ?? '1' },
  { className: 'step-2', label: 'Step Two', flowId: FLOW_STEPS[1]?.id ?? '2' },
  { className: 'step-3', label: 'Step Three', flowId: FLOW_STEPS[2]?.id ?? '3' },
]

const STEP_FOUR_DROPDOWN: {
  className: string
  label: string
  flowId: FlowStepId
}[] = [
  { className: 'step-4', label: 'Step Four', flowId: '4' },
  { className: 'step-5', label: 'Step Five', flowId: '5' },
  { className: 'step-6', label: 'Step Six', flowId: '6' },
]

const STEP_FOUR_GROUP = new Set<FlowStepId>(['4', '5', '6'])

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
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownPanelId = useId()

  const isStepFourGroupActive = STEP_FOUR_GROUP.has(step.id)

  const selectStep = useCallback(
    (id: FlowStepId) => {
      goToStepById(id)
      setDropdownOpen(false)
    },
    [goToStepById],
  )

  useEffect(() => {
    if (!dropdownOpen) return
    const onPointerDown = (event: PointerEvent) => {
      const root = dropdownRef.current
      if (root && !root.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDropdownOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [dropdownOpen])

  const onDropdownTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setDropdownOpen((open) => !open)
    }
    if (event.key === 'ArrowDown' && !dropdownOpen) {
      event.preventDefault()
      setDropdownOpen(true)
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
            ref={dropdownRef}
            className={`step-tab-dropdown${dropdownOpen ? ' is-open' : ''}`}
          >
            <button
              type="button"
              className={`step-tab step-4 step-tab-dropdown__trigger${
                isStepFourGroupActive ? ' is-active' : ''
              }`}
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              aria-controls={dropdownPanelId}
              aria-current={isStepFourGroupActive ? 'step' : undefined}
              onClick={() => setDropdownOpen((open) => !open)}
              onKeyDown={onDropdownTriggerKeyDown}
            >
              <span className="step-label">
                <span className="step-label-inner">
                  <span className="step-diamond" aria-hidden="true" />
                  <span className="step-label-text">More steps</span>
                </span>
              </span>
            </button>
            {dropdownOpen ? (
              <div
                id={dropdownPanelId}
                className="step-tab-dropdown__panel"
                role="menu"
              >
                {STEP_FOUR_DROPDOWN.map(({ className, label, flowId }) => (
                  <StepTab
                    key={className}
                    className={className}
                    label={label}
                    flowId={flowId}
                    isCurrent={step.id === flowId}
                    onSelect={selectStep}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="navbar-right" />
      </div>
    </div>
  )
}
