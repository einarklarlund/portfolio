import { motion } from 'framer-motion'

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

export default function SkillCategory({ category, items }) {
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
