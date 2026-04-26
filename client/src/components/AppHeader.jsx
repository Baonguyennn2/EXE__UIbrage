import { Link } from 'react-router-dom'

function BrandTile() {
  return (
    <span className="market-brand-tile" aria-hidden="true">
      <div />
      <div />
      <div />
      <div />
    </span>
  )
}

export default function AppHeader() {
  return (
    <header className="market-nav">
      <Link to="/marketplace" className="market-nav__brand market-nav__brand-link">
        <BrandTile />
        <strong>UIbrage</strong>
      </Link>

      <nav className="market-nav__links" aria-label="Primary">
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/library">My Library</Link>
        <Link to="/community">Community</Link>
      </nav>

      <div className="market-nav__actions">
        <label className="market-search" aria-label="Search game assets">
          <span>⌕</span>
          <input type="search" placeholder="Search game assets..." />
        </label>
        <Link to="/auth/login" className="market-link-button">Login</Link>
        <Link to="/auth/register" className="market-primary-button">Register</Link>
      </div>
    </header>
  )
}
