import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useDitherStore } from '../../store/ditherStore'

// Owns the pointer pipeline: a window mousemove listener writes DPR-scaled
// pixel coords into the store (mutation, no re-render), and a per-frame tick
// copies those coords into both shader uniform blocks and consumes the delta
// (zeroing dx/dy so one mousemove = one frame of pressure).
export function useMousePointer(waveUniformsRef, velocityUniformsRef, enabled) {
  const { gl } = useThree()

  useEffect(() => {
    if (!enabled) return
    const handler = (e) => {
      const rect = gl.domElement.getBoundingClientRect()
      const dpr = gl.getPixelRatio()
      const newX = (e.clientX - rect.left) * dpr
      const newY = (e.clientY - rect.top) * dpr
      const { mouse } = useDitherStore.getState()
      mouse.dx += newX - mouse.x
      mouse.dy += newY - mouse.y
      mouse.x = newX
      mouse.y = newY
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [enabled, gl])

  useFrame(() => {
    if (!enabled) return
    const { mouse } = useDitherStore.getState()
    waveUniformsRef.current.mousePos.value.set(mouse.x, mouse.y)
    velocityUniformsRef.current.mousePos.value.set(mouse.x, mouse.y)
    velocityUniformsRef.current.mouseDelta.value.set(mouse.dx, mouse.dy)
    mouse.dx = 0
    mouse.dy = 0
  })
}
