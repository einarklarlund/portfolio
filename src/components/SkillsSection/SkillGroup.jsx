import { motion } from 'framer-motion'
import SkillCategory from './SkillCategory'

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

export default function SkillGroup({ group, isInView }) {
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
