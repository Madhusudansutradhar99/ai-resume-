import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Key, Search, Layers, FileWarning, HelpCircle } from 'lucide-react'

export default function ATSReportPanel({ atsReport, isWebGrounded }) {
  if (!atsReport) return null

  const {
    contact,
    sections,
    skillsFound,
    keywordMatchPercent,
    formatWarnings,
    atsScore,
    matchedKeywords,
    missingKeywords,
    sectionScore,
    keywordScore,
    formattingScore,
    recommendations,
    jobDescriptionUsed,
    scanMode,
  } = atsReport

  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--success)'
    if (score >= 50) return 'var(--warning)'
    return 'var(--danger)'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card"
      style={{
        border: '1px solid var(--border)',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
      }}
    >
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '20px' }}>🔍</div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
              Applicant Tracking System (ATS) Scan
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {jobDescriptionUsed ? 'Target job description matched scan' : 'General industry profile scanner'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {isWebGrounded ? (
            <div className="small-badge" style={{ borderColor: 'var(--success)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              🌐 Live Web Grounded
            </div>
          ) : (
            <div className="small-badge" style={{ borderColor: 'var(--warning)', color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              ⚠️ Local Scan Only
            </div>
          )}
          <div className="small-badge" style={{ borderColor: getScoreColor(atsScore), color: getScoreColor(atsScore) }}>
            ATS Score: {atsScore}%
          </div>
        </div>
      </div>

      {/* Warning block for generic scans */}
      {!jobDescriptionUsed && (
        <div style={{
          marginBottom: '28px',
          fontSize: '13px',
          color: '#fbbf24',
          background: 'rgba(245, 158, 11, 0.04)',
          border: '1px solid rgba(245, 158, 11, 0.15)',
          padding: '12px 16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <HelpCircle size={16} />
          <span>This is an estimated general scan. For role-specific matching, paste the exact Job Description when uploading.</span>
        </div>
      )}

      {/* Grid of Scores */}
      <div className="ats-panel-grid">
        <div className="ats-metric-card">
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Keyword Match
          </span>
          <span className="ats-metric-score" style={{ color: getScoreColor(keywordScore || keywordMatchPercent) }}>
            {keywordScore || keywordMatchPercent}%
          </span>
        </div>
        <div className="ats-metric-card">
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Section Coverage
          </span>
          <span className="ats-metric-score" style={{ color: getScoreColor(sectionScore) }}>
            {sectionScore || 0}%
          </span>
        </div>
        <div className="ats-metric-card">
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Format Strength
          </span>
          <span className="ats-metric-score" style={{ color: getScoreColor(formattingScore) }}>
            {formattingScore || 0}%
          </span>
        </div>
      </div>

      {/* Details Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
        
        {/* Contact detected details */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
            📞 Profile Contact Info Detected
          </strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <div>Email(s): <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{contact?.emails?.join(', ') || 'None found'}</span></div>
            <div>Phone(s): <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{contact?.phones?.join(', ') || 'None found'}</span></div>
          </div>
        </div>

        {/* Sections detected details */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
            📁 Core Sections Found
          </strong>
          <div className="capsule-list">
            {(sections && sections.length) ? (
              sections.map((sect, i) => (
                <span key={i} className="capsule-pill capsule-pill-general" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.12)' }}>
                  {sect}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--danger)' }}>No profile sections parsed. Structuring required.</span>
            )}
          </div>
        </div>

        {/* Skills detected details */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
            🛠️ Extracted Tech Skills
          </strong>
          <div className="capsule-list">
            {(skillsFound && skillsFound.length) ? (
              skillsFound.map((skill, i) => (
                <span key={i} className="capsule-pill capsule-pill-general" style={{ background: 'rgba(34, 211, 238, 0.05)', borderColor: 'rgba(34, 211, 238, 0.12)' }}>
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No standard skills scanned.</span>
            )}
          </div>
        </div>

        {/* Matched Keywords capsule list */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <strong style={{ fontSize: '13.5px', display: 'block', marginBottom: '8px', color: 'var(--success)' }}>
            ✅ Matched Job Keywords
          </strong>
          <div className="capsule-list">
            {(matchedKeywords && matchedKeywords.length) ? (
              matchedKeywords.map((kw, i) => (
                <span key={i} className="capsule-pill capsule-pill-match">
                  {kw}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No keywords matched yet. Add targets in job description.</span>
            )}
          </div>
        </div>

        {/* Missing Keywords capsule list */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <strong style={{ fontSize: '13.5px', display: 'block', marginBottom: '8px', color: 'var(--danger)' }}>
            ⚠️ Missing Target Keywords
          </strong>
          <div className="capsule-list">
            {(missingKeywords && missingKeywords.length) ? (
              missingKeywords.map((kw, i) => (
                <span key={i} className="capsule-pill capsule-pill-missing">
                  + {kw}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--success)' }}>Perfect match! No missing target keywords.</span>
            )}
          </div>
        </div>

      </div>

      {/* Warnings area */}
      {formatWarnings && formatWarnings.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <strong style={{ fontSize: '14px', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <FileWarning size={16} />
            Formatting Warnings
          </strong>
          <div>
            {formatWarnings.map((w, i) => (
              <div key={i} className="report-list-item report-list-item-warning">
                <AlertTriangle size={14} style={{ color: 'var(--warning)', marginTop: '2px', flexShrink: 0 }} />
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations area */}
      {recommendations && recommendations.length > 0 && (
        <div>
          <strong style={{ fontSize: '14px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <CheckCircle2 size={16} />
            Recommended Adjustments
          </strong>
          <div>
            {recommendations.map((r, i) => (
              <div key={i} className="report-list-item report-list-item-recommendation">
                <CheckCircle2 size={14} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
