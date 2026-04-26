import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'

function AppGlyph() {
  return (
    <span className="login-card__glyph" aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" role="presentation" aria-hidden="true">
      <path d="M3.5 5.5h13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
      <path d="m4 7 6 4 6-4" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" role="presentation" aria-hidden="true">
      <path d="M6.5 9V7.8a3.5 3.5 0 1 1 7 0V9" />
      <rect x="5" y="9" width="10" height="7" rx="1.2" />
    </svg>
  )
}

export default function LoginPage({ variant = 'v1' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const showToast = variant === 'v2'

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await authService.login(email, password)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      alert('Logged in successfully!')
      navigate('/marketplace')
    } catch (error) {
      console.error('Login Error:', error)
      alert(error.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      {showToast ? (
        <aside className="login-toast" aria-live="polite">
          <strong>Success</strong>
          <span>Account created successfully</span>
        </aside>
      ) : null}

      <section className="login-page__brand">
        <span className="login-page__brand-icon">
          <AppGlyph />
        </span>
        <strong>UIbrage</strong>
      </section>

      <section className="login-card" aria-labelledby="login-title">
        <header className="login-card__header">
          <h1 id="login-title">Log in to your UIbrage account</h1>
          <p>Welcome back! Please enter your details.</p>
        </header>

        <form className="login-card__form" onSubmit={handleSubmit}>
          <label className="login-card__field">
            <span>Username or Email</span>
            <div className="login-card__input">
              <MailIcon />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </label>

          <label className="login-card__field">
            <div className="login-card__field-head">
              <span>Password</span>
              <a href="#forgot-password">Forgot password?</a>
            </div>
            <div className="login-card__input">
              <LockIcon />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </label>

          <button type="submit" className="login-card__submit">
            Log in
          </button>
        </form>

        <div className="login-card__divider">
          <span>Or log in with another service</span>
        </div>

        <div className="login-card__socials">
          <button type="button">ⓕ Facebook</button>
          <button type="button">Ⓖ Google</button>
        </div>

        <p className="login-card__signup">
          Don&apos;t have an account? <Link to="/auth/register">Create account</Link>
        </p>
      </section>

      <footer className="login-page__footer">
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/community">Community</Link>
        <Link to="/library">My Library</Link>
        <Link to="/routes">All routes</Link>
        <a href="#terms">Terms of Service</a>
      </footer>
    </main>
  )
}
