import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react'

export const UploadZone = ({ onAnalyze, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [error, setError] = useState('')

  const onDrop = useCallback((acceptedFiles) => {
    setError('')
    if (acceptedFiles.length === 0) {
      setError('Please drop a PDF or DOCX file')
      return
    }

    const file = acceptedFiles[0]
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (!validTypes.includes(file.type)) {
      setError('Only PDF and DOCX files are supported')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    disabled: isLoading,
  })

  const handleClearFile = () => {
    setSelectedFile(null)
    setError('')
  }

  const handleAnalyze = () => {
    if (!selectedFile) {
      setError('Please select a file')
      return
    }
    onAnalyze(selectedFile, jobDescription)
  }

  // Floating background pills for a tech-workspace mood
  const techPills = [
    { text: 'TypeScript', top: '15%', left: '8%', delay: 0 },
    { text: 'AWS Cloud', top: '22%', right: '10%', delay: 1 },
    { text: 'System Design', bottom: '25%', left: '12%', delay: 2 },
    { text: 'Docker & K8s', bottom: '15%', right: '15%', delay: 0.5 },
  ]

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '650px', width: '100%', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="glass-card-premium"
        style={{
          width: '100%',
        }}
      >
        {/* Interactive Dropzone */}
        <motion.div
          whileHover={!isLoading ? { scale: 1.01 } : {}}
          {...getRootProps()}
          className="premium-dropzone"
          style={{
            padding: '48px 32px',
            textAlign: 'center',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            background: isDragActive ? 'rgba(99, 102, 241, 0.04) !important' : 'rgba(255, 255, 255, 0.01) !important',
            borderColor: isDragActive ? 'var(--accent-cyan) !important' : 'rgba(99, 102, 241, 0.25) !important',
          }}
        >
          <input {...getInputProps()} />
          
          <motion.div
            animate={isDragActive ? { y: [0, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            <Upload
              size={44}
              style={{
                margin: '0 auto 16px',
                color: isDragActive ? 'var(--accent-cyan)' : 'var(--accent)',
                filter: `drop-shadow(0 4px 12px ${isDragActive ? 'rgba(34, 211, 238, 0.2)' : 'rgba(99, 102, 241, 0.15)'})`
              }}
            />
          </motion.div>
          
          <p style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
            {isDragActive ? 'Release to drop your resume' : 'Drag & drop your resume here'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: 0 }}>
            Supports standard PDF and Word DOCX formats (Up to 5MB)
          </p>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px',
              padding: '4px 10px',
              background: localStorage.getItem('custom_gemini_api_key') ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.03)',
              border: localStorage.getItem('custom_gemini_api_key') ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border)',
              color: localStorage.getItem('custom_gemini_api_key') ? 'var(--success)' : 'var(--text-muted)',
              borderRadius: '20px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🔑 Key: {localStorage.getItem('custom_gemini_api_key') ? 'Custom Active' : 'Default Server'}
            </span>
            <span style={{
              fontSize: '11px',
              padding: '4px 10px',
              background: 'rgba(34, 211, 238, 0.05)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              color: 'var(--accent-cyan)',
              borderRadius: '20px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ⚡ ATS Sync: Live
            </span>
          </div>
        </motion.div>

        {/* Selected File Details */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3, cubicBezier: [0.16, 1, 0.3, 1] }}
              style={{
                marginTop: '20px',
                padding: '16px 20px',
                background: 'rgba(99, 102, 241, 0.03)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                  }}
                >
                  <File size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {selectedFile.name}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClearFile}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                <X size={16} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Description Textarea */}
        <div style={{ marginTop: '28px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
            📝 Target Job Description (Optional)
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job requirements or full job description here to run a target keyword-matching scan..."
            disabled={isLoading}
            className="input-cyber"
            style={{
              width: '100%',
              minHeight: '110px',
              resize: 'vertical',
              opacity: isLoading ? 0.5 : 1,
              lineHeight: '1.5',
            }}
          />
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--danger)',
                marginTop: '20px',
                fontSize: '13.5px',
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                padding: '10px 14px',
                borderRadius: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action trigger button */}
        <motion.button
          whileHover={selectedFile && !isLoading ? { scale: 1.02 } : {}}
          whileTap={selectedFile && !isLoading ? { scale: 0.98 } : {}}
          onClick={handleAnalyze}
          disabled={!selectedFile || isLoading}
          className="btn-glow"
          style={{
            width: '100%',
            marginTop: '28px',
            padding: '16px 28px',
            background: selectedFile && !isLoading
              ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-violet) 100%)'
              : 'rgba(255, 255, 255, 0.02)',
            color: selectedFile && !isLoading ? 'white' : 'var(--text-muted)',
            border: selectedFile && !isLoading ? 'none' : '1px solid var(--border)',
            fontWeight: 700,
            fontSize: '15.5px',
            borderRadius: '12px',
            cursor: selectedFile && !isLoading ? 'pointer' : 'not-allowed',
            opacity: isLoading ? 0.8 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'var(--font-title)',
          }}
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ display: 'inline-block' }}
              >
                ⏳
              </motion.div>
              <span>Analyzing and Extracting Profile...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Analyze Resume →</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  )
}

export default UploadZone
