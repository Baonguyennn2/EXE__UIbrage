import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/api'
import Toast from '../components/Toast.jsx'

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
    <main className="auth-figma">
      <div className="auth-figma__canvas">
        <header className="auth-figma__brand">
          <div className="auth-figma__brand-tile">▦</div>
          <strong>UIbrage</strong>
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

        <section className="auth-figma__card">
          <header>
            <h1>Verify your identity</h1>
            <p>We&apos;ve sent a 6-digit code to <strong>{email || 'your email'}</strong>.</p>
          </header>

          <form className="auth-figma__form" onSubmit={handleSubmit}>
            {!location.state?.email && (
              <label>
                Email address
                <div className="auth-figma__input-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </label>
            )}
            
            <label>
              Verification Code
              <div className="auth-figma__input-wrap">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
            </label>

            <button type="submit" className="auth-figma__submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <footer className="auth-figma__footer">
            Didn&apos;t receive a code? <button type="button" className="auth-figma__link-btn" onClick={handleResend} disabled={loading}>Resend Code</button>
          </footer>
        </section>

        <nav className="auth-figma__meta-links">
          <a href="#">About</a>
          <a href="#">FAQ</a>
          <a href="#">Blog</a>
          <a href="#">Contact</a>
          <a href="#">Terms of Service</a>
        </nav>
      </div>
    </main>
  )
}
