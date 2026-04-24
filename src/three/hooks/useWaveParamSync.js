import { useEffect } from 'react'

// Props from <BackgroundCanvas /> → shader uniforms. These change only on
// React renders, so useEffect is the right scope. The uniform blocks are
// passed in via refs (three.js uniforms are mutated in place; refs let us do
// that without tripping React's immutability checks on hook arguments).
export function useWaveParamSync(
  waveUniformsRef,
  velocityUniformsRef,
  {
    waveSpeed,
    waveFrequency,
    waveAmplitude,
    enableMouseInteraction,
    mouseRadius,
    mousePushStrength,
    pressureDecay,
    colorNum,
    pixelSize,
  },
) {
  useEffect(() => {
    waveUniformsRef.current.colorNum.value = colorNum
  }, [colorNum, waveUniformsRef])

  useEffect(() => {
    waveUniformsRef.current.pixelSize.value = pixelSize
  }, [pixelSize, waveUniformsRef])

  useEffect(() => {
    waveUniformsRef.current.waveSpeed.value = waveSpeed
    velocityUniformsRef.current.waveSpeed.value = waveSpeed
  }, [waveSpeed, waveUniformsRef, velocityUniformsRef])

  useEffect(() => {
    waveUniformsRef.current.waveFrequency.value = waveFrequency
  }, [waveFrequency, waveUniformsRef])

  useEffect(() => {
    waveUniformsRef.current.waveAmplitude.value = waveAmplitude
  }, [waveAmplitude, waveUniformsRef])

  useEffect(() => {
    waveUniformsRef.current.enableMouseInteraction.value = enableMouseInteraction ? 1 : 0
  }, [enableMouseInteraction, waveUniformsRef])

  useEffect(() => {
    waveUniformsRef.current.mouseRadius.value = mouseRadius
    velocityUniformsRef.current.mouseRadius.value = mouseRadius
  }, [mouseRadius, waveUniformsRef, velocityUniformsRef])

  useEffect(() => {
    waveUniformsRef.current.pushStrength.value = mousePushStrength
    velocityUniformsRef.current.pushStrength.value = mousePushStrength
  }, [mousePushStrength, waveUniformsRef, velocityUniformsRef])

  useEffect(() => {
    velocityUniformsRef.current.pressureDecay.value = pressureDecay
  }, [pressureDecay, velocityUniformsRef])
}
