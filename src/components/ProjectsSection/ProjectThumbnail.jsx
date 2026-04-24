import { useState, useRef, useEffect } from 'react'

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
    </div>
  )
}
