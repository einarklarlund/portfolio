import { forwardRef, useRef } from 'react'
import { wrapEffect } from '@react-three/postprocessing'
import { Effect } from 'postprocessing'
import * as THREE from 'three'
import { useColorUniforms } from '../hooks/useColorUniforms'
import ditherFrag from '../shaders/dither.frag.glsl?raw'

// Post-processing pass: applies 8×8 Bayer-matrix ordered dithering on top of
// the wave pass and quantizes to `colorNum` levels, then remaps the resulting
// single-channel scalar between `backgroundColor` and `waveColor`.
class DitherEffectImpl extends Effect {
  constructor() {
    const uniforms = new Map([
      ['colorNum', new THREE.Uniform(4.0)],
      ['pixelSize', new THREE.Uniform(2.0)],
      ['waveColor', new THREE.Uniform(new THREE.Color(1, 1, 1))],
      ['backgroundColor', new THREE.Uniform(new THREE.Color(0, 0, 0))],
    ])
    super('DitherEffect', ditherFrag, { uniforms })
    this.uniforms = uniforms
  }
  set colorNum(v) { this.uniforms.get('colorNum').value = v }
  get colorNum() { return this.uniforms.get('colorNum').value }
  set pixelSize(v) { this.uniforms.get('pixelSize').value = v }
  get pixelSize() { return this.uniforms.get('pixelSize').value }
  set waveColor(v) { this.uniforms.get('waveColor').value.copy(v) }
  get waveColor() { return this.uniforms.get('waveColor').value }
  set backgroundColor(v) { this.uniforms.get('backgroundColor').value.copy(v) }
  get backgroundColor() { return this.uniforms.get('backgroundColor').value }
}

const WrappedDither = wrapEffect(DitherEffectImpl)

const DitherEffect = forwardRef(({ colorNum, pixelSize }, outerRef) => {
  const effectRef = useRef()
  useColorUniforms(effectRef)

  return (
    <WrappedDither
      ref={(node) => {
        effectRef.current = node
        if (outerRef) typeof outerRef === 'function' ? outerRef(node) : (outerRef.current = node)
      }}
      colorNum={colorNum}
      pixelSize={pixelSize}
    />
  )
})
DitherEffect.displayName = 'DitherEffect'

export default DitherEffect
