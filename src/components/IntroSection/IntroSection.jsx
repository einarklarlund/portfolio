import { motion } from 'framer-motion'
import { useRef, useEffect, useId } from 'react'
import CrtBackground from './CrtBackground'
import ScrollArrow from '../ScrollArrow'
import { useDitherContext } from '../DitherContext'

export default function IntroSection() {
  const sectionRef = useRef(null)
  const crtRef = useRef(null)
  const { ditherStateRef, registerSdf, unregisterSdf } = useDitherContext()
  const sdfId = useId()

  useEffect(() => {
    ditherStateRef.current.backgroundColor = [0.827, 0.855, 0.851]
  }, [ditherStateRef])

  useEffect(() => {
    const measure = () => {
      const crtEl = crtRef.current
      if (!crtEl) return
      const crtRect = crtEl.getBoundingClientRect()
      registerSdf(sdfId, {
        type: 'box',
        x: (crtRect.left + crtRect.width / 2) / window.innerWidth,
        y: (crtRect.top + crtRect.height / 2) / window.innerHeight,
        width: crtRect.width / window.innerWidth,
        height: crtRect.height / window.innerHeight,
        falloff: 0.03,
        intensity: 0.8,
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (crtRef.current) ro.observe(crtRef.current)
    if (sectionRef.current) ro.observe(sectionRef.current)
    window.addEventListener('scroll', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', measure)
      unregisterSdf(sdfId)
    }
  }, [sdfId, registerSdf, unregisterSdf])

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
        background: 'transparent',
        color: '#D3DAD9',
      }}
    >
      <CrtBackground ref={crtRef} />

      {/* Header — centered on top screen edge */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        style={{
          position: 'absolute',
          top: '24px',
          left: 0,
          right: 0,
          transform: 'translateY(-50%)',
          zIndex: 2,
          fontFamily: '"VCR OSD Mono", monospace',
          fontSize: 'clamp(2rem, 6.5vw, 4.2rem)',
          fontWeight: 400,
          letterSpacing: '0.04em',
          lineHeight: 1.1,
          margin: 0,
          textAlign: 'center',
          textTransform: 'uppercase',
          color: '#D3DAD9',
        }}
      >
        Game Dev & Software
      </motion.h1>

      {/* Subtitle + arrow — centered on bottom screen edge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
        style={{
          position: 'absolute',
          bottom: '25px',
          left: 0,
          right: 0,
          transform: 'translateY(50%)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            fontWeight: 300,
            color: '#D3DAD9',
            lineHeight: 1.6,
            maxWidth: '600px',
            margin: 0,
          }}
        >
          I'm Einar Klarlund, a gameplay and software engineer with full-stack and cloud service skills, and a love for retro games.
        </p>
        <ScrollArrow label="projects" targetId="projects" style={{ color: '#715A5A' }} />
      </motion.div>
    </motion.section>
  )
}
