import { useEffect, useRef } from 'react'

const PLACEHOLDER_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
  '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
]

const BG = '#dcdcda'

function drawVideoCover(ctx, video, w, h) {
  const vr = video.videoWidth / video.videoHeight
  const cr = w / h
  let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight
  if (vr > cr) {
    sw = video.videoHeight * cr
    sx = (video.videoWidth - sw) / 2
  } else {
    sh = video.videoWidth / cr
    sy = (video.videoHeight - sh) / 2
  }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h)
}

function drawBlobSource(octx, w, h, t) {
  octx.fillStyle = '#111'
  octx.fillRect(0, 0, w, h)
  for (let i = 0; i < 6; i++) {
    const x = w * (0.2 + 0.6 * Math.sin(t * 0.0008 + i * 1.2))
    const y = h * (0.2 + 0.6 * Math.cos(t * 0.0006 + i * 0.9))
    const r = 80 + 60 * Math.sin(t * 0.001 + i)
    const gradient = octx.createRadialGradient(x, y, 0, x, y, r)
    gradient.addColorStop(0, PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length])
    gradient.addColorStop(1, 'transparent')
    octx.fillStyle = gradient
    octx.beginPath()
    octx.arc(x, y, r, 0, Math.PI * 2)
    octx.fill()
  }
}

function renderHalftone(ctx, pixels, srcW, srcH, canvasW, canvasH, dotSpacing) {
  const maxRadius = dotSpacing / 2 - 0.5
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, canvasW, canvasH)
  for (let y = 0; y < canvasH; y += dotSpacing) {
    for (let x = 0; x < canvasW; x += dotSpacing) {
      const px = Math.min(Math.floor(x), srcW - 1)
      const py = Math.min(Math.floor(y), srcH - 1)
      const i = (py * srcW + px) * 4
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const brightness = (r + g + b) / (3 * 255)
      const radius = brightness * maxRadius
      if (radius > 0.5) {
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
}

export default function HalftoneBackground({ src = '/halftone.mp4' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dotSpacing = 8
    const offscreen = document.createElement('canvas')
    let frameId = 0

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create video imperatively so we can call .play() explicitly —
    // avoids Chrome refusing to advance readyState on display:none elements.
    const video = document.createElement('video')
    video.src = src
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    video.play().catch(() => { /* autoplay blocked — blob fallback will be used */ })

    function render(t) {
      const w = canvas.width
      const h = canvas.height
      offscreen.width = w
      offscreen.height = h
      const octx = offscreen.getContext('2d')

      const videoReady = video.readyState >= 2 && video.videoWidth > 0

      if (videoReady) {
        try {
          drawVideoCover(octx, video, w, h)
          const { data } = octx.getImageData(0, 0, w, h)
          renderHalftone(ctx, data, w, h, w, h, dotSpacing)
          frameId = requestAnimationFrame(render)
          return
        } catch {
          // CORS tainted canvas — fall through to blob fallback
        }
      }

      drawBlobSource(octx, w, h, t)
      const { data } = octx.getImageData(0, 0, w, h)
      renderHalftone(ctx, data, w, h, w, h, dotSpacing)
      frameId = requestAnimationFrame(render)
    }

    frameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      video.pause()
      video.src = ''
    }
  }, [src])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  )
}
