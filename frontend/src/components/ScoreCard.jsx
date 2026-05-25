import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react'

export const ScoreCard = ({ analysis }) => {
  const [displayScore, setDisplayScore] = useState(0)
  const [animatedCategories, setAnimatedCategories] = useState({
    formatStructure: 0,
    keywordsMatch: 0,
    experienceQuality: 0,
    educationCerts: 0,
    readability: 0,
  })
  const strengths = Array.isArray(analysis?.strengths) ? analysis.strengths : []
  const weaknesses = Array.isArray(analysis?.weaknesses) ? analysis.weaknesses : []

  const baseScore = (typeof analysis?.overallScore === 'number')
    ? analysis.overallScore
    : (analysis?.atsReport && typeof analysis.atsReport.atsScore === 'number')
      ? analysis.atsReport.atsScore
      : 0

  // Animate primary displayed score
  useEffect(() => {
    const duration = 1200
    const steps = 40
    const target = Math.max(0, Math.min(100, baseScore || 0))
    const increment = target / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setDisplayScore(Math.round(target))
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [baseScore])

  // Animate category bars
  useEffect(() => {
    const delays = [0, 80, 160, 240, 320]
    const entries = Object.entries(analysis.categories || {})
    const timers = entries.map(([key, value], index) => {
      return setTimeout(() => {
        const duration = 800
        const steps = 40
        const increment = value / steps
        let current = 0
        const t = setInterval(() => {
          current += increment
          if (current >= value) {
            setAnimatedCategories((prev) => ({ ...prev, [key]: value }))
            clearInterval(t)
          } else {
            setAnimatedCategories((prev) => ({ ...prev, [key]: Math.floor(current) }))
          }
        }, duration / steps)
        return t
      }, delays[index] || 0)
    })

    return () => timers.forEach((t) => clearTimeout(t))
  }, [analysis.categories])

  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--success)'
    if (score >= 50) return 'var(--warning)'
    return 'var(--danger)'
  }

  const getScoreGlow = (score) => {
    if (score >= 75) return 'rgba(16, 185, 129, 0.35)'
    if (score >= 50) return 'rgba(245, 158, 11, 0.35)'
    return 'rgba(239, 68, 68, 0.35)'
  }

  const circumference = 2 * Math.PI * 55
  const offset = circumference - (displayScore / 100) * circumference
  const currentChance = Math.max(0, Math.min(100, displayScore))
  const improvedChance = Math.max(
    currentChance,
    Math.min(100, Math.round(analysis.estimatedImprovement ?? currentChance))
  )
  const smallCircumference = 2 * Math.PI * 34
  const currentChanceOffset = smallCircumference - (currentChance / 100) * smallCircumference
  const improvedOffset = smallCircumference - (improvedChance / 100) * smallCircumference

  const categoryLabels = {
    formatStructure: 'Format & ATS Structure',
    keywordsMatch: 'Keywords Matching',
    experienceQuality: 'Work Experience Bullets',
    educationCerts: 'Education & Certs',
    readability: 'Overall Readability',
  }

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        border: '1px solid var(--border)',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="header-accent" style={{ fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} style={{ color: 'var(--accent-cyan)' }} />
            ATS Resume Analysis
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
            AI scanner feedback, score breakdown, and quick fixes
          </div>
        </div>
        <div className="small-badge">
          Live • {analysis.careerGuidance?.targetField || 'General Profile'}
        </div>
      </div>

      {/* Summary report banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          color: 'var(--text-primary)',
          marginBottom: '32px',
          fontSize: '15px',
          lineHeight: '1.6',
          fontStyle: 'italic',
          background: 'rgba(255, 255, 255, 0.01)',
          borderLeft: '3px solid var(--accent)',
          padding: '14px 20px',
          borderRadius: '0 12px 12px 0',
        }}
      >
        "{analysis.summary}"
      </motion.div>

      {/* Primary Cyber Radial Gauge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '44px', position: 'relative' }}>
        <div className="decor-ring" style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Dashboard ring SVG */}
          <svg width="220" height="220" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} viewBox="0 0 220 220">
            {/* Background Track */}
            <circle
              cx="110"
              cy="110"
              r="55"
              fill="none"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="9"
            />
            {/* Glowing Active Arc */}
            <motion.circle
              cx="110"
              cy="110"
              r="55"
              fill="none"
              stroke={getScoreColor(displayScore)}
              strokeWidth="9"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                strokeDasharray: circumference,
                filter: `drop-shadow(0 0 10px ${getScoreColor(displayScore)})`,
              }}
            />
          </svg>

          {/* Central digital display */}
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <motion.span
              style={{
                fontSize: '60px',
                fontWeight: 800,
                color: getScoreColor(displayScore),
                lineHeight: '1',
                fontFamily: 'var(--font-title)',
                textShadow: `0 0 15px ${getScoreGlow(displayScore)}`
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {displayScore}
            </motion.span>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>
              ATS Match %
            </div>
          </div>
        </div>
      </div>

      {/* Dual Small Speedometers (Selection chance now vs future) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '44px' }}>
        
        {/* Left mini gauge */}
        <div className="panel-soft" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
            <svg width="84" height="84" viewBox="0 0 84 84" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="42" cy="42" r="34" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="6" />
              <motion.circle
                cx="42"
                cy="42"
                r="34"
                fill="none"
                stroke={getScoreColor(currentChance)}
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ strokeDashoffset: smallCircumference }}
                animate={{ strokeDashoffset: currentChanceOffset }}
                transition={{ duration: 1.4 }}
                style={{
                  strokeDasharray: smallCircumference,
                  filter: `drop-shadow(0 0 8px ${getScoreColor(currentChance)})`
                }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: getScoreColor(currentChance), fontFamily: 'var(--font-title)' }}>{currentChance}</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
              Current Selection Chance
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: '1.4' }}>
              Your profile alignment with candidate benchmarks.
            </p>
          </div>
        </div>

        {/* Right mini gauge */}
        <div className="panel-soft" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', borderLeft: '3px solid var(--success)' }}>
          <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
            <svg width="84" height="84" viewBox="0 0 84 84" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="42" cy="42" r="34" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="6" />
              <motion.circle
                cx="42"
                cy="42"
                r="34"
                fill="none"
                stroke="var(--success)"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ strokeDashoffset: smallCircumference }}
                animate={{ strokeDashoffset: improvedOffset }}
                transition={{ duration: 1.4 }}
                style={{
                  strokeDasharray: smallCircumference,
                  filter: 'drop-shadow(0 0 8px var(--success))'
                }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-title)' }}>{improvedChance}</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
              Optimized Potential
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: '1.4' }}>
              Achievable score tier once target recommendations are applied.
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown list */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
          Category breakdown
        </h3>
        <div style={{ display: 'grid', gap: '18px' }}>
          {Object.entries(categoryLabels).map(([key, label], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13.5px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                <span style={{ fontWeight: 700, color: getScoreColor(animatedCategories[key]) }}>
                  {animatedCategories[key]}%
                </span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', height: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.02)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${animatedCategories[key]}%` }}
                  transition={{ delay: 0.2 + index * 0.08, duration: 1, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${getScoreColor(animatedCategories[key])} 0%, var(--accent-cyan) 100%)`,
                    borderRadius: '6px',
                    position: 'relative'
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Strengths and Weaknesses panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Strengths Column */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-title)' }}>
            <CheckCircle size={18} />
            Key Strengths
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {strengths.map((strength, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.08 }}
                style={{
                  background: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.12)',
                  borderLeft: '3px solid var(--success)',
                  borderRadius: '0 8px 8px 0',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.4'
                }}
              >
                {strength}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Weaknesses Column */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-title)' }}>
            <AlertTriangle size={18} />
            Warning Areas
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {weaknesses.map((weakness, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.08 }}
                style={{
                  background: 'rgba(245, 158, 11, 0.04)',
                  border: '1px solid rgba(245, 158, 11, 0.12)',
                  borderLeft: '3px solid var(--warning)',
                  borderRadius: '0 8px 8px 0',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.4'
                }}
              >
                {weakness}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ScoreCard
