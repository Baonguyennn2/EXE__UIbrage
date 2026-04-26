import { useState } from 'react'
import { Link } from 'react-router-dom'

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch && onSearch(searchTerm)
    }
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
          <Link to="/admin/upload-asset">Upload Asset</Link>
          <Link to="/community">Community</Link>
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
          <Link to="/auth/login" className="login-link">Login</Link>
          <Link to="/auth/register" className="register-button">Register</Link>
        </div>
      </div>
    </header>
  )
}
