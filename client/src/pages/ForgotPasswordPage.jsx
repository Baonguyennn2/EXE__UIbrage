import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { MdOutlineEmail } from 'react-icons/md'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      alert('Reset code sent to your email.')
      navigate('/auth/reset-password', { state: { email } })
    } catch (error) {
      console.error('Forgot Password Error:', error)
      alert(error.response?.data?.error || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-figma">
      <section className="auth-figma__canvas">
        <header className="auth-figma__brand">
          <span className="auth-figma__brand-tile">▦</span>
          <strong>Ulbrage</strong>
        </header>

        <section className="auth-figma__card">
          <header>
            <p className="eyebrow">Recovery</p>
            <h1>Forgot password?</h1>
            <p>No worries, we'll send you reset instructions.</p>
          </header>

          <form className="auth-figma__form" onSubmit={handleSubmit}>
            <label>
              Email address
              <div className="auth-figma__input-wrap">
                <span><MdOutlineEmail /></span>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter your email" 
                  required 
                />
              </div>
            </label>

            <button type="submit" className="auth-figma__submit" disabled={loading} style={{ marginTop: '1.5rem' }}>
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
          </form>

          <footer className="auth-figma__footer">
            Remember your password? <Link to="/auth/login">Log in</Link>
          </footer>
        </section>

        <nav className="auth-figma__meta-links">
          <a href="#">About</a>
          <a href="#">FAQ</a>
          <a href="#">Blog</a>
          <a href="#">Contact</a>
          <a href="#">Terms of Service</a>
        </nav>
      </section>
    </main>
  )
}
