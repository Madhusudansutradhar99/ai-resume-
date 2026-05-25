import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export const Loader = () => {
  const [statusIndex, setStatusIndex] = useState(0)

  const statuses = [
    '🔍 Parsing resume structure...',
    '⚡ Connecting to ATS Database Engine...',
    '🔄 Syncing parsed fields (Personal Info, Skills, Education)...',
    '📊 Matching keyword density in real-time...',
    '🎯 Generating ATS Compatibility Score & Roadmap...',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-page)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Animated blob background */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'gradient-blob 7s infinite',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Resume Silhouette with Scanning Line */}
        <div style={{ marginBottom: '40px' }}>
          <svg width="120" height="160" viewBox="0 0 120 160" style={{ margin: '0 auto', display: 'block' }}>
            {/* Resume outline */}
            <rect x="10" y="10" width="100" height="140" fill="none" stroke="var(--accent)" strokeWidth="2" rx="4" />
            
            {/* Resume lines */}
            <line x1="20" y1="30" x2="100" y2="30" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
            <line x1="20" y1="45" x2="100" y2="45" stroke="var(--text-muted)" strokeWidth="1" opacity="0.4" />
            <line x1="20" y1="60" x2="100" y2="60" stroke="var(--text-muted)" strokeWidth="1" opacity="0.4" />
            <line x1="20" y1="75" x2="80" y2="75" stroke="var(--text-muted)" strokeWidth="1" opacity="0.3" />
            <line x1="20" y1="90" x2="100" y2="90" stroke="var(--text-muted)" strokeWidth="1" opacity="0.4" />
            <line x1="20" y1="105" x2="95" y2="105" stroke="var(--text-muted)" strokeWidth="1" opacity="0.3" />
            <line x1="20" y1="120" x2="100" y2="120" stroke="var(--text-muted)" strokeWidth="1" opacity="0.4" />
            <line x1="20" y1="135" x2="85" y2="135" stroke="var(--text-muted)" strokeWidth="1" opacity="0.3" />

            {/* Scanning line animation */}
            <line
              x1="10"
              x2="110"
              y1="10"
              y2="10"
              stroke="var(--accent-cyan)"
              strokeWidth="3"
              opacity="0.8"
              className="scanning-line"
              style={{ filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))' }}
            />
          </svg>
        </div>

        {/* Spinning Loading Ring */}
        <div
          style={{
            width: '60px',
            height: '60px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTop: '3px solid var(--accent)',
            borderRadius: '50%',
            margin: '0 auto 40px',
            animation: 'spin-slow 2s linear infinite',
          }}
        />

        {/* Status message with animation */}
        <motion.p
          key={statusIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '12px',
            height: '28px',
          }}
        >
          {statuses[statusIndex]}
        </motion.p>

        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          This usually takes 10-30 seconds
        </p>
      </div>
    </motion.div>
  )
}

export default Loader
