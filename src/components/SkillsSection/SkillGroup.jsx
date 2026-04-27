import SkillCategory from './SkillCategory'
import BoxSdfFrame from '../BoxSdfFrame/BoxSdfFrame'

export default function SkillGroup({ group, isInView }) {
  return (
    <BoxSdfFrame active={isInView} intensity={0.25} falloff={0.12}>
    <div
      className="reveal reveal-up"
      data-visible={isInView}
      style={{ textAlign: 'center', padding: '2rem 1.5rem' }}
    >
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
          color: '#D3DAD9',
          lineHeight: 1.6,
          maxWidth: '550px',
          margin: '0 auto 2.5rem',
        }}
      >
        {group.subtitle}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
          gap: '3rem 2rem',
        }}
      >
        {group.categories.map((cat, i) => (
          <SkillCategory
            key={cat.category}
            category={cat.category}
            items={cat.items}
            isInView={isInView}
            delay={i * 0.12}
          />
        ))}
      </div>
    </div>
    </BoxSdfFrame>
  )
}
