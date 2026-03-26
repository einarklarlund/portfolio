import { useEffect } from 'react'
import { useDitherContext } from '../components/DitherContext'

function lerp(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t)
}

export function useWaveColorTransition(sectionRef, sectionColor, prevColor) {
  const { ditherStateRef } = useDitherContext()

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

      ditherStateRef.current.waveColor = scrollY <= sectionTop
        ? lerp(prevColor, sectionColor, (scrollY - rangeStart) / vh)
        : sectionColor
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sectionRef, sectionColor, prevColor, ditherStateRef])
}
