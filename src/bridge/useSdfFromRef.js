import { useEffect, useId } from 'react'
import { useDitherStore } from '../store/ditherStore'

// The write-side of the React ↔ three.js bridge for SDFs.
//
// Pass a ref to any DOM element and a type + target intensity/falloff. The
// element is registered in the store; three.js measures it each frame inside
// useSdfUniforms and smoothly lerps intensity/falloff toward the targets.
//
// Position is never written from React — three.js reads the bounding rect on
// its own tick. This means layout animations (CSS transitions, View
// Transitions) track perfectly without any polling on the React side.
export function useSdfFromRef(ref, { type = 'box_outline', intensity = 0, falloff = 0, radius = 0 } = {}) {
  const id = useId()
  const registerSdf = useDitherStore((s) => s.registerSdf)
  const unregisterSdf = useDitherStore((s) => s.unregisterSdf)

  useEffect(() => {
    registerSdf(id, {
      el: ref,
      type,
      targetIntensity: intensity,
      targetFalloff: falloff,
      radius,
    })
    return () => unregisterSdf(id)
    // Depend only on mount-time identity + shape. intensity/falloff changes
    // flow through the mutation effect below so we don't re-register the
    // entry (which would reset the lerp state in useSdfUniforms).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ref, type, radius, registerSdf, unregisterSdf])

  useEffect(() => {
    const entry = useDitherStore.getState().sdfs.get(id)
    if (!entry) return
    entry.targetIntensity = intensity
    entry.targetFalloff = falloff
  }, [id, intensity, falloff])
}
