import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import Toast from '../components/Toast.jsx'
import { FaFacebookF } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  function setField(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
      // Clear error when user types
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!form.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and a number'
    }
    
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    
    if (!validateForm()) {
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
      const errorMsg = error.response?.data?.error || 'Registration failed.'
      if (errorMsg.includes('Username') || errorMsg.includes('username')) {
        setErrors({ username: errorMsg })
      } else if (errorMsg.includes('email')) {
        setErrors({ email: errorMsg })
      } else {
        setNotification({ type: 'error', message: errorMsg })
      }
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
            <label className={errors.username ? 'has-error' : ''}>
              Username
              <div className="auth-figma__input-wrap">
                <input type="text" value={form.username} onChange={setField('username')} placeholder="gameder_pro" required />
              </div>
              {errors.username && <span className="error-text">{errors.username}</span>}
            </label>
            <label className={errors.email ? 'has-error' : ''}>
              Email address
              <div className="auth-figma__input-wrap">
                <input type="email" value={form.email} onChange={setField('email')} placeholder="you@example.com" required />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </label>
            <label className={errors.password ? 'has-error' : ''}>
              Password
              <div className="auth-figma__input-wrap">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={setField('password')} placeholder="••••••••" required />
                <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                  {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </span>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </label>
            <label className={errors.confirmPassword ? 'has-error' : ''}>
              Confirm password
              <div className="auth-figma__input-wrap">
                <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={setField('confirmPassword')} placeholder="••••••••" required />
                <span onClick={() => setShowConfirm(!showConfirm)} style={{ cursor: 'pointer' }}>
                  {showConfirm ? <RiEyeOffLine /> : <RiEyeLine />}
                </span>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
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
