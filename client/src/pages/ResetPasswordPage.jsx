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
    <main className="auth-figma" style={{ background: 'var(--cyber-bg)' }}>
      <div className="cyber-grid-bg" style={{ opacity: 0.05, position: 'fixed', inset: 0, zIndex: 0 }}></div>
      <section className="auth-figma__canvas" style={{ background: 'transparent', border: 'none', position: 'relative', zIndex: 10 }}>
        <header className="auth-figma__brand">
          <strong className="cyber-glitch-text" data-text="UIBRAGE" style={{ fontFamily: 'var(--font-cyber-heading)', fontSize: '2.5rem', letterSpacing: '0.1em', color: 'var(--cyber-accent)' }}>UIBRAGE</strong>
        </header>

        <section className="auth-figma__card cyber-card" style={{ background: 'rgba(5, 5, 10, 0.7)', border: '1px solid var(--cyber-border)', padding: '2.5rem' }}>
          <header style={{ marginBottom: '2rem' }}>
            <h1 className="cyber-glitch-text" data-text="SET_NEW_PASSWORD" style={{ fontFamily: 'var(--font-cyber-heading)', textTransform: 'uppercase', color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>SET_NEW_PASSWORD</h1>
            <p style={{ color: 'var(--cyber-accent-secondary)', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem' }}>// ENTER_NEW_CREDENTIALS</p>
          </header>

          <form className="auth-figma__form" onSubmit={handleSubmit}>
            {!location.state?.email && (
               <label style={{ display: 'block', marginBottom: '1.25rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: 'var(--cyber-accent)' }}>EMAIL_ADDRESS</span>
                <div className="cyber-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'white' }}>
                  <MdOutlineEmail size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--cyber-accent-tertiary)', pointerEvents: 'none' }} />
                  <input 
                    type="email" 
                    className="cyber-input"
                    style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem' }}
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Enter your email" 
                    required 
                  />
                </div>
              </label>
            )}
            <label style={{ display: 'block', marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: 'var(--cyber-accent)' }}>VERIFICATION_CODE</span>
              <div className="cyber-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'white' }}>
                <RiShieldCheckLine size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--cyber-accent-tertiary)', pointerEvents: 'none' }} />
                <input 
                  type="text" 
                  className="cyber-input"
                  style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem' }}
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  placeholder="000000" 
                  maxLength={6}
                  required 
                />
              </div>
            </label>
            <label style={{ display: 'block', marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: 'var(--cyber-accent)' }}>NEW_PASSWORD</span>
              <div className="cyber-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'white' }}>
                <RiLock2Line size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--cyber-accent-tertiary)', pointerEvents: 'none' }} />
                <input 
                  type="password" 
                  className="cyber-input"
                  style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem' }}
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </label>
            <label style={{ display: 'block', marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: 'var(--cyber-accent)' }}>CONFIRM_PASSWORD</span>
              <div className="cyber-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'white' }}>
                <RiLock2Line size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--cyber-accent-tertiary)', pointerEvents: 'none' }} />
                <input 
                  type="password" 
                  className="cyber-input"
                  style={{ width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem' }}
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </label>

            <button type="submit" className="cyber-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '1.5rem' }}>
              {loading ? 'UPDATING...' : 'UPDATE_PASSWORD'}
            </button>
          </form>

          <footer style={{ marginTop: '2.5rem', textAlign: 'center', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: '#94a3b8' }}>
             <Link to="/auth/login" style={{ color: 'var(--cyber-accent)' }}>BACK_TO_LOGIN</Link>
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
