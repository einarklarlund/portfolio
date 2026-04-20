import { Canvas } from '@react-three/fiber'
import WavePlane from './WavePlane'
import './BackgroundCanvas.css'

// The R3F Canvas shell for the site's animated background: a fullscreen plane
// running the wave shader, with a dither post-processing pass composited on
// top. All React ↔ three.js state flows through the store in src/store/.
export default function BackgroundCanvas({
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
      className="background-canvas"
      camera={{ position: [0, 0, 6] }}
      dpr={1}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <WavePlane
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
