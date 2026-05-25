import React from 'react'
import { motion } from 'framer-motion'
import { Building2, Landmark, Briefcase, GraduationCap, Target, Award } from 'lucide-react'

const defaultGuidance = {
  targetField: 'General / Entry-Level IT',
  idealRoles: ['Associate Software Engineer', 'Trainee Developer', 'IT Analyst'],
  preparationAreas: [
    'Core CS fundamentals',
    'DSA basics',
    'One strong project with deployment',
  ],
  companyMatches: [
    {
      sector: 'Private',
      companies: ['TCS', 'Infosys', 'Wipro', 'HCLTech', 'Cognizant', 'Capgemini'],
      fitReason: 'Good default fit for broad entry-level and service/product support roles.',
    },
    {
      sector: 'Government/PSU',
      companies: ['NIC', 'PSU IT teams', 'state government IT cells', 'CDAC', 'BSNL'],
      fitReason: 'Better fit if you target public-sector hiring or exam-based technical roles.',
    },
  ],
  confidence: 55,
}

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0))

export const CareerFitPanel = ({ careerGuidance }) => {
  const guidance = {
    ...defaultGuidance,
    ...(careerGuidance || {}),
  }

  const companies = Array.isArray(guidance.companyMatches) && guidance.companyMatches.length > 0
    ? guidance.companyMatches
    : defaultGuidance.companyMatches

  const confidence = clamp(guidance.confidence)
  const circumference = 2 * Math.PI * 34
  const offset = circumference - (confidence / 100) * circumference
  const confidenceColor = confidence >= 75 ? 'var(--success)' : confidence >= 50 ? 'var(--warning)' : 'var(--danger)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card"
      style={{
        border: '1px solid var(--border)',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '32px', alignItems: 'center' }}>
        <div>
          <h2 className="header-accent" style={{ fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} style={{ color: 'var(--accent-cyan)' }} />
            Career Fit & Company Match
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Estimated job matching metrics based on your profile keywords
          </p>
        </div>

        {/* Confidence Widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)', borderRadius: '16px', padding: '12px 18px' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="7" />
              <motion.circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke={confidenceColor}
                strokeWidth="7"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                style={{ strokeDasharray: circumference, filter: `drop-shadow(0 0 8px ${confidenceColor})` }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: confidenceColor, fontFamily: 'var(--font-title)' }}>{confidence}%</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
              Match Confidence
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '3px 0 0', fontWeight: 500 }}>
              Keyword matching confidence tier
            </p>
          </div>
        </div>
      </div>

      {/* Target Fields & Ideal Roles Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Target Field */}
        <div style={{ background: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Briefcase size={18} color="var(--accent)" />
            <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
              Primary Target Field
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>
            {guidance.targetField}
          </p>
        </div>

        {/* Ideal Roles */}
        <div style={{ background: 'rgba(34, 211, 238, 0.03)', border: '1px solid rgba(34, 211, 238, 0.15)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Target size={18} color="var(--accent-cyan)" />
            <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
              Ideal Job Roles
            </h3>
          </div>
          <div className="capsule-list">
            {guidance.idealRoles.map((role, index) => (
              <span key={index} className="capsule-pill capsule-pill-general">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Learn Next & Private Fit */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Next to Learn */}
        <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <GraduationCap size={18} color="var(--success)" />
            <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
              Recommended Areas to Learn
            </h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-primary)', fontSize: '13px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {guidance.preparationAreas.map((item, index) => (
              <li key={index} style={{ color: 'var(--text-primary)' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Private Sector Fit */}
        <div style={{ background: 'rgba(167, 139, 250, 0.03)', border: '1px solid rgba(167, 139, 250, 0.15)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Building2 size={18} color="var(--accent-violet)" />
            <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
              Private Sector Benchmark
            </h3>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {companies[0]?.fitReason || defaultGuidance.companyMatches[0].fitReason}
          </p>
          <div className="capsule-list">
            {(companies[0]?.companies || defaultGuidance.companyMatches[0].companies).map((company, index) => (
              <span key={index} className="capsule-pill capsule-pill-general" style={{ background: 'rgba(167, 139, 250, 0.06)', borderColor: 'rgba(167, 139, 250, 0.12)' }}>
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Gov / PSU Sector Fit */}
      <div style={{ background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Landmark size={18} color="var(--warning)" />
          <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
            Government & Public Sector Fit
          </h3>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          {companies[1]?.fitReason || defaultGuidance.companyMatches[1].fitReason}
        </p>
        <div className="capsule-list">
          {(companies[1]?.companies || defaultGuidance.companyMatches[1].companies).map((company, index) => (
            <span key={index} className="capsule-pill capsule-pill-general" style={{ background: 'rgba(245, 158, 11, 0.06)', borderColor: 'rgba(245, 158, 11, 0.12)' }}>
              {company}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default CareerFitPanel
