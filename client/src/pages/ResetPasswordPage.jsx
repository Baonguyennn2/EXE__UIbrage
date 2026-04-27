import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/api'

export default function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(email, code, newPassword)
      alert('Password reset successful! You can now log in with your new password.')
      navigate('/auth/login')
    } catch (error) {
      console.error('Reset Password Error:', error)
      alert(error.response?.data?.error || 'Reset failed. Please check your code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-page__card">
        <header>
          <p className="eyebrow">Reset</p>
          <h1>Set new password</h1>
          <p>Your new password must be different from previous ones.</p>
        </header>

        <form className="auth-page__form" onSubmit={handleSubmit}>
          {!location.state?.email && (
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
          )}
          <label>
            Verification Code
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              placeholder="000000" 
              maxLength={6}
              required 
            />
          </label>
          <label>
            New Password
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
            />
          </label>
          <label>
            Confirm Password
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
            />
          </label>

          <button type="submit" className="market-primary-button auth-page__submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <footer>
           <Link to="/auth/login">Back to Login</Link>
        </footer>
      </section>
    </main>
  )
}
