import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const EXPERIENCE = [
  {
    id: 1,
    role: 'Senior Game Developer',
    company: 'Studio Placeholder',
    period: '2023 — Present',
    description:
      'Led gameplay systems design and implementation for a AAA title. Owned the combat framework, AI behaviour trees, and networked multiplayer state synchronisation.',
    tags: ['Unity', 'C#', 'Netcode', 'Shader Graph'],
  },
  {
    id: 2,
    role: 'Game Developer',
    company: 'Indie Co.',
    period: '2021 — 2023',
    description:
      'Shipped two titles on Steam. Responsible for procedural generation systems, custom rendering pipelines, and tooling to accelerate level-design workflows.',
    tags: ['Godot', 'GDScript', 'Blender', 'GLSL'],
  },
  {
    id: 3,
    role: 'Junior Developer',
    company: 'Games Agency Ltd.',
    period: '2019 — 2021',
    description:
      'Built client-facing interactive experiences and advergames. Collaborated with designers to implement UI/UX flows and performance-optimised particle systems.',
    tags: ['Unity', 'C#', 'JavaScript', 'WebGL'],
  },
  {
    id: 4,
    role: 'Intern — Tools & Pipeline',
    company: 'Big Publisher',
    period: 'Summer 2018',
    description:
      'Developed internal editor extensions and automated asset-pipeline scripts that reduced build times by ~30% for a cross-platform mobile title.',
    tags: ['Python', 'C#', 'Unity Editor API'],
  },
]

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const entryVariants = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

function TimelineEntry({ entry, isLast }) {
  return (
    <motion.div
      variants={entryVariants}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2rem 1fr',
        gap: '0 1.5rem',
        position: 'relative',
      }}
    >
      {/* Left: period */}
      <div
        style={{
          textAlign: 'right',
          paddingTop: '0.15rem',
          paddingBottom: isLast ? 0 : '3rem',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            color: '#37353E',
            fontWeight: 500,
          }}
        >
          {entry.period}
        </span>
      </div>

      {/* Center: dot + line */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Dot */}
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#37353E',
            flexShrink: 0,
            marginTop: '0.25rem',
            boxShadow: '0 0 0 3px rgba(55,53,62,0.2)',
          }}
        />
        {/* Connecting line */}
        {!isLast && (
          <div
            style={{
              flex: 1,
              width: '1px',
              background: 'rgba(55,53,62,0.25)',
              marginTop: '0.5rem',
            }}
          />
        )}
      </div>

      {/* Right: content */}
      <div style={{ paddingBottom: isLast ? 0 : '3rem' }}>
        <p
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#37353E',
            marginBottom: '0.2rem',
            letterSpacing: '-0.01em',
          }}
        >
          {entry.role}
        </p>
        <p
          style={{
            fontSize: '0.8rem',
            fontWeight: 500,
            color: '#37353E',
            marginBottom: '0.75rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {entry.company}
        </p>
        <p
          style={{
            fontSize: '0.88rem',
            color: '#37353E',
            lineHeight: 1.65,
            marginBottom: '0.85rem',
          }}
        >
          {entry.description}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {entry.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.72rem',
                fontWeight: 500,
                padding: '0.25rem 0.7rem',
                borderRadius: '999px',
                background: 'rgba(55,53,62,0.1)',
                border: '1px solid rgba(55,53,62,0.2)',
                color: '#37353E',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function WorkExperienceSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { amount: 0.1 })

  return (
    <section
      id="work-experience"
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
        background: '#D3DAD9',
        color: '#37353E',
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
          Work Experience
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          style={{ textAlign: 'left' }}
        >
          {EXPERIENCE.map((entry, i) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              isLast={i === EXPERIENCE.length - 1}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
