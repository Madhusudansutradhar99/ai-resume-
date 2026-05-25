import React, { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'dark' } catch { return 'dark' }
  })

  const themes = ['dark', 'light', 'emerald', 'rose']
  const themeLabels = { 
    dark: '🌙 Cyberpunk', 
    light: '☀️ Light', 
    emerald: '🟢 Matrix Green', 
    rose: '🌅 Sunset Aurora' 
  }

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-dark', 'theme-light', 'theme-blue', 'theme-emerald', 'theme-rose')
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
        emerald: {
          '--bg-page': '#020705',
          '--bg-primary': '#020705',
          '--bg-secondary': '#05120a',
          '--text-primary': '#ecfdf5',
          '--text-muted': '#6ee7b7',
          '--card-bg': 'rgba(4, 18, 12, 0.75)',
          '--card-border': 'rgba(16, 185, 129, 0.15)',
          '--bg-card': 'rgba(4, 18, 12, 0.75)',
          '--border': 'rgba(16, 185, 129, 0.15)',
          '--accent': '#059669',
          '--accent-cyan': '#10b981',
          '--accent-violet': '#34d399',
          '--glow-shadow': 'rgba(16, 185, 129, 0.18)'
        },
        rose: {
          '--bg-page': '#090406',
          '--bg-primary': '#090406',
          '--bg-secondary': '#160a0f',
          '--text-primary': '#fff1f2',
          '--text-muted': '#fda4af',
          '--card-bg': 'rgba(22, 10, 15, 0.75)',
          '--card-border': 'rgba(244, 63, 94, 0.15)',
          '--bg-card': 'rgba(22, 10, 15, 0.75)',
          '--border': 'rgba(244, 63, 94, 0.15)',
          '--accent': '#e11d48',
          '--accent-cyan': '#f43f5e',
          '--accent-violet': '#fb7185',
          '--glow-shadow': 'rgba(244, 63, 94, 0.18)'
        }
      }
      const vars = themeConfigs[theme] || themeConfigs.dark
      const rootStyle = document.documentElement.style
      Object.entries(vars).forEach(([k, v]) => rootStyle.setProperty(k, v))
    } catch (e) {}
  }, [theme])

  const cycle = () => {
    const currentIdx = themes.indexOf(theme)
    const nextTheme = themes[(currentIdx + 1) % themes.length]
    setTheme(nextTheme)
  }

  return (
    <button onClick={cycle} className="small-badge" style={{ cursor: 'pointer' }}>
      {themeLabels[theme]}
    </button>
  )
}
