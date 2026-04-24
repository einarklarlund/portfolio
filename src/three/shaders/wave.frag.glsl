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
uniform float pushStrength;
uniform float colorNum;
uniform float pixelSize;
uniform vec3 waveColor;
uniform vec3 backgroundColor;
#define MAX_SDFS 12
uniform int sdfCount;
uniform int sdfTypes[MAX_SDFS];
uniform vec2 sdfCenters[MAX_SDFS];
uniform vec3 sdfSizes[MAX_SDFS];
uniform float sdfFalloffs[MAX_SDFS];
uniform float sdfIntensities[MAX_SDFS];

const float bayerMatrix8x8[64] = float[64](
  0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
  32.0/64.0,16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0,19.0/64.0, 47.0/64.0, 31.0/64.0,
  8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0,59.0/64.0,  7.0/64.0, 55.0/64.0,
  40.0/64.0,24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0,27.0/64.0, 39.0/64.0, 23.0/64.0,
  2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0,49.0/64.0, 13.0/64.0, 61.0/64.0,
  34.0/64.0,18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0,17.0/64.0, 45.0/64.0, 29.0/64.0,
  10.0/64.0,58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0,57.0/64.0,  5.0/64.0, 53.0/64.0,
  42.0/64.0,26.0/64.0, 38.0/64.0, 22.0/64.0, 41.0/64.0,25.0/64.0, 37.0/64.0, 21.0/64.0
);

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

// SDF helpers (mirrored from the velocity shader, operating in DOM UV space).
float evalSdfValue(vec2 coordUV, int i) {
  if (sdfTypes[i] == 0) {
    vec2 d = abs(coordUV - sdfCenters[i]) - sdfSizes[i].xy * 0.5;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  } else if (sdfTypes[i] == 2) {
    vec2 d = abs(coordUV - sdfCenters[i]) - sdfSizes[i].xy * 0.5;
    return abs(length(max(d, 0.0)) + min(max(d.x, d.y), 0.0));
  } else {
    return length(coordUV - sdfCenters[i]) - sdfSizes[i].z;
  }
}

vec2 sdfGradientAspect(vec2 coordUV, int i, float aspect) {
  float e = 0.002;
  float dx = evalSdfValue(coordUV + vec2(e, 0.0), i) - evalSdfValue(coordUV - vec2(e, 0.0), i);
  float dy = evalSdfValue(coordUV + vec2(0.0, e), i) - evalSdfValue(coordUV - vec2(0.0, e), i);
  float len = length(vec2(dx, dy));
  if (len < 0.0001) return vec2(0.0);
  vec2 gradDomUV = vec2(dx, dy) / len;
  return normalize(vec2(gradDomUV.x * aspect, -gradDomUV.y));
}

// SDF displacement computed directly from current SDF geometry — no FBO
// accumulation, so the effect is always in sync with element positions even
// when the page is scrolled or elements move.
vec2 applySdfDisplacement(vec2 uv, vec2 coordUV, float aspect) {
  for (int i = 0; i < MAX_SDFS; i++) {
    if (i >= sdfCount) break;
    float sdfVal  = max(evalSdfValue(coordUV, i), 0.0);
    float falloff = max(sdfFalloffs[i], 0.0001);
    float w       = (1.0 - smoothstep(0.0, falloff, sdfVal)) * sdfIntensities[i];
    if (w < 0.001) continue;
    uv -= sdfGradientAspect(coordUV, i, aspect) * w * pushStrength;
  }
  return uv;
}

// Reads scalar mouse pressure from vel.b (maximum at cursor centre) and
// reconstructs the outward displacement direction from the current mouse position.
// This avoids the direction singularity at centre that caused a bright hole.
// Reads gl_FragCoord indirectly via `sampleCoord` so we can evaluate the wave
// at cell-center coordinates when pixelating.
vec2 applyVelocityField(vec2 uv, vec2 sampleCoord, out float pressureMag) {
  pressureMag = 0.0;
  if (enableVelocityMap == 1) {
    vec2 screenUV = sampleCoord / resolution.xy;
    vec4 vel = texture2D(velocityMap, screenUV);
    uv -= vel.rg;  // swirl: trails left by cursor movement
    pressureMag = vel.b;  // mouse pressure scalar — peaks at cursor centre
    if (enableMouseInteraction == 1 && pressureMag > 0.0001) {
      float aspect  = resolution.x / resolution.y;
      vec2 uvAspect = (screenUV - 0.5) * vec2(aspect, 1.0);
      vec2 mouseUV  = vec2(mousePos.x / resolution.x, 1.0 - mousePos.y / resolution.y);
      vec2 mAspect  = (mouseUV - 0.5) * vec2(aspect, 1.0);
      float dist    = length(uvAspect - mAspect);
      vec2 pushDir  = dist > 0.0001 ? normalize(uvAspect - mAspect) : vec2(0.0);
      uv -= pushDir * pressureMag;
    }
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
    f = clamp(f + sdfVal * 0.85, 0.0, 1.0);
  }
  return f;
}

// Darken proportionally to pressure. Stored pressure is clamped to [0, 0.5]
// in the velocity shader, so *2 maps the full range to a [0, 1] darkness factor.
float applyPressureDarkening(float f, float pressureMag) {
  return f / max((1.0 - clamp(pressureMag * 2.0, 0.0, 1.0)), 0.0001);
}

void main() {
  // Pixelate: snap this fragment to the corner of its pixelSize×pixelSize cell,
  // so every fragment in a cell evaluates the wave at the same coord. The
  // Bayer threshold below is also keyed on cellIdx, so the whole cell ends up
  // a single quantized colour — same as the old 2-pass (wave → dither) output.
  vec2 cellIdx     = floor(gl_FragCoord.xy / pixelSize);
  vec2 sampleCoord = cellIdx * pixelSize;

  vec2 uv = sampleCoord / resolution.xy;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;

  float pressureMag;
  uv = applyVelocityField(uv, sampleCoord, pressureMag);

  vec2 coordUV = sampleCoord / resolution.xy;
  coordUV.y = 1.0 - coordUV.y;
  float aspect = resolution.x / resolution.y;
  uv = applySdfDisplacement(uv, coordUV, aspect);

  float f = clamp(pattern(uv), 0.0, 1.0);
  f = applySdfs(f, coordUV);
  f = applyPressureDarkening(f, pressureMag);

  // Ordered dither: pick threshold from the Bayer matrix indexed by cell, nudge
  // f before quantizing so adjacent cells fall into different quantization
  // buckets and produce the dithered pattern.
  int bx = int(mod(cellIdx.x, 8.0));
  int by = int(mod(cellIdx.y, 8.0));
  float threshold = bayerMatrix8x8[by * 8 + bx] - 0.25;
  float stepSize  = 1.0 / (colorNum - 1.0);
  float q = clamp(f + threshold * stepSize, 0.0, 1.0);
  q = floor(q * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);

  gl_FragColor = vec4(mix(backgroundColor, waveColor, q), 1.0);
}
