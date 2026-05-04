import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const reactRoot = path.resolve(__dirname, 'node_modules/react')
const reactDomRoot = path.resolve(__dirname, 'node_modules/react-dom')
const waypointSidebarRoot = path.resolve(__dirname, 'node_modules/waypoint-sidebar')
const stepscreenRoot = path.resolve(__dirname, 'node_modules/stepscreen')

/** Bust CDN/browser cache for `public/` step images on each Vercel deploy (same path, new file). */
const stepImgCacheKey =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
  process.env.VERCEL_DEPLOYMENT_ID?.slice(0, 12) ||
  ''

export default defineConfig({
  define: {
    __STEP_IMG_VER__: JSON.stringify(stepImgCacheKey),
  },
  plugins: [react()],
  resolve: {
    /** `waypoint-sidebar` ships React 18; app uses React 19 — one copy or hooks break → blank UI */
    dedupe: ['react', 'react-dom'],
    alias: {
      react: reactRoot,
      'react-dom': reactDomRoot,
      '@assets': path.resolve(__dirname, 'src/assets'),
      'waypoint-sidebar': waypointSidebarRoot,
      stepscreen: stepscreenRoot,
    },
  },
  optimizeDeps: {
    include: [
      'waypoint-sidebar/src/luna-sidebar/index.js',
      'waypoint-sidebar/src/luna-sidebar/LunaSidebar.jsx',
      'waypoint-sidebar/src/luna-sidebar/LunaScaledArtboard.jsx',
    ],
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..'), waypointSidebarRoot, stepscreenRoot],
    },
  },
})
