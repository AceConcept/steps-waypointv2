/**
 * Sidebar titles + body copy — ordered for flow ids: 1–6.
 * (IDs stay wired to URL hashes; labels here are generic for the shell.)
 */

export const STEP_TITLES = [
  'Step 1',
  'Step 2',
  'Step 3',
  'Step 4',
  'Step 5',
  'Step 6',
] as const

export const STEP_DESCRIPTIONS = [
  'The left story column introduces each step—title and description beside the live app in the center, kept in sync as you move through the flow.',
  'Each step is displayed within the waypoint sidebar. If you are lost you can easily find a waypoint.',
  'Clicking start will jump you ahead in the flow.',
  'Move back and forth at anytime.',
  'No more need for design app prototypes, moving onwards towards code based interactable flows.',
  'Made with Vite, React, Typescript, JSON.',
] as const
