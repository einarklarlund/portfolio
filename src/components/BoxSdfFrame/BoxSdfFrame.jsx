import { useRef } from 'react'
import { useSdfFromRef } from '../../bridge/useSdfFromRef'

// Wraps children and contributes a box-outline SDF around their bounding box.
// The shader reads the element's position directly each frame, so layout
// animations (CSS transitions, View Transitions) track without any polling here.
export default function BoxSdfFrame({ children, intensity = 0.3, falloff = 0.2 }) {
  const ref = useRef(null)
  useSdfFromRef(ref, { type: 'box_outline', intensity, falloff })
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {children}
    </div>
  )
}
