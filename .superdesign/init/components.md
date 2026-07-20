# Shared UI Components

## StarRating
- **Path**: `client/src/components/StarRating.jsx`
- **Description**: Interactive 5-star rating component with hover effects
- **Props**: `rating` (number), `setRating` (function), `size` (number, default 24), `interactive` (boolean, default true)

```jsx
import { useState } from 'react'
import { RiStarFill, RiStarLine } from 'react-icons/ri'

export default function StarRating({ rating, setRating, size = 24, interactive = true }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="star-rating-container" style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && setRating(star)}
          style={{ 
            cursor: interactive ? 'pointer' : 'default',
            color: star <= (hover || rating) ? '#f59e0b' : '#e2e8f0',
            transition: 'color 0.2s'
          }}
        >
          {star <= (hover || rating) ? <RiStarFill size={size} /> : <RiStarLine size={size} />}
        </span>
      ))}
    </div>
  )
}
```

## Toast
- **Path**: `client/src/components/Toast.jsx`
- **Description**: Auto-dismissing toast notification with type-based icons (success, error, info, warning)
- **Props**: `message` (string), `type` (string, default 'info'), `onClose` (function), `duration` (number, default 5000)

```jsx
import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300)
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
```

## BrandMark
- **Path**: `client/src/components/BrandMark.jsx`
- **Description**: UIbrage SVG logo mark with purple gradient
- **Props**: none

```jsx
export default function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 72 72" role="img" aria-label="UIbrage">
      <defs>
        <linearGradient id="brandGlow" x1="12" y1="10" x2="60" y2="64">
          <stop offset="0%" stopColor="#f4e8ff" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle cx="36" cy="36" r="32" fill="url(#brandGlow)" opacity="0.14" />
      <circle cx="36" cy="36" r="27" fill="#ffffff" opacity="0.95" />
      <path
        d="M25 23h10v19c0 4.97 4.03 9 9 9h3v-7h-3a2 2 0 0 1-2-2V23h10v19c0 9.39-7.61 17-17 17s-17-7.61-17-17V23Z"
        fill="#7c3aed"
      />
      <path d="M25 23h10v7H25z" fill="#0f172a" opacity="0.92" />
      <path d="M47 23h10v7H47z" fill="#0f172a" opacity="0.92" />
    </svg>
  )
}
```

## LoadingScreen
- **Path**: `client/src/components/LoadingScreen.jsx`
- **Description**: Full-screen loading overlay with animated logo, spinner, and floating effect
- **Props**: `message` (string, default 'Loading...')

```jsx
import { RiLayoutMasonryFill } from 'react-icons/ri'

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="modern-loading-screen">
      <div className="loading-content">
        <div className="loading-logo-wrapper">
          <div className="loading-logo-glow" />
          <div className="loading-logo">
            <RiLayoutMasonryFill size={32} color="#fff" />
          </div>
          <div className="loading-spinner" />
        </div>
        <div className="loading-brand">
          <h2 className="loading-title">UIbrage</h2>
          <div className="loading-status">
            <span className="status-dot" />
            <p className="status-text">{message}</p>
          </div>
        </div>
      </div>
      {/* Inline styles for loading screen - see source for full CSS */}
    </div>
  )
}
```

## PageCanvas
- **Path**: `client/src/components/PageCanvas.jsx`
- **Description**: Generic page shell layout with topbar, canvas card, workspace main + sidebar
- **Props**: `frame`, `kicker`, `title`, `description`, `spotlight`, `sidebarTitle`, `sidebarItems`, `metaContent`, `mainContent`, `sidebarContent`

```jsx
import { Link } from 'react-router-dom'

export default function PageCanvas({
  frame, kicker, title, description, spotlight,
  sidebarTitle, sidebarItems, metaContent, mainContent, sidebarContent,
}) {
  return (
    <main className="page-shell">
      <header className="page-shell__topbar">
        <div>
          <p className="eyebrow">Page 1 route</p>
          <h1>{title}</h1>
          <p className="page-shell__subtitle">
            {description} <span className="page-shell__subtitle-id">{frame.id}</span>
          </p>
        </div>
        <Link to="/" className="page-shell__home">Route index</Link>
      </header>
      <section className="page-shell__canvas page-shell__canvas--stacked">
        <div className="page-shell__canvas-card page-shell__canvas-card--highlighted">
          <p className="page-shell__eyebrow">{kicker}</p>
          <h2>{frame.id}</h2>
          <p>URL: <span>/page-1/{frame.slug}</span></p>
          {metaContent ?? <p>{spotlight}</p>}
        </div>
        <div className="page-shell__workspace">
          <div className="page-shell__workspace-main">{mainContent ?? spotlight}</div>
          <aside className="page-shell__workspace-sidebar">
            <p className="page-shell__eyebrow">{sidebarTitle}</p>
            {sidebarContent ?? (
              <ul>
                {sidebarItems.map((item) => (<li key={item}>{item}</li>))}
              </ul>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
```

## ProtectedRoute
- **Path**: `client/src/components/ProtectedRoute.jsx`
- **Description**: Auth guard that redirects unauthenticated users or users without allowed roles
- **Props**: `children`, `allowedRoles` (array)

```jsx
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!token || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return user.role === 'admin' 
      ? <Navigate to="/admin/dashboard" replace /> 
      : <Navigate to="/marketplace" replace />
  }

  return children
}
```
