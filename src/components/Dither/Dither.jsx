/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber'
import DitheredWaves from './DitheredWaves'
import './Dither.css'

export default function Dither({
  ditherStateRef,
  waveSpeed = 0.05,
  waveFrequency = 3,
  waveAmplitude = 0.3,
  colorNum = 4,
  pixelSize = 2,
  disableAnimation = false,
  enableMouseInteraction = true,
  mouseRadius = 1,
  mousePushStrength = 0.125,
  pressureDecay = 0.92,
}) {
  return (
    <Canvas
      className="dither-container"
      camera={{ position: [0, 0, 6] }}
      dpr={1}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <DitheredWaves
        ditherStateRef={ditherStateRef}
        waveSpeed={waveSpeed}
        waveFrequency={waveFrequency}
        waveAmplitude={waveAmplitude}
        colorNum={colorNum}
        pixelSize={pixelSize}
        disableAnimation={disableAnimation}
        enableMouseInteraction={enableMouseInteraction}
        mouseRadius={mouseRadius}
        mousePushStrength={mousePushStrength}
        pressureDecay={pressureDecay}
      />
    </Canvas>
  )
}
