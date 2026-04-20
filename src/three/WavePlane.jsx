import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer } from '@react-three/postprocessing'
import DitherEffect from './effects/DitherEffect'
import { createWaveUniforms, createVelocityUniforms } from './uniforms'
import { useVelocityFBO } from './hooks/useVelocityFBO'
import { useMousePointer } from './hooks/useMousePointer'
import { useSdfUniforms } from './hooks/useSdfUniforms'
import { useWaveParamSync } from './hooks/useWaveParamSync'
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
//
// Renders the fullscreen wave plane plus the dither post-processing pass.
// Colour uniforms live inside DitherEffect itself.
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

  useFrame(({ clock }, delta) => {
    const u = waveUniformsRef.current
    if (!props.disableAnimation) u.time.value = clock.getElapsedTime()
    renderVelocity(props.disableAnimation ? 0 : delta)
  })

  return (
    <>
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

      <EffectComposer>
        <DitherEffect colorNum={props.colorNum} pixelSize={props.pixelSize} />
      </EffectComposer>
    </>
  )
}
