import { createContext, useContext } from 'react'

/** Stage iframe fade-out before fullscreen iframe mounts (avoids dual embed). */
export const STAGE_EMBED_HANDOFF_MS = 280

type LunaStageEmbedContextValue = {
  fullscreenOpen: boolean
  stageEmbedVisible: boolean
}

export const LunaStageEmbedContext = createContext<LunaStageEmbedContextValue>({
  fullscreenOpen: false,
  stageEmbedVisible: true,
})

export function useLunaStageEmbed(): LunaStageEmbedContextValue {
  return useContext(LunaStageEmbedContext)
}
