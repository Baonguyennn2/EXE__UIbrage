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
  RiMoneyDollarCircleLine,
  RiNotification3Line,
  RiMessage3Line,
  RiHeadphoneLine
} from 'react-icons/ri'
import { metadataService, notificationService } from '../services/api'

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
  const [notifications, setNotifications] = useState([])
  const [showNotifMenu, setShowNotifMenu] = useState(false)
  const navigate = useNavigate()
  
  const categoryRef = useRef(null)
  const userMenuRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (savedUser && token) {
        try {
          const parsed = JSON.parse(savedUser)
          setUser(parsed)
          fetchNotifications()
        } catch (e) {
          console.error('Error parsing user', e)
        }
      } else {
        setUser(null)
      }
    }

    const fetchNotifications = async () => {
       try {
         const res = await notificationService.getAll()
         setNotifications(res.data)
       } catch (e) {}
    }

    loadUser()
    metadataService.getCategories().then(res => setCategories(res.data))
    window.addEventListener('authChange', loadUser)

    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) setShowCategoryMenu(false)
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false)
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifMenu(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('authChange', loadUser)
    }
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (onSearch) onSearch(searchTerm)
      else navigate(`/marketplace?search=${encodeURIComponent(searchTerm)}`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/auth/login')
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo-link">
          <BrandTile />
        </Link>

        <nav className="header-nav">
          <Link to="/marketplace">Browse Assets</Link>
          
          <div className="dropdown-trigger" ref={categoryRef} onMouseEnter={() => setShowCategoryMenu(true)} onMouseLeave={() => setShowCategoryMenu(false)}>
            <button className="nav-dropdown-btn">Categories <RiArrowDownSLine /></button>
            {showCategoryMenu && (
              <div className="header-dropdown header-dropdown--categories">
                {categories.map(cat => (
                  <Link key={cat.id} to={`/marketplace?categoryId=${cat.id}`} onClick={() => setShowCategoryMenu(false)}>{cat.name}</Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/community">Community</Link>
          {user && (
            <Link to={user.role === 'admin' ? '/admin/upload-asset' : '/assets/upload'}>Upload Asset</Link>
          )}
        </nav>

        <div className="header-search">
          <div className="search-input-wrapper">
            <span className="search-icon">⌕</span>
            <input type="text" placeholder="Search game assets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleKeyDown} />
          </div>
        </div>

        <div className="header-auth" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {user ? (
            <>
              <div className="header-notif-btn" ref={notifRef} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifMenu(!showNotifMenu)}>
                <RiNotification3Line size={24} color="#64748b" />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                {showNotifMenu && (
                  <div className="header-dropdown header-dropdown--notif" style={{ width: '320px', right: 0, padding: '1rem' }}>
                     <header style={{ padding: '0 0.5rem 1rem', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>Notifications</header>
                     <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No notifications</p> : (
                          notifications.map(n => (
                            <div key={n._id} className={`notif-item ${n.isRead ? '' : 'unread'}`} style={{ padding: '1rem 0.5rem', borderBottom: '1px solid #f8fafc' }}>
                               <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.title}</div>
                               <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: '#64748b' }}>{n.message}</p>
                               <small style={{ color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleDateString()}</small>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
                )}
              </div>

              <div className="header-user-wrapper" ref={userMenuRef} onMouseEnter={() => setShowUserMenu(true)} onMouseLeave={() => setShowUserMenu(false)}>
                <div className="user-profile-summary">
                  <div className="avatar-circle">
                    {user.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (user.username?.[0]?.toUpperCase() || 'U')}
                  </div>
                  <span className="user-name">{user.username}</span>
                  <RiArrowDownSLine size={16} color="#64748b" />
                </div>

                {showUserMenu && (
                  <div className="header-dropdown header-dropdown--user">
                    <div className="dropdown-header">
                      <strong>{user.username}</strong>
                      <span>{user.email}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to={`/profile/${user.username}`} onClick={() => setShowUserMenu(false)}><RiUser3Line /> View Profile</Link>
                    <Link to="/messages" onClick={() => setShowUserMenu(false)}><RiMessage3Line /> Messages</Link>
                    <Link to="/messages" onClick={() => setShowUserMenu(false)}><RiHeadphoneLine /> Contact Support / Admin</Link>
                    <div className="dropdown-divider" />
                    <Link to="/wishlist" onClick={() => setShowUserMenu(false)}><RiBookletLine /> Wishlist</Link>
                    <Link to="/assets/manage" onClick={() => setShowUserMenu(false)}><RiBookletLine /> Manage My Assets</Link>
                    <Link to="/earnings" onClick={() => setShowUserMenu(false)}><RiMoneyDollarCircleLine /> Revenue Dashboard</Link>
                    <Link to="/library" onClick={() => setShowUserMenu(false)}><RiBookletLine /> My Library</Link>
                    <Link to="/profile/edit" onClick={() => setShowUserMenu(false)}><RiSettings4Line /> Edit Profile</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" onClick={() => setShowUserMenu(false)}><RiLayout4Line /> Admin Panel</Link>
                    )}
                    <div className="dropdown-divider" />
                    <button onClick={handleLogout} className="dropdown-logout"><RiLogoutBoxRLine /> Logout</button>
                    <div className="dropdown-safe-bridge"></div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="login-link">Login</Link>
              <Link to="/auth/register" className="register-button">Register</Link>
            </>
          )}
        </div>
      </div>
      <style>{`
        .notif-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: #fff;
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
          border-radius: 1rem;
          border: 2px solid #fff;
        }
        .notif-item.unread { background: #f0f7ff; }
        .header-dropdown--notif {
          position: absolute;
          top: 100%;
          right: 0;
          background: #fff;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          z-index: 100;
          border: 1px solid #f1f5f9;
        }
      `}</style>
    </header>
  )
}
