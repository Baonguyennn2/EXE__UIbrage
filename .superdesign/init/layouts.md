# Layout Components

## AppHeader (Main Navigation)
- **Path**: `client/src/components/AppHeader.jsx`
- **Description**: Full-width site header with cyberpunk branding (UIBRAGE glitch text), main navigation (Browse, Categories dropdown, Community, Upload Asset), search bar with cyber-input styling, notifications dropdown, user profile dropdown with avatar, and a responsive mobile drawer. All styled in the cyberpunk theme with neon green accents.

```jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  RiUser3Line, RiLogoutBoxRLine, RiBookletLine, RiUploadCloud2Line, 
  RiArrowDownSLine, RiSettings4Line, RiLayout4Line, RiMoneyDollarCircleLine,
  RiNotification3Line, RiMessage3Line, RiHeadphoneLine, RiMenuLine,
  RiCloseLine, RiHome4Line, RiCompass3Line, RiCommunityLine
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
  // ... state and effect hooks for user, search, categories, notifications, menus ...

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
                  <Link key={cat.id} to={`/marketplace?categoryId=${cat.id}`}>{cat.name}</Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/community">Community</Link>
          {user && <Link to={user.role === 'admin' ? '/admin/upload-asset' : '/assets/upload'}>Upload Asset</Link>}
        </nav>

        <div className="header-search">
          <div className="cyber-input-wrapper">
            <input type="text" className="cyber-input" placeholder="Search data streams..." />
          </div>
        </div>

        <div className="header-auth" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {user ? (
            <>
              {/* Notification bell with badge */}
              <div className="header-notif-btn" ref={notifRef}>
                <RiNotification3Line size={24} color="#64748b" />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </div>

              {/* User profile dropdown */}
              <div className="header-user-wrapper" ref={userMenuRef}>
                <div className="user-profile-summary">
                  <div className="avatar-circle">{/* avatar */}</div>
                  <span className="user-name">{user.username}</span>
                  <RiArrowDownSLine size={16} color="#64748b" />
                </div>
                {/* Dropdown with: View Profile, Contact Support, Wishlist, Manage Assets, Revenue Dashboard, My Library, Edit Profile, Admin Panel, Logout */}
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

      {/* Mobile Drawer - slides in from left with overlay */}
      {isDrawerOpen && <div className="drawer-overlay" />}
      <div className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
        {/* BrandTile + close button, then nav links: Home, Browse Assets, Community, user-specific links, Logout */}
      </div>

      <style>{`
        .notif-badge { position: absolute; top: -5px; right: -5px; background: var(--cyber-destructive); color: #fff; font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 0; border: 1px solid var(--cyber-accent); font-family: var(--font-cyber-mono); }
        .notif-item.unread { background: rgba(0, 255, 136, 0.1); }
        .header-dropdown--notif, .header-dropdown--user, .header-dropdown--categories { position: absolute; top: 100%; right: 0; background: var(--cyber-card); border-radius: 0; box-shadow: var(--neon-glow-primary-sm); z-index: 100; border: 1px solid var(--cyber-border); color: var(--cyber-foreground); }
        .header-dropdown a { color: var(--cyber-foreground) !important; font-family: var(--font-cyber-mono); text-transform: uppercase; }
        .header-dropdown a:hover { color: var(--cyber-accent) !important; background: rgba(0, 255, 136, 0.1) !important; }
        .header-nav a:hover, .nav-dropdown-btn:hover { color: var(--cyber-accent) !important; text-shadow: 0 0 5px var(--cyber-accent); }
        .nav-dropdown-btn { color: var(--cyber-foreground); background: none; border: none; font: inherit; cursor: pointer; }
      `}</style>
    </header>
  )
}
```

## Footer (Homepage Footer)
- **Path**: Inline in `client/src/pages/HomepagePage.jsx` (lines 176-218)
- **Description**: Full-width footer with 4 columns: brand logo + tagline, Explore links, Community links, Help links. Bottom bar with copyright and social icons. Styled via `.market-footer`, `.market-footer__cols`, `.footer-brand`, `.footer-nav-col`, `.market-footer__bottom` classes.

```jsx
<footer className="market-footer">
  <div className="market-footer__cols">
    <div className="footer-brand">
      <div className="brand-logo-alt">
         <div className="logo-icon-grid">
           <div /><div /><div /><div />
         </div>
         <strong>UIbrage</strong>
      </div>
      <p>The premier marketplace for high-quality game user interface assets.</p>
    </div>
    <div className="footer-nav-col">
      <h4>Explore</h4>
      <Link to="/marketplace">Featured Assets</Link>
      <Link to="/marketplace?sort=new">New Releases</Link>
      <Link to="/marketplace?sort=rating">Top Rated</Link>
      <Link to="/marketplace?price=0">Freebies</Link>
    </div>
    <div className="footer-nav-col">
      <h4>Community</h4>
      <Link to="/community">Forums</Link>
      <Link to="/community">Discord</Link>
      <Link to="/community">Blog</Link>
      <Link to="/community">Events</Link>
    </div>
    <div className="footer-nav-col">
      <h4>Help</h4>
      <Link to="/support">Contact Support</Link>
      <Link to="/sell">Sell your assets</Link>
      <Link to="/privacy">Privacy Policy</Link>
      <Link to="/terms">Terms of Service</Link>
    </div>
  </div>
  <div className="market-footer__bottom">
    <p>© 2026 UIbrage Marketplace. All rights reserved.</p>
    <div className="footer-social">
      <span className="social-icon"></span>
      <span className="social-icon"></span>
    </div>
  </div>
</footer>
```

## Sidebar Filters
- **Path**: Inline in `client/src/pages/HomepagePage.jsx` and `client/src/pages/MarketplacePage.jsx`
- **Description**: Left sidebar with filter groups (FILTERS, UI STYLE, GAME GENRE, ENGINE, PRICE). Styled via `.sidebar-filters`, `.filter-group` classes. Cyberpunk theme with uppercase headings.
