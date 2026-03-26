/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber'
import DitheredWaves from './DitheredWaves'
import './Dither.css'

export default function Dither({
  waveSpeed = 0.05,
  waveFrequency = 3,
  waveAmplitude = 0.3,
  waveColor = [0.5, 0.5, 0.5],
  backgroundColor = [0, 0, 0],
  colorNum = 4,
  pixelSize = 2,
  disableAnimation = false,
  enableMouseInteraction = true,
  mouseRadius = 1,
  // Steady-state noise-space displacement at mouseRadius distance from cursor.
  // Higher values = more aggressive parting.
  mousePushStrength = 0.15,
  // Per-frame pressure retention (0–1). Higher = slower refill after cursor passes.
  // Typical range: 0.85 (fast) – 0.98 (slow).
  pressureDecay = 0.92,
  sdfs = [],
}) {
  return (
    <Canvas
      className="dither-container"
      camera={{ position: [0, 0, 6] }}
      dpr={1}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <DitheredWaves
        waveSpeed={waveSpeed}
        waveFrequency={waveFrequency}
        waveAmplitude={waveAmplitude}
        waveColor={waveColor}
        backgroundColor={backgroundColor}
        colorNum={colorNum}
        pixelSize={pixelSize}
        disableAnimation={disableAnimation}
        enableMouseInteraction={enableMouseInteraction}
        mouseRadius={mouseRadius}
        mousePushStrength={mousePushStrength}
        pressureDecay={pressureDecay}
        sdfs={sdfs}
      />
    </Canvas>
  )
}
