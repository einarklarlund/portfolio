import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { createWaveUniforms, createVelocityUniforms } from './uniforms'
import { useVelocityFBO } from './hooks/useVelocityFBO'
import { useMousePointer } from './hooks/useMousePointer'
import { useSdfUniforms } from './hooks/useSdfUniforms'
import { useWaveParamSync } from './hooks/useWaveParamSync'
import { useColorUniforms } from './hooks/useColorUniforms'
import waveVert from './shaders/wave.vert.glsl?raw'
import waveFrag from './shaders/wave.frag.glsl?raw'

// Orchestrates the background's three.js work. Owns the two shader uniform
// blocks (held in refs because three.js uniforms are mutated in place every
// frame) and delegates per-frame concerns to focused hooks:
//
//   useWaveParamSync   props → uniforms (render-scoped, not per-frame)
//   useMousePointer    DOM mouse → store → mouse uniforms (per-frame)
//   useVelocityFBO     ping-pong render target management (per-frame)
//   useSdfUniforms     store.sdfs → SDF uniforms via DOM measurement (per-frame)
//   useColorUniforms   store.waveColor/backgroundColor → wave uniforms (per-frame)
//
// Dither + colour-quantisation + 2-colour remap is done inside wave.frag.glsl,
// so the whole background is a single render pass with no EffectComposer.
export default function WavePlane(props) {
  const mesh = useRef(null)
  const { viewport } = useThree()

  const waveUniformsRef = useRef(null)
  const velocityUniformsRef = useRef(null)
  if (waveUniformsRef.current == null) waveUniformsRef.current = createWaveUniforms(props)
  if (velocityUniformsRef.current == null) velocityUniformsRef.current = createVelocityUniforms(props)

  useWaveParamSync(waveUniformsRef, velocityUniformsRef, props)
  useMousePointer(waveUniformsRef, velocityUniformsRef, props.enableMouseInteraction)
  const renderVelocity = useVelocityFBO(waveUniformsRef, velocityUniformsRef, props.enableMouseInteraction)
  useSdfUniforms(waveUniformsRef, velocityUniformsRef)
  useColorUniforms(waveUniformsRef)

  useFrame(({ clock }, delta) => {
    const u = waveUniformsRef.current
    if (!props.disableAnimation) u.time.value = clock.getElapsedTime()
    renderVelocity(props.disableAnimation ? 0 : delta)
  })

  return (
    <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={waveVert}
        fragmentShader={waveFrag}
        // three.js reads uniforms by identity; passing the ref's current
        // object here gives the ShaderMaterial the same object we mutate
        // in the per-frame hooks.
        // eslint-disable-next-line react-hooks/refs
        uniforms={waveUniformsRef.current}
      />
    </mesh>
  )
}
