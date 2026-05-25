import React from 'react'

export default function Logo({ size = 48, showText = true, layout = 'column' }) {
  const isRow = layout === 'row'

  return (
    <div 
      style={{ 
        display: 'inline-flex', 
        flexDirection: isRow ? 'row' : 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: isRow ? '14px' : '8px',
        textAlign: isRow ? 'left' : 'center'
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.15))' }}
      >
        {/* Stylized 'm' logo */}
        {/* Left vertical stem */}
        <rect x="25" y="36" width="10" height="28" rx="5" fill="white" />
        {/* Middle vertical stem */}
        <rect x="45" y="42" width="10" height="30" rx="5" fill="white" />
        {/* Right vertical stem */}
        <rect x="65" y="36" width="10" height="22" rx="5" fill="white" />
        {/* Arches connecting the stems */}
        <path 
          d="M25 36 C 25 22, 45 22, 45 36" 
          stroke="white" 
          strokeWidth="10" 
          strokeLinecap="round" 
          fill="none" 
        />
        <path 
          d="M45 42 C 45 24, 65 24, 65 30" 
          stroke="white" 
          strokeWidth="10" 
          strokeLinecap="round" 
          fill="none" 
        />
        {/* Tilted pill under the right leg */}
        <rect 
          x="62" 
          y="68" 
          width="16" 
          height="8" 
          rx="4" 
          transform="rotate(-15 62 68)" 
          fill="white" 
        />
      </svg>
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
