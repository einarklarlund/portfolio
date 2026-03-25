export default function WoodPanelFrame({ children }) {
  const PANEL_WIDTH = 'clamp(32px, 7vw, 110px)'

  const grainLines = `repeating-linear-gradient(
    180deg,
    transparent 0px, transparent 3px,
    rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px,
    transparent 4px, transparent 9px,
    rgba(255,255,255,0.03) 9px, rgba(255,255,255,0.03) 10px
  )`

  const poreChannels = `repeating-linear-gradient(
    178deg,
    transparent 0px, transparent 18px,
    rgba(0,0,0,0.2) 18px, rgba(0,0,0,0.2) 20px,
    transparent 20px, transparent 34px,
    rgba(0,0,0,0.1) 34px, rgba(0,0,0,0.1) 35px
  )`

  const baseRight = `linear-gradient(to right, #1a1820 0%, #282630 18%, #44444E 45%, #37353E 65%, #1a1820 100%)`
  const baseLeft  = `linear-gradient(to left,  #1a1820 0%, #282630 18%, #44444E 45%, #37353E 65%, #1a1820 100%)`

  const panelBase = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    zIndex: 0,
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Shelf edge strip — front face of the shelf board */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '20px',
        zIndex: 2,
        backgroundImage: 'linear-gradient(to bottom, #0e0d12 0%, #1a1820 40%, #282630 80%, #1e1c24 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
      }} />

      {/* Molding bead — router-carved highlight just below the shelf edge */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: 0,
        right: 0,
        height: '2px',
        zIndex: 2,
        background: 'linear-gradient(90deg, transparent, #3E3C47 15%, #4A485A 50%, #3E3C47 85%, transparent)',
      }} />

      {/* Left wood panel */}
      <div style={{
        ...panelBase,
        left: 0,
        backgroundImage: [grainLines, poreChannels, baseLeft].join(', '),
        boxShadow: 'inset -8px 0 16px rgba(0,0,0,0.5), inset -1px 0 0 rgba(0,0,0,0.7), inset 2px 0 4px rgba(255,255,255,0.06)',
      }} />

      {/* Right wood panel */}
      <div style={{
        ...panelBase,
        right: 0,
        backgroundImage: [grainLines, poreChannels, baseRight].join(', '),
        boxShadow: 'inset 8px 0 16px rgba(0,0,0,0.5), inset 1px 0 0 rgba(0,0,0,0.7), inset -2px 0 4px rgba(255,255,255,0.06)',
      }} />

      {/* Section content — above panels */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
