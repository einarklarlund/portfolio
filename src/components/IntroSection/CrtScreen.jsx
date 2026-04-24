import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import crtVert from '../../three/shaders/wave.vert.glsl?raw'
import crtFrag from '../../three/shaders/crt.frag.glsl?raw'

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

const BG_HEX = 0x37353E
const BG_CSS = '#37353E'

// Keep in sync with crt.frag.glsl's transState encoding.
const TRANS_PLAYING = 0
const TRANS_DESAT = 1
const TRANS_BLACK = 2
const TRANS_PARTIAL = 3

const DESAT_DURATION = 160
const BLACK_DURATION = 300
const PARTIAL_DURATION = 50

const CELL_SIZE = 4

function drawChannelText(ctx, w, h, idx) {
  ctx.clearRect(0, 0, w, h)
  const name = VIDEO_SOURCES[idx].channel
  const num = String(channelNumbers[idx])
  const numSize = Math.max(48, Math.round(w * 0.13))
  const nameSize = Math.max(36, Math.round(w * 0.08))
  const x = w - 20
  const y = 20
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.font = `${numSize}px "VT323", monospace`
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`CH ${num}`, x, y)
  ctx.font = `${nameSize}px "VT323", monospace`
  ctx.fillStyle = '#cccccc'
  ctx.fillText(name, x, y + numSize + 2)
}

function applyCurrentVideo(state, u) {
  const v = state.videos[state.vidIndex]
  u.videoTex.value = state.textures[state.vidIndex]
  const canvasW = u.resolution.value.x
  const canvasH = u.resolution.value.y
  if (canvasW <= 0 || canvasH <= 0) return
  const va = v.videoWidth && v.videoHeight ? v.videoWidth / v.videoHeight : 4 / 3
  const ca = canvasW / canvasH
  u.videoUvScaleX.value = ca / va
}

function redrawText(state) {
  const w = state.textCanvas.width
  const h = state.textCanvas.height
  if (w === 0 || h === 0) return
  drawChannelText(state.textCtx, w, h, state.vidIndex)
  state.textTex.needsUpdate = true
}

