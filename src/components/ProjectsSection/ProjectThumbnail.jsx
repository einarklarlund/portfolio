import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ProjectThumbnail({ color, videos, active }) {
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
