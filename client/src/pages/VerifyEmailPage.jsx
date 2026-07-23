import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/api'
import Toast from '../components/Toast.jsx'
import { MdOutlineEmail } from 'react-icons/md'
import { RiLock2Line } from 'react-icons/ri'

export default function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      await authService.verifyEmail(email, code)
      setNotification({ type: 'success', message: 'Account verified! You can now log in.' })
      setTimeout(() => navigate('/auth/login'), 1500)
    } catch (error) {
      console.error('Verification Error:', error)
      setNotification({ type: 'error', message: error.response?.data?.error || 'Invalid code.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setLoading(true)
    try {
      await authService.resendCode(email)
      setNotification({ type: 'success', message: 'A new verification code has been sent!' })
    } catch (error) {
      console.error('Resend Error:', error)
      setNotification({ type: 'error', message: error.response?.data?.error || 'Failed to resend code.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-figma auth-figma--verify-page" style={{ background: 'var(--cyber-bg)' }}>
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
            <h1 className="cyber-glitch-text" data-text="VERIFY_IDENTITY" style={{ fontFamily: 'var(--font-cyber-heading)', textTransform: 'uppercase', color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>VERIFY_IDENTITY</h1>
            <p style={{ color: 'var(--cyber-accent-secondary)', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem' }}>// AWAITING_AUTHORIZATION_CODE</p>
            <p style={{ color: '#94a3b8', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', marginTop: '0.5rem' }}>We&apos;ve sent a 6-digit code to <strong style={{ color: 'var(--cyber-accent)' }}>{email || 'your email'}</strong>.</p>
          </header>

          <form className="auth-figma__form" onSubmit={handleSubmit}>
            {!location.state?.email && (
              <label style={{ display: 'block', marginBottom: '1.25rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: 'var(--cyber-accent)' }}>EMAIL_ADDRESS</span>
                <div className="cyber-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'white' }}>
                  <MdOutlineEmail size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--cyber-accent-tertiary)', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    className="cyber-input"
                    style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </label>
            )}
            
            <label style={{ display: 'block', marginBottom: '2rem' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: 'var(--cyber-accent)' }}>VERIFICATION_CODE</span>
              <div className="cyber-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'white' }}>
                <RiLock2Line size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--cyber-accent-tertiary)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  className="cyber-input"
                  style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', letterSpacing: '0.5em', fontFamily: 'var(--font-cyber-mono)' }}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
            </label>

            <button type="submit" className="cyber-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
              {loading ? 'VERIFYING...' : 'VERIFY_&_CONTINUE'}
            </button>
          </form>

          <footer style={{ marginTop: '2.5rem', textAlign: 'center', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: '#94a3b8' }}>
            DIDN&apos;T_RECEIVE_CODE? <button type="button" onClick={handleResend} disabled={loading} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--cyber-accent)', marginLeft: '0.5rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline' }}>RESEND_CODE</button>
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
