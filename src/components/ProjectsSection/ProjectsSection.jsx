import { useState, useRef, useMemo, useCallback } from 'react'
import ScrollArrow from '../ScrollArrow'
import ProjectCard from './ProjectCard'
import BoxSdfFrame from '../BoxSdfFrame/BoxSdfFrame'
import { useScrollColorTransition } from '../../bridge/useScrollColorTransition'
import { useInView } from '../../bridge/useInView'

const BASE = import.meta.env.BASE_URL

const SECTION_COLOR = [0.443, 0.353, 0.353]
const PREV_COLOR    = [0.216, 0.208, 0.243]

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
  }
]

export default function ProjectsSection() {
  const [selectedId, setSelectedId] = useState(null)
  const [sectionRef, isInView] = useInView({ amount: 0.2 })
  const headingRef = useRef(null)
  useScrollColorTransition(sectionRef, SECTION_COLOR, PREV_COLOR)

  // Wrap reorder + resize in View Transitions so the layout morph is animated
  // by the browser. Progressive enhancement — falls back to an instant swap on
  // browsers without the API (Safari < 18).
  const handleSelect = useCallback((id) => {
    if (id !== null && selectedId === null && headingRef.current) {
      const top = headingRef.current.getBoundingClientRect().top + window.scrollY
      requestAnimationFrame(() => {
        requestAnimationFrame(() => window.scrollTo({ top, behavior: 'smooth' }))
      })
    }
    const next = id
    const update = () => setSelectedId(next)
    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.startViewTransition(() => {
        update()
        return Promise.resolve()
      })
    } else {
      update()
    }
  }, [selectedId])

  const sortedProjects = useMemo(() =>
    selectedId ? [ PROJECTS.find((p) => p.id === selectedId), ...PROJECTS.filter((p) => p.id !== selectedId) ] : PROJECTS,
    [selectedId]
  )

  return (
    <section id="projects" ref={sectionRef} style={{ position: 'relative', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', color: '#D3DAD9' }}>
      <div style={{ width: '100%', maxWidth: '900px', textAlign: 'center' }}>
        <BoxSdfFrame active={isInView} style={{ display: 'inline-block', width: 'auto', marginBottom: '3rem' }}>
          <h2 ref={headingRef} className="reveal reveal-up" data-visible={isInView} style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, padding: '0.4rem 1.2rem' }}>
            Projects
          </h2>
        </BoxSdfFrame>
        <div
          className="reveal reveal-up"
          data-visible={isInView}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}
        >
          {sortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} isSelected={selectedId === project.id} selectedId={selectedId} onSelect={handleSelect} isInView={isInView} />
          ))}
        </div>
      </div>
      <div
        className="reveal"
        data-visible={isInView}
        style={{
          '--delay': '0.5s',
          position: 'relative',
          width: '100%',
          marginTop: '4rem',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <ScrollArrow label="skills" targetId="skills" style={{ color: '#D3DAD9' }} />
      </div>
    </section>
  )
}
