import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiUser3Line, RiLogoutBoxRLine, RiBookletLine, RiUploadCloud2Line } from 'react-icons/ri'

function BrandTile() {
  return (
    <div className="brand-logo">
      <div className="logo-icon">
        <div className="icon-grid">
          <div /><div />
          <div /><div />
        </div>
      </div>
      <strong>UIbrage</strong>
    </div>
  )
}

export default function AppHeader({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Error parsing user', e)
      }
    }
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch && onSearch(searchTerm)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/auth/login')
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/marketplace" className="logo-link">
          <BrandTile />
        </Link>

        <nav className="header-nav">
          <Link to="/marketplace">Browse Assets</Link>
          <Link to="/marketplace">Categories</Link>
          <Link to="/community">Community</Link>
          {user && <Link to="/admin/upload-asset">Upload Asset</Link>}
        </nav>

        <div className="header-search">
          <div className="search-input-wrapper">
            <span className="search-icon">⌕</span>
            <input 
              type="text" 
              placeholder="Search game assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="header-auth">
          {user ? (
            <div className="header-user-menu">
              <Link to="/library" title="My Library" className="header-icon-link">
                <RiBookletLine size={20} />
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" title="Admin Panel" className="header-icon-link">
                  <RiUploadCloud2Line size={20} />
                </Link>
              )}
              <div className="user-profile-summary">
                <div className="avatar-circle">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="user-name">{user.username}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn" title="Logout">
                <RiLogoutBoxRLine size={20} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/auth/login" className="login-link">Login</Link>
              <Link to="/auth/register" className="register-button">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
