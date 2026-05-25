import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Target, Rocket, Calendar } from 'lucide-react'

export const ImprovementRoadmap = ({ roadmap, estimatedImprovement }) => {
  const phases = [
    {
      title: 'Phase 1: Quick Wins',
      subtitle: 'Fix in 1 day',
      items: roadmap.phase1,
      color: 'var(--accent-cyan)',
      icon: Zap,
      bgColor: 'rgba(34, 211, 238, 0.03)',
      borderColor: 'rgba(34, 211, 238, 0.15)',
    },
    {
      title: 'Phase 2: Medium Effort',
      subtitle: 'Apply within 1 week',
      items: roadmap.phase2,
      color: 'var(--accent)',
      icon: Target,
      bgColor: 'rgba(99, 102, 241, 0.03)',
      borderColor: 'rgba(99, 102, 241, 0.15)',
    },
    {
      title: 'Phase 3: Long Term',
      subtitle: 'Develop in 1-3 months',
      items: roadmap.phase3,
      color: 'var(--accent-violet)',
      icon: Rocket,
      bgColor: 'rgba(167, 139, 250, 0.03)',
      borderColor: 'rgba(167, 139, 250, 0.15)',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card"
      style={{
        border: '1px solid var(--border)',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <div style={{ fontSize: '20px' }}>📈</div>
        <div>
          <h2 className="header-accent" style={{ fontSize: '22px', margin: 0, fontFamily: 'var(--font-title)' }}>
            Personalized Improvement Roadmap
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Structured phase-by-phase action plan to optimize your profile
          </p>
        </div>
      </div>

      {/* Timeline List */}
      <div style={{ marginBottom: '36px', position: 'relative' }}>
        {phases.map((phase, phaseIndex) => {
          const Icon = phase.icon
          return (
            <motion.div
              key={phaseIndex}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + phaseIndex * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              style={{
                marginBottom: '28px',
                paddingLeft: '40px',
                position: 'relative',
              }}
            >
              {/* Timeline Dot (pulsing neon node) */}
              <div
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '6px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: phase.color,
                  border: `3px solid var(--bg-secondary)`,
                  boxShadow: `0 0 14px ${phase.color}`,
                  zIndex: 2,
                }}
              />

              {/* Connector line between steps */}
              {phaseIndex < phases.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '28px',
                    width: '2px',
                    bottom: '-28px',
                    background: `linear-gradient(180deg, ${phase.color} 0%, ${phases[phaseIndex + 1].color} 100%)`,
                    zIndex: 1,
                    opacity: 0.3,
                  }}
                />
              )}

              {/* Phase Glass Card */}
              <div
                className="panel-soft"
                style={{
                  background: phase.bgColor,
                  border: `1px solid ${phase.borderColor}`,
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'block',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: `rgba(255, 255, 255, 0.02)`,
                      border: `1px solid ${phase.borderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: phase.color,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-title)' }}>
                      {phase.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {phase.subtitle}
                    </p>
                  </div>
                </div>

                {/* Checklist Items */}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {phase.items.map((item, itemIndex) => (
                    <motion.li
                      key={itemIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + phaseIndex * 0.15 + itemIndex * 0.05 }}
                      viewport={{ once: true }}
                      style={{
                        paddingLeft: '22px',
                        fontSize: '13.5px',
                        color: 'var(--text-primary)',
                        position: 'relative',
                        lineHeight: '1.45',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: '4px',
                          top: '8px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: phase.color,
                          boxShadow: `0 0 6px ${phase.color}`,
                        }}
                      />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Target optimized score indicator card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        viewport={{ once: true }}
        style={{
          background: 'rgba(16, 185, 129, 0.03)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(16, 185, 129, 0.04)',
        }}
      >
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
          Potential ATS Score after all phase adjustments:
        </p>
        <p
          className="header-accent"
          style={{
            fontSize: '36px',
            fontWeight: 800,
            margin: 0,
            background: 'linear-gradient(90deg, var(--success), var(--accent-cyan))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {Math.min(100, (Math.round(estimatedImprovement / 5) * 5))}% Match Chance
        </p>
      </motion.div>
    </motion.div>
  )
}

export default ImprovementRoadmap
