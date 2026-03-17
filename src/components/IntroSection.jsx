import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import HalftoneBackground from './HalftoneBackground'
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
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          opacity,
        }}
      >
        <HalftoneBackground />
      </motion.div>

      {/* Scroll-driven fade wrapper (separate from variant animation) */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 2,
          opacity,
          scale,
        }}
      >
        {/* Variant-driven stagger animation (initial load only) */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{
            textAlign: 'center',
            maxWidth: '800px',
            padding: '0 2rem',
            position: 'relative',
          }}
        >
          <motion.h1
            variants={item}
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              position: 'relative',
              display: 'inline-block',
            }}
          >
            {/* Oval behind the name */}
            <div
              style={{
                position: 'absolute',
                inset: '-1rem -3rem',
                background: 'radial-gradient(ellipse at center, rgba(220,220,218,0.95) 35%, transparent 75%)',
                pointerEvents: 'none',
                zIndex: -1,
              }}
            />
            Einar
          </motion.h1>

          <motion.p
            variants={item}
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
              fontWeight: 300,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto',
              position: 'relative',
            }}
          >
            {/* Oval behind the subtitle */}
            <div
              style={{
                position: 'absolute',
                inset: '-10rem -30rem',
                background: 'radial-gradient(ellipse at center, rgba(220,220,218,0.92) 35%, transparent 50%)',
                pointerEvents: 'none',
                zIndex: -1,
              }}
            />
            Website website yay yay yay yay!! My next thing will be to change the video 
            content behind this text and fill out all the placeholder text. 
            Also I want to choose some different colors and fonts cuz this looks 
            mad apple store rn. also hi Max i luv u &lt;3
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Arrow with its own local oval gradient */}
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
              background: 'radial-gradient(ellipse at center, rgba(220,220,218,0.85) 30%, transparent 75%)',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />
          <ScrollArrow label="projects" targetId="projects" />
        </div>
      </motion.div>
    </motion.section>
  )
}
