import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300) // Match animation duration
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  }

  return (
    <div className={`toast-message toast--${type} ${isExiting ? 'toast--exit' : ''}`}>
      <span className="toast-icon">{icons[type]}</span>
      <p>{message}</p>
      <button className="toast-close" onClick={() => {
        setIsExiting(true)
        setTimeout(onClose, 300)
      }}>×</button>
    </div>
  )
}
