import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import Toast from '../components/Toast.jsx'
import { FaFacebookF } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { RiEyeLine } from 'react-icons/ri'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  function setField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      setNotification({ type: 'error', message: 'Passwords do not match' })
      return
    }

    setLoading(true)
    try {
      await authService.register({
        email: form.email,
        password: form.password,
        fullName: form.username,
        username: form.username || form.email.split('@')[0],
      })
      setNotification({ type: 'success', message: 'Account created! Redirecting to verification...' })
      setTimeout(() => navigate('/auth/verify-email', { state: { email: form.email } }), 1500)
    } catch (error) {
      console.error('Registration Error:', error)
      setNotification({ type: 'error', message: error.response?.data?.error || 'Registration failed.' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
     setNotification({ type: 'info', message: 'Redirecting to Google...' })
     window.location.href = 'http://localhost:5000/api/auth/google'
  }

  const handleFacebookLogin = () => {
    setNotification({ type: 'info', message: 'Facebook login is coming soon.' })
  }

  return (
    <main className="auth-figma auth-figma--register-page">
      <section className="auth-figma__canvas">
        <header className="auth-figma__brand">
          <span className="auth-figma__brand-tile">▦</span>
          <strong>Ulbrage</strong>
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

      <section className="auth-figma__card auth-figma__card--register">
          <header>
            <h1>Create your Ulbrage account</h1>
          </header>

          <form className="auth-figma__form" onSubmit={handleSubmit}>
            <label>
              Username
              <input type="text" value={form.username} onChange={setField('username')} placeholder="gameder_pro" required />
            </label>
            <label>
              Email address
              <input type="email" value={form.email} onChange={setField('email')} placeholder="you@example.com" required />
            </label>
            <label>
              Password
              <div className="auth-figma__input-wrap">
                <input type="password" value={form.password} onChange={setField('password')} placeholder="••••••••" required />
                <span><RiEyeLine /></span>
              </div>
            </label>
            <label>
              Confirm password
              <input type="password" value={form.confirmPassword} onChange={setField('confirmPassword')} placeholder="••••••••" required />
            </label>

            <button type="submit" className="auth-figma__submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="auth-figma__divider">
            <span>OR SIGN UP WITH</span>
          </div>

          <div className="auth-figma__socials">
            <button type="button" className="auth-figma__social-btn" onClick={handleFacebookLogin}>
              <FaFacebookF />
              Facebook
            </button>
            <button type="button" className="auth-figma__social-btn" onClick={handleGoogleLogin}>
              <FcGoogle />
              Google
            </button>
          </div>

          <footer className="auth-figma__footer">
            Already have an account? <Link to="/auth/login">Log in</Link>
          </footer>
        </section>
      </section>
    </main>
  )
}
