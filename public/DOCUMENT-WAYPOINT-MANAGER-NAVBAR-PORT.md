# Waypoint Manager → Navbar Port Guide


Use this document to apply the same changes from the **waypoint-v2.1** session to an **older Waypoint** checkout of that repo that still uses the **right-hand sidebar** (`WaypointSidebar` + rail). The goal is:

1. **Remove** the expandable right sidebar.
2. **Move** step navigation (all 6 steps) into a **navbar dropdown** — the 5th slot in `.navbar-steps`, labeled **Waypoint Manager**.
3. Keep **Steps 1–4** as direct navbar tabs; steps **5–6** are reachable only via the manager menu (same as the old “more steps” pattern, but with sidebar UI inside the dropdown).

All sizes assume **1rem = 16px** at the design root (Luna document scaling).

---

## Before vs after

| Area | Old | New |
|------|-----|-----|
| Step nav in navbar | Often 3 tabs + “More steps” dropdown (4–6) | **4 tabs** (Step One–Four) + **Waypoint Manager** dropdown |
| Right rail / drawer | `WaypointSidebar` in `LunaChrome` | **Removed** |
| Step list UI | Sidebar preview cards + hero copy | **Preview list only** (thumbs + step title, no descriptions) |
| Navbar width for steps | Fixed `120rem` (or 4×30rem) | **`--luna-center-w`** (matches center stage width) |
| Right gutter column | `--sidebar-collapsed` width | **`width: 0`**, `flex: 10 10 0` |
| `navbar-right` | Reserved rail width | **Restored** with `width: 0` (layout spacer) |

---

## Files to touch

| Action | File |
|--------|------|
| **Create** | `src/luna/WaypointManagerMenu.tsx` |
| **Rewrite / heavy edit** | `src/luna/WaypointNavbar.tsx` |
| **Edit** | `src/luna/LunaChrome.tsx` |
| **Edit** | `src/App.tsx` |
| **Edit** | `src/luna/lunaChrome.css` |
| **Edit** | `src/App.css` |
| **Edit** | `src/luna/waypointSidebar.css` (active bar + shared card styles; still imported for menu) |
| **Asset** | `public/plus.svg` (white plus on transparent; colored via CSS mask) |
| **Stop using** | `WaypointSidebar` in `App.tsx` (file can remain unused) |

---

## 1. `App.tsx` — remove sidebar

**Before (pattern):**

```tsx
<LunaChrome
  footerBackgroundUrl="/news_bg.jpg"
  sidebar={({ expanded, onExpandedChange }) => (
    <div className="waypoint-sidebar">
      <WaypointSidebar
        items={FLOW_SIDEBAR_ITEMS}
        expanded={expanded}
        onExpandedChange={onExpandedChange}
        initialActiveId={step.id}
        onActiveItemChange={(id) => { /* goToStepById */ }}
      />
    </div>
  )}
>
  <WaypointStepsScreen />
</LunaChrome>
```

**After:**

```tsx
<LunaChrome footerBackgroundUrl="/news_bg.jpg">
  <WaypointStepsScreen />
</LunaChrome>
```

Remove imports: `WaypointSidebar`, `FLOW_SIDEBAR_ITEMS` (if only used for sidebar).

---

## 2. `LunaChrome.tsx` — drop sidebar shell

Remove from props/types:

- `sidebar: (controls) => ReactNode`
- `LunaChromeSidebarControls`
- `expanded` / `setExpanded` state
- `luna-canvas-row--drawer-open` class toggles
- Drawer **scrim** (`luna-canvas-row-scrim`)
- `LunaCanvasScaleContext.Provider` wrapping sidebar only (remove import if unused)
- `useLayoutEffect` that sets `--luna-shell-design-w` from `SIDEBAR_EXPANDED_REM` / `SIDEBAR_COLLAPSED_REM`
- Render: `{sidebar({ expanded, onExpandedChange })}` and `.waypoint-sidebar` wrapper

Keep: `WaypointNavbar`, main row, center stage, footer, fullscreen overlay.

---

## 3. New file: `WaypointManagerMenu.tsx`

Extract the **preview list** from `WaypointSidebar` (the scrollable cards), not the hero / rail / drawer.

- Props: `items: FlowSidebarItem[]`, `activeId`, `onSelect(id)`
- Reuse classes: `wp-sidebar__preview`, `wp-sidebar__card`, etc.
- **Do not render** `.wp-sidebar__card-desc` (no descriptions, no `-` placeholder).
- Wrap in `.navbar-manager-menu` for scoped overrides in `App.css`.

See current repo: `src/luna/WaypointManagerMenu.tsx`.

---

## 4. `WaypointNavbar.tsx` — structure

### Step config

```ts
const PRIMARY_NAV_STEPS = [
  { className: 'step-1', label: 'Step One', flowId: '1' },
  { className: 'step-2', label: 'Step Two', flowId: '2' },
  { className: 'step-3', label: 'Step Three', flowId: '3' },
  { className: 'step-4', label: 'Step Four', flowId: '4' },
]
const MANAGER_ONLY_STEPS = new Set(['5', '6']) // optional: highlight manager tab on these steps
```

