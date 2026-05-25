import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ui.css'
import LandingPage from './components/LandingPage'
import UploadZone from './components/UploadZone'
import ThemeToggle from './components/ThemeToggle'
import Loader from './components/Loader'
import ScoreCard from './components/ScoreCard'
import CareerFitPanel from './components/CareerFitPanel'
import ATSReportPanel from './components/ATSReportPanel'
import ImprovementRoadmap from './components/ImprovementRoadmap'
import ResumeEditor from './components/ResumeEditor'
import AIGuidePanel from './components/AIGuidePanel'
import Toast from './components/Toast'
import { analyzeResume } from './api'

function App() {
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [showUploadZone, setShowUploadZone] = useState(false)

  const normalizeAnalysis = (raw) => {
    if (!raw || typeof raw !== 'object') return null

    return {
      ...raw,
      categories: raw.categories && typeof raw.categories === 'object'
        ? raw.categories
        : {
            formatStructure: 0,
            keywordsMatch: 0,
            experienceQuality: 0,
            educationCerts: 0,
            readability: 0,
          },
      strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
      weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses : [],
      roadmap: raw.roadmap && typeof raw.roadmap === 'object'
        ? raw.roadmap
        : { phase1: [], phase2: [], phase3: [] },
      careerGuidance: raw.careerGuidance && typeof raw.careerGuidance === 'object'
        ? raw.careerGuidance
        : {},
      atsReport: raw.atsReport && typeof raw.atsReport === 'object'
        ? raw.atsReport
        : {},
      structuredResume: raw.structuredResume && typeof raw.structuredResume === 'object'
        ? raw.structuredResume
        : {},
    }
  }

  const handleStartFromLanding = () => {
    setShowUploadZone(true)
    localStorage.setItem('introSeen', 'true')
  }

  // Load analysis and intro state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('resumeAnalysis')
      if (saved) {
        setAnalysis(normalizeAnalysis(JSON.parse(saved)))
      }
      
      const introSeen = localStorage.getItem('introSeen')
      if (introSeen === 'true') {
        setShowUploadZone(true)
      }
    } catch (err) {
      console.error('Error loading saved analysis or intro state:', err)
    }
  }, [])

  // Save analysis to localStorage
  useEffect(() => {
    if (analysis) {
      localStorage.setItem('resumeAnalysis', JSON.stringify(analysis))
    }
  }, [analysis])

  const handleAnalyze = async (file, jobDescription) => {
    setError('')
    setIsLoading(true)

    try {
      const result = await analyzeResume(file, jobDescription)
      setAnalysis(normalizeAnalysis(result))
      setResumeFile(file)
    } catch (err) {
      console.error('Analysis error:', err)
      const message = err.response?.data?.detail || err.message || 'Failed to analyze resume. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setAnalysis(null)
    setResumeFile(null)
    setShowUploadZone(true) // Go directly to the upload zone on reset
    localStorage.removeItem('resumeAnalysis')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="dot-grid"
    >
      {/* Animated blob backgrounds */}
      <div
        style={{
          position: 'fixed',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '-200px',
          left: '-200px',
          animation: 'gradient-blob 8s infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: '-150px',
          right: '-100px',
          animation: 'gradient-blob 10s infinite 2s',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.07) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '50%',
          right: '10%',
          animation: 'gradient-blob 12s infinite 4s',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <div style={{ position: 'fixed', right: 20, top: 18, zIndex: 60 }}>
          <ThemeToggle />
        </div>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <Loader key="loader" />
          ) : analysis ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{
                padding: '40px 20px',
                maxWidth: '1200px',
                margin: '0 auto',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '40px',
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: '32px',
                      fontWeight: 700,
                      marginBottom: '8px',
                      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-cyan) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      margin: 0,
                    }}
                  >
                    📊 Your Resume Analysis
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                    {resumeFile?.name}
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = 'var(--accent)'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = 'var(--border)'
                  }}
                >
                  ↻ Upload Another Resume
                </button>
              </div>

              {/* Results Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <ScoreCard analysis={analysis} />
                <CareerFitPanel careerGuidance={analysis.careerGuidance} />
                <ATSReportPanel atsReport={analysis.atsReport} isWebGrounded={!analysis.summary?.includes("Fallback")} />
                <ImprovementRoadmap
                  roadmap={analysis.roadmap}
                  estimatedImprovement={analysis.estimatedImprovement}
                />
                <ResumeEditor analysis={analysis} />
              </div>
            </motion.div>          ) : !showUploadZone ? (
            <LandingPage key="landing" onStartClick={handleStartFromLanding} />          ) : (
            <UploadZone key="upload" onAnalyze={handleAnalyze} isLoading={isLoading} />
          )}
        </AnimatePresence>

        {/* AI Guide Panel */}
        {analysis && <AIGuidePanel resumeContext={analysis.parsedText} />}
      </div>

      {/* Toast notifications */}
      <AnimatePresence>
        {error && (
          <Toast
            key="error-toast"
            message={error}
            type="error"
            onClose={() => setError('')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App

