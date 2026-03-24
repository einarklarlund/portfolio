import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useInView, LayoutGroup } from 'framer-motion'
import ScrollArrow from './ScrollArrow'
const BASE = import.meta.env.BASE_URL

const PROJECTS = [
  {
    id: 1,
    title: 'Einus Arena',
    description: (
      <>Single-player FPS with an arcade-ey game loop and power-up system. Play in-browser{' '}
        <a href="https://einus.itch.io/einus-arena" target="_blank" rel="noopener noreferrer" style={{ color: '#D3DAD9', textDecoration: 'underline' }}>on itch</a>.
      </>
    ),
    tech: ['Unity', 'HLSL', 'Kinematics', 'FPS Combat'],
    color: '#D3DAD9',
    videos: [
      `${BASE}einus-arena-gameplay-1.mp4`,
      `${BASE}einus-arena-gameplay-2.mp4`,
      `${BASE}einus-arena-gameplay-3.mp4`,
      `${BASE}einus-arena-gameplay-4.mp4`,
      `${BASE}einus-arena-gameplay-5.mp4`,
    ],
  },
  {
    id: 2,
    title: 'Funny Hotel',
    description: (
      <>Short narrative game about exploring a surreal space and meeting weird characters with hand-crafted art-assets. Play in-browser{' '}
        <a href="https://einus.itch.io/funny-hotel" target="_blank" rel="noopener noreferrer" style={{ color: '#D3DAD9', textDecoration: 'underline' }}>on itch</a>.
      </>
    ),
    tech: ['Unity', 'Dialogue systems', 'HLSL programming', 'Hand-drawn sprites'],
    color: '#D3DAD9',
    videos: [
      `${BASE}funny-hotel-gameplay-1.mp4`,
      `${BASE}funny-hotel-gameplay-2.mp4`,
      `${BASE}funny-hotel-gameplay-3.mp4`,
      `${BASE}funny-hotel-gameplay-4.mp4`,
      `${BASE}funny-hotel-gameplay-5.mp4`,
      `${BASE}funny-hotel-gameplay-6.mp4`,
    ],
  },
  {
    id: 3,
    title: 'Remnants in the Water',
    description: (
      <>A narrative-driven game about a submarine that survived a nuclear apocalypse. Download{' '}
        <a href="https://toothmonster.itch.io/remnants-in-the-water" target="_blank" rel="noopener noreferrer" style={{ color: '#D3DAD9', textDecoration: 'underline' }}>on itch</a>.
      </>
    ),
    tech: ['Unity', 'Stateful dialogue', 'Persistent saving', 'UI/UX design', 'Custom graphics pipeline'],
    color: '#D3DAD9',
    videos: [
      `${BASE}remnants-gameplay-1.mp4`,
      `${BASE}remnants-gameplay-2.mp4`,
      `${BASE}remnants-gameplay-3.mp4`,
      `${BASE}remnants-gameplay-4.mp4`,
      `${BASE}remnants-gameplay-5.mp4`,
      `${BASE}remnants-gameplay-6.mp4`,
    ],
  },
  {
    id: 4,
    title: 'Einus Arena II',
    description: (
      <>WIP fast-paced multiplayer arena shooter. Features in-browser server-hosting powered by WebRTC. Play in-browser{' '}
        <a href="https://einarklarlund.github.io/ArenaURP/" target="_blank" rel="noopener noreferrer" style={{ color: '#D3DAD9', textDecoration: 'underline' }}>on my website</a>.
      </>
    ),
    tech: ['Unity', 'URP', 'FPS Combat', 'Kinematics', 'Bot AI', 'Lag compensation', 'Client-server architecture', 'Synchronization'],
    color: '#D3DAD9',
    videos: [
      `${BASE}einus-arena-2-gameplay-1.mp4`,
      `${BASE}einus-arena-2-gameplay-2.mp4`,
    ],
  },
  {
    id: 5,
    title: 'Game Editor for Learning',
    description: (
      <>A platformer made with a level editor, made in QML. Was used for a{' '}
        <a href="https://www.sciencedirect.com/science/article/pii/S1749772822000124#sec0065" target="_blank" rel="noopener noreferrer" style={{ color: '#D3DAD9', textDecoration: 'underline' }}>research paper</a>{' '}
        about how game-jams can be used as educational tools.
      </>
    ),
    tech: ['QML/Felgo', 'Persistent saving'],
    color: '#D3DAD9',
    videos: [],
  },
]

