import { useEffect } from 'react'
import { useDitherContext } from '../components/DitherContext'

function lerp(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t)
}

export function useWaveColorTransition(sectionRef, sectionColor, prevColor) {
  const { setDitherConfig } = useDitherContext()

  useEffect(() => {
    function handleScroll() {
      const el = sectionRef.current
      if (!el) return

      const vh = window.innerHeight
      const sectionTop = el.getBoundingClientRect().top + window.scrollY
      const sectionHeight = el.offsetHeight
      const scrollY = window.scrollY

      const rangeStart = sectionTop - vh
      const rangeEnd = sectionTop + sectionHeight - vh

      if (scrollY < rangeStart || scrollY > rangeEnd) return

      const waveColor = scrollY <= sectionTop
        ? lerp(prevColor, sectionColor, (scrollY - rangeStart) / vh)
        : sectionColor

      setDitherConfig(prev => {
        // Bail out early if color hasn't changed — avoids re-rendering all context
        // consumers (and re-allocating THREE.Color objects) on every scroll event.
        const [pr, pg, pb] = prev.waveColor
        const [nr, ng, nb] = waveColor
        if (pr === nr && pg === ng && pb === nb) return prev
        return { ...prev, waveColor }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sectionRef, sectionColor, prevColor, setDitherConfig])
}
