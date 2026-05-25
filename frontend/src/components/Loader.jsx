import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

export const Loader = () => {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    'Parsing your CV',
    'Analyzing your experience',
    'Extracting your skills',
    'Generating recommendations',
  ]

  // Sequentially tick off the steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < steps.length) {
          return prev + 1
        }
        return prev
      })
    }, 2000)
    return () => clearInterval(timer)
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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
        backdropFilter: 'blur(10px)',
        padding: '20px',
      }}
    >
      {/* Background glowing blob */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'gradient-blob 7s infinite',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          gap: '32px',
          maxWidth: '850px',
          width: '100%',
          alignItems: 'stretch',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* Left Side: Score Card (inspired by Enhancv layout) */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '36px 24px',
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#1e293b',
              margin: '0 0 24px 0',
              fontFamily: 'var(--font-title)',
            }}
          >
            Your Score
          </h3>

          {/* Semicircle radial gauge progress */}
          <div
            style={{
              position: 'relative',
              width: '160px',
              height: '90px',
              display: 'flex',
              justifyContent: 'center',
              overflow: 'hidden',
              marginBottom: '28px',
            }}
          >
            <svg
              width="160"
              height="160"
              viewBox="0 0 160 160"
              style={{ transform: 'rotate(-180deg)' }}
            >
              {/* Semicircle Track */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="10"
                strokeDasharray={`${Math.PI * 60} ${Math.PI * 60}`}
              />
              {/* Semicircle Filled Loading Arc */}
              <motion.circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#10b981"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${Math.PI * 60} ${Math.PI * 60}`}
                animate={{
                  strokeDashoffset: [
                    Math.PI * 60,
                    (Math.PI * 60) * 0.5,
                    0,
                    (Math.PI * 60) * 0.5,
                    Math.PI * 60,
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                bottom: '5px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>--/100</span>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.7px',
                }}
              >
                Scanning...
              </span>
            </div>
          </div>

          {/* Categories list placeholders */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            {['CONTENT', 'SECTION', 'ATS ESSENTIALS', 'TAILORING'].map((cat) => (
              <div
                key={cat}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#64748b',
                    letterSpacing: '0.5px',
                  }}
                >
                  {cat}
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '14px',
                    borderRadius: '10px',
                    background: '#f1f5f9',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <motion.div
                    animate={{ left: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.18), transparent)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* bottom button placeholder */}
          <button
            style={{
              width: '100%',
              padding: '12px 0',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'not-allowed',
              fontFamily: 'var(--font-title)',
            }}
          >
            Analyzing Resume
          </button>
        </div>

        {/* Right Side: Checklist Panel */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            padding: '40px 36px',
            flex: 1,
            minWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {steps.map((step, idx) => {
              const isCompleted = activeStep > idx
              const isActive = activeStep === idx

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    opacity: isCompleted || isActive ? 1 : 0.35,
                    transition: 'all 0.4s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle2
                        size={24}
                        color="#6366f1"
                        style={{ fill: 'rgba(99, 102, 241, 0.12)' }}
                      />
                    ) : isActive ? (
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          border: '2px solid #6366f1',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      />
                    ) : (
                      <Circle size={22} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '17px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontFamily: 'var(--font-title)',
                    }}
                  >
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Loader
