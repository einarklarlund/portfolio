import { useRef } from 'react'
import { useSdfFromRef } from '../../bridge/useSdfFromRef'

// Wraps children and contributes an SDF behind their bounding box.
// The shader reads the element's position directly each frame, so layout
// animations (CSS transitions, View Transitions) track without any polling here.
//
// `active` drives a 0→1 size tween: when false the SDF collapses to a point;
// when true it grows to the element's measured size. Use this to gate the
// reveal in sync with content fade-ins.
export default function BoxSdfFrame({
  children,
  type = 'box',
  intensity = 0.3,
  falloff = 0.12,
  active = true,
  style,
}) {
  const ref = useRef(null)
  useSdfFromRef(ref, { type, intensity, falloff, scale: active ? 1 : 0 })
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', ...style }}>
      {children}
    </div>
  )
}
