import { useRef, useEffect, useId, useCallback } from 'react'
import { useDitherContext } from '../DitherContext'

export default function BoxSdfFrame({ children, falloff = 0.2, intensity = 0.3, layoutKey }) {
  const frameRef = useRef(null)
  const { registerSdf, unregisterSdf } = useDitherContext()
  const id = useId()

  const currentRef = useRef({ intensity: 0, falloff: 0 })
  const targetRef = useRef({ intensity, falloff })
  const posRef = useRef(null)
  const rafRef = useRef(null)

  // Keep target ref in sync with props without triggering effects
  targetRef.current = { intensity, falloff }

  const startAnimation = useCallback(() => {
    if (rafRef.current) return

    function tick() {
      // Remeasure every frame so the SDF tracks framer-motion layout animations
      const el = frameRef.current
      let posChanged = false
      if (el) {
        const rect = el.getBoundingClientRect()
        const vw = window.innerWidth
        const vh = window.innerHeight
        const newPos = {
          cx: (rect.left + rect.width / 2) / vw,
          cy: (rect.top + rect.height / 2) / vh,
          w: rect.width / vw,
          h: rect.height / vh,
        }
        const prev = posRef.current
        if (!prev || prev.cx !== newPos.cx || prev.cy !== newPos.cy ||
            prev.w !== newPos.w || prev.h !== newPos.h) {
          posChanged = true
        }
        posRef.current = newPos
      }

      const LERP = 0.12
      const THRESHOLD = 0.00001
      const curr = currentRef.current
      const tgt = targetRef.current

      curr.intensity += (tgt.intensity - curr.intensity) * LERP
      curr.falloff += (tgt.falloff - curr.falloff) * LERP

      const doneIntensity = Math.abs(tgt.intensity - curr.intensity) < THRESHOLD
      const doneFalloff = Math.abs(tgt.falloff - curr.falloff) < THRESHOLD
      if (doneIntensity) curr.intensity = tgt.intensity
      if (doneFalloff) curr.falloff = tgt.falloff

      const pos = posRef.current
      if (pos) {
        registerSdf(id, {
          type: 'box_outline',
          x: pos.cx, y: pos.cy, width: pos.w, height: pos.h,
          falloff: curr.falloff, intensity: curr.intensity,
        })
      }

      if (doneIntensity && doneFalloff && !posChanged) {
        rafRef.current = null
      } else {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [id, registerSdf])

  // Restart the loop when props or external layout signals change
  useEffect(() => {
    startAnimation()
  }, [intensity, falloff, layoutKey, startAnimation])

  useEffect(() => {
    startAnimation()
    window.addEventListener('scroll', startAnimation, { passive: true })
    window.addEventListener('resize', startAnimation)
    return () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      posRef.current = null
      window.removeEventListener('scroll', startAnimation)
      window.removeEventListener('resize', startAnimation)
      unregisterSdf(id)
    }
  }, [id, unregisterSdf, startAnimation])

  return (
    <div ref={frameRef} style={{ position: 'relative', width: '100%' }}>
      {children}
    </div>
  )
}
