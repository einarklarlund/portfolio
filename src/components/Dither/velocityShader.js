// Renders one step of the velocity field:
//   - 3×3 Gaussian blur of the previous frame's velocity (spreads/swirls)
//   - Decay multiplier (velocity dissipates over time)
//   - Gaussian "paint" of the current mouse delta at the cursor position
export const velocityVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

export const velocityFragmentShader = `
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
#define MAX_SDFS 12
uniform int sdfCount;
uniform int sdfTypes[MAX_SDFS];
uniform vec2 sdfCenters[MAX_SDFS];
uniform vec3 sdfSizes[MAX_SDFS];
uniform float sdfFalloffs[MAX_SDFS];
uniform float sdfIntensities[MAX_SDFS];
uniform vec2 sdfDeltas[MAX_SDFS];
varying vec2 vUv;

// Evaluate SDF value in DOM UV space (Y=0 at top, matching sdfCenters convention).
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

// SDF-surface-falloff swirl added to v by an SDF's movement delta this frame.
// Intensity follows the same smoothstep profile as pressure — peaks at the
// SDF surface (sdfVal=0) and falls to zero over sdfFalloffs[i].
// Delta is in DOM UV units — converted to noise-space: x scaled by aspect, y flipped.
vec2 sdfSwirlContribution(vec2 coordUV, int i, float aspect) {
  float sdfVal  = max(evalSdfValue(coordUV, i), 0.0);
  float falloff = max(sdfFalloffs[i], 0.0001);
  float mag     = (1.0 - smoothstep(0.0, falloff, sdfVal)) * sdfIntensities[i];
  vec2 delta    = vec2(sdfDeltas[i].x * aspect, -sdfDeltas[i].y);
  return delta * mag * 2.0;
  // float sdfSwirlMax = 0.1;
  // return clampMag(delta * mag * 0.125, sdfSwirlMax);
}

// Accumulates combined mouse + SDF pressure in the B channel.
// Mouse: inverse-distance peak at cursor, tapered beyond mouseRadius.
// SDF:   falloff-based contribution at SDF edges, always in sync with geometry.
// Storing scalars (not 2D vectors) keeps the cursor/SDF centres at maximum
// value while outward directions are reconstructed live in the wave shader.
float updatePressure(vec2 src, vec2 uvAspect, vec2 mouseAspect, vec2 coordUV) {
  float p   = texture2D(prevVelocity, src).b;
  p        *= pressureDecay;

  // Mouse contribution
  float distP   = length(uvAspect - mouseAspect);
  float invDist = min((mouseRadius * mouseRadius) / (distP * distP), 5.0);
  float taper   = 1.0 - smoothstep(mouseRadius * 1.5, mouseRadius * 2.5, distP);
  p += invDist * taper * pushStrength * (1.0 - pressureDecay);

  // SDF contribution — same channel, same decay
  for (int i = 0; i < MAX_SDFS; i++) {
    if (i >= sdfCount) break;
    float sdfVal  = max(evalSdfValue(coordUV, i), 0.0);
    float falloff = max(sdfFalloffs[i], 0.0001);
    float mag     = (1.0 - smoothstep(0.0, falloff, sdfVal)) * sdfIntensities[i];
    p += mag * pushStrength * (1.0 - pressureDecay);
  }

  return p;
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
  vec2 coordUV     = vec2(vUv.x, 1.0 - vUv.y);  // DOM UV (Y=0 at top, matches sdfCenters)

  // Swirl: mouse + all moving SDFs, clamped to prevent runaway
  vec2 v = blurVelocity(src, texel) * 0.995;
  v += mouseSwirlContribution(uvAspect, mouseAspect);
  for (int i = 0; i < MAX_SDFS; i++) {
    if (i >= sdfCount) break;
    v += sdfSwirlContribution(coordUV, i, aspect);
  }
  v = clampMag(v, 0.3);

  // Pressure: mouse + SDF merged into the B channel
  float p = updatePressure(src, uvAspect, mouseAspect, coordUV);
  p = clamp(p, 0.0, 0.5);

  gl_FragColor = vec4(v, p, 0.0);
}
`
