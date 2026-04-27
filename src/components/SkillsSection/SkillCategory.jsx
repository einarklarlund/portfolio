export default function SkillCategory({ category, items, isInView, delay = 0 }) {
  return (
    <div
      className="reveal reveal-up-sm reveal-medium"
      data-visible={isInView}
      style={{ textAlign: 'center', '--delay': `${delay}s` }}
    >
      <p
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#D3DAD9',
          marginBottom: '1rem',
          fontWeight: 600,
        }}
      >
        {category}
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'center',
        }}
      >
        {items.map((skill, i) => (
          <span
            key={skill}
            className="reveal reveal-scale reveal-fast"
            data-visible={isInView}
            style={{
              '--delay': `${delay + i * 0.06}s`,
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
          </span>
        ))}
      </div>
    </div>
  )
}
