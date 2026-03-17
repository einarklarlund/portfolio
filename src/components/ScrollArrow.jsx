import { motion } from 'framer-motion'

export default function ScrollArrow({ label, targetId, style = {} }) {
  return (
    <motion.a
      href={`#${targetId}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        color: 'var(--text-muted)',
        zIndex: 10,
        cursor: 'pointer',
        ...style,
      }}
    >
      <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <motion.svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
      >
        <path d="M12 5v14M5 12l7 7 7-7" />
      </motion.svg>
    </motion.a>
  )
}
