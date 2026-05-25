import React, { useEffect, useState } from 'react'

export default function ThemeToggle(){
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'dark' } catch { return 'dark' }
  })

  const themes = ['dark', 'light', 'blue']
  const themeLabels = { dark: '🌙 Dark', light: '☀️ Light', blue: '🔵 Blue' }

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-dark','theme-light','theme-blue')
    root.classList.add(theme === 'light' ? 'theme-light' : theme === 'blue' ? 'theme-blue' : 'theme-dark')
    try { localStorage.setItem('theme', theme) } catch {}

    // Apply explicit CSS variables so inline styles read correct colors immediately
    try {
      const themes = {
        dark: {
          '--bg-page': '#05060a',
          '--bg-primary': '#05060a',
          '--bg-secondary': '#0f1419',
          '--text-primary': '#e6eef8',
          '--text-muted': '#9fb4c8',
          '--card-bg': 'rgba(255,255,255,0.04)',
          '--card-border': 'rgba(255,255,255,0.06)',
          '--bg-card': 'rgba(255,255,255,0.04)',
          '--border': 'rgba(255,255,255,0.06)'
        },
        light: {
          '--bg-page': '#ffffff',
          '--bg-primary': '#ffffff',
          '--bg-secondary': '#f9fafb',
          '--text-primary': '#0b1220',
          '--text-muted': '#4b5563',
          '--card-bg': 'rgba(10,10,10,0.03)',
          '--card-border': 'rgba(10,10,10,0.06)',
          '--bg-card': 'rgba(10,10,10,0.03)',
          '--border': 'rgba(10,10,10,0.06)'
        },
        blue: {
          '--bg-page': '#ecf8ff',
          '--bg-primary': '#ecf8ff',
          '--bg-secondary': '#dceefb',
          '--text-primary': '#003d6b',
          '--text-muted': '#0f5a8a',
          '--card-bg': 'rgba(30,144,255,0.08)',
          '--card-border': 'rgba(30,144,255,0.15)',
          '--bg-card': 'rgba(30,144,255,0.08)',
          '--border': 'rgba(30,144,255,0.15)'
        }
      }
      const vars = themes[theme] || themes.dark
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
