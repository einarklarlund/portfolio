import { useEffect } from 'react'
import Dither from './components/Dither/Dither'
import { useDitherContext } from './components/DitherContext'
import IntroSection from './components/IntroSection/IntroSection'
import ProjectsSection from './components/ProjectsSection/ProjectsSection'
import SkillsSection from './components/SkillsSection/SkillsSection'
import WorkExperienceSection from './components/WorkExperienceSection/WorkExperienceSection'

export default function AppInner() {
  const { ditherStateRef } = useDitherContext()

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
  return (
    <main>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Dither
          ditherStateRef={ditherStateRef}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.1}
          colorNum={4}
          waveAmplitude={0.5}
          waveFrequency={2}
          waveSpeed={0.025}
        />
      </div>
      <IntroSection />
      <ProjectsSection />
      <SkillsSection />
      <WorkExperienceSection />
    </main>
  )
}