function CrtScene() {
  const { size, viewport } = useThree()
  const uniformsRef = useRef(null)
  const stateRef = useRef(null)

  if (uniformsRef.current == null) {
    uniformsRef.current = {
      videoTex: new THREE.Uniform(null),
      textTex: new THREE.Uniform(null),
      resolution: new THREE.Uniform(new THREE.Vector2(1, 1)),
      videoUvScaleX: new THREE.Uniform(1),
      bgColor: new THREE.Uniform(new THREE.Color(BG_HEX)),
      cellSize: new THREE.Uniform(CELL_SIZE),
      transState: new THREE.Uniform(TRANS_PLAYING),
      partialDstStart: new THREE.Uniform(0),
      partialSliceH: new THREE.Uniform(0),
      textAlpha: new THREE.Uniform(1),
    }
  }

  // One-time: create <video> elements, VideoTextures, text canvas/texture,
  // wire the transition state machine. Kept in an effect with [] so the
  // video objects survive resize events.
  useEffect(() => {
    const state = {
      videos: [],
      textures: [],
      onVideoEnded: null,
      ready: false,
      vidIndex: 0,
      nextVidIndex: 0,
      transState: TRANS_PLAYING,
      transStart: performance.now(),
      partialOffsetY: 0,
      textCanvas: document.createElement('canvas'),
      textCtx: null,
      textTex: null,
    }
    state.textCtx = state.textCanvas.getContext('2d')
    state.textTex = new THREE.CanvasTexture(state.textCanvas)
    state.textTex.minFilter = THREE.LinearFilter
    state.textTex.magFilter = THREE.LinearFilter
    state.textTex.generateMipmaps = false
    uniformsRef.current.textTex.value = state.textTex
    stateRef.current = state

    VIDEO_SOURCES.forEach((s) => {
      const video = document.createElement('video')
      video.src = s.url
      video.muted = true
      video.playsInline = true
      video.preload = 'metadata'
      video.crossOrigin = 'anonymous'
      video.style.display = 'none'
      document.body.appendChild(video)
      const tex = new THREE.VideoTexture(video)
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.generateMipmaps = false
      state.videos.push(video)
      state.textures.push(tex)
    })

    let cancelled = false

    Promise.all(state.videos.map((v) => new Promise((resolve) => {
      const done = () => resolve()
      v.addEventListener('loadedmetadata', done, { once: true })
      v.addEventListener('error', done, { once: true })
      setTimeout(done, 3000)
    }))).then(() => {
      if (cancelled) return
      state.vidIndex = Math.floor(Math.random() * state.videos.length)
      applyCurrentVideo(state, uniformsRef.current)
      redrawText(state)
      state.videos[state.vidIndex].play().catch(() => {})

      state.onVideoEnded = function () {
        if (cancelled || state.transState !== TRANS_PLAYING) return
        state.transState = TRANS_DESAT
        state.transStart = performance.now()
        let next
        do {
          next = Math.floor(Math.random() * state.videos.length)
        } while (next === state.vidIndex && state.videos.length > 1)
        state.nextVidIndex = next
        state.partialOffsetY = Math.random() * (uniformsRef.current.resolution.value.y * 2 / 3)
      }
      state.videos.forEach((v) => v.addEventListener('ended', state.onVideoEnded))
      state.ready = true
    })

    // VT323 may still be loading at initial draw — redraw once it's ready.
    if (typeof document !== 'undefined' && document.fonts && document.fonts.load) {
      document.fonts.load('48px "VT323"').then(() => {
        if (!cancelled && state.ready) redrawText(state)
      }).catch(() => {})
    }

    return () => {
      cancelled = true
      if (state.onVideoEnded) {
        state.videos.forEach((v) => v.removeEventListener('ended', state.onVideoEnded))
      }
      state.videos.forEach((v) => {
        v.pause()
        v.removeAttribute('src')
        v.load()
        v.remove()
      })
      state.textures.forEach((t) => t.dispose())
      if (state.textTex) state.textTex.dispose()
    }
  }, [])

  // Resize: sync resolution uniform + text canvas dimensions. Text canvas
  // matches screen size for crisp glyphs at the exact same positions as the
  // original CPU code (offsets in drawChannelText are in canvas pixels).
  useEffect(() => {
    const u = uniformsRef.current
    const w = Math.max(1, Math.round(size.width))
    const h = Math.max(1, Math.round(size.height))
    u.resolution.value.set(w, h)
    const state = stateRef.current
    if (!state) return
    if (state.textCanvas.width !== w || state.textCanvas.height !== h) {
      state.textCanvas.width = w
      state.textCanvas.height = h
    }
    if (state.ready) {
      redrawText(state)
      applyCurrentVideo(state, u)
    }
  }, [size.width, size.height])

  useFrame(() => {
    const state = stateRef.current
    if (!state || !state.ready) return
    const u = uniformsRef.current
    const t = performance.now()

    u.videoTex.value = state.textures[state.vidIndex]

    if (state.transState === TRANS_PLAYING) {
      u.transState.value = TRANS_PLAYING
      u.textAlpha.value = 1
    } else if (state.transState === TRANS_DESAT) {
      u.transState.value = TRANS_DESAT
      u.textAlpha.value = 0
      if (t - state.transStart >= DESAT_DURATION) {
        state.transState = TRANS_BLACK
        state.transStart = t
      }
    } else if (state.transState === TRANS_BLACK) {
      u.transState.value = TRANS_BLACK
      if (t - state.transStart >= BLACK_DURATION) {
        state.transState = TRANS_PARTIAL
        state.transStart = t
        const cur = state.videos[state.vidIndex]
        cur.pause()
        cur.currentTime = 0
        state.vidIndex = state.nextVidIndex
        applyCurrentVideo(state, u)
        redrawText(state)
        state.videos[state.vidIndex].currentTime = 0
      }
    } else if (state.transState === TRANS_PARTIAL) {
      u.transState.value = TRANS_PARTIAL
      u.textAlpha.value = 1
      u.partialSliceH.value = Math.floor(u.resolution.value.y / 3)
      u.partialDstStart.value = Math.floor(state.partialOffsetY)
      if (t - state.transStart >= PARTIAL_DURATION) {
        state.transState = TRANS_PLAYING
        state.videos[state.vidIndex].play().catch(() => {})
      }
    }
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={crtVert}
        fragmentShader={crtFrag}
        // eslint-disable-next-line react-hooks/refs
        uniforms={uniformsRef.current}
      />
    </mesh>
  )
}

export default function CrtScreen() {
  const screenRef = useRef(null)

  return (
    <div
      ref={screenRef}
      style={{
        flex: 1,
        minWidth: 0,
        position: 'relative',
        border: '6px solid #0a0a0a',
        overflow: 'hidden',
        background: BG_CSS,
      }}
    >
      <Canvas
        dpr={1}
        camera={{ position: [0, 0, 6] }}
        gl={{ antialias: false, outputColorSpace: THREE.LinearSRGBColorSpace }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <CrtScene />
      </Canvas>
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
