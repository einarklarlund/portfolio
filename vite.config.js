import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/portfolio/',
  build: {
    // Only exclude the tiny BackgroundCanvas wrapper from modulepreload —
    // the r3f / three chunks end up on the critical path anyway because
    // rolldown hoists `react`, `scheduler`, and `use-sync-external-store`
    // into r3f (ignoring manualChunks for shared-via-@react-three/fiber
    // deps). Excluding r3f from preload makes the fetch SERIAL after
    // main.js parses; letting it preload is strictly better.
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter((d) => !/(?:^|\/)BackgroundCanvas-/.test(d)),
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // react-dom lands here; `react` and scheduler rolldown insists on
          // hoisting into r3f. Keeping this rule so react-dom (~56 kB gzip)
          // stays cacheable independently of the app chunk.
          if (/[\\/]node_modules[\\/](?:react|react-dom|react-reconciler|scheduler|use-sync-external-store)[\\/]/.test(id)) {
            return 'react'
          }
          if (/[\\/]node_modules[\\/]three[\\/]/.test(id)) return 'three'
          if (
            /[\\/]node_modules[\\/]@react-three[\\/]/.test(id) ||
            /[\\/]node_modules[\\/]postprocessing[\\/]/.test(id) ||
            /[\\/]node_modules[\\/](?:its-fine|suspend-react|react-use-measure|maath|n8ao)[\\/]/.test(id)
          ) {
            return 'r3f'
          }
        },
      },
    },
  },
})
