import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Download, Sparkles, Printer, FileText, CheckCircle2, AlertTriangle, RefreshCw, Briefcase, GraduationCap, Award, Code, Hammer } from 'lucide-react'
import { improveSection, scanAtsDirect } from '../api'

export const ResumeEditor = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState('checklist') // 'checklist', 'editor', 'preview'
  const [selectedTemplate, setSelectedTemplate] = useState('tech') // 'classic', 'tech', 'creative'
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      linkedIn: '',
      github: '',
      location: '',
    },
    professionalSummary: '',
    workExperience: [{ company: '', title: '', duration: '', bullets: [''] }],
    skills: [],
    education: [{ degree: '', institution: '', year: '', cgpa: '' }],
    projects: [{ name: '', techStack: '', description: '' }],
    certifications: [{ name: '', issuer: '', year: '' }],
  })

  const [improvingSection, setImprovingSection] = useState(null)
  const [diffView, setDiffView] = useState(null)
  const [skillInput, setSkillInput] = useState('')
  
  // Real-time ATS Scanning states
  const [atsReport, setAtsReport] = useState(null)
  const [isScanning, setIsScanning] = useState(false)

  // Initialize data from analysis response
  useEffect(() => {
    if (analysis) {
      if (analysis.atsReport) {
        setAtsReport(analysis.atsReport)
      }
      
      if (analysis.structuredResume) {
        const sr = analysis.structuredResume
        setResumeData({
          personalInfo: {
            name: sr.personalInfo?.name || '',
            email: sr.personalInfo?.email || '',
            phone: sr.personalInfo?.phone || '',
            linkedIn: sr.personalInfo?.linkedIn || '',
            github: sr.personalInfo?.github || '',
            location: sr.personalInfo?.location || '',
          },
          professionalSummary: sr.professionalSummary || '',
          workExperience: sr.workExperience?.length > 0 
            ? sr.workExperience.map(item => ({
                company: item.company || '',
                title: item.title || '',
                duration: item.duration || '',
                bullets: item.bullets?.length > 0 ? [...item.bullets] : [''],
              }))
            : [{ company: '', title: '', duration: '', bullets: [''] }],
          skills: sr.skills || [],
          education: sr.education?.length > 0
            ? sr.education.map(item => ({
                degree: item.degree || '',
                institution: item.institution || '',
                year: item.year || '',
                cgpa: item.cgpa || '',
              }))
            : [{ degree: '', institution: '', year: '', cgpa: '' }],
          projects: sr.projects?.length > 0
            ? sr.projects.map(item => ({
                name: item.name || '',
                techStack: item.techStack || '',
                description: item.description || '',
              }))
            : [{ name: '', techStack: '', description: '' }],
          certifications: sr.certifications?.length > 0
            ? sr.certifications.map(item => ({
                name: item.name || '',
                issuer: item.issuer || '',
                year: item.year || '',
              }))
            : [{ name: '', issuer: '', year: '' }],
        })
      } else if (analysis.parsedText) {
        setResumeData(prev => ({
          ...prev,
          professionalSummary: analysis.summary || '',
        }))
      }
    }
  }, [analysis])

  // Debounced ATS Rescanning
  useEffect(() => {
    if (activeTab === 'checklist') return

    const timer = setTimeout(() => {
      handleScanAts()
    }, 1500) // Trigger 1.5s after user stops typing

    return () => clearTimeout(timer)
  }, [resumeData])

  const handleScanAts = async () => {
    setIsScanning(true)
    try {
      const text = generateResumeText()
      const jd = analysis?.atsReport?.jobDescriptionUsed ? "Job Description Provided" : ""
      const report = await scanAtsDirect(text, jd)
      setAtsReport(report)
    } catch (error) {
      console.error('Failed to rescan ATS:', error)
    } finally {
      setIsScanning(false)
    }
  }

  // AI Section-level improvements
  const handleImproveSection = async (sectionKey, content, metadata = {}) => {
    const sectionNameMap = {
      professionalSummary: 'Professional Summary',
      workExperience: 'Work Experience Bullet',
      projects: 'Project Description',
    }
    
    setImprovingSection(metadata.id || sectionKey)
    try {
      const jobTitle = resumeData.workExperience[0]?.title || 'Software Engineer'
      const result = await improveSection(sectionNameMap[sectionKey] || sectionKey, content, jobTitle)
      setDiffView({
        original: content,
        improved: result.improved,
        explanation: result.explanation,
        section: sectionKey,
        metadata: metadata,
      })
    } catch (error) {
      console.error('Error improving section:', error)
    } finally {
      setImprovingSection(null)
    }
  }

  const handleAcceptImprovement = () => {
    if (!diffView) return

    const { section, improved, metadata } = diffView

    if (section === 'professionalSummary') {
      setResumeData(prev => ({
        ...prev,
        professionalSummary: improved,
      }))
    } else if (section === 'workExperience') {
      const { jobIndex, bulletIndex } = metadata
      setResumeData(prev => {
        const jobs = [...prev.workExperience]
        jobs[jobIndex].bullets[bulletIndex] = improved
        return { ...prev, workExperience: jobs }
      })
    } else if (section === 'projects') {
      const { projectIndex } = metadata
      setResumeData(prev => {
        const projs = [...prev.projects]
        projs[projectIndex].description = improved
        return { ...prev, projects: projs }
      })
    }
    
    setDiffView(null)
  }

  // Structured updates handlers
  const updatePersonalInfo = (field, val) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: val },
    }))
  }

  // Work Experience Handlers
  const handleJobChange = (index, field, val) => {
    setResumeData(prev => {
      const list = [...prev.workExperience]
      list[index][field] = val
      return { ...prev, workExperience: list }
    })
  }

  const handleBulletChange = (jobIndex, bulletIndex, val) => {
    setResumeData(prev => {
      const list = [...prev.workExperience]
      list[jobIndex].bullets[bulletIndex] = val
      return { ...prev, workExperience: list }
    })
  }

  const addJob = () => {
    setResumeData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { company: '', title: '', duration: '', bullets: [''] }],
    }))
  }

  const removeJob = (index) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, idx) => idx !== index),
    }))
  }

  const addBullet = (jobIndex) => {
    setResumeData(prev => {
      const list = [...prev.workExperience]
      list[jobIndex].bullets.push('')
      return { ...prev, workExperience: list }
    })
  }

  const removeBullet = (jobIndex, bulletIndex) => {
    setResumeData(prev => {
      const list = [...prev.workExperience]
      list[jobIndex].bullets = list[jobIndex].bullets.filter((_, idx) => idx !== bulletIndex)
      return { ...prev, workExperience: list }
    })
  }

  // Education Handlers
  const handleEduChange = (index, field, val) => {
    setResumeData(prev => {
      const list = [...prev.education]
      list[index][field] = val
      return { ...prev, education: list }
    })
  }

  const addEdu = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '', cgpa: '' }],
    }))
  }

  const removeEdu = (index) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== index),
    }))
  }

  // Projects Handlers
  const handleProjChange = (index, field, val) => {
    setResumeData(prev => {
      const list = [...prev.projects]
      list[index][field] = val
      return { ...prev, projects: list }
    })
  }

  const addProj = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', techStack: '', description: '' }],
    }))
  }

  const removeProj = (index) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index),
    }))
  }

  // Certifications Handlers
  const handleCertChange = (index, field, val) => {
    setResumeData(prev => {
      const list = [...prev.certifications]
      list[index][field] = val
      return { ...prev, certifications: list }
    })
  }

  const addCert = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', year: '' }],
    }))
  }

  const removeCert = (index) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, idx) => idx !== index),
    }))
  }

  // Download Plain Text
  const handleDownloadResume = () => {
    const resumeText = generateResumeText()
    const blob = new Blob([resumeText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${resumeData.personalInfo.name.replace(/\s+/g, '_') || 'resume'}_optimized.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Print PDF
  const handlePrintResume = () => {
    window.print()
  }

  const generateResumeText = () => {
    const { personalInfo, professionalSummary, workExperience, skills, education, projects, certifications } = resumeData

    let text = `${personalInfo.name}\n`
    if (personalInfo.email) text += `${personalInfo.email} | `
    if (personalInfo.phone) text += `${personalInfo.phone} | `
    if (personalInfo.location) text += personalInfo.location
    text += '\n\n'

    if (personalInfo.linkedIn) text += `LinkedIn: ${personalInfo.linkedIn}\n`
    if (personalInfo.github) text += `GitHub: ${personalInfo.github}\n\n`

    if (professionalSummary) {
      text += `PROFESSIONAL SUMMARY\n${professionalSummary}\n\n`
    }

    if (workExperience.length > 0 && workExperience[0].company) {
      text += `WORK EXPERIENCE\n`
      workExperience.forEach((job) => {
        if (job.company) {
          text += `${job.title || 'Position'} at ${job.company}\n`
          if (job.duration) text += `${job.duration}\n`
          job.bullets.forEach((bullet) => {
            if (bullet) text += `• ${bullet}\n`
          })
          text += '\n'
        }
      })
    }

    if (education.length > 0 && education[0].degree) {
      text += `EDUCATION\n`
      education.forEach((edu) => {
        if (edu.degree) {
          text += `${edu.degree}${edu.institution ? ` from ${edu.institution}` : ''}\n`
          if (edu.year) text += `Year: ${edu.year}\n`
          if (edu.cgpa) text += `CGPA: ${edu.cgpa}\n`
          text += '\n'
        }
      })
    }

    if (skills.length > 0) {
      text += `SKILLS\n${skills.join(', ')}\n\n`
    }

    if (projects.length > 0 && projects[0].name) {
      text += `PROJECTS\n`
      projects.forEach((proj) => {
        if (proj.name) {
          text += `${proj.name}\n`
          if (proj.techStack) text += `Tech: ${proj.techStack}\n`
          if (proj.description) text += `${proj.description}\n\n`
        }
      })
    }

    if (certifications.length > 0 && certifications[0].name) {
      text += `CERTIFICATIONS\n`
      certifications.forEach((cert) => {
        if (cert.name) {
          text += `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}\n`
          if (cert.year) text += `Year: ${cert.year}\n`
          text += '\n'
        }
      })
    }

    return text
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card"
      style={{
        border: '1px solid var(--border)',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
      }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
            background: none !important;
            color: black !important;
          }
          #print-layout-area, #print-layout-area * {
            visibility: visible !important;
            box-shadow: none !important;
          }
          #print-layout-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: #111111 !important;
            line-height: 1.5 !important;
          }
          
          /* Template Font Families */
          #print-layout-area.template-classic {
            font-family: "Georgia", "Times New Roman", serif !important;
          }
          #print-layout-area.template-tech {
            font-family: "Arial", "Helvetica", sans-serif !important;
          }
          #print-layout-area.template-creative {
            font-family: "Trebuchet MS", "Helvetica", sans-serif !important;
          }

          .print-header {
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          #print-layout-area.template-classic .print-header {
            text-align: center;
            border-bottom: 2px solid #333333;
          }
          #print-layout-area.template-tech .print-header {
            text-align: left;
            border-bottom: 2px solid #333333;
          }
          #print-layout-area.template-creative .print-header {
            text-align: left;
            border-left: 4px solid #6366f1;
            padding-left: 12px;
          }

          .print-header h1 {
            font-size: 26px;
            font-weight: 800;
            margin: 0 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          #print-layout-area.template-creative .print-header h1 {
            color: #6366f1 !important;
          }

          .print-contact {
            font-size: 11px;
            color: #444444;
          }

          .print-section {
            margin-bottom: 18px;
          }
          .print-section-title {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #dddddd;
            padding-bottom: 3px;
            margin-bottom: 10px;
            color: #222222;
          }
          #print-layout-area.template-creative .print-section-title {
            color: #6366f1 !important;
          }

          .print-item {
            margin-bottom: 10px;
          }
          .print-item-header {
            display: flex;
            justify-content: space-between;
            font-weight: 700;
            font-size: 13px;
          }
          .print-item-sub {
            display: flex;
            justify-content: space-between;
            font-style: italic;
            font-size: 12px;
            color: #444444;
            margin-bottom: 4px;
          }
          .print-bullets {
            margin: 0;
            padding-left: 18px;
            font-size: 12px;
          }
          .print-bullets li {
            margin-bottom: 3px;
          }
          .print-skills {
            font-size: 12px;
            font-weight: 500;
          }
        }
      `}</style>

      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '12px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '20px' }}>
          <button
            onClick={() => setActiveTab('checklist')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'checklist' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '14.5px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '8px 0',
              borderBottom: activeTab === 'checklist' ? '2px solid var(--accent-cyan)' : 'none',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-title)',
            }}
          >
            📊 Optimization Checklist
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'editor' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '14.5px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '8px 0',
              borderBottom: activeTab === 'editor' ? '2px solid var(--accent-cyan)' : 'none',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-title)',
            }}
          >
            ✏️ Live Resume Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'preview' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '14.5px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '8px 0',
              borderBottom: activeTab === 'preview' ? '2px solid var(--accent-cyan)' : 'none',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-title)',
            }}
          >
            👁️ PDF Preview & Templates
          </button>
        </div>

        {/* Live Score Ring/Stats inside Tab Header */}
        {atsReport && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isScanning && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center' }}
              >
                <RefreshCw size={16} />
              </motion.div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: atsReport.atsScore >= 75 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                borderRadius: '20px',
                border: atsReport.atsScore >= 75 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
                boxShadow: atsReport.atsScore >= 75 ? '0 0 10px rgba(16, 185, 129, 0.15)' : 'none',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: atsReport.atsScore >= 75 ? 'var(--success)' : atsReport.atsScore >= 50 ? 'var(--warning)' : 'var(--danger)',
                  boxShadow: atsReport.atsScore >= 75 ? '0 0 8px var(--success)' : 'none',
                }}
              />
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
                Live ATS Score: {atsReport.atsScore}% {atsReport.atsScore >= 75 ? ' (Ready to Apply 🚀)' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {activeTab === 'checklist' && (
        // Analysis Overview Summary
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: '1.6', marginBottom: '24px' }}>
            Switch to the <strong>Live Resume Editor</strong> tab above to directly modify details, address warnings, incorporate missing keywords in real-time, or check the <strong>PDF Preview & Templates</strong> tab to preview and download your optimized resume PDF. Your score calculates instantly as you edit.
          </p>

          {atsReport && atsReport.atsScore >= 75 && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '18px 24px',
                marginBottom: '28px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1)',
              }}
            >
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '50%',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
                flexShrink: 0,
              }}>
                <CheckCircle2 size={26} color="#10b981" />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '15px', color: '#10b981', marginBottom: '4px', fontFamily: 'var(--font-title)' }}>
                  🎉 Resume Company-Ready! Aap is resume ko directly companies me bhej sakte hain.
                </strong>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', opacity: 0.9 }}>
                  Aapka current score <strong>{atsReport.atsScore}%</strong> target threshold (75%) ko meet kar chuka hai, jo recruiters aur standards ke standard limits se upar hai. Niche click karke templates select karein aur PDF export karein!
                </span>
              </div>
              <button
                onClick={() => setActiveTab('preview')}
                className="btn-glow"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-title)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Go to Export 🖨️
              </button>
            </motion.div>
          )}

          {atsReport && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* Warnings Checklist */}
              <div className="panel-soft" style={{ padding: '24px', display: 'block' }}>
                <h5 style={{ fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', margin: '0 0 16px 0', fontFamily: 'var(--font-title)' }}>
                  <AlertTriangle size={16} /> formatting issues
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {atsReport.formatWarnings?.length > 0 ? (
                    atsReport.formatWarnings.map((warn, i) => (
                      <div key={i} className="report-list-item report-list-item-warning" style={{ margin: 0 }}>
                        <span>{warn}</span>
                      </div>
                    ))
                  ) : (
                    <div className="report-list-item" style={{ borderLeft: '3px solid var(--success)', margin: 0 }}>
                      <span>No formatting warnings detected. Resume is highly parser-friendly.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations Checklist */}
              <div className="panel-soft" style={{ padding: '24px', display: 'block' }}>
                <h5 style={{ fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', margin: '0 0 16px 0', fontFamily: 'var(--font-title)' }}>
                  <CheckCircle2 size={16} /> Quick Optimization Wins
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {atsReport.recommendations?.length > 0 ? (
                    atsReport.recommendations.map((rec, i) => (
                      <div key={i} className="report-list-item report-list-item-recommendation" style={{ margin: 0 }}>
                        <span>{rec}</span>
                      </div>
                    ))
                  ) : (
                    <div className="report-list-item" style={{ borderLeft: '3px solid var(--success)', margin: 0 }}>
                      <span>Excellent. Your resume hits all key profile match targets.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'preview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {atsReport && atsReport.atsScore >= 75 && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1)',
              }}
            >
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '50%',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
                flexShrink: 0,
              }}>
                <CheckCircle2 size={24} color="#10b981" />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '14.5px', color: '#10b981', marginBottom: '4px', fontFamily: 'var(--font-title)' }}>
                  🚀 Ready to Submit! Aap is resume ko directly companies me send kar sakte hain.
                </strong>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', opacity: 0.9 }}>
                  Aapka resume successfully optimized ho gaya hai. Template customize karke **Print / Save PDF** button click karein aur directly apply karna start karein.
                </span>
              </div>
            </motion.div>
          )}

          {/* Template Selector */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border)',
            padding: '12px 18px',
            borderRadius: '12px',
          }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>Select Resume Template</h4>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Choose an ATS-compliant layout for job applications.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['classic', 'tech', 'creative'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTemplate(t)}
                  style={{
                    padding: '8px 14px',
                    background: selectedTemplate === t ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                    color: selectedTemplate === t ? 'white' : 'var(--text-primary)',
                    border: selectedTemplate === t ? 'none' : '1px solid var(--border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    transition: 'all 0.2s',
                  }}
                >
                  {t === 'classic' ? 'Minimalist Serif' : t === 'tech' ? 'Modern Tech' : 'Elegant Creative'}
                </button>
              ))}
            </div>
          </div>

          {/* A4 Paper Frame Container */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '40px 20px',
            display: 'flex',
            justifyContent: 'center',
            overflowX: 'auto',
          }}>
            <div
              className={`a4-preview-page template-${selectedTemplate}`}
              style={{
                width: '100%',
                maxWidth: '800px',
                background: 'white',
                color: '#111111',
                borderRadius: '2px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                lineHeight: '1.45',
                boxSizing: 'border-box',
                fontFamily: selectedTemplate === 'classic' ? 'Georgia, serif' : selectedTemplate === 'tech' ? 'Inter, sans-serif' : 'Trebuchet MS, sans-serif',
              }}
            >
              {/* Header block */}
              <div style={{
                textAlign: selectedTemplate === 'classic' ? 'center' : 'left',
                borderBottom: selectedTemplate === 'creative' ? 'none' : '2px solid #333333',
                borderLeft: selectedTemplate === 'creative' ? '4px solid #6366f1' : 'none',
                paddingLeft: selectedTemplate === 'creative' ? '12px' : '0',
                paddingBottom: '10px',
                marginBottom: '18px',
              }}>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: selectedTemplate === 'creative' ? '#6366f1' : '#111111'
                }}>
                  {resumeData.personalInfo.name || 'Your Name'}
                </h1>
                <div style={{
                  fontSize: '11px',
                  color: '#444444',
                  marginTop: '5px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: selectedTemplate === 'classic' ? 'center' : 'flex-start',
                  gap: '8px 12px'
                }}>
                  {resumeData.personalInfo.email && <span>✉ {resumeData.personalInfo.email}</span>}
                  {resumeData.personalInfo.phone && <span>📞 {resumeData.personalInfo.phone}</span>}
                  {resumeData.personalInfo.location && <span>📍 {resumeData.personalInfo.location}</span>}
                  {resumeData.personalInfo.linkedIn && <span>🔗 {resumeData.personalInfo.linkedIn}</span>}
                  {resumeData.personalInfo.github && <span>💻 {resumeData.personalInfo.github}</span>}
                </div>
              </div>

              {/* Professional Summary */}
              {resumeData.professionalSummary && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #dddddd',
                    paddingBottom: '3px',
                    marginBottom: '8px',
                    color: selectedTemplate === 'creative' ? '#6366f1' : '#222222',
                  }}>
                    Professional Summary
                  </div>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#333333', textAlign: 'justify' }}>{resumeData.professionalSummary}</p>
                </div>
              )}

              {/* Work Experience */}
              {resumeData.workExperience.some(j => j.company) && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #dddddd',
                    paddingBottom: '3px',
                    marginBottom: '8px',
                    color: selectedTemplate === 'creative' ? '#6366f1' : '#222222',
                  }}>
                    Work Experience
                  </div>
                  {resumeData.workExperience.map((job, idx) => job.company && (
                    <div key={idx} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '12px' }}>
                        <span style={{ color: '#111111' }}>{job.title}</span>
                        <span style={{ color: '#555555', fontWeight: 500 }}>{job.duration}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'italic', fontSize: '11px', color: '#555555', marginBottom: '3px' }}>
                        <span>{job.company}</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px', color: '#333333' }}>
                        {job.bullets.map((b, bi) => b && (
                          <li key={bi} style={{ marginBottom: '2px' }}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {resumeData.skills.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #dddddd',
                    paddingBottom: '3px',
                    marginBottom: '6px',
                    color: selectedTemplate === 'creative' ? '#6366f1' : '#222222',
                  }}>
                    Skills & Technologies
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#222222', fontWeight: 500 }}>
                    {resumeData.skills.join(', ')}
                  </div>
                </div>
              )}

              {/* Projects */}
              {resumeData.projects.some(p => p.name) && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #dddddd',
                    paddingBottom: '3px',
                    marginBottom: '8px',
                    color: selectedTemplate === 'creative' ? '#6366f1' : '#222222',
                  }}>
                    Projects
                  </div>
                  {resumeData.projects.map((proj, idx) => proj.name && (
                    <div key={idx} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '12px' }}>
                        <span style={{ color: '#111111' }}>{proj.name}</span>
                        {proj.techStack && <span style={{ fontWeight: 500, fontSize: '11px', fontStyle: 'italic', color: '#555555' }}>({proj.techStack})</span>}
                      </div>
                      <p style={{ margin: '3px 0 0 0', fontSize: '11.5px', color: '#333333', textAlign: 'justify' }}>{proj.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {resumeData.education.some(e => e.degree) && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #dddddd',
                    paddingBottom: '3px',
                    marginBottom: '8px',
                    color: selectedTemplate === 'creative' ? '#6366f1' : '#222222',
                  }}>
                    Education
                  </div>
                  {resumeData.education.map((edu, idx) => edu.degree && (
                    <div key={idx} style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '12px' }}>
                        <span style={{ color: '#111111' }}>{edu.degree}</span>
                        <span style={{ color: '#555555', fontWeight: 500 }}>{edu.year}</span>
                      </div>
                      <div style={{ fontStyle: 'italic', fontSize: '11px', color: '#555555' }}>
                        {edu.institution} {edu.cgpa && ` | CGPA: ${edu.cgpa}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {resumeData.certifications.some(c => c.name) && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #dddddd',
                    paddingBottom: '3px',
                    marginBottom: '6px',
                    color: selectedTemplate === 'creative' ? '#6366f1' : '#222222',
                  }}>
                    Certifications
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px', color: '#333333' }}>
                    {resumeData.certifications.map((cert, idx) => cert.name && (
                      <li key={idx} style={{ marginBottom: '2px' }}>
                        <strong>{cert.name}</strong> {cert.issuer && ` - ${cert.issuer}`} {cert.year && ` (${cert.year})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

          {/* Print/Download Trigger */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={handlePrintResume}
              className="btn-glow"
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-cyan) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-title)',
              }}
            >
              <Printer size={15} />
              Print / Save PDF
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === 'editor' && (
        // Dynamic Editor Form
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          
          {/* Diff View Modal */}
          <AnimatePresence>
            {diffView && (
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
                  zIndex: 2000,
                  padding: '20px',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="glass-card-premium"
                  style={{
                    maxWidth: '750px',
                    width: '100%',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    padding: '32px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={20} color="var(--accent-cyan)" />
                      AI Optimization Suggestion
                    </h3>
                    <button
                      onClick={() => setDiffView(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Explanation */}
                  <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '20px', lineHeight: '1.5', fontStyle: 'italic' }}>
                    {diffView.explanation}
                  </p>

                  {/* Diff View */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--danger)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Original
                      </p>
                      <div
                        style={{
                          background: 'rgba(239, 68, 68, 0.04)',
                          border: '1px solid rgba(239, 68, 68, 0.15)',
                          borderRadius: '10px',
                          padding: '16px',
                          fontSize: '13px',
                          color: 'var(--text-primary)',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          lineHeight: '1.5',
                        }}
                      >
                        {diffView.original}
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        AI Improved
                      </p>
                      <div
                        style={{
                          background: 'rgba(16, 185, 129, 0.04)',
                          border: '1px solid rgba(16, 185, 129, 0.15)',
                          borderRadius: '10px',
                          padding: '16px',
                          fontSize: '13px',
                          color: 'var(--text-primary)',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          lineHeight: '1.5',
                        }}
                      >
                        {diffView.improved}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setDiffView(null)}
                      style={{
                        padding: '11px 20px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: 600,
                      }}
                    >
                      Keep Original
                    </button>
                    <button
                      onClick={handleAcceptImprovement}
                      className="btn-glow"
                      style={{
                        padding: '11px 22px',
                        background: 'var(--success)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: 700,
                      }}
                    >
                      Accept Changes
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Areas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Personal Information */}
            <div style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-title)' }}>
                👤 Personal Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Full Name</label>
                  <input className="input-cyber" style={{ width: '100%' }} placeholder="e.g. John Doe" value={resumeData.personalInfo.name} onChange={(e) => updatePersonalInfo('name', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Email Address</label>
                  <input className="input-cyber" style={{ width: '100%' }} placeholder="e.g. name@domain.com" value={resumeData.personalInfo.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Phone Number</label>
                  <input className="input-cyber" style={{ width: '100%' }} placeholder="e.g. +1 234 567 8900" value={resumeData.personalInfo.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Location</label>
                  <input className="input-cyber" style={{ width: '100%' }} placeholder="e.g. New York, USA" value={resumeData.personalInfo.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>LinkedIn URL</label>
                  <input className="input-cyber" style={{ width: '100%' }} placeholder="linkedin.com/in/username" value={resumeData.personalInfo.linkedIn} onChange={(e) => updatePersonalInfo('linkedIn', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>GitHub Profile</label>
                  <input className="input-cyber" style={{ width: '100%' }} placeholder="github.com/username" value={resumeData.personalInfo.github} onChange={(e) => updatePersonalInfo('github', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-title)' }}>
                  📝 Professional Summary
                </h4>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => handleImproveSection('professionalSummary', resumeData.professionalSummary)}
                  disabled={improvingSection === 'professionalSummary' || !resumeData.professionalSummary.trim()}
                  style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.22)',
                    color: 'var(--accent-cyan)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: (improvingSection || !resumeData.professionalSummary.trim()) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: (improvingSection === 'professionalSummary' || !resumeData.professionalSummary.trim()) ? 0.5 : 1,
                  }}
                >
                  {improvingSection === 'professionalSummary' ? (
                    <RefreshCw size={12} className="spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  Optimize Summary with AI
                </motion.button>
              </div>
              <textarea
                className="input-cyber"
                value={resumeData.professionalSummary}
                onChange={(e) => setResumeData(prev => ({ ...prev, professionalSummary: e.target.value }))}
                placeholder="Write a brief professional summary of your core experience and key skillsets..."
                style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            {/* Work Experience */}
            <div style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-title)' }}>
                  💼 Work Experience
                </h4>
                <button
                  onClick={addJob}
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                >
                  <Plus size={14} /> Add Role
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {resumeData.workExperience.map((job, jobIdx) => (
                  <div
                    key={jobIdx}
                    className="panel-soft"
                    style={{
                      padding: '24px',
                      display: 'block',
                      position: 'relative',
                    }}
                  >
                    {/* Delete Role Button */}
                    {resumeData.workExperience.length > 1 && (
                      <button
                        onClick={() => removeJob(jobIdx)}
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Company</label>
                        <input className="input-cyber" style={{ width: '100%', padding: '8px 12px' }} placeholder="e.g. Google" value={job.company} onChange={(e) => handleJobChange(jobIdx, 'company', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Job Title</label>
                        <input className="input-cyber" style={{ width: '100%', padding: '8px 12px' }} placeholder="e.g. Senior Developer" value={job.title} onChange={(e) => handleJobChange(jobIdx, 'title', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Duration</label>
                        <input className="input-cyber" style={{ width: '100%', padding: '8px 12px' }} placeholder="e.g. Jan 2022 - Present" value={job.duration} onChange={(e) => handleJobChange(jobIdx, 'duration', e.target.value)} />
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Key Duties & Achievements
                        </span>
                        <button
                          onClick={() => addBullet(jobIdx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-cyan)',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          + Add Bullet
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {job.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              className="input-cyber"
                              style={{ flex: 1, padding: '9px 14px' }}
                              placeholder="e.g. Optimized database queries which reduced load times by 35%."
                              value={bullet}
                              onChange={(e) => handleBulletChange(jobIdx, bIdx, e.target.value)}
                            />

                            {/* Optimize Bullet with AI */}
                            <button
                              onClick={() => handleImproveSection('workExperience', bullet, { jobIndex: jobIdx, bulletIndex: bIdx, id: `job-${jobIdx}-bullet-${bIdx}` })}
                              disabled={improvingSection !== null || !bullet.trim()}
                              title="Optimize bullet with AI"
                              style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border)',
                                color: improvingSection === `job-${jobIdx}-bullet-${bIdx}` ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                cursor: (improvingSection !== null || !bullet.trim()) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px',
                                borderRadius: '8px',
                              }}
                            >
                              {improvingSection === `job-${jobIdx}-bullet-${bIdx}` ? (
                                <RefreshCw size={14} className="spin" />
                              ) : (
                                <Sparkles size={14} />
                              )}
                            </button>

                            {/* Delete Bullet */}
                            {job.bullets.length > 1 && (
                              <button
                                onClick={() => removeBullet(jobIdx, bIdx)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-title)' }}>
                  📂 Technical Projects
                </h4>
                <button
                  onClick={addProj}
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {resumeData.projects.map((proj, projIdx) => (
                  <div
                    key={projIdx}
                    className="panel-soft"
                    style={{
                      padding: '24px',
                      display: 'block',
                      position: 'relative',
                    }}
                  >
                    {/* Delete Project Button */}
                    {resumeData.projects.length > 1 && (
                      <button
                        onClick={() => removeProj(projIdx)}
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Project Name</label>
                        <input className="input-cyber" style={{ width: '100%', padding: '8px 12px' }} placeholder="e.g. Chat App" value={proj.name} onChange={(e) => handleProjChange(projIdx, 'name', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Tech Stack</label>
                        <input className="input-cyber" style={{ width: '100%', padding: '8px 12px' }} placeholder="e.g. React, Node, WebSockets" value={proj.techStack} onChange={(e) => handleProjChange(projIdx, 'techStack', e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Description</label>
                        <button
                          onClick={() => handleImproveSection('projects', proj.description, { projectIndex: projIdx, id: `proj-${projIdx}` })}
                          disabled={improvingSection !== null || !proj.description.trim()}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: improvingSection === `proj-${projIdx}` ? 'var(--accent-cyan)' : 'var(--text-muted)',
                            cursor: (improvingSection !== null || !proj.description.trim()) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          {improvingSection === `proj-${projIdx}` ? (
                            <RefreshCw size={12} className="spin" />
                          ) : (
                            <Sparkles size={12} />
                          )}
                          Optimize Project with AI
                        </button>
                      </div>
                      <textarea
                        className="input-cyber"
                        placeholder="Detail what was built, tech stacks used, and individual feature contributions..."
                        value={proj.description}
                        onChange={(e) => handleProjChange(projIdx, 'description', e.target.value)}
                        style={{ width: '100%', minHeight: '70px', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-title)' }}>
                  🎓 Education
                </h4>
                <button
                  onClick={addEdu}
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus size={14} /> Add Education
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {resumeData.education.map((edu, eduIdx) => (
                  <div
                    key={eduIdx}
                    className="panel-soft"
                    style={{
                      padding: '20px',
                      display: 'block',
                      position: 'relative',
                    }}
                  >
                    {/* Delete Education Button */}
                    {resumeData.education.length > 1 && (
                      <button
                        onClick={() => removeEdu(eduIdx)}
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Degree</label>
                        <input className="input-cyber" style={{ width: '100%', padding: '8px 12px' }} placeholder="e.g. B.Tech CS" value={edu.degree} onChange={(e) => handleEduChange(eduIdx, 'degree', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Institution</label>
                        <input className="input-cyber" style={{ width: '100%', padding: '8px 12px' }} placeholder="e.g. IIT Delhi" value={edu.institution} onChange={(e) => handleEduChange(eduIdx, 'institution', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Graduation Year</label>
                        <input className="input-cyber" style={{ width: '100%', padding: '8px 12px' }} placeholder="e.g. 2024" value={edu.year} onChange={(e) => handleEduChange(eduIdx, 'year', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>CGPA / Percentage</label>
                        <input className="input-cyber" style={{ width: '100%', padding: '8px 12px' }} placeholder="e.g. 8.5 / 10" value={edu.cgpa} onChange={(e) => handleEduChange(eduIdx, 'cgpa', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-title)' }}>
                  📜 Certifications
                </h4>
                <button
                  onClick={addCert}
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus size={14} /> Add Certificate
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {resumeData.certifications.map((cert, certIdx) => (
                  <div
                    key={certIdx}
                    className="panel-soft"
                    style={{
                      padding: '20px',
                      display: 'block',
                      position: 'relative',
                    }}
                  >
                    {/* Delete Cert Button */}
                    {resumeData.certifications.length > 1 && (
                      <button
                        onClick={() => removeCert(certIdx)}
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Certificate Name</label>
                        <input className="input-cyber" style={{ width: '100%', padding: '8px 12px' }} placeholder="e.g. AWS Solutions Architect" value={cert.name} onChange={(e) => handleCertChange(certIdx, 'name', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Issuer</label>
                        <input className="input-cyber" style={{ width: '100%', padding: '8px 12px' }} placeholder="e.g. Amazon Web Services" value={cert.issuer} onChange={(e) => handleCertChange(certIdx, 'issuer', e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Year Obtained</label>
                        <input className="input-cyber" style={{ width: '100%', padding: '8px 12px' }} placeholder="e.g. 2023" value={cert.year} onChange={(e) => handleCertChange(certIdx, 'year', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div style={{ paddingBottom: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-title)' }}>
                🎯 Core Skills & Technologies
              </h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <input
                  className="input-cyber"
                  style={{ flex: 1 }}
                  placeholder="Type a skill (e.g. TypeScript) and press Enter or click '+'"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && skillInput.trim()) {
                      if (!resumeData.skills.includes(skillInput.trim())) {
                        setResumeData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }))
                      }
                      setSkillInput('')
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (skillInput.trim()) {
                      if (!resumeData.skills.includes(skillInput.trim())) {
                        setResumeData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }))
                      }
                      setSkillInput('')
                    }
                  }}
                  style={{
                    padding: '12px 20px',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
              
              <div className="capsule-list">
                {resumeData.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="capsule-pill capsule-pill-general"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      background: 'rgba(34, 211, 238, 0.06)',
                      borderColor: 'rgba(34, 211, 238, 0.15)',
                    }}
                  >
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{skill}</span>
                    <button
                      onClick={() => setResumeData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons for Download and Print */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={handlePrintResume}
                className="btn-glow"
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '14px 28px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-title)',
                }}
              >
                <Printer size={16} />
                Print / Save PDF
              </button>

              <button
                onClick={handleDownloadResume}
                className="btn-glow"
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-violet) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-title)',
                }}
              >
                <Download size={16} />
                Download Plain Text
              </button>
            </div>

          </div>
        </motion.div>
      )}

      {/* Hidden printable A4 layout area that only renders on window.print() */}
      <div id="print-layout-area" className={`template-${selectedTemplate}`} style={{ display: 'none' }}>
        <div className="print-header">
          <h1>{resumeData.personalInfo.name || 'Your Name'}</h1>
          <div className="print-contact">
            {resumeData.personalInfo.email && `✉ ${resumeData.personalInfo.email}`}
            {resumeData.personalInfo.phone && `  |  📞 ${resumeData.personalInfo.phone}`}
            {resumeData.personalInfo.location && `  |  📍 ${resumeData.personalInfo.location}`}
            {resumeData.personalInfo.linkedIn && `  |  🔗 ${resumeData.personalInfo.linkedIn}`}
            {resumeData.personalInfo.github && `  |  💻 ${resumeData.personalInfo.github}`}
          </div>
        </div>

        {/* Professional Summary */}
        {resumeData.professionalSummary && (
          <div className="print-section">
            <div className="print-section-title">Professional Summary</div>
            <p style={{ margin: 0, fontSize: '13px' }}>{resumeData.professionalSummary}</p>
          </div>
        )}

        {/* Work Experience */}
        {resumeData.workExperience.some(j => j.company) && (
          <div className="print-section">
            <div className="print-section-title">Work Experience</div>
            {resumeData.workExperience.map((job, idx) => job.company && (
              <div className="print-item" key={idx}>
                <div className="print-item-header">
                  <span>{job.title}</span>
                  <span>{job.duration}</span>
                </div>
                <div className="print-item-sub">
                  <span>{job.company}</span>
                </div>
                <ul className="print-bullets">
                  {job.bullets.map((b, bi) => b && (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resumeData.education.some(e => e.degree) && (
          <div className="print-section">
            <div className="print-section-title">Education</div>
            {resumeData.education.map((edu, idx) => edu.degree && (
              <div className="print-item" key={idx} style={{ marginBottom: '8px' }}>
                <div className="print-item-header">
                  <span>{edu.degree}</span>
                  <span>{edu.year}</span>
                </div>
                <div className="print-item-sub">
                  <span>{edu.institution} {edu.cgpa && `  |  CGPA: ${edu.cgpa}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <div className="print-section">
            <div className="print-section-title">Skills & Technologies</div>
            <div className="print-skills">
              {resumeData.skills.join(', ')}
            </div>
          </div>
        )}

        {/* Projects */}
        {resumeData.projects.some(p => p.name) && (
          <div className="print-section">
            <div className="print-section-title">Academic & Technical Projects</div>
            {resumeData.projects.map((proj, idx) => proj.name && (
              <div className="print-item" key={idx}>
                <div className="print-item-header">
                  <span>{proj.name}</span>
                  {proj.techStack && <span style={{ fontWeight: 'normal', fontSize: '12px', fontStyle: 'italic' }}>({proj.techStack})</span>}
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>{proj.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {resumeData.certifications.some(c => c.name) && (
          <div className="print-section">
            <div className="print-section-title">Certifications</div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
              {resumeData.certifications.map((cert, idx) => cert.name && (
                <li key={idx} style={{ marginBottom: '4px' }}>
                  <strong>{cert.name}</strong> {cert.issuer && `issued by ${cert.issuer}`} {cert.year && `(${cert.year})`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </motion.div>
  )
}

export default ResumeEditor
