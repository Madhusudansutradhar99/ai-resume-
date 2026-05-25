import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Zap, TrendingUp, Brain, FileText, Target, Sparkles, ArrowRight, ShieldCheck, Star } from 'lucide-react'
import Logo from './Logo'
import UploadZone from './UploadZone'

export default function LandingPage({ onAnalyze, isLoading }) {
  const handleScrollToUpload = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Extraction',
      description: 'Advanced heuristic and LLM engines automatically parse and extract your entire profile into an interactive builder.',
      color: '#6366f1' // Indigo
    },
    {
      icon: Target,
      title: 'ATS Scanner & Score',
      description: 'Get a real-time Applicant Tracking System compatibility score with details on keywords, sections, and layout.',
      color: '#22d3ee' // Cyan
    },
    {
      icon: TrendingUp,
      title: 'Career Trajectory Path',
      description: 'Discover your ideal job domains, target private/public sectors, and recommended areas of certification.',
      color: '#a78bfa' // Violet
    },
    {
      icon: FileText,
      title: 'Job Description Mirroring',
      description: 'Paste any target job description to dynamically align and highlight missing keywords and requirements.',
      color: '#f43f5e' // Rose
    },
    {
      icon: Zap,
      title: 'Targeted AI Optimizer',
      description: 'Refine individual experience bullets or project summaries with inline side-by-side AI change comparison.',
      color: '#fbbf24' // Amber
    },
    {
      icon: CheckCircle2,
      title: 'Print-Ready PDF Export',
      description: 'Download optimized plain text or export to a pixel-perfect, clean, single-page printable PDF resume.',
      color: '#10b981' // Emerald
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Upload Profile',
      description: 'Drag & drop your current PDF or Word DOCX resume to start parsing.'
    },
    {
      number: '02',
      title: 'Paste Job Details',
      description: 'Add the target job role or full JD to map specific keywords.'
    },
    {
      number: '03',
      title: 'AI Analysis & Score',
      description: 'View your live ATS score, strengths, and structured roadmap.'
    },
    {
      number: '04',
      title: 'Optimize & Download',
      description: 'Refine details with target AI suggestions and export to PDF.'
    }
  ]

  // Floating background badges for visual "wow" factor
  const floatingTags = [
    { text: '🎯 ATS Score: 94%', color: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', textColor: '#10b981', top: '12%', left: '6%', delay: 0 },
    { text: '✨ React & Python', color: 'rgba(34, 211, 238, 0.1)', border: 'rgba(34, 211, 238, 0.3)', textColor: '#22d3ee', top: '25%', right: '8%', delay: 1.5 },
    { text: '⚡ Keyword Match: 100%', color: 'rgba(167, 139, 250, 0.1)', border: 'rgba(167, 139, 250, 0.3)', textColor: '#a78bfa', bottom: '30%', left: '8%', delay: 0.8 },
    { text: '💼 Senior Engineer', color: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.3)', textColor: '#6366f1', bottom: '45%', right: '6%', delay: 2.2 }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative Rotating Space Grid */}
      <div 
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1200px',
          height: '1200px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Floating Badges */}
      {floatingTags.map((tag, idx) => (
        <motion.div
          key={idx}
          animate={{
            y: [0, -15, 0],
            x: [0, 8, 0],
          }}
          whileHover={{
            scale: 1.1,
            boxShadow: `0 8px 30px ${tag.color}`,
          }}
          transition={{
            duration: 6 + idx,
            repeat: Infinity,
            delay: tag.delay,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            top: tag.top,
            left: tag.left,
            right: tag.right,
            bottom: tag.bottom,
            padding: '10px 18px',
            background: tag.color,
            border: `1px solid ${tag.border}`,
            borderRadius: '24px',
            color: tag.textColor,
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'default',
            zIndex: 1,
            backdropFilter: 'blur(12px)',
            boxShadow: `0 4px 20px ${tag.color}`,
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          {tag.text}
        </motion.div>
      ))}

      {/* Header Navbar */}
      <header 
        className="navbar-header"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 50,
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <Logo size={40} showText={true} layout="row" />
      </header>

      {/* Hero Section */}
      <div style={{ position: 'relative', zIndex: 2, padding: '140px 20px 60px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* Large Centered Logo */}
        <div style={{ marginBottom: '32px' }}>
          <Logo size={80} showText={true} />
        </div>

        {/* Glowing Top Intro Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pulse-glow"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '30px',
            color: 'var(--text-primary)',
            fontSize: '12.5px',
            fontWeight: 700,
            marginBottom: '32px',
            backdropFilter: 'blur(8px)',
            letterSpacing: '0.5px'
          }}
        >
          <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>INTRODUCING RESUME OPTIMIZER 2.0</span>
        </motion.div>

        {/* Shifting Gradient Title */}
        <h1
          className="text-gradient-flow hero-title"
          style={{
            fontWeight: 800,
            lineHeight: '1.15',
            marginBottom: '24px',
            fontFamily: "var(--font-title)",
            letterSpacing: '-1.5px'
          }}
        >
          Build a Resume That<br />Recruiters Actually Read
        </h1>
        
        <p 
          className="hero-desc"
          style={{
            color: 'var(--text-muted)',
            marginBottom: '36px',
            maxWidth: '720px',
            margin: '0 auto 36px',
            lineHeight: '1.6',
            fontFamily: "var(--font-body)"
          }}
        >
          Upload your resume to instantly extract structured sections, receive dynamic ATS grading, and optimize bullet points with target AI suggestions.
        </p>

        {/* Embedded UploadZone */}
        <div style={{ marginTop: '48px', marginBottom: '32px' }}>
          <UploadZone onAnalyze={onAnalyze} isLoading={isLoading} />
        </div>
      </div>

      {/* Features Grid Section */}
      <div style={{ position: 'relative', zIndex: 2, padding: '80px 20px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '40px',
          fontWeight: 800,
          marginBottom: '16px',
          textAlign: 'center',
          color: 'var(--text-primary)',
          fontFamily: "var(--font-title)",
          letterSpacing: '-0.5px'
        }}>
          ✨ Next-Gen Features
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginBottom: '54px',
          maxWidth: '520px',
          margin: '0 auto 54px'
        }}>
          Everything you need to bypass applicant tracking filters and build a highly professional profile.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '28px'
        }}>
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, borderColor: feature.color, boxShadow: `0 12px 30px ${feature.color}15` }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  borderRadius: '20px',
                  padding: '32px',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: `linear-gradient(135deg, ${feature.color}1c 0%, ${feature.color}05 100%)`,
                  border: `1px solid ${feature.color}3d`,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: feature.color,
                  boxShadow: `0 4px 12px ${feature.color}1c`
                }}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '19px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                    fontFamily: "var(--font-title)"
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    margin: 0,
                    lineHeight: '1.6',
                    fontFamily: "var(--font-body)"
                  }}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Connected Timeline How It Works */}
      <div style={{ position: 'relative', zIndex: 2, padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '40px',
          fontWeight: 800,
          marginBottom: '16px',
          textAlign: 'center',
          color: 'var(--text-primary)',
          fontFamily: "var(--font-title)",
          letterSpacing: '-0.5px'
        }}>
          🚀 Interactive Timeline
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginBottom: '64px',
          maxWidth: '520px',
          margin: '0 auto 64px'
        }}>
          Optimize your profile layout in four simple phases.
        </p>

        {/* Timeline Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '28px',
          position: 'relative'
        }}>
          
          {/* Neon Horizontal Connector Line for Desktop */}
          <div 
            style={{
              position: 'absolute',
              top: '40px',
              left: '60px',
              right: '60px',
              height: '2px',
              background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-cyan) 50%, var(--accent-violet) 100%)',
              opacity: 0.2,
              zIndex: 0,
            }}
            className="timeline-horizontal-line"
          />

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, borderColor: 'var(--accent-cyan)' }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="glass-card"
              style={{
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
                borderRadius: '20px',
                padding: '32px 20px',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-violet) 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '22px',
                  fontWeight: 800,
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                  border: '3px solid var(--bg-page)',
                  fontFamily: "var(--font-title)"
                }}
              >
                {step.number}
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '10px',
                fontFamily: "var(--font-title)"
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: '13.5px',
                color: 'var(--text-muted)',
                lineHeight: '1.55',
                margin: 0,
                fontFamily: "var(--font-body)"
              }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Beautiful Curved Card CTA */}
      <div style={{ position: 'relative', zIndex: 2, padding: '80px 20px 120px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass-card-premium"
          style={{
            padding: '64px 48px',
            textAlign: 'center',
          }}
        >
          {/* Inner Light Flare */}
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 60%)',
              pointerEvents: 'none'
            }}
          />

          <h2 style={{
            fontSize: '40px',
            fontWeight: 800,
            marginBottom: '18px',
            color: 'var(--text-primary)',
            fontFamily: "var(--font-title)",
            position: 'relative',
            zIndex: 1,
            letterSpacing: '-0.5px'
          }}>
            Ready to Bypass the ATS Filter?
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-muted)',
            marginBottom: '36px',
            lineHeight: '1.6',
            maxWidth: '580px',
            margin: '0 auto 36px',
            fontFamily: "var(--font-body)",
            position: 'relative',
            zIndex: 1
          }}>
            Upload your profile in seconds to generate dynamic matching logs and structured PDF exports.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleScrollToUpload}
            className="btn-glow"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-cyan) 100%)',
              color: 'white',
              border: 'none',
              padding: '18px 44px',
              fontSize: '16.5px',
              fontWeight: 700,
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
              zIndex: 1,
              fontFamily: "var(--font-title)"
            }}
          >
            Upload Your Resume Now <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>

    </div>
  )
}
