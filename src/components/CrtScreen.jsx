import { useEffect, useRef } from 'react'

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

// Background color as RGB components
const BG_R = 0x37, BG_G = 0x35, BG_B = 0x3E

// Pre-computed lookup tables for CRT phosphor colors (indexed 0-255 by channel value)
const CRT_LUT = (() => {
  const rR = new Uint8Array(256), rG = new Uint8Array(256), rB = new Uint8Array(256)
  const gR = new Uint8Array(256), gG = new Uint8Array(256), gB = new Uint8Array(256)
  const bR = new Uint8Array(256), bG = new Uint8Array(256), bB = new Uint8Array(256)
  for (let v = 0; v < 256; v++) {
    rR[v] = Math.min(255, Math.round(v * 1.6 + 80))
    rG[v] = Math.floor(v * 0.25)
    rB[v] = Math.floor(v * 0.18)
    gR[v] = Math.floor(v * 0.18)
    gG[v] = Math.min(255, Math.round(v * 1.6 + 70))
    gB[v] = Math.floor(v * 0.18)
    bR[v] = Math.floor(v * 0.18)
    bG[v] = Math.floor(v * 0.25)
    bB[v] = Math.min(255, Math.round(v * 1.6 + 80))
  }
  return { rR, rG, rB, gR, gG, gB, bR, bG, bB }
})()

// Reusable ImageData to avoid allocation each frame
let _crtImageData = null
let _crtBuf = null

function renderCRT(ctx, pixels, srcW, srcH, canvasW, canvasH, cellSize) {
  const subW = Math.floor(cellSize / 4)
  const gap = Math.max(0, Math.floor(cellSize / 12))
  const totalBarW = subW * 3 + gap * 2
  const padX = Math.floor((cellSize - totalBarW) / 2)
  const maxH = cellSize - 2

  // Reuse or create ImageData buffer
  if (!_crtImageData || _crtImageData.width !== canvasW || _crtImageData.height !== canvasH) {
    _crtImageData = ctx.createImageData(canvasW, canvasH)
    _crtBuf = new Uint32Array(_crtImageData.data.buffer)
  }
  const buf32 = _crtBuf
  const buf8 = _crtImageData.data

  // Fill background
  // Pack ABGR (little-endian: R at byte 0, then G, B, A)
  const bgPixel = (255 << 24) | (BG_B << 16) | (BG_G << 8) | BG_R
  buf32.fill(bgPixel)

  const { rR, rG, rB, gR, gG, gB, bR, bG, bB } = CRT_LUT

  for (let cy = 0; cy < canvasH; cy += cellSize) {
    for (let cx = 0; cx < canvasW; cx += cellSize) {
      const px = Math.min(cx, srcW - 1)
      const py = Math.min(cy, srcH - 1)
      // Chromatic bleed: offset R left, B right by 2px
      const rxp = px > 1 ? px - 2 : 0
      const bxp = px + 2 < srcW ? px + 2 : srcW - 1
      const ri = (py * srcW + rxp) * 4
      const gi = (py * srcW + px) * 4
      const bi = (py * srcW + bxp) * 4
      const r = pixels[ri]
      const g = pixels[gi + 1]
      const b = pixels[bi + 2]

      // Channel values and LUT colors
      const vals = [r, g, b]
      const cR = [rR[r], gR[g], bR[b]]
      const cG = [rG[r], gG[g], bG[b]]
      const cB = [rB[r], gB[g], bB[b]]

      for (let s = 0; s < 3; s++) {
        const v = vals[s]
        const intensity = v / 255
        const alpha = 0.65 + 0.35 * intensity
        const barH = Math.max(4, Math.round((0.4 + 0.6 * intensity) * maxH))
        const barX = cx + padX + s * (subW + gap)
        const barY = cy + cellSize - 1 - barH

        // Blend bar color with alpha onto background
        const cr = cR[s], cg = cG[s], cb = cB[s]
        const blendR = (cr * alpha + BG_R * (1 - alpha)) | 0
        const blendG = (cg * alpha + BG_G * (1 - alpha)) | 0
        const blendB = (cb * alpha + BG_B * (1 - alpha)) | 0
        const barPixel = (255 << 24) | (blendB << 16) | (blendG << 8) | blendR

        // Draw the bar directly into the buffer
        const xEnd = Math.min(barX + subW, canvasW)
        const yEnd = Math.min(barY + barH, canvasH)
        for (let y = barY; y < yEnd; y++) {
          const rowOff = y * canvasW
          for (let x = barX; x < xEnd; x++) {
            buf32[rowOff + x] = barPixel
          }
        }

        // Glow pass — wider bar with lower alpha, composited on existing content
        if (intensity > 0.25) {
          const glowAlpha = (intensity - 0.25) * 0.6
          const invGlow = 1 - glowAlpha
          const gx0 = Math.max(barX - 1, 0)
          const gx1 = Math.min(barX + subW + 1, canvasW)
          for (let y = barY; y < yEnd; y++) {
            const rowOff = y * canvasW
            for (let x = gx0; x < gx1; x++) {
              const idx = (rowOff + x) * 4
              buf8[idx]     = (cr * glowAlpha + buf8[idx]     * invGlow) | 0
              buf8[idx + 1] = (cg * glowAlpha + buf8[idx + 1] * invGlow) | 0
              buf8[idx + 2] = (cb * glowAlpha + buf8[idx + 2] * invGlow) | 0
            }
          }
        }
      }
    }
  }

  // Scanlines — darken every other cell row
  for (let y = 0; y < canvasH; y += cellSize * 2) {
    const slY = y + cellSize - 1
    if (slY >= canvasH) break
    const rowOff = slY * canvasW
    for (let x = 0; x < canvasW; x++) {
      const i = (rowOff + x) * 4
      buf8[i]     = (buf8[i] * 0.94) | 0
      buf8[i + 1] = (buf8[i + 1] * 0.94) | 0
      buf8[i + 2] = (buf8[i + 2] * 0.94) | 0
    }
  }

  ctx.putImageData(_crtImageData, 0, 0)
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

export default function CrtScreen() {
  const canvasRef = useRef(null)
  const screenRef = useRef(null)

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

      const FRAME_INTERVAL = 1000 / 24  // 24 fps
      let lastFrameTime = 0

      function render(t) {
        if (cancelled) return

        if (t - lastFrameTime < FRAME_INTERVAL) {
          frameId = requestAnimationFrame(render)
          return
        }
        lastFrameTime = t

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
  )
}
