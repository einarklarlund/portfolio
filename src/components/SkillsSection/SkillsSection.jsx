import ScrollArrow from '../ScrollArrow'
import SkillGroup from './SkillGroup'
import BoxSdfFrame from '../BoxSdfFrame/BoxSdfFrame'
import { useScrollColorTransition } from '../../bridge/useScrollColorTransition'
import { useInView } from '../../bridge/useInView'

const SECTION_COLOR = [0.303, 0.296, 0.343]
const PREV_COLOR    = [0.325, 0.322, 0.371]

const SOFTWARE_ENGINEERING = {
  title: 'Software Engineering',
  subtitle: 'Skills that my professional experience bring to the table:',
  categories: [
    {
      category: 'Cloud Infrastructure',
      items: ['AWS', 'Serverless full-stack', 'Serverless data pipelines'],
    },
    {
      category: 'DevOps',
      items: ['CI/CD pipelines', 'Zero-downtime deployments', "Monitoring", "Logging"],
    },
    {
      category: 'User Behavior Analytics',
      items: ['Telemetry pipelines', 'Linear regression', 'Global datasets'],
    },
    {
      category: 'Fullstack Development',
      items: ['React', 'Node.js', 'Real-time web applications', 'Crash reporting'],
    },
  ],
}

const GAME_DEVELOPMENT = {
  title: 'Game Development',
  subtitle: 'Skills that my game dev projects bring to the table:',
  categories: [
    {
      category: 'Multiplayer and Network Programming',
      items: ['WebRTC', 'Client-server architecture', 'Synchronization', 'Lag Compensation'],
    },
    {
      category: 'Graphics',
      items: ['URP', 'HLSL', 'Custom graphics pipelines'],
    },
    {
      category: 'Game Systems Programming',
      items: ['Unity (C#, 3+ years)', 'Kinematics', 'FPS Combat', 'Stateful dialogue', 'Persistent saving', 'UI/UX', 'Felgo/QML'],
    },
  ],
}

export default function SkillsSection() {
  const [sectionRef, isInView] = useInView({ amount: 0.2 })
  useScrollColorTransition(sectionRef, SECTION_COLOR, PREV_COLOR)

  return (
    <section
      id="skills"
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 2rem',
        color: '#D3DAD9',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          textAlign: 'center',
        }}
      >
        <BoxSdfFrame active={isInView} style={{ display: 'inline-block', width: 'auto', marginBottom: '3rem' }}>
          <h2
            className="reveal reveal-up"
            data-visible={isInView}
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
              padding: '0.4rem 1.2rem',
            }}
          >
            Skills
          </h2>
        </BoxSdfFrame>

        <SkillGroup group={SOFTWARE_ENGINEERING} isInView={isInView} />

        {/* Divider */}
        <BoxSdfFrame active={isInView} style={{ display: 'inline-block', width: 'auto' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '200px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #715A5A, transparent)',
            margin: '3.5rem auto',
          }}
        />
        </BoxSdfFrame>

        <SkillGroup group={GAME_DEVELOPMENT} isInView={isInView} />
      </div>

      <div
        className="reveal"
        data-visible={isInView}
        style={{
          '--delay': '0.5s',
          position: 'relative',
          width: '100%',
          marginTop: '4rem',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {/* <ScrollArrow label="work experience" targetId="work-experience" style={{ color: '#D3DAD9' }} /> */}
      </div>
    </section>
  )
}
