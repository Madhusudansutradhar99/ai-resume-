import React from 'react'

export default function Logo({ size = 48, showText = true, layout = 'column' }) {
  const isRow = layout === 'row'

  return (
    <div 
      className="logo-container"
      style={{ 
        display: 'inline-flex', 
        flexDirection: isRow ? 'row' : 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: isRow ? '12px' : '8px',
        textAlign: isRow ? 'left' : 'center'
      }}
    >
      <svg 
        className="logo-svg"
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ 
          filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.12))',
          flexShrink: 0
        }}
      >
        {/* Continuous fluid 'm' logo using lines and paths with identical stroke properties */}
        {/* Left vertical stem */}
        <line x1="30" y1="38" x2="30" y2="68" stroke="white" strokeWidth="10" strokeLinecap="round" />
        
        {/* Middle vertical stem */}
        <line x1="50" y1="44" x2="50" y2="74" stroke="white" strokeWidth="10" strokeLinecap="round" />
        
        {/* Right vertical stem */}
        <line x1="70" y1="38" x2="70" y2="58" stroke="white" strokeWidth="10" strokeLinecap="round" />
        
        {/* Arches connecting the stems */}
        <path 
          d="M 30 38 C 30 22, 50 22, 50 44" 
          stroke="white" 
          strokeWidth="10" 
          strokeLinecap="round" 
          fill="none" 
        />
        <path 
          d="M 50 44 C 50 24, 70 24, 70 38" 
          stroke="white" 
          strokeWidth="10" 
          strokeLinecap="round" 
          fill="none" 
        />
        
        {/* Underline/pill under the right stem */}
        <line x1="60" y1="74" x2="78" y2="69" stroke="white" strokeWidth="9" strokeLinecap="round" />
      </svg>
      {showText && (
        <div className="logo-text" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div 
            style={{ 
              fontFamily: 'Syne, sans-serif', 
              fontWeight: 800, 
              fontSize: isRow ? `${size * 0.42}px` : '20px', 
              letterSpacing: '3px', 
              color: '#ffffff',
              lineHeight: 1.1
            }}
          >
            M CLUB
          </div>
          <div 
            style={{ 
              fontFamily: 'DM Sans, sans-serif', 
              fontWeight: 700, 
              fontSize: isRow ? `${size * 0.16}px` : '8.5px', 
              letterSpacing: '4.5px', 
              color: 'var(--text-muted)', 
              marginTop: '4px',
              textTransform: 'uppercase',
              lineHeight: 1
            }}
          >
            Connect Grow Belong
          </div>
        </div>
      )}
    </div>
  )
}
