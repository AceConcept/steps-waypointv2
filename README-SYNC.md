# Syncing the Luna sidebar with another GitHub project

Waypoint Manager currently keeps **`luna-sidebar/`** inside this repository. GitHub only tracks one history here, so edits in a **separate** sidebar repo do not appear in this project until you **link** the two repos and **pull** updates (or automate that step).

Use this guide when the sidebar is the **source of truth** in another GitHub repository and you want this app to consume it.

---

## Option A — `npm` dependency from the other GitHub repo (recommended for “library + app”)

### 1. Sidebar repository

Add a root **`package.json`** with:

- A package name, e.g. `"name": "@aceconcept/luna-sidebar"`
- Entry points: **`main`**, **`module`**, and/or **`exports`** pointing at your built or source entry (match how you ship JSX—many internal packages ship source and let the app transpile)
- **`peerDependencies`**: `"react"`, `"react-dom"` (versions compatible with this app)
- **`files`**: which paths are included when the package is installed from git

### 2. This repository (Waypoint Manager)

1. **Stop editing** the vendored copy under `luna-sidebar/` here (or remove that folder once the dependency works).
2. In **`package.json`**, add a dependency on the other repo, for example:

```json
"luna-sidebar": "github:AceConcept/YourSidebarRepo#main"
```

Replace with your real **`owner/repo`**, branch, or a **tag** (e.g. `#v1.2.0`) if you want pinned, reviewable upgrades.

3. Update imports from paths like `'../luna-sidebar/index.js'` to the package name, e.g. **`'luna-sidebar'`**. Adjust **Vite** and **TypeScript** (`paths` / `moduleResolution`) if the package needs special handling.

### 3. Day-to-day sync

After changes are **pushed** to the sidebar repo:

```bash
npm update luna-sidebar
```

Or change the `#branch` / tag in `package.json`, then run **`npm install`**. Commit **`package-lock.json`** (and any `package.json` change) in Waypoint Manager.

**Note:** Git does **not** auto-update this repo when the other repo is pushed. That step is manual unless you add CI (below).

---

## Option B — Git submodule (other repo as a folder)

Chosen repo URL: **`https://github.com/AceConcept/waypoint-sidebar.git`**

1. Add the sidebar repository as a **submodule** at **`luna-sidebar/`**:

```bash
git rm -r luna-sidebar
git submodule add https://github.com/AceConcept/waypoint-sidebar.git luna-sidebar
```

2. Point app imports to the submodule source location (current path in this repo):

```ts
import { LunaSidebar } from '../luna-sidebar/src/luna-sidebar/index.js'
```

3. Commit the submodule setup (`.gitmodules`, `luna-sidebar` gitlink, and import updates).
2. When the sidebar repo has new commits you want:

```bash
git submodule update --remote luna-sidebar
git add luna-sidebar
git commit -m "Bump luna-sidebar submodule"
```

This repo stores **which commit** of the other repo it uses. No npm package is required; submodule workflows can be unfamiliar to some teams.

### Super simple daily workflow (Option B)

Think of this as two notebooks:

- Notebook A = **`waypoint-sidebar`** (where sidebar code lives)
- Notebook B = **`WaypointManager`** (your app)

Notebook B keeps a **bookmark** to a commit in Notebook A.

1. Edit sidebar in `waypoint-sidebar`, then commit and push there.
2. In `WaypointManager`, run:

```powershell
.\update-sidebar.ps1
```

3. Push `WaypointManager` so everyone gets the new bookmark.

Rules:

- Make sidebar code changes in `waypoint-sidebar`.
- Move the bookmark in `WaypointManager` with `.\update-sidebar.ps1`.
- If teammate pulls and sidebar looks old, run:

```bash
git submodule update --init --recursive
```

---

## Option C — Monorepo (single GitHub repository)

Put both parts in **one** repo, for example:

- `apps/waypoint-manager`
- `packages/luna-sidebar`

Use **npm/pnpm/yarn workspaces**. One **push** updates everything; there is no cross-repo sync.

---

## Automatic updates (“push sidebar → PR in Waypoint Manager”)

GitHub will not merge two repos by itself. Typical automation:

1. **GitHub Actions** on the **sidebar** repository (on push to `main` or on a **release**): use a **PAT** or GitHub App with permission on **Waypoint Manager** to:
   - open a **PR** that bumps the git dependency / lockfile, or  
   - update the **submodule** pointer and open a PR.

2. **Publish to npm** (or GitHub Packages) from the sidebar repo; enable **Dependabot** or **Renovate** in Waypoint Manager to open version-bump PRs.

---

## Quick comparison

| Goal | Approach |
|------|----------|
| Clear ownership, normal `npm install`, versioned consumption | **Git or npm dependency** from the sidebar repo (Option A) |
| Keep a folder in-tree without publishing a package | **Submodule** (Option B) |
| One push always updates app + sidebar | **Monorepo** (Option C) |
| A PR appears here when the sidebar repo changes | **CI** on top of A or B |

---

## Current state of this project

- **`luna-sidebar/`** is a **Git submodule** pointing to `https://github.com/AceConcept/waypoint-sidebar.git`.
- `src/App.tsx` imports `LunaSidebar` from `../luna-sidebar/src/luna-sidebar/index.js`.

When you adopt Option A or B, remove or stop maintaining the duplicate **`luna-sidebar/`** copy here so there is a single source of truth.
