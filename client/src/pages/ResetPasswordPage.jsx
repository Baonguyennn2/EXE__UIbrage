import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/api'
import { MdOutlineEmail } from 'react-icons/md'
import { RiShieldCheckLine, RiLock2Line } from 'react-icons/ri'

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
    <main className="auth-figma">
      <section className="auth-figma__canvas">
        <header className="auth-figma__brand">
          <span className="auth-figma__brand-tile">▦</span>
          <strong>Ulbrage</strong>
        </header>

        <section className="auth-figma__card">
          <header>
            <p className="eyebrow">Reset</p>
            <h1>Set new password</h1>
            <p>Your new password must be different from previous ones.</p>
          </header>

          <form className="auth-figma__form" onSubmit={handleSubmit}>
            {!location.state?.email && (
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
            )}
            <label>
              Verification Code
              <div className="auth-figma__input-wrap">
                <span><RiShieldCheckLine /></span>
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
            <label>
              New Password
              <div className="auth-figma__input-wrap">
                <span><RiLock2Line /></span>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </label>
            <label>
              Confirm Password
              <div className="auth-figma__input-wrap">
                <span><RiLock2Line /></span>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </label>

            <button type="submit" className="auth-figma__submit" disabled={loading} style={{ marginTop: '1.5rem' }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <footer className="auth-figma__footer">
             <Link to="/auth/login">Back to Login</Link>
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
