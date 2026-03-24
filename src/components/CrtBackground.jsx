import { useEffect, useState } from 'react'
import CrtScreen from './CrtScreen'

function SpeakerPanel({ side }) {
  return (
    <div style={{
      width: '72px',
      flexShrink: 0,
      background: '#37353E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Recessed grille frame */}
      <div style={{
        width: '48px',
        height: 'calc(100% - 12px)',
        borderRadius: '3px',
        background: '#272530',
        boxShadow: [
          'inset 0 3px 8px rgba(0,0,0,0.9)',
          'inset 0 -2px 5px rgba(0,0,0,0.7)',
          `inset ${side === 'left' ? '3px' : '-3px'} 0 8px rgba(0,0,0,0.8)`,
          `inset ${side === 'left' ? '-2px' : '2px'} 0 4px rgba(255,255,255,0.04)`,
          '0 0 0 1px #1a1820',
          '0 0 0 2px #37353E',
        ].join(', '),
        // Dot grid via radial-gradient
        backgroundImage: 'radial-gradient(circle, #1a1820 1.2px, transparent 1.2px)',
        backgroundSize: '5px 5px',
        backgroundPosition: '2px 2px',
      }} />
    </div>
  )
}

export default function CrtBackground() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(true), 1000)
    return () => clearTimeout(fadeTimer)
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
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
        <CrtScreen />
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
