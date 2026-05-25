import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Apply saved theme before React mounts to avoid flash
try {
  const saved = localStorage.getItem('theme')
  const root = document.documentElement
  root.classList.remove('theme-dark', 'theme-light', 'theme-blue')
  if (saved === 'light') root.classList.add('theme-light')
  else if (saved === 'blue') root.classList.add('theme-blue')
  else root.classList.add('theme-dark')
} catch (e) {
  // ignore
}

// Also apply explicit CSS variables for the selected theme so inline styles pick them up
try {
  const theme = localStorage.getItem('theme') || 'dark'
  const root = document.documentElement
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
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
} catch (e) {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
