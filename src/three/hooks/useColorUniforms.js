import { useFrame } from '@react-three/fiber'
import { useDitherStore } from '../../store/ditherStore'

// Per-frame: copy the store's waveColor and backgroundColor into the dither
// effect's uniform colours, converting sRGB → linear each frame (cheap, and
// keeps the store values in the authoring space that React code uses).
export function useColorUniforms(effectRef) {
  useFrame(() => {
    const effect = effectRef.current
    if (!effect) return
    const { waveColor, backgroundColor } = useDitherStore.getState()
    const [wr, wg, wb] = waveColor
    const [br, bg, bb] = backgroundColor
    effect.uniforms.get('waveColor').value.setRGB(wr, wg, wb).convertSRGBToLinear()
    effect.uniforms.get('backgroundColor').value.setRGB(br, bg, bb).convertSRGBToLinear()
  })
}
