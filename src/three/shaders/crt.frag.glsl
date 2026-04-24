precision highp float;

uniform sampler2D videoTex;
uniform sampler2D textTex;
uniform vec2 resolution;
uniform float videoUvScaleX;
uniform vec3 bgColor;
uniform float cellSize;
uniform int transState;
uniform float partialDstStart;
uniform float partialSliceH;
uniform float textAlpha;

const int TRANS_PLAYING = 0;
const int TRANS_DESAT = 1;
const int TRANS_BLACK = 2;
const int TRANS_PARTIAL = 3;

// Sample the combined video+text source at integer pixel position
// (top-left origin), then apply the desat transformation if active.
vec3 sampleSource(vec2 pixelPos) {
  vec2 uv = (pixelPos + vec2(0.5)) / resolution;
  // three.js textures default to flipY=true, so sampling at
  // texUv.y == 1.0 returns the top row of the source image.
  vec2 texUv = vec2(uv.x, 1.0 - uv.y);

  vec2 vUvVideo = vec2((texUv.x - 0.5) * videoUvScaleX + 0.5, texUv.y);
  vec3 videoColor;
  if (vUvVideo.x < 0.0 || vUvVideo.x > 1.0) {
    videoColor = bgColor;
  } else {
    videoColor = texture2D(videoTex, vUvVideo).rgb;
  }

  vec4 textSample = texture2D(textTex, texUv);
  vec3 color = mix(videoColor, textSample.rgb, textSample.a * textAlpha);

  if (transState == TRANS_DESAT) {
    float avg = (color.r + color.g + color.b) / 3.0;
    color = (color + vec3(avg)) * 0.5;
  }
  return color;
}

// Partial-state wrapper: outside the slice, source is black (matching the
// zeroed Uint8ClampedArray in the original CPU path, which still gets
// fed through the CRT filter and produces dim baseline phosphor).
vec3 sampleSourceAtCell(vec2 cellPos) {
  if (transState == TRANS_PARTIAL) {
    float effY = cellPos.y - partialDstStart;
    if (effY < 0.0 || effY >= partialSliceH) return vec3(0.0);
    return sampleSource(vec2(cellPos.x, effY));
  }
  return sampleSource(cellPos);
}

// CRT_LUT in the original: per-channel phosphor colour as a function of
// byte-scale input value. Same math, computed analytically.
vec3 phosphorColor(int channel, float v) {
  if (channel == 0) {
    return vec3(
      min(255.0, v * 1.6 + 80.0),
      v * 0.25,
      v * 0.18
    ) / 255.0;
  } else if (channel == 1) {
    return vec3(
      v * 0.18,
      min(255.0, v * 1.6 + 70.0),
      v * 0.18
    ) / 255.0;
  }
  return vec3(
    v * 0.18,
    v * 0.25,
    min(255.0, v * 1.6 + 80.0)
  ) / 255.0;
}

void main() {
  if (transState == TRANS_BLACK) {
    gl_FragColor = vec4(bgColor, 1.0);
    return;
  }

  // Top-left origin pixel coordinates.
  float px = floor(gl_FragCoord.x);
  float py = floor(resolution.y - gl_FragCoord.y);

  // With cellSize=4 and barH≡4, each canvas row belongs to exactly one
  // cell's bar: the cell at cellSize * floor((py + 1) / cellSize).
  // (The bar at cell cy spans rows [cy - 1, cy + 3).)
  float cy = cellSize * floor((py + 1.0) / cellSize);
  float cx = floor(px / cellSize) * cellSize;

  float subW = floor(cellSize / 4.0);
  float gap = max(0.0, floor(cellSize / 12.0));
  float totalBarW = subW * 3.0 + gap * 2.0;
  float padX = floor((cellSize - totalBarW) / 2.0);
  float maxH = cellSize - 2.0;

  vec3 color = bgColor;

  // Glow extends bars horizontally by 1 px each side, so neighbour cells
  // in the same row can contribute to this pixel. Iterating left→right
  // reproduces the original cell draw order so glow overlaps composite
  // identically.
  for (int off = -1; off <= 1; off++) {
    float ncx = cx + float(off) * cellSize;
    if (ncx < 0.0 || ncx >= resolution.x) continue;

    // Chromatic bleed: R samples offset left, B offset right.
    float rxp = max(ncx - 2.0, 0.0);
    float bxp = min(ncx + 2.0, resolution.x - 1.0);
    vec3 sR = sampleSourceAtCell(vec2(rxp, cy));
    vec3 sG = sampleSourceAtCell(vec2(ncx, cy));
    vec3 sB = sampleSourceAtCell(vec2(bxp, cy));
    vec3 vBytes = vec3(sR.r, sG.g, sB.b) * 255.0;

    for (int s = 0; s < 3; s++) {
      float vs = (s == 0) ? vBytes.x : (s == 1) ? vBytes.y : vBytes.z;
      float intensity = vs / 255.0;
      float alpha = 0.65 + 0.35 * intensity;
      float barH = max(4.0, (0.4 + 0.6 * intensity) * maxH);
      float barX = ncx + padX + float(s) * (subW + gap);
      float barY = cy + cellSize - 1.0 - barH;
      vec3 phos = phosphorColor(s, vs);

      // Bar body (solid over background)
      if (px >= barX && px < barX + subW && py >= barY && py < barY + barH) {
        color = phos * alpha + bgColor * (1.0 - alpha);
      }

      // Glow: wider rect, alpha-over existing contents
      if (intensity > 0.25) {
        float gx0 = max(barX - 1.0, 0.0);
        float gx1 = min(barX + subW + 1.0, resolution.x);
        if (px >= gx0 && px < gx1 && py >= barY && py < barY + barH) {
          float glowAlpha = (intensity - 0.25) * 0.6;
          color = phos * glowAlpha + color * (1.0 - glowAlpha);
        }
      }
    }
  }

  // Scanlines: darken the last row of every other cell-row.
  float yMod = mod(py, cellSize * 2.0);
  if (abs(yMod - (cellSize - 1.0)) < 0.5) {
    color *= 0.94;
  }

  gl_FragColor = vec4(color, 1.0);
}
