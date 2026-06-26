# Waypoint Manager dropdown animation

Documents the open/close animation added to the **Waypoint Manager** navbar dropdown so it no longer appears instantly.

Uses **Framer Motion** (`framer-motion` is already a project dependency).

---

## Before vs after

| | Before | After |
|---|--------|-------|
| Panel mount | Instant show/hide (`{managerOpen ? <div>…` ) | Fade + slide with enter/exit |
| Library | Plain React | `AnimatePresence` + `motion.div` |
| Close | Unmounts immediately | Exit animation plays, then unmounts |

---

## Files to touch

| File | Change |
|------|--------|
| `src/luna/WaypointNavbar.tsx` | Import Framer Motion; wrap panel in `AnimatePresence` + `motion.div` |
| `src/luna/lunaChrome.css` | `transform-origin` + `will-change` on manager panel |

---

## 1. `WaypointNavbar.tsx`

### Import

```tsx
import { AnimatePresence, motion } from 'framer-motion'
```

### Replace instant panel with animated panel

**Before:**

```tsx
{managerOpen ? (
  <div
    id={managerPanelId}
    className="step-tab-dropdown__panel"
    role="menu"
  >
    <WaypointManagerMenu … />
  </div>
) : null}
```

**After:**

```tsx
<AnimatePresence>
  {managerOpen ? (
    <motion.div
      id={managerPanelId}
      className="step-tab-dropdown__panel"
      role="menu"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <WaypointManagerMenu … />
    </motion.div>
  ) : null}
</AnimatePresence>
```

### Motion values

| Prop | Value | Effect |
|------|-------|--------|
| `initial` | `opacity: 0`, `y: -10` | Starts slightly above final position, invisible |
| `animate` | `opacity: 1`, `y: 0` | Settles into place |
| `exit` | `opacity: 0`, `y: -8` | Collapses upward on close |
| `transition.duration` | `0.28` | Matches plus-icon rotate timing (`0.28s` in CSS) |
| `transition.ease` | `[0.22, 1, 0.36, 1]` | Smooth ease-out cubic-bezier |

`AnimatePresence` must wrap the conditional so the **exit** animation runs before unmount.

---

## 2. `lunaChrome.css`

Add to the existing manager panel rule:

```css
.luna-canvas-row > .luna-absolute-pad .navbar-steps .navbar-manager-dropdown .step-tab-dropdown__panel {
  /* …existing layout (top, right, width, background, shadow)… */
  transform-origin: top right;
  will-change: transform, opacity;
}
```

- **`transform-origin: top right`** — motion feels anchored to the manager trigger (panel is `right: 5rem` aligned).
- **`will-change`** — optional hint for smoother compositing during the short animation.

---

## Verification

- [ ] Click **Waypoint Manager** — panel fades in and slides down (~280ms).
- [ ] Click outside or **Escape** — panel fades out and slides up before disappearing.
- [ ] Plus icon still rotates 45° on open (unchanged CSS).
- [ ] `npm run build` passes.

---

## Tuning

| Goal | Adjust |
|------|--------|
| Slower | Increase `duration` (e.g. `0.36`) |
| Snappier | Decrease `duration` (e.g. `0.2`) |
| More travel | Increase `y` in `initial` / `exit` (e.g. `-16`) |
| Scale instead of slide | Use `initial={{ opacity: 0, scale: 0.96 }}` with same `transform-origin` |

---

*Added in the waypoint-v2 session after the Waypoint Manager navbar port.*
