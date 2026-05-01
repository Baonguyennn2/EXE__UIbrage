import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()

  useEffect(() => {
    // Check if there is a token in the URL (from Google Login callback)
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const userData = params.get('user')
    
    if (token) {
      localStorage.setItem('token', token)
      if (userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData))
          localStorage.setItem('user', JSON.stringify(user))
          
          setNotification({ type: 'success', message: `Logged in as ${user.role}!` })
          
          const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/marketplace'
          setTimeout(() => navigate(redirectPath), 1500)
        } catch (e) {
          console.error('Error parsing user data', e)
        }
      } else {
        setNotification({ type: 'success', message: 'Logged in!' })
        setTimeout(() => navigate('/marketplace'), 1500)
      }
    }

    const error = params.get('error')
    if (error) {
      setNotification({ type: 'error', message: 'Google authentication failed.' })
    }
  }, [location, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await authService.login(email, password)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      setNotification({ type: 'success', message: `Logged in as ${user.role}!` })
      
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/marketplace'
      setTimeout(() => navigate(redirectPath), 1500)
    } catch (error) {
      console.error('Login Error:', error)
      setNotification({ type: 'error', message: error.response?.data?.error || 'Login failed.' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setNotification({ type: 'info', message: 'Redirecting to Google...' })
    const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' 
      ? 'http://localhost:5000/api' 
      : 'https://exe-uibrage.onrender.com/api')
    window.location.href = `${apiUrl}/auth/google`
  }

  const handleFacebookLogin = () => {
    setNotification({ type: 'info', message: 'Facebook login is coming soon.' })
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
            <h1>Log in to your UIbrage account</h1>
            <p>Welcome back! Please enter your details.</p>
          </header>

          <form className="auth-figma__form" onSubmit={handleSubmit}>
            <label>
              Username or Email
              <div className="auth-figma__input-wrap">
                <span><MdOutlineEmail /></span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label>
              <div className="auth-figma__label-row">
                <span>Password</span>
                <Link to="/auth/forgot-password">Forgot password?</Link>
              </div>
              <div className="auth-figma__input-wrap">
                <span><RiLock2Line /></span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>

            <button type="submit" className="auth-figma__submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="auth-figma__divider">
            <span>Or log in with another service</span>
          </div>

          <div className="auth-figma__socials">
            <button type="button" className="auth-figma__social-btn" onClick={handleFacebookLogin}>
              <FaFacebookF color="#1877F2" />
              Facebook
            </button>
            <button type="button" className="auth-figma__social-btn" onClick={handleGoogleLogin}>
              <FcGoogle />
              Google
            </button>
          </div>

          <footer className="auth-figma__footer">
            Don&apos;t have an account? <Link to="/auth/register">Create account</Link>
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
