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
  RiHeadphoneLine,
  RiMenuLine,
  RiCloseLine,
  RiHome4Line,
  RiCompass3Line,
  RiCommunityLine
} from 'react-icons/ri'
import { metadataService, notificationService } from '../services/api'

function BrandTile() {
  return (
    <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <strong className="cyber-glitch-text" data-text="UIBRAGE" style={{ fontFamily: 'var(--font-cyber-heading)', fontSize: '1.5rem', letterSpacing: '0.1em', color: 'var(--cyber-accent)' }}>UIBRAGE</strong>
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1100) {
        setIsDrawerOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
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
        <button className="mobile-toggle" onClick={() => setIsDrawerOpen(true)} style={{ marginRight: '0.5rem' }}>
          <RiMenuLine size={24} color="#1e293b" />
        </button>

        <Link to="/" className="logo-link" style={{ textDecoration: 'none' }}>
          <BrandTile />
        </Link>

        <nav className="header-nav" style={{ fontFamily: 'var(--font-cyber-mono)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
          <Link to="/marketplace" style={{ color: 'var(--cyber-foreground)', textDecoration: 'none' }}>Browse</Link>
          
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
          <div className="cyber-input-wrapper">
            <input type="text" className="cyber-input" placeholder="Search data streams..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleKeyDown} />
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
              <Link to="/auth/login" className="cyber-btn-ghost">Login</Link>
              <Link to="/auth/register" className="cyber-btn cyber-btn-glitch">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isDrawerOpen && <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)} />}
      <div className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <BrandTile />
          <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <RiCloseLine size={28} color="#64748b" />
          </button>
        </div>

        <nav className="mobile-nav-links">
          <Link to="/" onClick={() => setIsDrawerOpen(false)}><RiHome4Line /> Home</Link>
          <Link to="/marketplace" onClick={() => setIsDrawerOpen(false)}><RiCompass3Line /> Browse Assets</Link>
          <Link to="/community" onClick={() => setIsDrawerOpen(false)}><RiCommunityLine /> Community</Link>
          
          <div style={{ margin: '1rem 0', height: '1px', background: '#f1f5f9' }} />
          
          {user ? (
            <>
              <Link to={`/profile/${user.username}`} onClick={() => setIsDrawerOpen(false)}><RiUser3Line /> My Profile</Link>
              <Link to="/library" onClick={() => setIsDrawerOpen(false)}><RiBookletLine /> My Library</Link>
              <Link to="/assets/manage" onClick={() => setIsDrawerOpen(false)}><RiBookletLine /> Manage Assets</Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" onClick={() => setIsDrawerOpen(false)}><RiLayout4Line /> Admin Panel</Link>
              )}
              <div style={{ margin: '1rem 0', height: '1px', background: '#f1f5f9' }} />
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.8rem 0', background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: '1.1rem', textAlign: 'left', cursor: 'pointer' }}>
                <RiLogoutBoxRLine /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
               <Link to="/auth/login" className="btn-ghost" style={{ textAlign: 'center', width: '100%' }} onClick={() => setIsDrawerOpen(false)}>Login</Link>
               <Link to="/auth/register" className="btn-solid" style={{ textAlign: 'center', width: '100%' }} onClick={() => setIsDrawerOpen(false)}>Register</Link>
            </div>
          )}
        </nav>
      </div>
      <style>{`
        .notif-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--cyber-destructive);
          color: #fff;
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
          border-radius: 0;
          border: 1px solid var(--cyber-accent);
          font-family: var(--font-cyber-mono);
        }
        .notif-item.unread { background: rgba(0, 255, 136, 0.1); }
        .header-dropdown--notif, .header-dropdown--user, .header-dropdown--categories {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--cyber-card);
          border-radius: 0;
          box-shadow: var(--neon-glow-primary-sm);
          z-index: 100;
          border: 1px solid var(--cyber-border);
          color: var(--cyber-foreground);
        }
        .header-dropdown a {
          color: var(--cyber-foreground) !important;
          font-family: var(--font-cyber-mono);
          text-transform: uppercase;
        }
        .header-dropdown a:hover {
          color: var(--cyber-accent) !important;
          background: rgba(0, 255, 136, 0.1) !important;
        }
        .header-nav a:hover, .nav-dropdown-btn:hover {
          color: var(--cyber-accent) !important;
          text-shadow: 0 0 5px var(--cyber-accent);
        }
        .nav-dropdown-btn {
          color: var(--cyber-foreground);
          background: none; border: none; font: inherit; cursor: pointer;
        }
      `}</style>
    </header>
  )
}
