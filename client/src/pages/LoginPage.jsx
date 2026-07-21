import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import Toast from '../components/Toast.jsx'
import { FaFacebookF } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { MdOutlineEmail } from 'react-icons/md'
import { RiLock2Line } from 'react-icons/ri'

export default function LoginPage({ variant = 'v1' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()
  const isCompact = variant === 'v2'

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await authService.login(email, password)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      setNotification({ type: 'success', message: 'Logged in successfully!' })
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/marketplace')
        }
      }, 1500)
    } catch (error) {
      console.error('Login Error:', error)
      setNotification({ type: 'error', message: error.response?.data?.error || 'Login failed.' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setNotification({ type: 'info', message: 'Redirecting to Google...' })
    // Placeholder for Google OAuth redirect
    window.location.href = 'http://localhost:5000/api/auth/google'
  }

  const handleFacebookLogin = () => {
    setNotification({ type: 'info', message: 'Facebook login is coming soon.' })
  }

  return (
    <main className={`auth-figma auth-figma--login ${isCompact ? 'auth-figma--compact' : ''}`} style={{ background: 'var(--cyber-bg)' }}>
      <div className="cyber-grid-bg" style={{ opacity: 0.05, position: 'fixed', inset: 0, zIndex: 0 }}></div>
      <section className="auth-figma__canvas" style={{ background: 'transparent', border: 'none', position: 'relative', zIndex: 10 }}>
        <header className="auth-figma__brand">
          <strong className="cyber-glitch-text" data-text="UIBRAGE" style={{ fontFamily: 'var(--font-cyber-heading)', fontSize: '2.5rem', letterSpacing: '0.1em', color: 'var(--cyber-accent)' }}>UIBRAGE</strong>
        </header>

        {notification && (
          <div className="toast-container">
            <Toast
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          </div>
        )}

        <section className="auth-figma__card cyber-card" style={{ background: 'rgba(5, 5, 10, 0.7)', border: '1px solid var(--cyber-border)', padding: '2.5rem' }}>
          <header style={{ marginBottom: '2rem' }}>
            <h1 className="cyber-glitch-text" data-text="LOGIN_TO_SYSTEM" style={{ fontFamily: 'var(--font-cyber-heading)', textTransform: 'uppercase', color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>LOGIN_TO_SYSTEM</h1>
            <p style={{ color: 'var(--cyber-accent-secondary)', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem' }}>// ENTER_YOUR_CREDENTIALS</p>
          </header>

          <form className="auth-figma__form" onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: 'var(--cyber-accent)' }}>USERNAME_OR_EMAIL</span>
              <div className="cyber-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <MdOutlineEmail size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--cyber-accent-tertiary)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  className="cyber-input"
                  style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem' }}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label style={{ display: 'block', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: 'var(--cyber-accent)' }}>PASSWORD</span>
                <Link to="/auth/forgot-password" style={{ fontFamily: 'var(--font-cyber-mono)', fontSize: '0.8rem', color: 'var(--cyber-accent-secondary)' }}>Forgot password?</Link>
              </div>
              <div className="cyber-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <RiLock2Line size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--cyber-accent-tertiary)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  className="cyber-input"
                  style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>

            <button type="submit" className="cyber-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
              {loading ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>
          </form>

          <div style={{ margin: '2rem 0', position: 'relative', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--cyber-border)', zIndex: 1 }}></div>
            <span style={{ position: 'relative', zIndex: 2, background: 'rgba(5, 5, 10, 0.95)', padding: '0 1rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.75rem', color: '#64748b' }}>OR_CONNECT_VIA</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button type="button" className="cyber-btn-outline" onClick={handleFacebookLogin} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0.5rem 1rem', minHeight: 'auto', fontSize: '0.85rem', clipPath: 'none', background: 'var(--cyber-muted)' }}>
              <FaFacebookF /> FACEBOOK
            </button>
            <button type="button" className="cyber-btn-outline" onClick={handleGoogleLogin} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0.5rem 1rem', minHeight: 'auto', fontSize: '0.85rem', clipPath: 'none', background: 'var(--cyber-muted)' }}>
              <FcGoogle /> GOOGLE
            </button>
          </div>

          <footer style={{ marginTop: '2.5rem', textAlign: 'center', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: '#94a3b8' }}>
            NEW_TO_SYSTEM? <Link to="/auth/register" style={{ color: 'var(--cyber-accent)', marginLeft: '0.5rem' }}>CREATE_ACCOUNT</Link>
          </footer>
        </section>

        <nav style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.8rem', color: 'var(--cyber-muted-foreground)', marginTop: '2rem' }}>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>ABOUT</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>BLOG</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>CONTACT</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>TERMS_OF_SERVICE</a>
        </nav>
      </section>
    </main>
  )
}

