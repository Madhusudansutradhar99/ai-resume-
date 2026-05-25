import React, { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      // Map any obsolete themes from cache to a valid theme
      if (saved === 'emerald' || saved === 'rose') return 'dark'
      return saved || 'dark'
    } catch {
      return 'dark'
    }
  })

  const themes = ['dark', 'light', 'blue']
  const themeLabels = { 
    dark: '🌙 Cyberpunk', 
    light: '☀️ Light', 
    blue: '🔵 Deep Blue'
  }

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-dark', 'theme-light', 'theme-blue')
    root.classList.add(`theme-${theme}`)
    try { localStorage.setItem('theme', theme) } catch {}

    // Apply explicit CSS variables so inline styles read correct colors immediately
    try {
      const themeConfigs = {
        dark: {
          '--bg-page': '#05060b',
          '--bg-primary': '#05060b',
          '--bg-secondary': '#0d0f17',
          '--text-primary': '#f1f5f9',
          '--text-muted': '#8492a6',
          '--card-bg': 'rgba(13, 15, 23, 0.75)',
          '--card-border': 'rgba(99, 102, 241, 0.15)',
          '--bg-card': 'rgba(13, 15, 23, 0.75)',
          '--border': 'rgba(99, 102, 241, 0.15)',
          '--accent': '#6366f1',
          '--accent-cyan': '#22d3ee',
          '--accent-violet': '#a78bfa',
          '--glow-shadow': 'rgba(99, 102, 241, 0.18)'
        },
        light: {
          '--bg-page': '#f8fafc',
          '--bg-primary': '#f8fafc',
          '--bg-secondary': '#f1f5f9',
          '--text-primary': '#0f172a',
          '--text-muted': '#64748b',
          '--card-bg': 'rgba(255, 255, 255, 0.85)',
          '--card-border': 'rgba(99, 102, 241, 0.12)',
          '--bg-card': 'rgba(255, 255, 255, 0.85)',
          '--border': 'rgba(99, 102, 241, 0.12)',
          '--accent': '#4f46e5',
          '--accent-cyan': '#06b6d4',
          '--accent-violet': '#8b5cf6',
          '--glow-shadow': 'rgba(79, 70, 229, 0.08)'
        },
        blue: {
          '--bg-page': '#0b1528',
          '--bg-primary': '#0b1528',
          '--bg-secondary': '#080d1a',
          '--text-primary': '#e0f2fe',
          '--text-muted': '#7dd3fc',
          '--card-bg': 'rgba(11, 21, 40, 0.7)',
          '--card-border': 'rgba(14, 165, 233, 0.15)',
          '--bg-card': 'rgba(11, 21, 40, 0.7)',
          '--border': 'rgba(14, 165, 233, 0.15)',
          '--accent': '#0284c7',
          '--accent-cyan': '#38bdf8',
          '--accent-violet': '#818cf8',
          '--glow-shadow': 'rgba(14, 165, 233, 0.2)'
        }
      }
      const vars = themeConfigs[theme] || themeConfigs.dark
      const rootStyle = document.documentElement.style
      Object.entries(vars).forEach(([k, v]) => rootStyle.setProperty(k, v))
    } catch (e) {}
  }, [theme])

  const cycle = () => {
    const currentIdx = themes.indexOf(theme)
    const safeIdx = currentIdx === -1 ? 0 : currentIdx
    const nextTheme = themes[(safeIdx + 1) % themes.length]
    setTheme(nextTheme)
  }

  return (
    <button onClick={cycle} className="small-badge" style={{ cursor: 'pointer' }}>
      {themeLabels[theme] || '🌙 Cyberpunk'}
    </button>
  )
}
