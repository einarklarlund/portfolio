/* eslint-disable react/no-unknown-property */
import { useRef, useEffect } from 'react'
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

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;
  float f = pattern(uv);
  f = clamp(f, 0.0, 1.0);
  if (enableMouseInteraction == 1) {
    vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
    mouseNDC.x *= resolution.x / resolution.y;
    float dist = length(uv - mouseNDC);
    float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
    f -= 0.5 * effect;
  }
  vec2 coordUV = gl_FragCoord.xy / resolution.xy;
  coordUV.y = 1.0 - coordUV.y;
  for (int i = 0; i < MAX_SDFS; i++) {
    if (i >= sdfCount) break;
    float sdf;
    if (sdfTypes[i] == 0) {
      vec2 d = abs(coordUV - sdfCenters[i]) - sdfSizes[i].xy * 0.5;
      sdf = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    } else {
      sdf = length(coordUV - sdfCenters[i]) - sdfSizes[i].z;
    }
    float sdfVal = 1.0 - smoothstep(0.0, max(sdfFalloffs[i], 0.0001), max(sdf, 0.0));
    sdfVal *= sdfIntensities[i];
    f = clamp(f + sdfVal, 0.0, 1.0);
  }
  gl_FragColor = vec4(vec3(f), 1.0);
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
  sdfs = [],
}) {
  const mesh = useRef(null)
  const mouseRef = useRef(new THREE.Vector2())
  const { viewport, size, gl } = useThree()

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
    sdfCount: new THREE.Uniform(0),
    sdfTypes: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfCenters: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector2())),
    sdfSizes: new THREE.Uniform(Array.from({ length: MAX_SDFS }, () => new THREE.Vector3())),
    sdfFalloffs: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
    sdfIntensities: new THREE.Uniform(new Array(MAX_SDFS).fill(0)),
  })

  useEffect(() => {
    const dpr = gl.getPixelRatio()
    const w = Math.floor(size.width * dpr),
      h = Math.floor(size.height * dpr)
    const res = waveUniformsRef.current.resolution.value
    if (res.x !== w || res.y !== h) {
      res.set(w, h)
    }
  }, [size, gl])

  useFrame(({ clock }) => {
    const u = waveUniformsRef.current

    if (!disableAnimation) {
      u.time.value = clock.getElapsedTime()
    }

    if (u.waveSpeed.value !== waveSpeed) u.waveSpeed.value = waveSpeed
    if (u.waveFrequency.value !== waveFrequency) u.waveFrequency.value = waveFrequency
    if (u.waveAmplitude.value !== waveAmplitude) u.waveAmplitude.value = waveAmplitude

    u.enableMouseInteraction.value = enableMouseInteraction ? 1 : 0
    u.mouseRadius.value = mouseRadius

    if (enableMouseInteraction) {
      u.mousePos.value.copy(mouseRef.current)
    }

    const activeSdfs = sdfs ?? []
    u.sdfCount.value = Math.min(activeSdfs.length, MAX_SDFS)
    activeSdfs.slice(0, MAX_SDFS).forEach((sdf, i) => {
      u.sdfTypes.value[i] = sdf.type === 'circle' ? 1 : 0
      u.sdfCenters.value[i].set(sdf.x, sdf.y)
      u.sdfSizes.value[i].set(sdf.width ?? 0, sdf.height ?? 0, sdf.radius ?? 0)
      u.sdfFalloffs.value[i] = sdf.falloff ?? 0.1
      u.sdfIntensities.value[i] = sdf.intensity ?? 0.75
    })
  })

  const handlePointerMove = e => {
    if (!enableMouseInteraction) return
    const rect = gl.domElement.getBoundingClientRect()
    const dpr = gl.getPixelRatio()
    mouseRef.current.set((e.clientX - rect.left) * dpr, (e.clientY - rect.top) * dpr)
  }

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
          waveColor={new THREE.Color(...waveColor).convertSRGBToLinear()}
          backgroundColor={new THREE.Color(...backgroundColor).convertSRGBToLinear()}
        />
      </EffectComposer>

      <mesh
        onPointerMove={handlePointerMove}
        position={[0, 0, 0.01]}
        scale={[viewport.width, viewport.height, 1]}
        visible={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  )
}
