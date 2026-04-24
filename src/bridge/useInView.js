import { useEffect, useRef, useState } from 'react'

// Fires once the target's visible area crosses `amount`. One-shot by default
// so we don't thrash state when the user scrolls back past a revealed
// section. Returns [ref, inView].
export function useInView({ amount = 0.1, once = true } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold: amount },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [amount, once])

  return [ref, inView]
}
