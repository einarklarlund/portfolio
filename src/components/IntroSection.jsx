import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import CrtBackground from './CrtBackground'
import ScrollArrow from './ScrollArrow'
import Dither from './Dither'

export default function IntroSection() {
  const sectionRef = useRef(null)
  const crtRef = useRef(null)
  const [box, setBox] = useState(null)

  useEffect(() => {
    const measure = () => {
      const crtEl = crtRef.current
      const secEl = sectionRef.current
      if (!crtEl || !secEl) return
      const crtRect = crtEl.getBoundingClientRect()
      const secRect = secEl.getBoundingClientRect()
      setBox({
        x: (crtRect.left - secRect.left + crtRect.width / 2) / secRect.width,
        y: (crtRect.top - secRect.top + crtRect.height / 2) / secRect.height,
        width: crtRect.width / secRect.width,
        height: crtRect.height / secRect.height,
        falloff: 0.03,
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (crtRef.current) ro.observe(crtRef.current)
    if (sectionRef.current) ro.observe(sectionRef.current)
    return () => ro.disconnect()
  }, [])

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
        background: '#D3DAD9',
        color: '#D3DAD9',
      }}
    >
      <Dither
        waveColor={[0.216,0.208,0.243]}
        backgroundColor={[0.827,0.855,0.851]}
        disableAnimation={false}
        enableMouseInteraction={false}
        mouseRadius={0.1}
        colorNum={4}
        waveAmplitude={0.5}
        waveFrequency={2}
        waveSpeed={0.025}
        box={box}
      />
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
