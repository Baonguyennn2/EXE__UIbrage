import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { assetService } from '../services/api'

const heroPreviewUrl = 'https://res.cloudinary.com/dz0v7n8m0/image/upload/v1700000000/ui-pack-preview.png' // Placeholder for the fantasy UI pack

export default function HomepagePage() {
  const [featuredAssets, setFeaturedAssets] = useState([])
  const [latestAssets, setLatestAssets] = useState([])
  const [trendingAssets, setTrendingAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: '', engine: '', search: '' })

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const response = await assetService.getAll(filters)
      const allAssets = response.data
      
      setFeaturedAssets(allAssets.filter(a => a.status === 'published').slice(0, 4))
      setLatestAssets(allAssets.filter(a => a.status === 'published').slice(4, 8))
      setTrendingAssets(allAssets.filter(a => a.status === 'published').slice(0, 2))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching assets:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <div className="loading-screen">Loading Marketplace...</div>

  return (
    <div className="homepage-container">
      <AppHeader onSearch={(val) => handleFilterChange('search', val)} />

      <main className="main-layout">
        <aside className="sidebar-filters">
          <div className="filter-group">
            <h3>FILTERS</h3>
            <button className="pill-button">✨ Popular Tags</button>
          </div>

          <div className="filter-group">
            <h3>UI STYLE</h3>
            <button onClick={() => handleFilterChange('category', 'Fantasy')}>Fantasy</button>
            <button onClick={() => handleFilterChange('category', 'Sci-Fi')}>Sci-Fi</button>
            <button onClick={() => handleFilterChange('category', 'Pixel Art')}>Pixel Art</button>
            <button onClick={() => handleFilterChange('category', 'Minimalist')}>Minimalist</button>
          </div>

          <div className="filter-group">
            <h3>GAME GENRE</h3>
            <button onClick={() => handleFilterChange('genre', 'RPG')}>RPG</button>
            <button onClick={() => handleFilterChange('genre', 'Platformer')}>Platformer</button>
            <button onClick={() => handleFilterChange('genre', 'Strategy')}>Strategy</button>
            <button onClick={() => handleFilterChange('genre', 'Casual')}>Casual</button>
          </div>

          <div className="filter-group">
            <h3>ENGINE</h3>
            <button onClick={() => handleFilterChange('engine', 'Unity')}>Unity</button>
            <button onClick={() => handleFilterChange('engine', 'Unreal Engine')}>Unreal Engine</button>
            <button onClick={() => handleFilterChange('engine', 'Godot')}>Godot</button>
          </div>

          <div className="filter-group">
            <h3>PRICE</h3>
            <button onClick={() => handleFilterChange('price', 'free')}>Free</button>
            <button onClick={() => handleFilterChange('price', 'paid')}>Paid</button>
            <button onClick={() => handleFilterChange('price', 'top-rated')}>Top Rated</button>
          </div>
        </aside>

        <section className="content-area">
          {/* Hero Section */}
          <section className="hero-banner">
            <div className="hero-banner__content">
              <span className="featured-label">FEATURED ASSET</span>
              <h1>Ultimate Fantasy UI Pack</h1>
              <p>Professional 4K game interface assets for high-end RPGs and Adventure games. Vector-based and fully customizable.</p>
              <div className="hero-banner__footer">
                <div className="price-info">
                  <small>PRICE</small>
                  <strong>$29.99</strong>
                </div>
                <button className="btn-get-pack">Get Asset Pack</button>
              </div>
            </div>
            <div className="hero-banner__image">
              <img src="https://res.cloudinary.com/dz0v7n8m0/image/upload/v1714152579/Screenshot_2024-04-26_234907_v04hvx.png" alt="Fantasy UI Pack" />
            </div>
          </section>

          {/* Featured Section */}
          <section className="section-block">
            <header className="section-header">
              <div className="section-title">
                <span className="icon">✨</span>
                <h2>Featured UI Packs</h2>
              </div>
              <Link to="/marketplace" className="view-all">View All</Link>
            </header>
            <div className="asset-grid">
              {featuredAssets.map((asset) => (
                <Link key={asset.id} to={`/marketplace/assets/${asset.id}`} className="asset-card">
                  <div className="asset-card__preview" style={{ backgroundImage: `url(${asset.coverImageUrl})` }}>
                    <span className="asset-card__badge">{asset.category?.toUpperCase()}</span>
                  </div>
                  <div className="asset-card__body">
                    <div className="asset-card__title-row">
                      <h3>{asset.title}</h3>
                      <span className="price">${asset.price}</span>
                    </div>
                    <p className="author">By <span>{asset.author?.username || 'Creator'}</span></p>
                    <p className="desc">{asset.description?.substring(0, 80)}...</p>
                    <div className="asset-card__tags">
                      {asset.engine && <span>{asset.engine.toUpperCase()}</span>}
                      <span>4K</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Latest Assets */}
          <section className="section-block">
            <header className="section-header">
              <div className="section-title">
                <span className="icon">🕒</span>
                <h2>Latest Assets</h2>
              </div>
              <div className="carousel-nav">
                <button>‹</button>
                <button>›</button>
              </div>
            </header>
            <div className="latest-grid">
              {latestAssets.map((asset) => (
                <Link key={asset.id} to={`/marketplace/assets/${asset.id}`} className="latest-card">
                  <div className="latest-card__img" style={{ backgroundImage: `url(${asset.coverImageUrl})` }} />
                  <h4>{asset.title}</h4>
                  <div className="latest-card__meta">
                    <span>By {asset.author?.username}</span>
                    <strong className={asset.price === 0 ? 'free' : ''}>{asset.price === 0 ? 'Free' : `$${asset.price}`}</strong>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Trending Section */}
          <section className="section-block">
            <header className="section-header">
              <div className="section-title">
                <span className="icon">📈</span>
                <h2>Trending This Week</h2>
              </div>
            </header>
            <div className="trending-row">
              <div className="trend-item">
                <div className="trend-item__img" style={{ backgroundImage: 'url(https://res.cloudinary.com/dz0v7n8m0/image/upload/v1714152579/cyberpunk_menu_preview.png)' }} />
                <div className="trend-item__info">
                  <h4>Cyberpunk Menu Suite</h4>
                  <p>Fast growing popularity in Sci-Fi category</p>
                  <div className="trend-item__meta">
                    <strong>$25</strong>
                    <span className="hot-badge">HOT ASSET</span>
                  </div>
                </div>
              </div>
              <div className="trend-item">
                <div className="trend-item__img" style={{ backgroundImage: 'url(https://res.cloudinary.com/dz0v7n8m0/image/upload/v1714152579/parchment_preview.png)' }} />
                <div className="trend-item__info">
                  <h4>Parchment Quest Journals</h4>
                  <p>Over 500 downloads this week</p>
                  <strong className="free">FREE</strong>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon small">
                <div className="icon-grid">
                  <div /><div />
                  <div /><div />
                </div>
              </div>
              <strong>UIbrage</strong>
            </div>
            <p>The premier marketplace for high-quality game user interface assets.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Explore</h4>
              <Link to="/">Featured Assets</Link>
              <Link to="/">New Releases</Link>
              <Link to="/">Top Rated</Link>
              <Link to="/">Freebies</Link>
            </div>
            <div>
              <h4>Community</h4>
              <Link to="/">Forums</Link>
              <Link to="/">Discord</Link>
              <Link to="/">Blog</Link>
              <Link to="/">Events</Link>
            </div>
            <div>
              <h4>Help</h4>
              <Link to="/">Contact Support</Link>
              <Link to="/">Sell your assets</Link>
              <Link to="/">Privacy Policy</Link>
              <Link to="/">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <small>© 2026 UIbrage Marketplace. All rights reserved.</small>
          <div className="footer-socials">
             <span>🔗</span>
             <span>🌐</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
