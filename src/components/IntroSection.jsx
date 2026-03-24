import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import CrtBackground from './CrtBackground'
import ScrollArrow from './ScrollArrow'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
}

export default function IntroSection() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Fade out as user scrolls past (last 40% of the section leaving)
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const scale = useTransform(scrollYProgress, [0.2, 0.6], [1, 0.9])

  return (
    <motion.section
      ref={sectionRef}
      id="intro"
      style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#091413',
        color: '#B0E4CC',
      }}
    >
      <CrtBackground />

      {/* Scroll-driven fade wrapper */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 2,
          opacity,
          scale,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Variant-driven stagger animation (initial load only) */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* Heading + subtitle — pinned to the top */}
          <motion.div
            variants={item}
            style={{
              textAlign: 'center',
              padding: '3rem 2rem 0',
              position: 'relative',
            }}
          >
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: '1.5rem',
              }}
            >
              Game Dev & Software
            </h1>

            <motion.p
              variants={item}
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                fontWeight: 300,
                color: '#B0E4CC',
                lineHeight: 1.6,
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              I'm Einar Klarlund, a gameplay and software engineer with full-stack and cloud service skills, and a love for retro games.
            </motion.p>
          </motion.div>

          {/* Spacer to keep layout balanced */}
          <div style={{ flex: 1 }} />
        </motion.div>
      </motion.div>

      {/* Arrow at bottom */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          opacity,
        }}
      >
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-1.5rem -3rem',
              background: 'radial-gradient(ellipse at center, rgba(9,20,19,0.85) 30%, transparent 75%)',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />
          <ScrollArrow label="projects" targetId="projects" style={{ color: '#408A71' }} />
        </div>
      </motion.div>
    </motion.section>
  )
}
