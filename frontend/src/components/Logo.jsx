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
        textAlign: isRow ? 'left' : 'center',
        color: 'var(--text-primary)'
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
          filter: 'drop-shadow(0 0 8px var(--glow-shadow))',
          flexShrink: 0,
          color: 'var(--text-primary)'
        }}
      >
        {/* Left vertical stem */}
        <line x1="28" y1="42" x2="28" y2="68" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
        
        {/* Middle vertical stem */}
        <line x1="50" y1="46" x2="50" y2="74" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
        
        {/* Right vertical stem */}
        <line x1="72" y1="42" x2="72" y2="58" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
        
        {/* Arches connecting the stems */}
        <path 
          d="M 28 42 C 28 26, 50 26, 50 46" 
          stroke="currentColor" 
          strokeWidth="11" 
          strokeLinecap="round" 
          fill="none" 
        />
        <path 
          d="M 50 46 C 50 28, 72 28, 72 42" 
          stroke="currentColor" 
          strokeWidth="11" 
          strokeLinecap="round" 
          fill="none" 
        />
        
        {/* Underline/pill under the right stem */}
        <line x1="58" y1="74" x2="78" y2="69" stroke="currentColor" strokeWidth="9.5" strokeLinecap="round" />
      </svg>
      {showText && (
        <div className="logo-text" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div 
            style={{ 
              fontFamily: 'Syne, sans-serif', 
              fontWeight: 800, 
              fontSize: isRow ? `${size * 0.42}px` : '20px', 
              letterSpacing: '3px', 
              color: 'var(--text-primary)',
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
