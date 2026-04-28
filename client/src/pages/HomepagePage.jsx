import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { assetService, metadataService } from '../services/api'
import { useNavigate } from 'react-router-dom'

// Fallback preview
const fallbackHeroUrl = 'https://res.cloudinary.com/dz0v7n8m0/image/upload/v1714152579/Screenshot_2024-04-26_234907_v04hvx.png'

export default function HomepagePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [featuredAssets, setFeaturedAssets] = useState([])
  const [latestAssets, setLatestAssets] = useState([])
  const [loading, setLoading] = useState(true)
  
  const uiStyles = ['Fantasy', 'Sci-Fi', 'Pixel Art', 'Minimalist']
  const gameGenres = ['RPG', 'Platformer', 'Strategy', 'Casual']
  const engines = ['Unity', 'Unreal Engine', 'Godot']

  // Homepage fetches global featured/latest
  const fetchData = async () => {
    setLoading(true)
    try {
      const assetsRes = await assetService.getAll()
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
  }, [])



  if (loading) return <div className="loading-screen">Loading Marketplace...</div>

  return (
    <div className="homepage-container">
      <AppHeader onSearch={(val) => navigate(`/marketplace?search=${encodeURIComponent(val)}`)} />

      <main className="homepage-hero-layout">
        <section className="home-hero-content">
          <div className="home-hero-text">
             <h1>Unleash Your Game Design Potential</h1>
             <p>Access thousands of high-quality UI assets, kits, and icons to speed up your development process.</p>
             <div className="home-search-bar">
                <input type="text" placeholder="Search for assets (e.g. Fantasy RPG)..." onKeyDown={(e) => e.key === 'Enter' && navigate(`/marketplace?search=${encodeURIComponent(e.target.value)}`)} />
                <button onClick={() => navigate('/marketplace')}>Browse Marketplace</button>
             </div>
             <div className="home-quick-tags">
                <span>Popular:</span>
                {uiStyles.slice(0, 3).map(s => <button key={s} onClick={() => navigate(`/marketplace?search=${s}`)}>{s}</button>)}
             </div>
          </div>
        </section>

        <section className="content-area">
          {/* Hero Section */}
          {featuredAssets.length > 0 && (
            <section className="hero-banner">
              <div className="hero-banner__content">
                <span className="featured-label">FEATURED ASSET</span>
                <h1>{featuredAssets[0].title}</h1>
                <p>{featuredAssets[0].description}</p>
                <div className="hero-banner__footer">
                  <div className="price-info">
                    <small>PRICE</small>
                    <strong>{featuredAssets[0].price === 0 ? 'Free' : `$${featuredAssets[0].price}`}</strong>
                  </div>
                  <Link to={`/marketplace/assets/${featuredAssets[0].id}`} className="btn-get-pack">Get Asset Pack</Link>
                </div>
              </div>
              <div className="hero-banner__image">
                <img src={featuredAssets[0].coverImageUrl || fallbackHeroUrl} alt={featuredAssets[0].title} />
              </div>
            </section>
          )}

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
