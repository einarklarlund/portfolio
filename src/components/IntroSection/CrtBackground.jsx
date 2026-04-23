import { lazy, Suspense, useEffect, useState } from 'react'
import SpeakerPanel from './CrtSpeakerPanel'

// CrtScreen creates 19 <video> elements and runs a per-pixel rAF loop on
// mount. Both its code (LUT, video URL list) and its effects would otherwise
// execute during Lighthouse's TBT window. Deferring the import + mount until
// the browser is idle keeps that work out of the critical path.
const CrtScreen = lazy(() => import('./CrtScreen'))

export default function CrtBackground({ ref }) {
  const [visible, setVisible] = useState(false)
  const [screenReady, setScreenReady] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(true), 1000)
    return () => clearTimeout(fadeTimer)
  }, [])

  useEffect(() => {
    const mount = () => setScreenReady(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(mount, { timeout: 3000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(mount, 1500)
    return () => clearTimeout(id)
  }, [])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc((100vh - 150px) * 4 / 3 + 144px)',
        height: '100%',
        zIndex: 0,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease-in',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#37353E',
      }}
    >
      {/* Top bezel */}
      <div style={{
        height: '62px',
        flexShrink: 0,
        background: 'linear-gradient(to bottom, #44444E, #3E3C47)',
        borderRadius: '6px 6px 0 0',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
      }} />
      {/* Middle row: left bezel + screen + right bezel */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <SpeakerPanel side="left" />
        <Suspense fallback={<div style={{ flex: 1, background: '#37353E' }} />}>
          {screenReady && <CrtScreen />}
        </Suspense>
        <SpeakerPanel side="right" />
      </div>
      {/* Bottom panel — thicker, holds controls */}
      <div style={{
        height: '88px',
        flexShrink: 0,
        background: 'linear-gradient(to bottom, #3E3C47, #3A3842, #37353E)',
        borderRadius: '0 0 6px 6px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '12px',
      }}>
          {/* A/V inputs — yellow (video), white & red (audio) */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {['#c8a828', '#d0d0d0', '#c03030'].map((color, i) => (
              <div key={i} style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: `radial-gradient(circle at 40% 35%, ${color}, ${color}88)`,
                boxShadow: `inset 0 1px 2px rgba(0,0,0,0.6), 0 0 2px ${color}33`,
                border: '1px solid #111',
              }}>
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#0a0a0a',
                  margin: '2px auto 0',
                }} />
              </div>
            ))}
          </div>
          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: '#44444E' }} />
          {/* Buttons — VOL/CH style */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{
                width: '8px',
                height: '14px',
                borderRadius: '2px',
                background: 'linear-gradient(to bottom, #4A485A, #37353E)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.09), 0 1px 2px rgba(0,0,0,0.4)',
                border: '1px solid #282630',
              }} />
            ))}
          </div>
          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: '#44444E' }} />
          {/* Power button */}
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'linear-gradient(to bottom, #4A485A, #37353E)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.11), 0 1px 2px rgba(0,0,0,0.5)',
            border: '1px solid #282630',
          }} />
          {/* IR sensor */}
          <div style={{
            width: '16px',
            height: '6px',
            borderRadius: '3px',
            background: 'linear-gradient(to bottom, #1a0a0a, #0e0505)',
            boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.8)',
            border: '1px solid #111',
            marginLeft: '4px',
          }} />
          {/* Brand area */}
          <div style={{
            marginLeft: 'auto',
            fontSize: '9px',
            fontFamily: 'Arial, sans-serif',
            color: '#715A5A',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            userSelect: 'none',
          }}>
            Panasonic
          </div>
      </div>
    </div>
  )
}
