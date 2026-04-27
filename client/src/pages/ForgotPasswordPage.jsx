import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'

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
    <main className="auth-page">
      <section className="auth-page__card">
        <header>
          <p className="eyebrow">Recovery</p>
          <h1>Forgot password?</h1>
          <p>No worries, we'll send you reset instructions.</p>
        </header>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email" 
              required 
            />
          </label>

          <button type="submit" className="market-primary-button auth-page__submit" disabled={loading}>
            {loading ? 'Sending...' : 'Reset Password'}
          </button>
        </form>

        <footer>
          Remember your password? <Link to="/auth/login">Log in</Link>
        </footer>
      </section>
    </main>
  )
}
