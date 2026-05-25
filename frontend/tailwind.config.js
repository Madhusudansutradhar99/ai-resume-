module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#050508',
        'bg-secondary': '#0d0d14',
        'bg-card': 'rgba(255, 255, 255, 0.04)',
        'border': 'rgba(255, 255, 255, 0.07)',
        'accent': '#6366f1',
        'accent-cyan': '#22d3ee',
        'accent-violet': '#a78bfa',
        'text-primary': '#f1f5f9',
        'text-muted': '#64748b',
        'success': '#10b981',
        'warning': '#f59e0b',
        'danger': '#ef4444',
      },
      fontFamily: {
        'syne': "'Syne', sans-serif",
        'dm-sans': "'DM Sans', sans-serif",
        'mono': "'JetBrains Mono', monospace",
      },
      keyframes: {
        'gradient-blob': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(20px, -50px) scale(1.1)' },
          '50%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '75%': { transform: 'translate(50px, 50px) scale(1.05)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
      animation: {
        'gradient-blob': 'gradient-blob 7s infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
