import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/portfolio/',
  build: {
    // Keep the lazy Canvas chunk out of the initial <link rel="modulepreload">
    // list so three.js / R3F aren't parsed during the critical path.
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter((d) => !/(?:^|\/)(?:r3f|three|BackgroundCanvas)-/.test(d)),
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/[\\/]node_modules[\\/]three[\\/]/.test(id)) return 'three'
          if (
            /[\\/]node_modules[\\/]@react-three[\\/]/.test(id) ||
            /[\\/]node_modules[\\/]postprocessing[\\/]/.test(id)
          ) {
            return 'r3f'
          }
        },
      },
    },
  },
})
