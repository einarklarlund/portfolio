import { useRef, useEffect, useId } from 'react'
import { useDitherContext } from '../DitherContext'

export default function BoxSdfFrame({ children, falloff = 0.2, intensity = 0.1 }) {
  const frameRef = useRef(null)
  const { registerSdf, unregisterSdf } = useDitherContext()
  const id = useId()
  const prevRef = useRef(null)

  useEffect(() => {
    function updateSdf() {
      const el = frameRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight

      const cx = (rect.left + rect.width / 2) / vw
      const cy = (rect.top + rect.height / 2) / vh
      const w = rect.width / vw
      const h = rect.height / vh

      const prev = prevRef.current
      if (prev && prev.cx === cx && prev.cy === cy && prev.w === w && prev.h === h) return

      prevRef.current = { cx, cy, w, h }
      registerSdf(id, { type: 'box_outline', x: cx, y: cy, width: w, height: h, falloff, intensity })
    }

    updateSdf()
    window.addEventListener('scroll', updateSdf, { passive: true })
    window.addEventListener('resize', updateSdf)
    return () => {
      prevRef.current = null
      window.removeEventListener('scroll', updateSdf)
      window.removeEventListener('resize', updateSdf)
      unregisterSdf(id)
    }
  }, [id, registerSdf, unregisterSdf, falloff, intensity])

  return (
    <div ref={frameRef} style={{ position: 'relative', width: '100%' }}>
      {children}
    </div>
  )
}
