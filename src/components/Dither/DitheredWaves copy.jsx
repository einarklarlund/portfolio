/* eslint-disable react/no-unknown-property */
import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import RetroEffect from './RetroEffect'

const waveVertexShader = `
precision highp float;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
}
`

const waveFragmentShader = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec2 mousePos;
uniform int enableMouseInteraction;
uniform float mouseRadius;
uniform sampler2D velocityMap;
uniform int enableVelocityMap;
#define MAX_SDFS 8
uniform int sdfCount;
uniform int sdfTypes[MAX_SDFS];
uniform vec2 sdfCenters[MAX_SDFS];
uniform vec3 sdfSizes[MAX_SDFS];
uniform float sdfFalloffs[MAX_SDFS];
uniform float sdfIntensities[MAX_SDFS];

vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

const int OCTAVES = 4;
float fbm(vec2 p) {
  float value = 0.0;
  float amp = 1.0;
  float freq = waveFrequency;
  for (int i = 0; i < OCTAVES; i++) {
    value += amp * abs(cnoise(p));
    p *= freq;
    amp *= waveAmplitude;
  }
  return value;
}

float pattern(vec2 p) {
  vec2 p2 = p - time * waveSpeed;
  return fbm(p + fbm(p2));
}

vec2 setupUV() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;
  return uv;
}

// Displaces uv by the velocity/pressure field and returns pressure magnitude.
vec2 applyVelocityField(vec2 uv, out float pressureMag) {
  pressureMag = 0.0;
  if (enableVelocityMap == 1) {
    vec2 screenUV = gl_FragCoord.xy / resolution.xy;
    vec4 vel = texture2D(velocityMap, screenUV);
    uv -= vel.rg;  // swirl: trails left by cursor movement
    uv -= vel.ba;  // pressure: smoke parted outward from cursor position
    pressureMag = length(vel.ba);
  }
  return uv;
}

