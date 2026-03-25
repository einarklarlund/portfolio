import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import ScrollArrow from '../ScrollArrow'
import SkillGroup from './SkillGroup'

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
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { amount: 0.2 })

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
        background: '#44444E',
        color: '#D3DAD9',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '900px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '3rem',
          }}
        >
          Skills
        </h2>

        <SkillGroup group={SOFTWARE_ENGINEERING} isInView={isInView} />

        {/* Divider */}
        <div
          style={{
            width: '100%',
            maxWidth: '200px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #715A5A, transparent)',
            margin: '3.5rem auto',
          }}
        />

        <SkillGroup group={GAME_DEVELOPMENT} isInView={isInView} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{
          position: 'relative',
          width: '100%',
          marginTop: '4rem',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <ScrollArrow label="work experience" targetId="work-experience" style={{ color: '#715A5A' }} />
      </motion.div>
    </section>
  )
}
