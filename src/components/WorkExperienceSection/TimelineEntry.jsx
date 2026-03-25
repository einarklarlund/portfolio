import { motion } from 'framer-motion'

const entryVariants = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function TimelineEntry({ entry, isLast }) {
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