Remove old `STEP_FOUR_DROPDOWN` / “More steps” fourth dropdown if present.

### DOM order inside `.waypoint-navbar`

```
.navbar-left          (brand link)
.navbar-steps
  StepTab × 4
  .navbar-manager-dropdown.step-tab-dropdown
    button.step-manager.step-tab-dropdown__trigger
    .step-tab-dropdown__panel (when open)
      WaypointManagerMenu
.navbar-right         (empty div — layout spacer)
```

### Manager trigger markup (no step diamond)

```tsx
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
```

### Behavior (keep from old dropdown pattern)

- `managerOpen` state + click outside + `Escape` to close
- `selectStep(id)` → `goToStepById(id)` + close menu
- `aria-expanded`, `aria-haspopup`, `role="menu"` on panel
- Import `./waypointSidebar.css` for card list styles
- Import `FLOW_SIDEBAR_ITEMS` from `../flowSidebarItems`

---

## 5. `public/plus.svg`

Minimal plus (24×24 viewBox). Icon color is **not** in the SVG for the navbar — use CSS mask + `background-color: #d9d9d9`.

---

## 6. `lunaChrome.css` — tokens (`.luna-root`)

Add/update:

```css
--luna-horizontal-pad-bottom: 10.9375rem; /* 175px — was ~229px in older builds */
--luna-center-slot: 0.7875; /* 2016×1134 center on 2560×1440 canvas, 16:9 */
--luna-center-w: calc(var(--canvas-w) * var(--luna-center-slot));
--luna-navbar-step-w: calc(var(--luna-center-w) / 5);
```

Remove `--sidebar-collapsed` from app tokens if present; use `0` width on gutters instead (below).

**Center column** — use shared width:

```css
.luna-canvas-row .luna-center-column {
  width: var(--luna-center-w);
  height: calc(var(--canvas-h) * var(--luna-center-slot));
  /* ... */
}
```

---

## 7. `lunaChrome.css` — navbar steps width

**Replace** fixed `120rem` / `30rem` per tab:

```css
.luna-canvas-row > .luna-absolute-pad .navbar-steps {
  flex: 0 0 var(--luna-center-w);
  width: var(--luna-center-w);
}

.luna-canvas-row > .luna-absolute-pad .navbar-steps > .step-tab,
.luna-canvas-row > .luna-absolute-pad .navbar-steps > .step-tab-dropdown {
  flex: 0 0 var(--luna-navbar-step-w);
  width: var(--luna-navbar-step-w);
}
```

---

## 8. `lunaChrome.css` — Waypoint Manager trigger

| Rule | Values |
|------|--------|
| `.navbar-manager-dropdown` | `border-right: 0` (no divider on last tab) |
| `.step-tab.step-manager` | `display: flex`, `justify-content: flex-start`, `padding: 0 5rem 0 0` (80px **right** inner padding) |
| `.step-tab.step-manager.is-active` | `background: transparent` (no dark active wash) |
| Exclude manager from generic hover/active bg | `:not(.step-manager)` on shared `.step-tab:hover` / `.is-active` rules |
| `.navbar-manager-label` | `font-size: 1.25rem`, `font-weight: 700`, `line-height: 1.5rem`, `color: rgba(0,0,0,0.5)`, right-aligned stack |
| `.navbar-manager-trigger` | flex row, `justify-content: flex-end`, `gap: 1.5rem` (24px between text and square) |
| `.navbar-manager-icon` | `4rem × 4rem`, `background: #393939`, transition on bg |
| `.navbar-manager-icon__plus` | `1.5rem × 1.5rem`, `background-color: #d9d9d9`, `mask: url('/plus.svg')` |
| **Open** `.navbar-manager-dropdown.is-open .navbar-manager-icon` | `background: #4a4a4a` |
| **Open** `.navbar-manager-icon__plus` | `transform: rotate(45deg)` (reads as X), `transition: transform 0.28s ease` |

No hover background on manager label (removed color change to `#000`).

---

## 9. `lunaChrome.css` — dropdown panel

```css
.luna-canvas-row > .luna-absolute-pad .navbar-steps .navbar-manager-dropdown .step-tab-dropdown__panel {
  top: calc(100% - 1.25rem);   /* 20px up — overlaps navbar bottom slightly */
  left: auto;
  right: 5rem;                 /* 80px — lines up with trigger padding-right */
  width: 43.1875rem;           /* old drawer width minus rail */
  max-height: calc(var(--canvas-h) - var(--luna-horizontal-pad-top) - 2rem);
  overflow: hidden;
  box-sizing: border-box;
  background: var(--preview-list-bg, #e4e3e3);
  /* no padding-bottom */
}
```

Panel is **right-aligned** to the manager slot with `right: 5rem`, not `left: 0`.

---

## 10. `lunaChrome.css` — layout cleanup

### Restore empty `navbar-right`

```html
<div className="navbar-right" />
```

