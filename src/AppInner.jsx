import { lazy, Suspense, useEffect, useState } from 'react'
import IntroSection from './components/IntroSection/IntroSection'

// Lazy so three.js, @react-three/fiber, and postprocessing land in a separate
// chunk that isn't parsed during initial page load.
const BackgroundCanvas = lazy(() => import('./three/BackgroundCanvas'))

// Below-the-fold sections: split out so their code + CSS-reveal observers
// don't land in the main chunk's parse path.
const ProjectsSection = lazy(() => import('./components/ProjectsSection/ProjectsSection'))
const SkillsSection = lazy(() => import('./components/SkillsSection/SkillsSection'))
const WorkExperienceSection = lazy(() => import('./components/WorkExperienceSection/WorkExperienceSection'))

export default function AppInner() {
  // React and R3F call performance.measure() on every frame in development builds.
  // The browser never frees these automatically, causing ~12 MB/minute of accumulation
  // in dev mode. Periodically clear them. This has no effect in production builds.
  useEffect(() => {
    if (import.meta.env.DEV) {
      const id = setInterval(() => {
        performance.clearMarks()
        performance.clearMeasures()
      }, 10_000)
      return () => clearInterval(id)
    }
  }, [])

  // Delay mounting the canvas until the browser is idle so LCP/TBT windows
  // close before three.js starts executing.
  const [canvasReady, setCanvasReady] = useState(false)
  useEffect(() => {
    const mount = () => setCanvasReady(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(mount, { timeout: 1000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(mount, 0)
    return () => clearTimeout(id)
  }, [])

  return (
    <main>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        {canvasReady && (
          <Suspense fallback={null}>
            <BackgroundCanvas
              disableAnimation={false}
              enableMouseInteraction={true}
              mouseRadius={0.05}
              colorNum={4}
              waveAmplitude={0.25}
              waveFrequency={4}
              waveSpeed={0.025}
            />
          </Suspense>
        )}
      </div>
      <IntroSection />
      <Suspense fallback={null}>
        <ProjectsSection />
        <SkillsSection />
        <WorkExperienceSection />
      </Suspense>
    </main>
  )
}
