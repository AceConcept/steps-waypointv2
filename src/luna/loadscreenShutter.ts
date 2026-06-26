/** html class set in index.html before React — blocks #root until shutter finishes. */
export const LOADSCREEN_HTML_CLASS = 'loadscreen-active'

export function lockAppBehindShutter() {
  document.documentElement.classList.add(LOADSCREEN_HTML_CLASS)
}

export function unlockAppBehindShutter() {
  document.documentElement.classList.remove(LOADSCREEN_HTML_CLASS)
}