float sdfBox(vec2 uv, int i) {
  vec2 d = abs(uv - sdfCenters[i]) - sdfSizes[i].xy * 0.5;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdfCircle(vec2 uv, int i) {
  return length(uv - sdfCenters[i]) - sdfSizes[i].z;
}

float applySdfs(float f, vec2 coordUV) {
  for (int i = 0; i < MAX_SDFS; i++) {
    if (i >= sdfCount) break;
    float sdf;
    if (sdfTypes[i] == 0) {
      sdf = sdfBox(coordUV, i);
    } else if (sdfTypes[i] == 2) {
      sdf = abs(sdfBox(coordUV, i));
    } else {
      sdf = sdfCircle(coordUV, i);
    }
    float sdfVal = 1.0 - smoothstep(0.0, max(sdfFalloffs[i], 0.0001), max(sdf, 0.0));
    sdfVal *= sdfIntensities[i];
    f = clamp(f + sdfVal, 0.0, 1.0);
  }
  return f;
}

// Darken proportionally to pressure. Stored pressure is clamped to [0, 0.5]
// in the velocity shader, so *2 maps the full range to a [0, 1] darkness factor.
float applyPressureDarkening(float f, float pressureMag) {
  return f / (1.0 - clamp(pressureMag * 2.0, 0.0, 1.0));
}

void main() {
  float pressureMag;
  vec2 uv = applyVelocityField(setupUV(), pressureMag);

  float f = clamp(pattern(uv), 0.0, 1.0);

  vec2 coordUV = gl_FragCoord.xy / resolution.xy;
  coordUV.y = 1.0 - coordUV.y;
  f = applySdfs(f, coordUV);

  f = applyPressureDarkening(f, pressureMag);

  gl_FragColor = vec4(vec3(f), 1.0);
}
`

// Renders one step of the velocity field:
//   - 3×3 Gaussian blur of the previous frame's velocity (spreads/swirls)
//   - Decay multiplier (velocity dissipates over time)
//   - Gaussian "paint" of the current mouse delta at the cursor position
const velocityVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

const velocityFragmentShader = `
precision highp float;
uniform sampler2D prevVelocity;
uniform vec2 mousePos;       // pixel coords (top-left origin)
uniform vec2 mouseDelta;     // accumulated pixel delta this frame
uniform float mouseRadius;   // noise-space radius (matches wave shader)
uniform vec2 resolution;
uniform float waveSpeed;     // matches the wave shader's waveSpeed
uniform float deltaTime;     // seconds since last frame
uniform float pushStrength;  // steady-state noise-space displacement at rim
uniform float pressureDecay; // per-frame pressure retention (higher = slower refill)
varying vec2 vUv;

// 3×3 Gaussian blur of the velocity field centred on src.
vec2 blurVelocity(vec2 src, vec2 texel) {
  vec2 v = vec2(0.0);
  v += texture2D(prevVelocity, src + vec2(-1.0,-1.0)*texel).rg * 0.0625;
  v += texture2D(prevVelocity, src + vec2( 0.0,-1.0)*texel).rg * 0.125;
  v += texture2D(prevVelocity, src + vec2( 1.0,-1.0)*texel).rg * 0.0625;
  v += texture2D(prevVelocity, src + vec2(-1.0, 0.0)*texel).rg * 0.125;
  v += texture2D(prevVelocity, src               ).rg * 0.25;
  v += texture2D(prevVelocity, src + vec2( 1.0, 0.0)*texel).rg * 0.125;
  v += texture2D(prevVelocity, src + vec2(-1.0, 1.0)*texel).rg * 0.0625;
  v += texture2D(prevVelocity, src + vec2( 0.0, 1.0)*texel).rg * 0.125;
  v += texture2D(prevVelocity, src + vec2( 1.0, 1.0)*texel).rg * 0.0625;
  return v;
}

// Clamp a 2D vector's magnitude to limit without changing its direction.
vec2 clampMag(vec2 v, float limit) {
  float mag = length(v);
  return mag > limit ? v / mag * limit : v;
}

// Gaussian-falloff swirl added to v by the mouse delta this frame.
// Convert pixel delta to noise-space units.
// Both axes divide by resolution.y: y-span covers resolution.y pixels, and after
// aspect-correction x-span does too. Flip Y: pixel-Y increases downward, noise-Y upward.
vec2 mouseSwirlContribution(vec2 uvAspect, vec2 mouseAspect) {
  float dist = length(uvAspect - mouseAspect);
  // Gaussian falloff — sigma scaled to mouseRadius so the push area matches the clear area
  float sigma   = mouseRadius * 0.4;
  float falloff = exp(-dist * dist / (2.0 * sigma * sigma));
  vec2 delta = vec2(mouseDelta.x, -mouseDelta.y) / resolution.y;
  return delta * falloff * 2.0;
}

// Update the pressure/parting field (BA channels).
// Outward push: invDist falloff (smooth-clamped so no singularity at cursor).
// mouseRadius^2 / (dist^2 + eps^2) gives ~1 at dist=mouseRadius, rises to a
// cap of 5 at the centre, then tapers to zero beyond 2.5×mouseRadius.
// Normalise gain so that steady-state displacement at rim equals pushStrength
// regardless of pressureDecay. (geometric-series limit: gain / (1-decay) = strength)
vec2 updatePressure(vec2 src, vec2 uvAspect, vec2 mouseAspect) {
  // Read the previous pressure, advected with the wave pattern (same src as blur)
  vec2 p = texture2D(prevVelocity, src).ba;
  // Decay — this is the "refill speed": closer to 1 = slower refill
  p *= pressureDecay;

  float distP   = length(uvAspect - mouseAspect);
  float eps     = mouseRadius * 0.1;
  float invDist = min((mouseRadius * mouseRadius) / (distP * distP + eps * eps), 5.0);
  float taper   = 1.0 - smoothstep(mouseRadius * 1.5, mouseRadius * 2.5, distP);
  vec2 pushDir  = distP < eps ? vec2(0.0) : normalize(uvAspect - mouseAspect);

  p += pushDir * invDist * taper * pushStrength * (1.0 - pressureDecay);
  return clampMag(p, 0.5);
}

void main() {
  vec2 texel  = 1.0 / resolution;
  float aspect = resolution.x / resolution.y;

  // Advect the sample origin so stored velocity drifts with the wave pattern.
  // The noise pattern moves by (deltaTime * waveSpeed) in both noise-x and noise-y
  // each frame. Converting to FBO UV space: divide x by aspect, y stays as-is.
  vec2 waveAdvect = vec2(deltaTime * waveSpeed / aspect, deltaTime * waveSpeed);
  vec2 src = vUv - waveAdvect;

  // Convert mouse pixel position to screen UV (y flipped: WebGL bottom-left, DOM top-left)
  vec2 mouseUV     = vec2(mousePos.x / resolution.x, 1.0 - mousePos.y / resolution.y);
  // Aspect-corrected positions used by both swirl and pressure helpers
  vec2 uvAspect    = (vUv     - 0.5) * vec2(aspect, 1.0);
  vec2 mouseAspect = (mouseUV - 0.5) * vec2(aspect, 1.0);

  vec2 v = blurVelocity(src, texel) * 0.995;  // decay so swirls dissipate over time
  v = clampMag(v + mouseSwirlContribution(uvAspect, mouseAspect), 0.3);

  vec2 p = updatePressure(src, uvAspect, mouseAspect);

  gl_FragColor = vec4(v, p);
}
`

export default function DitheredWaves({
  waveSpeed,
  waveFrequency,
  waveAmplitude,
  waveColor,
  backgroundColor,
  colorNum,
  pixelSize,
  disableAnimation,
  enableMouseInteraction,
  mouseRadius,
  mousePushStrength = 0.15,
  pressureDecay = 0.92,
  sdfs = [],
}) {
  const mesh = useRef(null)
  const mouseRef = useRef(new THREE.Vector2())
  const mouseDeltaRef = useRef(new THREE.Vector2())
  const { viewport, size, gl } = useThree()

  // --- Velocity FBO ping-pong ---
  const fboRef = useRef({ read: null, write: null })
  const velSceneRef = useRef(new THREE.Scene())
  const velCameraRef = useRef(new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1))
  const velMeshRef = useRef(null)
  const velUniformsRef = useRef({
    prevVelocity: new THREE.Uniform(null),
    mousePos: new THREE.Uniform(new THREE.Vector2()),
    mouseDelta: new THREE.Uniform(new THREE.Vector2()),
    mouseRadius: new THREE.Uniform(mouseRadius),
    resolution: new THREE.Uniform(new THREE.Vector2()),
    waveSpeed: new THREE.Uniform(waveSpeed),
    deltaTime: new THREE.Uniform(0),
    pushStrength: new THREE.Uniform(0.15),
    pressureDecay: new THREE.Uniform(0.92),
  })

  const MAX_SDFS = 8
  const waveUniformsRef = useRef({
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
    sdfCount: new THREE.Uniform(0),
    sdfTypes: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfCenters: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector2())),
    sdfSizes: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector3())),
    sdfFalloffs: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfIntensities: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
  })

  // Create / resize velocity FBOs and velocity-update mesh
  useEffect(() => {
    const dpr = gl.getPixelRatio()
    const w = Math.floor(size.width * dpr)
    const h = Math.floor(size.height * dpr)

    fboRef.current.read?.dispose()
    fboRef.current.write?.dispose()

    const opts = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      depthBuffer: false,
    }
    fboRef.current.read  = new THREE.WebGLRenderTarget(w, h, opts)
    fboRef.current.write = new THREE.WebGLRenderTarget(w, h, opts)

    velUniformsRef.current.resolution.value.set(w, h)

    // Build the full-screen quad for velocity updates (only once)
    if (!velMeshRef.current) {
      const mat = new THREE.ShaderMaterial({
        vertexShader: velocityVertexShader,
        fragmentShader: velocityFragmentShader,
        uniforms: velUniformsRef.current,
      })
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
      velSceneRef.current.add(quad)
      velMeshRef.current = quad
    }

    waveUniformsRef.current.enableVelocityMap.value = 1
  }, [size, gl])

  // Sync wave-shader resolution
  useEffect(() => {
    const dpr = gl.getPixelRatio()
    const w = Math.floor(size.width * dpr)
    const h = Math.floor(size.height * dpr)
    const res = waveUniformsRef.current.resolution.value
    if (res.x !== w || res.y !== h) res.set(w, h)
  }, [size, gl])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const waveColorObj = useMemo(() => new THREE.Color(...waveColor).convertSRGBToLinear(), [waveColor[0], waveColor[1], waveColor[2]])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bgColorObj = useMemo(() => new THREE.Color(...backgroundColor).convertSRGBToLinear(), [backgroundColor[0], backgroundColor[1], backgroundColor[2]])

  useFrame(({ clock, gl: renderer }, delta) => {
    const u  = waveUniformsRef.current
    const vu = velUniformsRef.current

    if (!disableAnimation) u.time.value = clock.getElapsedTime()

    if (u.waveSpeed.value    !== waveSpeed)    u.waveSpeed.value    = waveSpeed
    if (u.waveFrequency.value !== waveFrequency) u.waveFrequency.value = waveFrequency
    if (u.waveAmplitude.value !== waveAmplitude) u.waveAmplitude.value = waveAmplitude

    u.enableMouseInteraction.value = enableMouseInteraction ? 1 : 0
    u.mouseRadius.value = mouseRadius

    if (enableMouseInteraction) {
      u.mousePos.value.copy(mouseRef.current)
    }

    // --- Velocity FBO update ---
    const { read, write } = fboRef.current
    if (enableMouseInteraction && read && write) {
      vu.prevVelocity.value = read.texture
      vu.mousePos.value.copy(mouseRef.current)
      vu.mouseDelta.value.copy(mouseDeltaRef.current)
      vu.mouseRadius.value = mouseRadius
      vu.waveSpeed.value = waveSpeed
      vu.deltaTime.value = disableAnimation ? 0 : delta
      vu.pushStrength.value = mousePushStrength
      vu.pressureDecay.value = pressureDecay

      renderer.setRenderTarget(write)
      renderer.render(velSceneRef.current, velCameraRef.current)
      renderer.setRenderTarget(null)

      // Ping-pong swap
      const tmp = fboRef.current.read
      fboRef.current.read  = fboRef.current.write
      fboRef.current.write = tmp

      u.velocityMap.value = fboRef.current.read.texture
    }

    // Consume delta — reset so it doesn't repeat on the next frame
    mouseDeltaRef.current.set(0, 0)

    const activeSdfs = sdfs ?? []
    u.sdfCount.value = Math.min(activeSdfs.length, MAX_SDFS)
    activeSdfs.slice(0, MAX_SDFS).forEach((sdf, i) => {
      u.sdfTypes.value[i] = sdf.type === 'circle' ? 1 : sdf.type === 'box_outline' ? 2 : 0
      u.sdfCenters.value[i].set(sdf.x, sdf.y)
      u.sdfSizes.value[i].set(sdf.width ?? 0, sdf.height ?? 0, sdf.radius ?? 0)
      u.sdfFalloffs.value[i]   = sdf.falloff    ?? 0.1
      u.sdfIntensities.value[i] = sdf.intensity  ?? 0.75
    })
  })

  useEffect(() => {
    if (!enableMouseInteraction) return
    const handleMouseMove = e => {
      const rect = gl.domElement.getBoundingClientRect()
      const dpr  = gl.getPixelRatio()
      const newX = (e.clientX - rect.left) * dpr
      const newY = (e.clientY - rect.top)  * dpr
      // Accumulate delta between frames
      mouseDeltaRef.current.x += newX - mouseRef.current.x
      mouseDeltaRef.current.y += newY - mouseRef.current.y
      mouseRef.current.set(newX, newY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [enableMouseInteraction, gl])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      fboRef.current.read?.dispose()
      fboRef.current.write?.dispose()
      velMeshRef.current?.geometry.dispose()
      velMeshRef.current?.material.dispose()
    }
  }, [])

  return (
    <>
      <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={waveVertexShader}
          fragmentShader={waveFragmentShader}
          uniforms={waveUniformsRef.current}
        />
      </mesh>

      <EffectComposer>
        <RetroEffect
          colorNum={colorNum}
          pixelSize={pixelSize}
          waveColor={waveColorObj}
          backgroundColor={bgColorObj}
        />
      </EffectComposer>
    </>
  )
}
