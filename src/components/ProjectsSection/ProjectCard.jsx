import { useState, useRef } from 'react'
import ProjectThumbnail from './ProjectThumbnail'
import BoxSdfFrame from '../BoxSdfFrame/BoxSdfFrame'

export default function ProjectCard({ project, isSelected, onSelect, selectedId }) {
  const [hovered, setHovered] = useState(false)
  const [clickPulse, setClickPulse] = useState(false)
  const pulseTimeoutRef = useRef(null)
  const isOther = selectedId !== null && !isSelected
  const active = hovered || isSelected

  function handleClick() {
    if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current)
    setClickPulse(true)
    pulseTimeoutRef.current = setTimeout(() => setClickPulse(false), 150)
    onSelect(isSelected ? null : project.id)
  }

  const targetIntensity = clickPulse ? 0.3 : hovered ? 0.0375 : 0
  const targetFalloff   = clickPulse ? 0.15 : hovered ? 0.02 : 0

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        position: 'relative',
        flex: isSelected ? '1 1 100%' : '1 1 calc(50% - 1rem)',
        maxWidth: isSelected ? '700px' : 'calc(50% - 1rem)',
        opacity: isOther ? 0.3 : 1,
        transform: isOther ? 'scale(0.9)' : 'scale(1)',
        filter: isOther ? 'blur(2px)' : 'blur(0px)',
        transition:
          'opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1),' +
          ' transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1),' +
          ' filter 0.5s cubic-bezier(0.25, 0.1, 0.25, 1),' +
          ' flex-basis 0.5s cubic-bezier(0.25, 0.1, 0.25, 1),' +
          ' max-width 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
        viewTransitionName: `project-card-${project.id}`,
      }}
    >
      <BoxSdfFrame intensity={targetIntensity} falloff={targetFalloff}>
        <ProjectThumbnail color={project.color} videos={project.videos} active={active} />
      </BoxSdfFrame>
      <p style={{ marginTop: '0.75rem', fontSize: '0.95rem', fontWeight: 600, color: '#37353E' }}>
        {project.title}
      </p>
      <div className="collapse" data-open={isSelected}>
        <div className="collapse-inner">
          <div style={{ padding: '1rem 0' }}>
            <p style={{ fontSize: '0.9rem', color: '#44444E', lineHeight: 1.6, marginBottom: '1rem' }} onClick={(e) => e.stopPropagation()}>
              {project.description}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {project.tech.map((t) => (
                <span key={t} style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: `${project.color}18`, border: `1px solid ${project.color}33`, color: project.color }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