```css
.luna-canvas-row > .luna-absolute-pad .navbar-right {
  flex: 10 10 0;
  width: 0;
  min-width: 0;
}
```

### Right gutter (no sidebar rail)

```css
.luna-space-right {
  flex: 10 10 0;
  width: 0;
  min-width: 0;
}
```

### Remove from `lunaChrome.css` (if present)

- `.luna-canvas-row > .waypoint-sidebar` dock rules
- `.luna-canvas-row-scrim`
- `.luna-canvas-row--drawer-open`
- `.luna-design-surface--drawer-open`

---

## 11. `App.css` — manager menu overrides

Scoped under `.navbar-manager-menu`:

```css
/* List horizontal inset */
.luna-canvas-row .navbar-manager-menu .wp-sidebar__preview-steps {
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Card padding */
.luna-canvas-row .navbar-manager-menu .wp-sidebar__card {
  padding: 0.65rem 1.25rem 0.65rem 1rem;
  transition: background-color 0.2s ease;
}

.luna-canvas-row .navbar-manager-menu .wp-sidebar__card:hover {
  background: #d5d4d4; /* darker than #e4e3e3 list bg */
}

.luna-canvas-row .navbar-manager-menu .wp-sidebar__card.is-active:hover {
  background: var(--sidebar-active);
}

.luna-canvas-row .navbar-manager-menu .wp-sidebar__card-step {
  font-size: 1.25rem;
  font-weight: 400;
  text-transform: none;
}

/* Square thumbs */
.luna-root .navbar-manager-menu .wp-sidebar__thumb,
.luna-root .navbar-manager-menu .wp-sidebar__thumb-image {
  border-radius: 0;
}
```

**Remove** any rules that hide description text and inject `'-'` via `::after` on `.wp-sidebar__card-desc`.

---

## 12. `waypointSidebar.css` — active indicator bar

Update active white bar to match thumb height (used by manager menu cards):

```css
.wp-sidebar__card.is-active::before {
  left: 1.25rem;
  top: 50%;
  width: 0.5625rem;
  height: 7.75rem; /* same as .wp-sidebar__card-media */
  transform: translateY(-50%);
  /* remove top/bottom: 0.75rem stretch */
}

.wp-sidebar__card.is-active .wp-sidebar__card-media {
  margin-left: 2.0625rem;
}
```

If the old repo still uses `WaypointSidebar`, this changes the sidebar too unless you duplicate bar rules under `.navbar-manager-menu` only.

---

## 13. Mapping from old sidebar → navbar

| Old `WaypointSidebar` | New location |
|----------------------|--------------|
| Rail toggle + label | **Removed** |
| Hero image + title + description | **Removed** from dropdown |
| Preview card list | `WaypointManagerMenu` |
| `onActiveItemChange` / `goToStepById` | `WaypointManagerMenu` `onSelect` |
| `FLOW_SIDEBAR_ITEMS` | Same data source |
| Drawer width `43.1875rem` | Dropdown panel `width` |
| Rail `6.125rem` | `navbar-right` + `luna-space-right` at `0` width |

---

## 14. Optional related tweaks (same session)

These are **not** required for the manager port but were changed in the same branch:

- **Iframe bottom shadow** — `App.css` `::after` on `.stepscreen-embed-shell` (optional).
- **`--luna-center-slot: 0.7875`** — center stage 2016×1134; navbar steps follow via `--luna-center-w`.
- **Git** — `origin` remote removed (unrelated to UI).

---

## 15. Verification checklist

- [ ] No `WaypointSidebar` rendered; no right drawer or scrim.
- [ ] Navbar shows **Step One … Step Four** + **Waypoint Manager** (5 columns, equal width).
- [ ] Manager: stacked **Waypoint** / **Manager**, right-aligned; **64×64** `#393939` square; **24×24** `#d9d9d9` plus.
- [ ] Click manager: panel opens, plus rotates **45°**, square `#4a4a4a`; **no** gray button background.
- [ ] Panel aligned **`right: 5rem`** under slot; list shows **6 steps** with thumbs; **no** description lines.
- [ ] Card hover slightly darker; active row has white bar height = thumb.
- [ ] Steps 5–6 navigable from menu; tabs 1–4 still work.
- [ ] `navbar-right` present; right gutter does not reserve old rail width.

---

## 16. Quick diff mindset for an LLM porting agent

1. Delete sidebar wiring in `App.tsx` + `LunaChrome.tsx`.
2. Add `WaypointManagerMenu.tsx` + rewrite `WaypointNavbar.tsx` manager block.
3. Copy CSS sections **7–12** into `lunaChrome.css` / `App.css` / `waypointSidebar.css`.
4. Add `public/plus.svg`.
5. Search codebase for `waypoint-sidebar`, `wp-sidebar.is-expanded`, `SIDEBAR_EXPANDED`, `More steps` — remove or redirect.
6. Run build: `npm run build`.

---

*Generated from waypoint-v2.1 session changes (sidebar → navbar Waypoint Manager).*