function ProjectThumbnail({ color, videos, active }) {
  const [vidIndex, setVidIndex] = useState(0)
  const videoRef = useRef(null)
  const hasVideos = videos && videos.length > 0

  useEffect(() => {
    if (!videoRef.current) return
    if (active && hasVideos) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setVidIndex(0)
    }
  }, [active, hasVideos, vidIndex])

  const handleEnded = () => {
    if (!hasVideos) return
    setVidIndex((prev) => (prev + 1) % videos.length)
  }

  return (
    <div
      style={{
        width: '100%', aspectRatio: '16/9',
        background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`,
        borderRadius: '8px', overflow: 'hidden', position: 'relative',
        zIndex: 1
      }}
    >
      {/* Background grid shown while metadata loads or if no video */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: -1,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)', gap: '1px', padding: '1px',
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ background: `${color}${(15 + i * 3).toString(16).padStart(2, '0')}`, borderRadius: '2px' }} />
        ))}
      </div>

      {hasVideos && (
        <video
          ref={videoRef}
          src={videos[vidIndex]}
          muted playsInline preload="metadata"
          onEnded={handleEnded}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', borderRadius: '8px',
          }}
        />
      )}

      {/* Fallback hover effect for projects without videos */}
      {!hasVideos && (
        <div
          style={{
            position: 'absolute', inset: 0, opacity: active ? 1 : 0, transition: 'opacity 0.3s',
            background: `radial-gradient(circle at ${active ? '60% 40%' : '50% 50%'}, ${color}88, ${color}22)`,
          }}
        >
          <motion.div
            animate={active ? { x: [0, 30, -20, 10, 0], y: [0, -15, 25, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '50%', left: '50%', width: '20px', height: '20px',
              marginLeft: '-10px', marginTop: '-10px', background: color, borderRadius: '50%',
              boxShadow: `0 0 20px ${color}, 0 0 40px ${color}66`,
            }}
          />
          <motion.div
            animate={active ? { x: [0, -40, 20, -30, 0], y: [0, 20, -30, 15, 0] } : {}}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '30%', left: '30%', width: '12px', height: '12px',
              background: `${color}aa`, borderRadius: '50%', boxShadow: `0 0 15px ${color}44`,
            }}
          />
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project, isSelected, onSelect, selectedId }) {
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

export default function ProjectsSection() {
  const [selectedId, setSelectedId] = useState(null)
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const isInView = useInView(sectionRef, { amount: 0.2 })

  function handleSelect(id) {
    if (id !== null && selectedId === null && headingRef.current) {
      const top = headingRef.current.getBoundingClientRect().top + window.scrollY
      requestAnimationFrame(() => {
        requestAnimationFrame(() => window.scrollTo({ top, behavior: 'smooth' }))
      })
    }
    setSelectedId(id)
  }

  const sortedProjects = useMemo(() =>
    selectedId ? [ PROJECTS.find((p) => p.id === selectedId), ...PROJECTS.filter((p) => p.id !== selectedId) ] : PROJECTS,
    [selectedId]
  )

  return (
    <section id="projects" ref={sectionRef} style={{ position: 'relative', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', background: '#715A5A', color: '#37353E' }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.7, ease: 'easeOut' }} style={{ width: '100%', maxWidth: '900px', textAlign: 'center' }}>
        <h2 ref={headingRef} style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '3rem' }}>
          Projects
        </h2>
        <LayoutGroup>
          <motion.div layout style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
            {sortedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} isSelected={selectedId === project.id} selectedId={selectedId} onSelect={handleSelect} />
            ))}
          </motion.div>
        </LayoutGroup>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 0.5, duration: 0.6 }} style={{ position: 'relative', width: '100%', marginTop: '4rem', display: 'flex', justifyContent: 'center' }}>
        <ScrollArrow label="skills" targetId="skills" style={{ color: '#44444E' }} />
      </motion.div>
    </section>
  )
}