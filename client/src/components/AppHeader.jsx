import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  RiUser3Line, 
  RiLogoutBoxRLine, 
  RiBookletLine, 
  RiUploadCloud2Line, 
  RiArrowDownSLine, 
  RiSettings4Line,
  RiLayout4Line,
  RiMoneyDollarCircleLine
} from 'react-icons/ri'
import { metadataService } from '../services/api'

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
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()
  
  const categoryRef = useRef(null)
  const userMenuRef = useRef(null)
  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          console.error('Error parsing user', e)
        }
      } else {
        setUser(null)
      }
    }

    loadUser()

    // Load categories
    metadataService.getCategories().then(res => setCategories(res.data))

    // Listen for auth changes from other pages
    window.addEventListener('authChange', loadUser)

    // Handle clicking outside to close menus
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryMenu(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('authChange', loadUser)
    }
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (onSearch) {
        onSearch(searchTerm)
      } else {
        navigate(`/marketplace?search=${encodeURIComponent(searchTerm)}`)
      }
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
        <Link to="/" className="logo-link">
          <BrandTile />
        </Link>

        <nav className="header-nav">
          <Link to="/marketplace">Browse Assets</Link>
          
          <div 
            className="dropdown-trigger"
            ref={categoryRef}
            onMouseEnter={() => setShowCategoryMenu(true)}
            onMouseLeave={() => setShowCategoryMenu(false)}
          >
            <button className="nav-dropdown-btn">
              Categories <RiArrowDownSLine />
            </button>
            {showCategoryMenu && (
              <div className="header-dropdown header-dropdown--categories">
                {categories.map(cat => (
                  <Link key={cat.id} to={`/marketplace?categoryId=${cat.id}`} onClick={() => setShowCategoryMenu(false)}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/community">Community</Link>
          {user && (
            <Link to={user.role === 'admin' ? '/admin/upload-asset' : '/assets/upload'}>
              Upload Asset
            </Link>
          )}
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
            <div 
              className="header-user-wrapper" 
              ref={userMenuRef}
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <Link to={`/profile/${user.username}`} className="user-profile-summary">
                <div className="avatar-circle">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    user.username?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <span className="user-name">{user.username}</span>
                <RiArrowDownSLine size={16} color="#64748b" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowUserMenu(!showUserMenu); }} />
              </Link>

              {showUserMenu && (
                <div className="header-dropdown header-dropdown--user">
                  <div className="dropdown-header">
                    <strong>{user.username}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to={`/profile/${user.username}`} onClick={() => setShowUserMenu(false)}>
                    <RiUser3Line /> View Profile
                  </Link>
                  <Link to="/wishlist" onClick={() => setShowUserMenu(false)}>
                    <RiBookletLine /> Wishlist
                  </Link>
                  <Link to="/assets/manage" onClick={() => setShowUserMenu(false)}>
                    <RiBookletLine /> Manage My Assets
                  </Link>
                  <Link to="/earnings" onClick={() => setShowUserMenu(false)}>
                    <RiMoneyDollarCircleLine /> Revenue Dashboard
                  </Link>
                  <Link to="/library" onClick={() => setShowUserMenu(false)}>
                    <RiBookletLine /> My Library
                  </Link>
                  <Link to="/profile/edit" onClick={() => setShowUserMenu(false)}>
                    <RiSettings4Line /> Edit Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" onClick={() => setShowUserMenu(false)}>
                      <RiLayout4Line /> Admin Panel
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-logout">
                    <RiLogoutBoxRLine /> Logout
                  </button>
                  <div className="dropdown-safe-bridge"></div>
                </div>
              )}
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
