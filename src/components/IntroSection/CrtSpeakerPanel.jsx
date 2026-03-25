export default function CrtSpeakerPanel({ side }) {
  return (
    <div style={{
      width: '72px',
      flexShrink: 0,
      background: '#37353E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Recessed grille frame */}
      <div style={{
        width: '48px',
        height: 'calc(100% - 12px)',
        borderRadius: '3px',
        background: '#272530',
        boxShadow: [
          'inset 0 3px 8px rgba(0,0,0,0.9)',
          'inset 0 -2px 5px rgba(0,0,0,0.7)',
          `inset ${side === 'left' ? '3px' : '-3px'} 0 8px rgba(0,0,0,0.8)`,
          `inset ${side === 'left' ? '-2px' : '2px'} 0 4px rgba(255,255,255,0.04)`,
          '0 0 0 1px #1a1820',
          '0 0 0 2px #37353E',
        ].join(', '),
        // Dot grid via radial-gradient
        backgroundImage: 'radial-gradient(circle, #1a1820 1.2px, transparent 1.2px)',
        backgroundSize: '5px 5px',
        backgroundPosition: '2px 2px',
      }} />
    </div>
  )
}
