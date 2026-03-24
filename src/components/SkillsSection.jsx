import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import ScrollArrow from './ScrollArrow'

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

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const categoryVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const skillVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
}

function SkillCategory({ category, items }) {
  return (
    <motion.div variants={categoryVariants} style={{ textAlign: 'center' }}>
      <p
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#715A5A',
          marginBottom: '1rem',
          fontWeight: 600,
        }}
      >
        {category}
      </p>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'center',
        }}
      >
        {items.map((skill) => (
          <motion.span
            key={skill}
            variants={skillVariants}
            style={{
              fontSize: '0.88rem',
              fontWeight: 500,
              padding: '0.4rem 0.9rem',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#D3DAD9',
              letterSpacing: '0.01em',
            }}
          >
            {skill}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  )
}

function SkillGroup({ group, isInView }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <h3
        style={{
          fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          marginBottom: '0.5rem',
          color: '#D3DAD9',
        }}
      >
        {group.title}
      </h3>
      <p
        style={{
          fontSize: '0.85rem',
          color: '#715A5A',
          lineHeight: 1.6,
          maxWidth: '550px',
          margin: '0 auto 2.5rem',
        }}
      >
        {group.subtitle}
      </p>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
          gap: '3rem 2rem',
        }}
      >
        {group.categories.map((cat) => (
          <SkillCategory key={cat.category} category={cat.category} items={cat.items} />
        ))}
      </motion.div>
    </div>
  )
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
