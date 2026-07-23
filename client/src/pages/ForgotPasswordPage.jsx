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
    <main className="auth-figma" style={{ background: 'var(--cyber-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="cyber-grid-bg" style={{ opacity: 0.05, position: 'fixed', inset: 0, zIndex: 0 }}></div>
      <section className="auth-figma__canvas" style={{ background: 'transparent', border: 'none', position: 'relative', zIndex: 10 }}>
        <header className="auth-figma__brand">
          <strong className="cyber-glitch-text" data-text="UIBRAGE" style={{ fontFamily: 'var(--font-cyber-heading)', fontSize: '2.5rem', letterSpacing: '0.1em', color: 'var(--cyber-accent)' }}>UIBRAGE</strong>
        </header>

        <section className="auth-figma__card cyber-card" style={{ background: 'rgba(5, 5, 10, 0.7)', border: '1px solid var(--cyber-border)', padding: '2.5rem' }}>
          <header style={{ marginBottom: '2rem' }}>
            <h1 className="cyber-glitch-text" data-text="FORGOT_PASSWORD?" style={{ fontFamily: 'var(--font-cyber-heading)', textTransform: 'uppercase', color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>FORGOT_PASSWORD?</h1>
            <p style={{ color: 'var(--cyber-accent-secondary)', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem' }}>// RECOVERY_PROCEDURE_INITIATED</p>
          </header>

          <form className="auth-figma__form" onSubmit={handleSubmit}>
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

            <button type="submit" className="cyber-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '1.5rem' }}>
              {loading ? 'SENDING_INSTRUCTIONS...' : 'RESET_PASSWORD'}
            </button>
          </form>

          <footer style={{ marginTop: '2.5rem', textAlign: 'center', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: '#94a3b8' }}>
            REMEMBER_CREDENTIALS? <Link to="/auth/login" style={{ color: 'var(--cyber-accent)', marginLeft: '0.5rem' }}>LOG_IN</Link>
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
