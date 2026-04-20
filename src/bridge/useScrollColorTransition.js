import { useEffect } from 'react'
import { useDitherStore } from '../store/ditherStore'

function lerp(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t)
}

// As the user scrolls into `sectionRef`, fade the store's waveColor from
// `prevColor` → `sectionColor` over one viewport of scroll. Once past the
// transition zone, locks to `sectionColor`. Written with mutation-in-place so
// no React re-render happens per scroll event.
export function useScrollColorTransition(sectionRef, sectionColor, prevColor) {
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

      const next = scrollY <= sectionTop
        ? lerp(prevColor, sectionColor, (scrollY - rangeStart) / vh)
        : sectionColor

      // Mutate in place — three.js reads .waveColor each frame regardless.
      const state = useDitherStore.getState()
      state.waveColor[0] = next[0]
      state.waveColor[1] = next[1]
      state.waveColor[2] = next[2]
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sectionRef, sectionColor, prevColor])
}
