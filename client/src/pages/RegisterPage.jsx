import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import Toast from '../components/Toast.jsx'
import { FaFacebookF } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { RiEyeLine, RiEyeOffLine, RiLock2Line, RiUser3Line } from 'react-icons/ri'
import { MdOutlineEmail } from 'react-icons/md'

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
    <main className="auth-figma auth-figma--register-page" style={{ background: 'var(--cyber-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
            <h1 className="cyber-glitch-text" data-text="CREATE_ACCOUNT" style={{ fontFamily: 'var(--font-cyber-heading)', textTransform: 'uppercase', color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>CREATE_ACCOUNT</h1>
            <p style={{ color: 'var(--cyber-accent-secondary)', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem' }}>// INITIALIZE_NEW_USER_NODE</p>
          </header>

          <form className="auth-figma__form" onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: errors.username ? 'var(--cyber-destructive)' : 'var(--cyber-accent)' }}>USERNAME</span>
              <div className="cyber-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'white' }}>
                <RiUser3Line size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--cyber-accent-tertiary)', pointerEvents: 'none' }} />
                <input 
                  type="text" 
                  className="cyber-input"
                  style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', borderColor: errors.username ? 'var(--cyber-destructive)' : '' }}
                  value={form.username} 
                  onChange={setField('username')} 
                  placeholder="gameder_pro" 
                  required 
                />
              </div>
              {errors.username && <span style={{ color: 'var(--cyber-destructive)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.username}</span>}
            </label>

            <label style={{ display: 'block', marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: errors.email ? 'var(--cyber-destructive)' : 'var(--cyber-accent)' }}>EMAIL_ADDRESS</span>
              <div className="cyber-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'white' }}>
                <MdOutlineEmail size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--cyber-accent-tertiary)', pointerEvents: 'none' }} />
                <input 
                  type="email" 
                  className="cyber-input"
                  style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', borderColor: errors.email ? 'var(--cyber-destructive)' : '' }}
                  value={form.email} 
                  onChange={setField('email')} 
                  placeholder="you@example.com" 
                  required 
                />
              </div>
              {errors.email && <span style={{ color: 'var(--cyber-destructive)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
            </label>

            <label style={{ display: 'block', marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: errors.password ? 'var(--cyber-destructive)' : 'var(--cyber-accent)' }}>PASSWORD</span>
              <div className="cyber-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'white' }}>
                <RiLock2Line size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--cyber-accent-tertiary)', pointerEvents: 'none' }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="cyber-input"
                  style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '3rem', borderColor: errors.password ? 'var(--cyber-destructive)' : '' }}
                  value={form.password} 
                  onChange={setField('password')} 
                  placeholder="••••••••" 
                  required 
                />
                <span onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', cursor: 'pointer', color: '#64748b' }}>
                  {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </span>
              </div>
              {errors.password && <span style={{ color: 'var(--cyber-destructive)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.password}</span>}
            </label>

            <label style={{ display: 'block', marginBottom: '2rem' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: errors.confirmPassword ? 'var(--cyber-destructive)' : 'var(--cyber-accent)' }}>CONFIRM_PASSWORD</span>
              <div className="cyber-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'white' }}>
                <RiLock2Line size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--cyber-accent-tertiary)', pointerEvents: 'none' }} />
                <input 
                  type={showConfirm ? 'text' : 'password'} 
                  className="cyber-input"
                  style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '3rem', borderColor: errors.confirmPassword ? 'var(--cyber-destructive)' : '' }}
                  value={form.confirmPassword} 
                  onChange={setField('confirmPassword')} 
                  placeholder="••••••••" 
                  required 
                />
                <span onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '1rem', cursor: 'pointer', color: '#64748b' }}>
                  {showConfirm ? <RiEyeOffLine /> : <RiEyeLine />}
                </span>
              </div>
              {errors.confirmPassword && <span style={{ color: 'var(--cyber-destructive)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.confirmPassword}</span>}
            </label>

            <button type="submit" className="cyber-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
              {loading ? 'CREATING_ACCOUNT...' : 'CREATE_ACCOUNT'}
            </button>
          </form>

          <div style={{ margin: '2rem 0', position: 'relative', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--cyber-border)', zIndex: 1 }}></div>
            <span style={{ position: 'relative', zIndex: 2, background: 'rgba(5, 5, 10, 0.95)', padding: '0 1rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.75rem', color: '#64748b' }}>OR_SIGN_UP_WITH</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button type="button" className="cyber-btn-outline" onClick={handleFacebookLogin} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', minHeight: 'auto', fontSize: '0.85rem', clipPath: 'none', background: 'var(--cyber-muted)' }}>
              <FaFacebookF /> FACEBOOK
            </button>
            <button type="button" className="cyber-btn-outline" onClick={handleGoogleLogin} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', minHeight: 'auto', fontSize: '0.85rem', clipPath: 'none', background: 'var(--cyber-muted)' }}>
              <FcGoogle /> GOOGLE
            </button>
          </div>

          <footer style={{ marginTop: '2.5rem', textAlign: 'center', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: '#94a3b8' }}>
            ALREADY_HAVE_ACCOUNT? <Link to="/auth/login" style={{ color: 'var(--cyber-accent)', marginLeft: '0.5rem' }}>LOG_IN</Link>
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
