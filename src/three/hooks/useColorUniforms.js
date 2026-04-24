import { useFrame } from '@react-three/fiber'
import { useDitherStore } from '../../store/ditherStore'

// Per-frame: copy the store's waveColor and backgroundColor into the wave
// shader's colour uniforms. Colours stay in the authoring sRGB-ish [0,1]
// space; the inlined shader mixes there and the result lands on the
// framebuffer directly — no EffectComposer in the pipeline.
export function useColorUniforms(waveUniformsRef) {
  useFrame(() => {
    const u = waveUniformsRef.current
    if (!u) return
    const { waveColor, backgroundColor } = useDitherStore.getState()
    u.waveColor.value.set(waveColor[0], waveColor[1], waveColor[2])
    u.backgroundColor.value.set(backgroundColor[0], backgroundColor[1], backgroundColor[2])
  })
}
