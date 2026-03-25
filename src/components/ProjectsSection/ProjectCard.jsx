import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProjectThumbnail from './ProjectThumbnail'

export default function ProjectCard({ project, isSelected, onSelect, selectedId }) {
  const [hovered, setHovered] = useState(false)
  const isOther = selectedId !== null && !isSelected
  const active = hovered || isSelected

  return (
    <motion.div
      layout
      onClick={() => onSelect(isSelected ? null : project.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer', position: 'relative',
        flex: isSelected ? '1 1 100%' : '1 1 calc(50% - 1rem)',
        maxWidth: isSelected ? '700px' : 'calc(50% - 1rem)',
      }}
      animate={{ opacity: isOther ? 0.3 : 1, scale: isOther ? 0.9 : 1, filter: isOther ? 'blur(2px)' : 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <ProjectThumbnail color={project.color} videos={project.videos} active={active} />
      <motion.p style={{ marginTop: '0.75rem', fontSize: '0.95rem', fontWeight: 600, color: '#37353E' }}>
        {project.title}
      </motion.p>
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
