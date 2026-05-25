import React from 'react'

export const Toast = ({ message, type = 'info', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 
                   type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 
                   'rgba(99, 102, 241, 0.1)'
  
  const borderColor = type === 'error' ? 'rgba(239, 68, 68, 0.3)' :
                      type === 'success' ? 'rgba(16, 185, 129, 0.3)' :
                      'rgba(99, 102, 241, 0.3)'

  const textColor = type === 'error' ? '#fca5a5' :
                    type === 'success' ? '#86efac' :
                    '#a5f3fc'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '16px 20px',
        borderRadius: '8px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        color: textColor,
        fontSize: '14px',
        zIndex: 9999,
        animation: 'slide-in 0.3s ease',
      }}
    >
      {message}
    </div>
  )
}

export default Toast
