import { useCallback, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import velocityVert from '../shaders/velocity.vert.glsl?raw'
import velocityFrag from '../shaders/velocity.frag.glsl?raw'

// Owns the velocity-field ping-pong: two half-float RGBA FBOs, a fullscreen
// quad running the velocity shader, and the per-frame render-then-swap. Also
// syncs the shared `resolution` uniforms (used by both wave and velocity
// shaders) since FBO sizing and uniform resolution share the same source.
export function useVelocityFBO(waveUniformsRef, velocityUniformsRef, enabled) {
  const { gl, size } = useThree()
  const fbosRef = useRef({ read: null, write: null })
  const sceneRef = useRef(new THREE.Scene())
  const cameraRef = useRef(new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1))
  const meshRef = useRef(null)

  useEffect(() => {
    const dpr = gl.getPixelRatio()
    const w = Math.floor(size.width * dpr)
    const h = Math.floor(size.height * dpr)

    fbosRef.current.read?.dispose()
    fbosRef.current.write?.dispose()

    const opts = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      depthBuffer: false,
    }
    fbosRef.current.read = new THREE.WebGLRenderTarget(w, h, opts)
    fbosRef.current.write = new THREE.WebGLRenderTarget(w, h, opts)

    waveUniformsRef.current.resolution.value.set(w, h)
    velocityUniformsRef.current.resolution.value.set(w, h)

    if (!meshRef.current) {
      const mat = new THREE.ShaderMaterial({
        vertexShader: velocityVert,
        fragmentShader: velocityFrag,
        uniforms: velocityUniformsRef.current,
      })
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
      sceneRef.current.add(quad)
      meshRef.current = quad
    }

    waveUniformsRef.current.enableVelocityMap.value = 1
  }, [size, gl, waveUniformsRef, velocityUniformsRef])

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    // Dispose whatever FBO pair is live at unmount — the ping-pong rotates
    // fbosRef.current over the component's lifetime, which is expected here.
    return () => {
      fbosRef.current.read?.dispose()
      fbosRef.current.write?.dispose()
      meshRef.current?.geometry.dispose()
      meshRef.current?.material.dispose()
    }
  }, [])
  /* eslint-enable react-hooks/exhaustive-deps */

  // Call once per frame from WavePlane's useFrame. `delta` is passed through
  // to the shader as the advection time-step; caller passes 0 when paused.
  const renderVelocity = useCallback((delta) => {
    if (!enabled) return
    const { read, write } = fbosRef.current
    if (!read || !write) return

    velocityUniformsRef.current.prevVelocity.value = read.texture
    velocityUniformsRef.current.deltaTime.value = delta

    gl.setRenderTarget(write)
    gl.render(sceneRef.current, cameraRef.current)
    gl.setRenderTarget(null)

    fbosRef.current.read = write
    fbosRef.current.write = read
    waveUniformsRef.current.velocityMap.value = fbosRef.current.read.texture
  }, [enabled, gl, waveUniformsRef, velocityUniformsRef])

  return renderVelocity
}
