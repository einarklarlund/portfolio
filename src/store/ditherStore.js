import { create } from 'zustand'

// The React ↔ three.js bridge.
//
// Writers: bridge hooks under src/bridge/ and nowhere else.
// Readers: three.js hooks under src/three/ (inside useFrame via getState()).
//
// Two update patterns, by frequency:
//   * Low-frequency (mount/unmount, user intent change): call the set* /
//     register* / unregister* actions — these go through zustand's set() so
//     subscribers can react.
//   * High-frequency (per-frame position/colour/mouse updates): mutate the
//     fields on the snapshot returned by getState() directly. This bypasses
//     React, which is what we want — three.js reads on the next frame tick.
export const useDitherStore = create((set) => ({
  waveColor: [0.216, 0.208, 0.243],
  backgroundColor: [0.827, 0.855, 0.851],

  // id -> { el, type, targetIntensity, targetFalloff, falloffRadius? }
  // `el` is a React ref; three.js reads el.current.getBoundingClientRect() each frame.
  sdfs: new Map(),

  // Mouse in DPR-scaled pixel coords (top-left origin), updated imperatively
  // by useMousePointer on every mousemove. dx/dy are consumed (zeroed) by
  // three.js each frame.
  mouse: { x: 0, y: 0, dx: 0, dy: 0 },

  setWaveColor: (c) => set({ waveColor: c }),
  setBackgroundColor: (c) => set({ backgroundColor: c }),

  registerSdf: (id, entry) =>
    set((s) => {
      const next = new Map(s.sdfs)
      next.set(id, entry)
      return { sdfs: next }
    }),

  unregisterSdf: (id) =>
    set((s) => {
      const next = new Map(s.sdfs)
      next.delete(id)
      return { sdfs: next }
    }),
}))
