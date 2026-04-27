import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useDitherStore } from '../../store/ditherStore'
import { MAX_SDFS, SDF_TYPE } from '../constants'

const LERP = 0.12
const SNAP_THRESHOLD = 0.00001

// Every frame: iterate store.sdfs, measure each registered DOM element, lerp
// its intensity/falloff toward the stored targets, and push the result into
// both shader uniform blocks. Per-SDF `sdfDeltas` (UV-space movement since
// last frame) feed the velocity shader's swirl effect.
//
// Replaces the per-<BoxSdfFrame> RAF loop from the pre-refactor code. One
// loop, one layout flush, batched per frame.
export function useSdfUniforms(waveUniformsRef, velocityUniformsRef) {
  const currentById = useRef(new Map())      // id -> { intensity, falloff }
  const prevCenterById = useRef(new Map())   // id -> { x, y } for swirl deltas

  useFrame(() => {
    const { sdfs } = useDitherStore.getState()

    // Drop entries whose SDFs have been unregistered.
    for (const id of currentById.current.keys()) {
      if (!sdfs.has(id)) currentById.current.delete(id)
    }
    for (const id of prevCenterById.current.keys()) {
      if (!sdfs.has(id)) prevCenterById.current.delete(id)
    }

    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = waveUniformsRef.current
    const vu = velocityUniformsRef.current

    let i = 0
    for (const [id, entry] of sdfs) {
      if (i >= MAX_SDFS) break
      const el = entry.el?.current
      if (!el) continue  // element not mounted yet; skip this slot

      const rect = el.getBoundingClientRect()
      const cx = (rect.left + rect.width / 2) / vw
      const cy = (rect.top + rect.height / 2) / vh
      const ww = rect.width / vw
      const hh = rect.height / vh

      const cur = currentById.current.get(id) ?? { intensity: 0, falloff: 0, scale: 0 }
      const targetScale = entry.targetScale ?? 1
      cur.intensity += (entry.targetIntensity - cur.intensity) * LERP
      cur.falloff += (entry.targetFalloff - cur.falloff) * LERP
      cur.scale += (targetScale - cur.scale) * LERP
      if (Math.abs(entry.targetIntensity - cur.intensity) < SNAP_THRESHOLD) cur.intensity = entry.targetIntensity
      if (Math.abs(entry.targetFalloff - cur.falloff) < SNAP_THRESHOLD) cur.falloff = entry.targetFalloff
      if (Math.abs(targetScale - cur.scale) < SNAP_THRESHOLD) cur.scale = targetScale
      currentById.current.set(id, cur)

      const type = SDF_TYPE[entry.type] ?? SDF_TYPE.box
      const sw = ww * cur.scale
      const sh = hh * cur.scale
      const sr = (entry.radius ?? 0) * cur.scale

      w.sdfTypes.value[i] = type
      w.sdfCenters.value[i].set(cx, cy)
      w.sdfSizes.value[i].set(sw, sh, sr)
      w.sdfFalloffs.value[i] = cur.falloff
      w.sdfIntensities.value[i] = cur.intensity

      vu.sdfTypes.value[i] = type
      vu.sdfCenters.value[i].copy(w.sdfCenters.value[i])
      vu.sdfSizes.value[i].copy(w.sdfSizes.value[i])
      vu.sdfFalloffs.value[i] = cur.falloff
      vu.sdfIntensities.value[i] = cur.intensity

      const prev = prevCenterById.current.get(id)
      if (prev) {
        vu.sdfDeltas.value[i].set(cx - prev.x, cy - prev.y)
      } else {
        vu.sdfDeltas.value[i].set(0, 0)
      }
      prevCenterById.current.set(id, { x: cx, y: cy })

      i++
    }

    w.sdfCount.value = i
    vu.sdfCount.value = i
  })
}
