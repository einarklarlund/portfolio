// Must match `#define MAX_SDFS 12` in shaders/wave.frag.glsl and shaders/velocity.frag.glsl.
export const MAX_SDFS = 12

// Shader-side type enum. `box` draws filled box interior; `box_outline` draws
// ring at the surface; `circle` draws filled circle.
export const SDF_TYPE = {
  box: 0,
  circle: 1,
  box_outline: 2,
}
