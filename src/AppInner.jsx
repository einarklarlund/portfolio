import Dither from './components/Dither/Dither'
import { useDitherContext } from './components/DitherContext'
import IntroSection from './components/IntroSection/IntroSection'
import ProjectsSection from './components/ProjectsSection/ProjectsSection'
import SkillsSection from './components/SkillsSection/SkillsSection'
import WorkExperienceSection from './components/WorkExperienceSection/WorkExperienceSection'

export default function AppInner() {
  const { config } = useDitherContext()
  return (
    <main>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Dither
          waveColor={config.waveColor}
          backgroundColor={config.backgroundColor}
          sdfs={config.sdfs}
          disableAnimation={false}
          enableMouseInteraction={false}
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
