import * as THREE from 'three'
import { MAX_SDFS } from './constants'

// Factories for the wave + velocity shader uniform blocks. Kept in one place so
// changes to uniform layout stay in sync with the .glsl files. The factories
// allocate fresh Vector instances for array slots — all mutation happens
// in-place in the per-frame hooks (never replace values with new objects).
export function createWaveUniforms({
  waveSpeed,
  waveFrequency,
  waveAmplitude,
  mouseRadius,
  mousePushStrength,
  enableMouseInteraction,
  colorNum,
  pixelSize,
}) {
  return {
    time: new THREE.Uniform(0),
    resolution: new THREE.Uniform(new THREE.Vector2(0, 0)),
    waveSpeed: new THREE.Uniform(waveSpeed),
    waveFrequency: new THREE.Uniform(waveFrequency),
    waveAmplitude: new THREE.Uniform(waveAmplitude),
    mousePos: new THREE.Uniform(new THREE.Vector2(0, 0)),
    enableMouseInteraction: new THREE.Uniform(enableMouseInteraction ? 1 : 0),
    mouseRadius: new THREE.Uniform(mouseRadius),
    velocityMap: new THREE.Uniform(null),
    enableVelocityMap: new THREE.Uniform(0),
    pushStrength: new THREE.Uniform(mousePushStrength),
    colorNum: new THREE.Uniform(colorNum),
    pixelSize: new THREE.Uniform(pixelSize),
    // Mutated in place each frame by useColorUniforms from the zustand store.
    waveColor: new THREE.Uniform(new THREE.Vector3(1, 1, 1)),
    backgroundColor: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
    sdfCount: new THREE.Uniform(0),
    sdfTypes: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfCenters: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector2())),
    sdfSizes: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector3())),
    sdfFalloffs: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfIntensities: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
  }
}

export function createVelocityUniforms({ waveSpeed, mouseRadius }) {
  return {
    prevVelocity: new THREE.Uniform(null),
    mousePos: new THREE.Uniform(new THREE.Vector2()),
    mouseDelta: new THREE.Uniform(new THREE.Vector2()),
    mouseRadius: new THREE.Uniform(mouseRadius),
    resolution: new THREE.Uniform(new THREE.Vector2()),
    waveSpeed: new THREE.Uniform(waveSpeed),
    deltaTime: new THREE.Uniform(0),
    pushStrength: new THREE.Uniform(0.15),
    pressureDecay: new THREE.Uniform(0.92),
    sdfCount: new THREE.Uniform(0),
    sdfTypes: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfCenters: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector2())),
    sdfSizes: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector3())),
    sdfFalloffs: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfIntensities: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfDeltas: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector2())),
  }
}
