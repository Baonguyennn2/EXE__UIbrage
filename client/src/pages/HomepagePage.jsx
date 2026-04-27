import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { assetService } from '../services/api'

const heroPreviewUrl = 'https://res.cloudinary.com/dz0v7n8m0/image/upload/v1714152579/Screenshot_2024-04-26_234907_v04hvx.png'

export default function HomepagePage() {
  const location = useLocation()
  const [featuredAssets, setFeaturedAssets] = useState([])
  const [latestAssets, setLatestAssets] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [filters, setFilters] = useState({ 
    category: new URLSearchParams(location.search).get('category') || '', 
    engine: '', 
    search: '', 
    priceRange: '' 
  })

  // Hardcoded categories as requested
  const uiStyles = ['Fantasy', 'Sci-Fi', 'Pixel Art', 'Minimalist']
  const gameGenres = ['RPG', 'Platformer', 'Strategy', 'Casual']
  const engines = ['Unity', 'Unreal Engine', 'Godot']

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setFilters(prev => ({
      ...prev,
      category: params.get('category') || '',
    }))
  }, [location.search])

  const fetchData = async () => {
    setLoading(true)
    try {
      const apiParams = { ...filters }
      if (filters.priceRange === 'free') apiParams.maxPrice = 0
      
      const assetsRes = await assetService.getAll(apiParams)
      const allAssets = assetsRes.data
      
      setFeaturedAssets(allAssets.slice(0, 4))
      setLatestAssets(allAssets.slice(0, 8))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
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
            <h3 className="filter-label">FILTERS</h3>
            <button className="popular-tags-btn">
              <span className="flame-icon">🔥</span> Popular Tags
            </button>
          </div>

          <div className="filter-group">
            <h3 className="filter-label">UI STYLE</h3>
            {uiStyles.map(style => (
              <button 
                key={style}
                className={`filter-link ${filters.category === style ? 'active' : ''}`}
                onClick={() => handleFilterChange('category', style)}
              >
                {style}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <h3 className="filter-label">GAME GENRE</h3>
            {gameGenres.map(genre => (
              <button 
                key={genre}
                className={`filter-link ${filters.category === genre ? 'active' : ''}`}
                onClick={() => handleFilterChange('category', genre)}
              >
                {genre}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <h3 className="filter-label">ENGINE</h3>
            <button className={`filter-link ${filters.engine === '' ? 'active' : ''}`} onClick={() => handleFilterChange('engine', '')}>All Engines</button>
            {engines.map(engine => (
              <button 
                key={engine}
                className={`filter-link ${filters.engine === engine ? 'active' : ''}`}
                onClick={() => handleFilterChange('engine', engine)}
              >
                {engine}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <h3 className="filter-label">PRICE</h3>
            <button className={`filter-link ${filters.priceRange === 'free' ? 'active' : ''}`} onClick={() => handleFilterChange('priceRange', 'free')}>Free</button>
            <button className={`filter-link ${filters.priceRange === 'paid' ? 'active' : ''}`} onClick={() => handleFilterChange('priceRange', 'paid')}>Paid</button>
            <button className="filter-link">Top Rated</button>
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
              <img src={heroPreviewUrl} alt="Fantasy UI Pack" />
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
              {featuredAssets.length > 0 ? featuredAssets.map((asset) => (
                <Link key={asset.id} to={`/marketplace/assets/${asset.id}`} className="asset-card">
                  <div className="asset-card__preview" style={{ backgroundImage: `url(${asset.coverImageUrl})` }}>
                    <span className="asset-card__badge">{asset.categoryData?.name || 'UI KIT'}</span>
                  </div>
                  <div className="asset-card__body">
                    <div className="asset-card__title-row">
                      <h3>{asset.title}</h3>
                      <span className="price">{asset.price === 0 ? 'Free' : `$${asset.price}`}</span>
                    </div>
                    <p className="author">By <span>{asset.author?.username || 'Creator'}</span></p>
                    <p className="desc">{asset.description?.substring(0, 60)}...</p>
                    <div className="asset-card__tags">
                      {asset.engine && <span className="tag-pill">{asset.engine}</span>}
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="no-data-placeholder">No assets found for these filters.</div>
              )}
            </div>
          </section>

          {/* Latest Assets */}
          <section className="section-block">
            <header className="section-header">
              <div className="section-title">
                <span className="icon">🕒</span>
                <h2>Latest Assets</h2>
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
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo"><strong>UIbrage</strong></div>
            <p>The premier marketplace for game UI assets.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Explore</h4>
              <Link to="/">Featured</Link>
              <Link to="/">New</Link>
            </div>
            <div>
              <h4>Community</h4>
              <Link to="/">Forums</Link>
              <Link to="/">Discord</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <small>© 2026 UIbrage Marketplace.</small>
        </div>
      </footer>
    </div>
  )
}
