import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import ScrollArrow from './ScrollArrow'

const SKILLS = [
  {
    category: 'Game Development',
    items: ['Unity', 'Unreal Engine', 'Godot', 'Shader Graph', 'ML-Agents', 'Blueprints'],
  },
  {
    category: 'Programming',
    items: ['C#', 'C++', 'Python', 'JavaScript', 'TypeScript', 'GDScript'],
  },
  {
    category: 'Art & Design',
    items: ['Blender', 'Figma', 'Photoshop', 'Rigging', 'Animation', 'Lighting'],
  },
  {
    category: 'Tools & Other',
    items: ['Git', 'React', 'CI/CD', 'Docker', 'Agile', 'Technical Writing'],
  },
]

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
          color: 'var(--text-muted)',
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
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem 2rem',
          }}
        >
          {SKILLS.map((group) => (
            <SkillCategory key={group.category} category={group.category} items={group.items} />
          ))}
        </motion.div>
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
        <ScrollArrow label="work experience" targetId="work-experience" />
      </motion.div>
    </section>
  )
}
