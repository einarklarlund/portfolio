import { useEffect, useRef, useState } from 'react'

const BASE = import.meta.env.BASE_URL

const VIDEO_SOURCES = [
  { url: `${BASE}einus-arena-gameplay-1.mp4`, channel: 'EA' },
  { url: `${BASE}einus-arena-gameplay-2.mp4`, channel: 'EA' },
  { url: `${BASE}einus-arena-gameplay-3.mp4`, channel: 'EA' },
  { url: `${BASE}einus-arena-gameplay-4.mp4`, channel: 'EA' },
  { url: `${BASE}einus-arena-gameplay-5.mp4`, channel: 'EA' },
  { url: `${BASE}einus-arena-2-gameplay-1.mp4`, channel: 'EA2' },
  { url: `${BASE}einus-arena-2-gameplay-2.mp4`, channel: 'EA2' },
  { url: `${BASE}funny-hotel-gameplay-1.mp4`, channel: 'FH' },
  { url: `${BASE}funny-hotel-gameplay-2.mp4`, channel: 'FH' },
  { url: `${BASE}funny-hotel-gameplay-3.mp4`, channel: 'FH' },
  { url: `${BASE}funny-hotel-gameplay-4.mp4`, channel: 'FH' },
  { url: `${BASE}funny-hotel-gameplay-5.mp4`, channel: 'FH' },
  { url: `${BASE}funny-hotel-gameplay-6.mp4`, channel: 'FH' },
  { url: `${BASE}remnants-gameplay-1.mp4`, channel: 'RMNTS' },
  { url: `${BASE}remnants-gameplay-2.mp4`, channel: 'RMNTS' },
  { url: `${BASE}remnants-gameplay-3.mp4`, channel: 'RMNTS' },
  { url: `${BASE}remnants-gameplay-4.mp4`, channel: 'RMNTS' },
  { url: `${BASE}remnants-gameplay-5.mp4`, channel: 'RMNTS' },
  { url: `${BASE}remnants-gameplay-6.mp4`, channel: 'RMNTS' },
]

// Assign a random channel number (1-100) per video on load
const channelNumbers = VIDEO_SOURCES.map(() => Math.floor(Math.random() * 100) + 1)


const BG = '#37353E'

function renderCRT(ctx, pixels, srcW, srcH, canvasW, canvasH, cellSize) {
  const subW = Math.floor(cellSize / 4)
  const gap = Math.max(0, Math.floor(cellSize / 12))
  const totalBarW = subW * 3 + gap * 2
  const padX = Math.floor((cellSize - totalBarW) / 2)
  const maxH = cellSize - 2

  ctx.fillStyle = BG
  ctx.fillRect(0, 0, canvasW, canvasH)

  for (let cy = 0; cy < canvasH; cy += cellSize) {
    for (let cx = 0; cx < canvasW; cx += cellSize) {
      const px = Math.min(Math.floor(cx), srcW - 1)
      const py = Math.min(Math.floor(cy), srcH - 1)
      // Chromatic bleed: offset R left, B right by 2px
      const rx = Math.max(0, px - 2)
      const bx = Math.min(srcW - 1, px + 2)
      const ri = (py * srcW + rx) * 4
      const gi = (py * srcW + px) * 4
      const bi = (py * srcW + bx) * 4
      const r = pixels[ri]
      const g = pixels[gi + 1]
      const b = pixels[bi + 2]

      const channels = [
        { value: r, color: `rgb(${Math.min(255, Math.round(r * 1.6 + 80))},${Math.floor(r * 0.25)},${Math.floor(r * 0.18)})` },
        { value: g, color: `rgb(${Math.floor(g * 0.18)},${Math.min(255, Math.round(g * 1.6 + 70))},${Math.floor(g * 0.18)})` },
        { value: b, color: `rgb(${Math.floor(b * 0.18)},${Math.floor(b * 0.25)},${Math.min(255, Math.round(b * 1.6 + 80))})` },
      ]

      for (let s = 0; s < 3; s++) {
        const ch = channels[s]
        const intensity = ch.value / 255
        const barH = Math.max(4, Math.round((0.4 + 0.6 * intensity) * maxH))
        const bx = cx + padX + s * (subW + gap)
        const by = cy + cellSize - 1 - barH

        ctx.fillStyle = ch.color
        ctx.globalAlpha = 0.65 + 0.35 * intensity
        ctx.fillRect(bx, by, subW, barH)

        if (intensity > 0.25) {
          ctx.globalAlpha = (intensity - 0.25) * 0.6
          ctx.fillRect(bx - 1, by, subW + 2, barH)
        }
      }
      ctx.globalAlpha = 1.0
    }
  }

  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  for (let y = 0; y < canvasH; y += cellSize * 2) {
    ctx.fillRect(0, y + cellSize - 1, canvasW, 1)
  }
}

