/* eslint-disable react/no-unknown-property */
import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import RetroEffect from './RetroEffect'
import { waveVertexShader, waveFragmentShader } from './waveShader'
import { velocityVertexShader, velocityFragmentShader } from './velocityShader'
import { MAX_SDFS } from './constants'
import './Dither.css'

function WaveScene({
  ditherStateRef,
  waveSpeed,
  waveFrequency,
  waveAmplitude,
  colorNum,
  pixelSize,
  disableAnimation,
  enableMouseInteraction,
  mouseRadius,
  mousePushStrength,
  pressureDecay,
}) {
  const mesh = useRef(null)
  const mouseRef = useRef(new THREE.Vector2())
  const mouseDeltaRef = useRef(new THREE.Vector2())
  const prevSdfCentersRef = useRef(Array.from({ length: MAX_SDFS }, () => new THREE.Vector2()))
  const prevSdfCountRef = useRef(0)
  const { viewport, size, gl } = useThree()

  // --- Velocity FBO ping-pong ---
  const fboRef = useRef({ read: null, write: null })
  const velSceneRef = useRef(new THREE.Scene())
  const velCameraRef = useRef(new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1))
  const velMeshRef = useRef(null)
  const velUniformsRef = useRef({
    prevVelocity: new THREE.Uniform(null),
    mousePos: new THREE.Uniform(new THREE.Vector2()),
    mouseDelta: new THREE.Uniform(new THREE.Vector2()),
    mouseRadius: new THREE.Uniform(mouseRadius),
    resolution: new THREE.Uniform(new THREE.Vector2()),
    waveSpeed: new THREE.Uniform(waveSpeed),
    deltaTime: new THREE.Uniform(0),
    pushStrength: new THREE.Uniform(0.15),
    pressureDecay: new THREE.Uniform(0.92),
    sdfCount: new THREE.Uniform(0),
    sdfTypes: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfCenters: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector2())),
    sdfSizes: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector3())),
    sdfFalloffs: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfIntensities: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfDeltas: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector2())),
  })
  const waveUniformsRef = useRef({
    time: new THREE.Uniform(0),
    resolution: new THREE.Uniform(new THREE.Vector2(0, 0)),
    waveSpeed: new THREE.Uniform(waveSpeed),
    waveFrequency: new THREE.Uniform(waveFrequency),
    waveAmplitude: new THREE.Uniform(waveAmplitude),
    mousePos: new THREE.Uniform(new THREE.Vector2(0, 0)),
    enableMouseInteraction: new THREE.Uniform(enableMouseInteraction ? 1 : 0),
    mouseRadius: new THREE.Uniform(mouseRadius),
    velocityMap: new THREE.Uniform(null),
    enableVelocityMap: new THREE.Uniform(0),
    pushStrength: new THREE.Uniform(mousePushStrength),
    sdfCount: new THREE.Uniform(0),
    sdfTypes: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfCenters: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector2())),
    sdfSizes: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector3())),
    sdfFalloffs: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfIntensities: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
  })

  // Create / resize velocity FBOs and velocity-update mesh
  useEffect(() => {
    const dpr = gl.getPixelRatio()
    const w = Math.floor(size.width * dpr)
    const h = Math.floor(size.height * dpr)

    fboRef.current.read?.dispose()
    fboRef.current.write?.dispose()

    const opts = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      depthBuffer: false,
    }
    fboRef.current.read  = new THREE.WebGLRenderTarget(w, h, opts)
    fboRef.current.write = new THREE.WebGLRenderTarget(w, h, opts)

    velUniformsRef.current.resolution.value.set(w, h)

    // Build the full-screen quad for velocity updates (only once)
    if (!velMeshRef.current) {
      const mat = new THREE.ShaderMaterial({
        vertexShader: velocityVertexShader,
        fragmentShader: velocityFragmentShader,
        uniforms: velUniformsRef.current,
      })
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
      velSceneRef.current.add(quad)
      velMeshRef.current = quad
    }

    waveUniformsRef.current.enableVelocityMap.value = 1
  }, [size, gl])

  // Sync wave-shader resolution
  useEffect(() => {
    const dpr = gl.getPixelRatio()
    const w = Math.floor(size.width * dpr)
    const h = Math.floor(size.height * dpr)
    const res = waveUniformsRef.current.resolution.value
    if (res.x !== w || res.y !== h) res.set(w, h)
  }, [size, gl])

  useFrame(({ clock, gl: renderer }, delta) => {
    const u  = waveUniformsRef.current
    const vu = velUniformsRef.current

    if (!disableAnimation) u.time.value = clock.getElapsedTime()

    if (u.waveSpeed.value    !== waveSpeed)    u.waveSpeed.value    = waveSpeed
    if (u.waveFrequency.value !== waveFrequency) u.waveFrequency.value = waveFrequency
    if (u.waveAmplitude.value !== waveAmplitude) u.waveAmplitude.value = waveAmplitude

    u.enableMouseInteraction.value = enableMouseInteraction ? 1 : 0
    u.mouseRadius.value = mouseRadius

    if (enableMouseInteraction) {
      u.mousePos.value.copy(mouseRef.current)
    }

    // --- Velocity FBO update ---
    const { read, write } = fboRef.current
    if (enableMouseInteraction && read && write) {
      vu.prevVelocity.value = read.texture
      vu.mousePos.value.copy(mouseRef.current)
      vu.mouseDelta.value.copy(mouseDeltaRef.current)
      vu.mouseRadius.value = mouseRadius
      vu.waveSpeed.value = waveSpeed
      vu.deltaTime.value = disableAnimation ? 0 : delta
      vu.pushStrength.value = mousePushStrength
      vu.pressureDecay.value = pressureDecay

      renderer.setRenderTarget(write)
      renderer.render(velSceneRef.current, velCameraRef.current)
      renderer.setRenderTarget(null)

      // Ping-pong swap
      const tmp = fboRef.current.read
      fboRef.current.read  = fboRef.current.write
      fboRef.current.write = tmp

      u.velocityMap.value = fboRef.current.read.texture
    }

    // Consume delta — reset so it doesn't repeat on the next frame
    mouseDeltaRef.current.set(0, 0)

    u.pushStrength.value = mousePushStrength

    const activeSdfs = Object.values(ditherStateRef.current.sdfs)
    const sdfCount = Math.min(activeSdfs.length, MAX_SDFS)
    const prevCount = prevSdfCountRef.current
    u.sdfCount.value  = sdfCount
    vu.sdfCount.value = sdfCount
    for (let i = 0; i < sdfCount; i++) {
      const sdf       = activeSdfs[i]
      const type      = sdf.type === 'circle' ? 1 : sdf.type === 'box_outline' ? 2 : 0
      const falloff   = sdf.falloff   ?? 0.1
      const intensity = sdf.intensity ?? 0.75
      u.sdfTypes.value[i]       = type
      u.sdfCenters.value[i].set(sdf.x, sdf.y)
      u.sdfSizes.value[i].set(sdf.width ?? 0, sdf.height ?? 0, sdf.radius ?? 0)
      u.sdfFalloffs.value[i]    = falloff
      u.sdfIntensities.value[i] = intensity
      vu.sdfTypes.value[i]      = type
      vu.sdfCenters.value[i].copy(u.sdfCenters.value[i])
      vu.sdfSizes.value[i].copy(u.sdfSizes.value[i])
      vu.sdfFalloffs.value[i]   = falloff
      vu.sdfIntensities.value[i] = intensity
      // Compute per-SDF delta for swirl; zero out on first frame a new SDF appears
      const prev = prevSdfCentersRef.current[i]
      if (i < prevCount) {
        vu.sdfDeltas.value[i].set(sdf.x - prev.x, sdf.y - prev.y)
      } else {
        vu.sdfDeltas.value[i].set(0, 0)
      }
      prev.set(sdf.x, sdf.y)
    }
    prevSdfCountRef.current = sdfCount
  })

  useEffect(() => {
    if (!enableMouseInteraction) return
    const handleMouseMove = e => {
      const rect = gl.domElement.getBoundingClientRect()
      const dpr  = gl.getPixelRatio()
      const newX = (e.clientX - rect.left) * dpr
      const newY = (e.clientY - rect.top)  * dpr
      // Accumulate delta between frames
      mouseDeltaRef.current.x += newX - mouseRef.current.x
      mouseDeltaRef.current.y += newY - mouseRef.current.y
      mouseRef.current.set(newX, newY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [enableMouseInteraction, gl])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      fboRef.current.read?.dispose()
      fboRef.current.write?.dispose()
      velMeshRef.current?.geometry.dispose()
      velMeshRef.current?.material.dispose()
    }
  }, [])

  return (
    <>
      <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={waveVertexShader}
          fragmentShader={waveFragmentShader}
          uniforms={waveUniformsRef.current}
        />
      </mesh>

      <EffectComposer>
        <RetroEffect
          colorNum={colorNum}
          pixelSize={pixelSize}
          ditherStateRef={ditherStateRef}
        />
      </EffectComposer>
    </>
  )
}

export default function DitheredWaves({
  ditherStateRef,
  waveSpeed = 0.05,
  waveFrequency = 3,
  waveAmplitude = 0.3,
  colorNum = 4,
  pixelSize = 2,
  disableAnimation = false,
  enableMouseInteraction = true,
  mouseRadius = 1,
  mousePushStrength = 0.125,
  pressureDecay = 0.92,
}) {
  return (
    <Canvas
      className="dither-container"
      camera={{ position: [0, 0, 6] }}
      dpr={1}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <WaveScene
        ditherStateRef={ditherStateRef}
        waveSpeed={waveSpeed}
        waveFrequency={waveFrequency}
        waveAmplitude={waveAmplitude}
        colorNum={colorNum}
        pixelSize={pixelSize}
        disableAnimation={disableAnimation}
        enableMouseInteraction={enableMouseInteraction}
        mouseRadius={mouseRadius}
        mousePushStrength={mousePushStrength}
        pressureDecay={pressureDecay}
      />
    </Canvas>
  )
}
