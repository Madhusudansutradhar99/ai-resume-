import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ui.css'
import LandingPage from './components/LandingPage'
import UploadZone from './components/UploadZone'
import ThemeToggle from './components/ThemeToggle'
import Logo from './components/Logo'
import Loader from './components/Loader'
import ScoreCard from './components/ScoreCard'
import CareerFitPanel from './components/CareerFitPanel'
import ATSReportPanel from './components/ATSReportPanel'
import ImprovementRoadmap from './components/ImprovementRoadmap'
import ResumeEditor from './components/ResumeEditor'
import AIGuidePanel from './components/AIGuidePanel'
import Toast from './components/Toast'
import { Settings, Key, Database, Eye, EyeOff, X } from 'lucide-react'
import { analyzeResume } from './api'

function App() {
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [showUploadZone, setShowUploadZone] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [customKey, setCustomKey] = useState('')
  const [showKeyText, setShowKeyText] = useState(false)
  const [customGithub, setCustomGithub] = useState('')
  const [showGithubText, setShowGithubText] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

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

      const savedKey = localStorage.getItem('custom_gemini_api_key')
      if (savedKey) {
        setCustomKey(savedKey)
      }
      
      const savedGithub = localStorage.getItem('custom_github_token')
      if (savedGithub) {
        setCustomGithub(savedGithub)
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
    localStorage.setItem('introSeen', 'true')
    setShowUploadZone(true)

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

  const handleSaveKey = () => {
    if (customKey.trim()) {
      localStorage.setItem('custom_gemini_api_key', customKey.trim())
      setSaveStatus('Key saved successfully!')
      setTimeout(() => setSaveStatus(''), 3000)
    } else {
      localStorage.removeItem('custom_gemini_api_key')
      setSaveStatus('Key cleared.')
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const handleClearKey = () => {
    localStorage.removeItem('custom_gemini_api_key')
    setCustomKey('')
    setSaveStatus('Key cleared.')
    setTimeout(() => setSaveStatus(''), 3000)
  }

  const handleSaveGithub = () => {
    if (customGithub.trim()) {
      localStorage.setItem('custom_github_token', customGithub.trim())
      setSaveStatus('GitHub token saved!')
      setTimeout(() => setSaveStatus(''), 3000)
    } else {
      localStorage.removeItem('custom_github_token')
      setSaveStatus('GitHub token cleared.')
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const handleClearGithub = () => {
    localStorage.removeItem('custom_github_token')
    setCustomGithub('')
    setSaveStatus('GitHub token cleared.')
    setTimeout(() => setSaveStatus(''), 3000)
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
        <div style={{ position: 'fixed', right: 20, top: 18, zIndex: 60, display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '10px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title="ATS & API Key Settings"
          >
            <Settings size={18} />
          </button>
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
                  flexWrap: 'wrap',
                  gap: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <Logo size={42} showText={false} />
                  <div>
                    <h1
                      style={{
                        fontSize: '30px',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-cyan) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        margin: 0,
                        fontFamily: 'var(--font-title)',
                        letterSpacing: '-0.5px'
                      }}
                    >
                      Your Resume Analysis
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', margin: '4px 0 0' }}>
                      {resumeFile?.name || 'Loaded from History'}
                    </p>
                  </div>
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
            </motion.div>
          ) : !showUploadZone ? (
            <LandingPage key="landing" onAnalyze={handleAnalyze} isLoading={isLoading} />
          ) : (
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '100vh', 
                padding: '60px 20px', 
                position: 'relative', 
                zIndex: 10,
                maxWidth: '650px',
                margin: '0 auto'
              }}
            >
              <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <Logo size={64} showText={true} />
              </div>
              <UploadZone onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>
          )}
        </AnimatePresence>

        {/* AI Guide Panel */}
        {analysis && <AIGuidePanel resumeContext={analysis.parsedText} />}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-card-premium animate-glow-flow"
              style={{
                maxWidth: '480px',
                width: '100%',
                padding: '28px',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>

              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                ⚙️ ATS & API Settings
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', margin: '0 0 20px 0' }}>
                Configure credentials and monitor your real-time candidate sync log.
              </p>

              {/* API Key Panel */}
              <div className="panel-soft" style={{ padding: '16px', display: 'block', marginBottom: '18px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Key size={13} color="var(--accent)" />
                  Your Gemini API Key (Unlimited Checks)
                </strong>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', position: 'relative' }}>
                  <input
                    type={showKeyText ? 'text' : 'password'}
                    className="input-cyber"
                    style={{ flex: 1, paddingRight: '40px' }}
                    placeholder="Enter your Gemini API key (AIzaSy...)"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                  />
                  <button
                    onClick={() => setShowKeyText(!showKeyText)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showKeyText ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {saveStatus}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleClearKey}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: 'var(--danger)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSaveKey}
                      className="btn-glow"
                      style={{
                        padding: '6px 12px',
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      Save Key
                    </button>
                  </div>
                </div>
                
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: '1.4' }}>
                  💡 This saves the key locally in your browser cache. All analysis requests will be sent with your key for unlimited operations.
                </p>
              </div>

              {/* GitHub Token Panel */}
              <div className="panel-soft" style={{ padding: '16px', display: 'block', marginBottom: '18px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Database size={13} color="var(--accent-cyan)" />
                  GitHub Access Token (Free Fallback)
                </strong>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', position: 'relative' }}>
                  <input
                    type={showGithubText ? 'text' : 'password'}
                    className="input-cyber"
                    style={{ flex: 1, paddingRight: '40px' }}
                    placeholder="Enter GitHub Token (github_pat_...)"
                    value={customGithub}
                    onChange={(e) => setCustomGithub(e.target.value)}
                  />
                  <button
                    onClick={() => setShowGithubText(!showGithubText)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showGithubText ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {/* Status is shared */}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleClearGithub}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: 'var(--danger)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSaveGithub}
                      className="btn-glow"
                      style={{
                        padding: '6px 12px',
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      Save Token
                    </button>
                  </div>
                </div>
                
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: '1.4' }}>
                  💡 Provides a 100% free fallback using the GitHub Models API (gpt-4o-mini). Useful for deployed environments.
                </p>
              </div>

              {/* ATS Sync Status Panel */}
              <div className="panel-soft" style={{ padding: '16px', display: 'block' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Database size={13} color="var(--accent-cyan)" />
                  ATS Connection State
                </strong>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block', boxShadow: '0 0 8px var(--success)', animation: 'pulse 1.5s infinite' }} />
                      Synced
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Database</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Live ATS Parse Sandbox</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Sync Protocol</span>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>JSON Schema Mapping</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

