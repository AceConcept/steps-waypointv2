import { LunaSidebar } from 'waypoint-sidebar/src/luna-sidebar/index.js'
import { LunaChrome } from './luna/LunaChrome'
import WaypointStepsScreen from './steps/WaypointStepsScreen'
import { FLOW_SIDEBAR_ITEMS } from './flowSidebarItems'
import { POLAR_SYS_HASH, useFlowStep, useFlowStore } from './store/flowStore'
import './App.css'

function App() {
  const { step, stepIndex } = useFlowStep()
  const goToStepById = useFlowStore((s) => s.goToStepById)

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('atencium-step', String(stepIndex + 1))
    } catch {
      /* ignore */
    }
  }

  return (
    <LunaChrome
      footerBackgroundUrl="/news_bg.jpg"
      sidebar={({ expanded, onExpandedChange }) => (
        <LunaSidebar
          items={FLOW_SIDEBAR_ITEMS}
          expanded={expanded}
          onExpandedChange={onExpandedChange}
          initialActiveId={step.id}
          onActiveItemChange={(id: string) => {
            const hit = FLOW_SIDEBAR_ITEMS.find((item) => item.id === id)
            if (hit) goToStepById(hit.id)
          }}
          railLabel="WAYPOINT GUIDE"
        />
      )}
    >
      <div className="luna-stage luna-stage--fill">
        <WaypointStepsScreen polarHash={POLAR_SYS_HASH[step.id]} />
      </div>
    </LunaChrome>
  )
}

export default App