/**
 * Creates a hidden <video> element for the given URL.
 * Returns a promise that resolves once metadata is loaded.
 */
function createVideoElement(url) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.src = url
    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'
    video.crossOrigin = 'anonymous'
    video.style.display = 'none'
    document.body.appendChild(video)
    // Resolve on metadata (fires on mobile) or after a short timeout as fallback
    const done = () => resolve(video)
    video.addEventListener('loadedmetadata', done, { once: true })
    video.addEventListener('error', done, { once: true })
    setTimeout(done, 3000)
  })
}

const BEZEL_GOLD = '#C4962A'

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
  const canvasRef = useRef(null)
  const screenRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(true), 1000)
    return () => clearTimeout(fadeTimer)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const screen = screenRef.current
    const ctx = canvas.getContext('2d')
    const cellSize = 4
    const offscreen = document.createElement('canvas')
    const octx = offscreen.getContext('2d', { willReadFrequently: true })
    let frameId = 0
    let cancelled = false

    function resize() {
      const rect = screen.getBoundingClientRect()
      canvas.width = Math.round(rect.width)
      canvas.height = Math.round(rect.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // Load all videos, then start the render loop
    const videoElements = []
    Promise.all(VIDEO_SOURCES.map(s => createVideoElement(s.url))).then((allVideos) => {
      if (cancelled) return
      videoElements.push(...allVideos)

      let vidIndex = Math.floor(Math.random() * allVideos.length)
      let currentVideo = allVideos[vidIndex]

      // Channel-flip transition state machine
      // States: 'playing' | 'desat' | 'black' | 'partial'
      let transState = 'playing'
      let transStart = 0
      let nextVidIndex = 0
      let partialOffsetY = 0

      const DESAT_DURATION = 160    // ms
      const BLACK_DURATION = 300   // ms
      const PARTIAL_DURATION = 50  // ms — single frame flash

      function drawVideoContain(octx, video, w, h) {
        octx.fillStyle = BG
        octx.fillRect(0, 0, w, h)
        const vr = video.videoWidth / video.videoHeight
        const cr = w / h
        let dw, dh, dx, dy
        if (vr > cr) {
          dw = w; dh = w / vr; dx = 0; dy = (h - dh) / 2
        } else {
          dh = h; dw = h * vr; dx = (w - dw) / 2; dy = 0
        }
        octx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, dx, dy, dw, dh)
      }

      function desaturatePixels(data) {
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i]     = (data[i] + avg) / 2
          data[i + 1] = (data[i + 1] + avg) / 2
          data[i + 2] = (data[i + 2] + avg) / 2
        }
      }

      // Draw channel text onto the offscreen canvas so it goes through CRT rendering
      function drawChannelText(octx, w, idx) {
        const name = VIDEO_SOURCES[idx].channel
        const num = String(channelNumbers[idx])
        const numSize = Math.max(36, Math.round(w * 0.065))
        const nameSize = Math.max(28, Math.round(w * 0.04))
        const x = w - 20
        const y = 20
        octx.save()
        octx.textAlign = 'right'
        octx.textBaseline = 'top'
        // Channel number
        octx.font = `${numSize}px "VT323", monospace`
        octx.fillStyle = '#ffffff'
        octx.fillText(`CH ${num}`, x, y)
        // Channel name below
        octx.font = `${nameSize}px "VT323", monospace`
        octx.fillStyle = '#cccccc'
        octx.fillText(name, x, y + numSize + 2)
        octx.restore()
      }

      // Start playing the first video
      currentVideo.play().catch(() => {})

      // When a video ends, begin channel-flip transition
      function onVideoEnded() {
        if (cancelled || transState !== 'playing') return
        transState = 'desat'
        transStart = performance.now()
        let next
        do { next = Math.floor(Math.random() * allVideos.length) } while (next === vidIndex && allVideos.length > 1)
        nextVidIndex = next
        partialOffsetY = Math.random() * (canvas.height * 2 / 3)
      }

      // Attach ended listener to all videos
      allVideos.forEach(v => v.addEventListener('ended', onVideoEnded))

      function render(t) {
        if (cancelled) return

        const w = canvas.width
        const h = canvas.height
        if (offscreen.width !== w) offscreen.width = w
        if (offscreen.height !== h) offscreen.height = h

        if (transState === 'playing') {
          if (currentVideo.videoWidth > 0) {
            drawVideoContain(octx, currentVideo, w, h)
            drawChannelText(octx, w, vidIndex)
            const { data } = octx.getImageData(0, 0, w, h)
            renderCRT(ctx, data, w, h, w, h, cellSize)
          } else {
            ctx.fillStyle = BG
            ctx.fillRect(0, 0, w, h)
          }
        } else if (transState === 'desat') {
          if (currentVideo.videoWidth > 0) {
            drawVideoContain(octx, currentVideo, w, h)
            const imgData = octx.getImageData(0, 0, w, h)
            desaturatePixels(imgData.data)
            renderCRT(ctx, imgData.data, w, h, w, h, cellSize)
          }
          if (t - transStart >= DESAT_DURATION) {
            transState = 'black'
            transStart = t
          }
        } else if (transState === 'black') {
          ctx.fillStyle = BG
          ctx.fillRect(0, 0, w, h)
          if (t - transStart >= BLACK_DURATION) {
            transState = 'partial'
            transStart = t
            // Switch to next video
            currentVideo.pause()
            currentVideo.currentTime = 0
            vidIndex = nextVidIndex
            currentVideo = allVideos[vidIndex]
            currentVideo.currentTime = 0
          }
        } else if (transState === 'partial') {
          if (currentVideo.videoWidth > 0) {
            drawVideoContain(octx, currentVideo, w, h)
            drawChannelText(octx, w, vidIndex)
            const fullData = octx.getImageData(0, 0, w, h)
            const sliceData = new Uint8ClampedArray(fullData.data.length)
            const sliceH = Math.floor(h / 3)
            const srcStart = 0
            const dstStart = Math.floor(partialOffsetY)
            for (let row = 0; row < sliceH && (row + dstStart) < h; row++) {
              const si = (srcStart + row) * w * 4
              const di = (dstStart + row) * w * 4
              sliceData.set(fullData.data.subarray(si, si + w * 4), di)
            }
            renderCRT(ctx, sliceData, w, h, w, h, cellSize)
          }
          if (t - transStart >= PARTIAL_DURATION) {
            transState = 'playing'
            currentVideo.play().catch(() => {})
          }
        }

        frameId = requestAnimationFrame(render)
      }

      frameId = requestAnimationFrame(render)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      videoElements.forEach(v => {
        v.pause()
        v.removeAttribute('src')
        v.remove()
      })
    }
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
        {/* Screen area: black border + canvas + overlays */}
        <div
          ref={screenRef}
          style={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            border: '6px solid #0a0a0a',
            overflow: 'hidden',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
            }}
          />
          {/* Vignette — darkens edges to simulate curved glass */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'radial-gradient(ellipse 70% 65% at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)',
            }}
          />
          {/* Glare — subtle light reflection on curved screen */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'radial-gradient(ellipse 60% 45% at 30% 25%, rgba(255,255,255,0.10) 0%, transparent 70%)',
            }}
          />
          {/* Scanline tint at top edge for curvature highlight */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, transparent 8%, transparent 92%, rgba(0,0,0,0.3) 100%)',
            }}
          />
        </div>
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
