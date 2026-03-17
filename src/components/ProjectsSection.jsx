import { useState } from 'react'
import { motion, AnimatePresence, useInView, LayoutGroup } from 'framer-motion'
import { useRef } from 'react'
import ScrollArrow from './ScrollArrow'

const PLACEHOLDER_PROJECTS = [
  {
    id: 1,
    title: 'Project Alpha',
    description: 'A fast-paced action game with procedural generation and dynamic lighting.',
    tech: ['Unity', 'C#', 'Shader Graph'],
    color: '#ff6b6b',
  },
  {
    id: 2,
    title: 'Project Beta',
    description: 'Multiplayer puzzle platformer with physics-based mechanics.',
    tech: ['Unreal Engine', 'C++', 'Blueprints'],
    color: '#4ecdc4',
  },
  {
    id: 3,
    title: 'Project Gamma',
    description: 'Atmospheric exploration game with hand-crafted environments.',
    tech: ['Godot', 'GDScript', 'Blender'],
    color: '#45b7d1',
  },
  {
    id: 4,
    title: 'Project Delta',
    description: 'Retro-style roguelike with modern AI and procedural narrative.',
    tech: ['Unity', 'C#', 'ML-Agents'],
    color: '#feca57',
  },
]

function PlaceholderThumbnail({ color, hovered }) {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '16/9',
        background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`,
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Static state: grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: hovered ? 0 : 1,
          transition: 'opacity 0.3s',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '1px',
          padding: '1px',
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: `${color}${(15 + i * 3).toString(16).padStart(2, '0')}`,
              borderRadius: '2px',
            }}
          />
        ))}
      </div>

      {/* Hover state: animated "gameplay" */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s',
          background: `radial-gradient(circle at ${hovered ? '60% 40%' : '50% 50%'}, ${color}88, ${color}22)`,
        }}
      >
        <motion.div
          animate={hovered ? {
            x: [0, 30, -20, 10, 0],
            y: [0, -15, 25, -10, 0],
          } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '20px',
            height: '20px',
            marginLeft: '-10px',
            marginTop: '-10px',
            background: color,
            borderRadius: '50%',
            boxShadow: `0 0 20px ${color}, 0 0 40px ${color}66`,
          }}
        />
        <motion.div
          animate={hovered ? {
            x: [0, -40, 20, -30, 0],
            y: [0, 20, -30, 15, 0],
          } : {}}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '30%',
            left: '30%',
            width: '12px',
            height: '12px',
            background: `${color}aa`,
            borderRadius: '50%',
            boxShadow: `0 0 15px ${color}44`,
          }}
        />
      </div>
    </div>
  )
}

function ProjectCard({ project, isSelected, onSelect, selectedId }) {
  const [hovered, setHovered] = useState(false)
  const isOther = selectedId !== null && !isSelected

  return (
    <motion.div
      layout
      onClick={() => onSelect(isSelected ? null : project.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        position: 'relative',
        flex: isSelected ? '1 1 100%' : '1 1 calc(50% - 1rem)',
        maxWidth: isSelected ? '700px' : 'calc(50% - 1rem)',
      }}
      animate={{
        opacity: isOther ? 0.3 : 1,
        scale: isOther ? 0.9 : 1,
        filter: isOther ? 'blur(2px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <PlaceholderThumbnail color={project.color} hovered={hovered || isSelected} />

      <motion.p
        style={{
          marginTop: '0.75rem',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--text)',
        }}
      >
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
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  marginBottom: '1rem',
                }}
              >
                {project.description}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {project.tech.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      background: `${project.color}18`,
                      border: `1px solid ${project.color}33`,
                      color: project.color,
                    }}
                  >
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

export default function ProjectsSection() {
  const [selectedId, setSelectedId] = useState(null)
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const isInView = useInView(sectionRef, { amount: 0.2 })

  function handleSelect(id) {
    if (id !== null && selectedId === null && headingRef.current) {
      const top = headingRef.current.getBoundingClientRect().top + window.scrollY
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top, behavior: 'smooth' })
        })
      })
    }
    setSelectedId(id)
  }

  // Selected project always first, rest follow in original order
  const sortedProjects = selectedId
    ? [
        PLACEHOLDER_PROJECTS.find((p) => p.id === selectedId),
        ...PLACEHOLDER_PROJECTS.filter((p) => p.id !== selectedId),
      ]
    : PLACEHOLDER_PROJECTS

  return (
    <section
      id="projects"
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
          ref={headingRef}
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '3rem',
          }}
        >
          Projects
        </h2>

        <LayoutGroup>
          <motion.div
            layout
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              justifyContent: 'center',
            }}
          >
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={selectedId === project.id}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            ))}
          </motion.div>
        </LayoutGroup>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{ position: 'relative', width: '100%', marginTop: '4rem', display: 'flex', justifyContent: 'center' }}
      >
        <ScrollArrow label="skills" targetId="skills" />
      </motion.div>
    </section>
  )
}
