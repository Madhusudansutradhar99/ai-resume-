import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, TrendingUp, ShieldCheck, Download, Sparkles, FileText, CheckCircle2, XCircle } from 'lucide-react'

export const ScoreCard = ({ analysis }) => {
  const [displayScore, setDisplayScore] = useState(0)
  const [animatedCategories, setAnimatedCategories] = useState({
    formatStructure: 0,
    keywordsMatch: 0,
    experienceQuality: 0,
    readability: 0,
  })

  const baseScore = typeof analysis?.overallScore === 'number' ? analysis.overallScore : 0
  const strengths = Array.isArray(analysis?.strengths) ? analysis.strengths : []
  const weaknesses = Array.isArray(analysis?.weaknesses) ? analysis.weaknesses : []

  // Animate displayed score
  useEffect(() => {
    const duration = 1200
    const steps = 45
    const target = Math.max(0, Math.min(100, baseScore))
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

  // Animate category percentages
  useEffect(() => {
    const categories = {
      formatStructure: analysis.categories?.formatStructure || 0,
      keywordsMatch: analysis.categories?.keywordsMatch || 0,
      experienceQuality: analysis.categories?.experienceQuality || 0,
      readability: analysis.categories?.readability || 0,
    }

    const delays = [0, 100, 200, 300]
    const entries = Object.entries(categories)

    const timers = entries.map(([key, val], idx) => {
      return setTimeout(() => {
        const duration = 800
        const steps = 30
        const increment = val / steps
        let current = 0
        const t = setInterval(() => {
          current += increment
          if (current >= val) {
            setAnimatedCategories((prev) => ({ ...prev, [key]: val }))
            clearInterval(t)
          } else {
            setAnimatedCategories((prev) => ({ ...prev, [key]: Math.floor(current) }))
          }
        }, duration / steps)
        return t
      }, delays[idx])
    })

    return () => timers.forEach((t) => clearTimeout(t))
  }, [analysis.categories])

  const getScoreColor = (score) => {
    if (score >= 75) return '#10b981' // Green (var(--success))
    if (score >= 50) return '#f59e0b' // Yellow (var(--warning))
    return '#ef4444' // Red (var(--danger))
  }

  const getScoreBg = (score) => {
    if (score >= 75) return 'rgba(16, 185, 129, 0.05)'
    if (score >= 50) return 'rgba(245, 158, 11, 0.05)'
    return 'rgba(239, 68, 68, 0.05)'
  }

  const getScoreBorder = (score) => {
    if (score >= 75) return 'rgba(16, 185, 129, 0.2)'
    if (score >= 50) return 'rgba(245, 158, 11, 0.2)'
    return 'rgba(239, 68, 68, 0.2)'
  }

  // Semicircle arc computations
  const radius = 60
  const semicircumference = Math.PI * radius // 188.49
  const strokeOffset = semicircumference - (displayScore / 100) * semicircumference

  // Job readiness threshold checks
  const isJobReady = displayScore >= 75

  const scrollToOptimizer = () => {
    const editor = document.getElementById('print-layout-area')
    if (editor) {
      editor.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '32px',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        justifyContent: 'center',
        width: '100%',
        margin: '0 auto',
      }}
    >
      {/* LEFT CARD: "Your Score" Dashboard (White glassmorphism for Enhancv aesthetic) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '36px 24px',
          width: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          flexShrink: 0,
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#1e293b',
            margin: '0 0 20px 0',
            fontFamily: 'var(--font-title)',
          }}
        >
          Your Score
        </h3>

        {/* Semicircle Gauge */}
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
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(0deg)' }}>
            {/* Semicircle Track */}
            <path
              d="M 20 80 A 60 60 0 0 1 140 80"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Semicircle Filled Arc */}
            <motion.path
              d="M 20 80 A 60 60 0 0 1 140 80"
              fill="none"
              stroke={getScoreColor(displayScore)}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={semicircumference}
              initial={{ strokeDashoffset: semicircumference }}
              animate={{ strokeDashoffset: strokeOffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                filter: `drop-shadow(0 0 6px ${getScoreColor(displayScore)})`,
              }}
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
            <span style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b' }}>
              {displayScore}/100
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: weaknesses.length > 0 ? '#ef4444' : '#10b981',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {weaknesses.length} {weaknesses.length === 1 ? 'Issue' : 'Issues'} Found
            </span>
          </div>
        </div>

        {/* Enhancv Category Rows */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {[
            { label: 'CONTENT', score: animatedCategories.experienceQuality },
            { label: 'SECTIONS', score: animatedCategories.formatStructure },
            { label: 'ATS ESSENTIALS', score: animatedCategories.readability },
            { label: 'TAILORING', score: animatedCategories.keywordsMatch },
          ].map((cat) => (
            <div
              key={cat.label}
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
                {cat.label}
              </span>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  color: getScoreColor(cat.score),
                  background: getScoreBg(cat.score),
                  border: `1px solid ${getScoreBorder(cat.score)}`,
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                {cat.score}%
              </span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={scrollToOptimizer}
          className="btn-glow"
          style={{
            width: '100%',
            padding: '12px 0',
            background: isJobReady
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'rgba(99, 102, 241, 0.05)',
            border: isJobReady ? 'none' : '1px solid rgba(99, 102, 241, 0.15)',
            borderRadius: '8px',
            color: isJobReady ? 'white' : 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-title)',
            boxShadow: isJobReady ? '0 4px 15px rgba(16, 185, 129, 0.25)' : 'none',
          }}
        >
          {isJobReady ? 'View Ready CV 🖨️' : 'Optimize Resume ✏️'}
        </button>
      </motion.div>

      {/* RIGHT PANEL: Job-Readiness Alerts & Detailed Breakdown */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card"
        style={{
          flex: 1,
          minWidth: '320px',
          border: '1px solid var(--border)',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header context */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2
                className="header-accent"
                style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <TrendingUp size={18} style={{ color: 'var(--accent-cyan)' }} />
                ATS Checker Feedback
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>
                Online trends & compatibility matching report
              </p>
            </div>
            <div className="small-badge">
              {analysis.careerGuidance?.targetField || 'General Profile'}
            </div>
          </div>

          {/* Job-Readiness Alert Banner */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            style={{
              background: getScoreBg(displayScore),
              border: `1px solid ${getScoreBorder(displayScore)}`,
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              {displayScore >= 75 ? (
                <CheckCircle2 size={22} color="#10b981" />
              ) : displayScore >= 50 ? (
                <AlertTriangle size={22} color="#f59e0b" />
              ) : (
                <XCircle size={22} color="#ef4444" />
              )}
            </div>
            <div>
              <strong
                style={{
                  fontSize: '14px',
                  color: getScoreColor(displayScore),
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                {displayScore >= 75
                  ? '🎉 Job-Ready Status: Excellent!'
                  : displayScore >= 50
                    ? '⚠️ Job-Ready Status: Improvement Recommended'
                    : '❌ Job-Ready Status: Major Optimizations Required'}
              </strong>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: '1.5',
                }}
              >
                {displayScore >= 75
                  ? 'Aapka resume target benchmark se align ho chuka hai! Aap is resume ko directly companies me send kar sakte hain. Niche scroll karke PDF format download karein.'
                  : displayScore >= 50
                    ? 'Aapka resume theek hai, lekin metrics aur keywords add karne ki zaroorat hai. Humein recommend hai ki aap warnings area ko theek karein jisse selection rates badhein.'
                    : 'Aapke resume me contact details (email/phone) ya core structural sections missing hain. Resume ko company me bhejne ke liye please warnings ko resolve karein.'}
              </p>
              {displayScore >= 75 && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span
                    className="btn-glow"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    🚀 COMPANY READY
                  </span>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                    Aap is resume ko companies me bhej sakte hain!
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Summary Quote */}
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: '0',
              fontStyle: 'italic',
              borderLeft: '3px solid var(--accent)',
              paddingLeft: '12px',
            }}
          >
            "{analysis.summary}"
          </p>

          {/* Strengths & Weaknesses Stacked inside Right Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Strengths */}
            <div>
              <h5
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#10b981',
                  margin: '0 0 10px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle size={14} /> Passed Checks
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {strengths.slice(0, 3).map((s, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      background: 'rgba(16, 185, 129, 0.02)',
                      border: '1px solid rgba(16, 185, 129, 0.08)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div>
              <h5
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#f59e0b',
                  margin: '0 0 10px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertTriangle size={14} /> Fixes Required
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {weaknesses.slice(0, 3).map((w, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      background: 'rgba(245, 158, 11, 0.02)',
                      border: '1px solid rgba(245, 158, 11, 0.08)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                    }}
                  >
                    {w}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ScoreCard
