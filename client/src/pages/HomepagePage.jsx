import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { assetService, metadataService } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { RiFlashlightLine, RiTimeLine, RiFilter3Line } from 'react-icons/ri'
import LoadingScreen from '../components/LoadingScreen.jsx'

export default function HomepagePage() {
  const navigate = useNavigate()
  const [featuredAssets, setFeaturedAssets] = useState([])
  const [latestAssets, setLatestAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  
  useEffect(() => {
    const controller = new AbortController()
    
    const fetchData = async () => {
      setLoading(true)
      try {
        const [assetsRes, catsRes] = await Promise.all([
          assetService.getAll(null, { signal: controller.signal }),
          metadataService.getCategories({ signal: controller.signal })
        ])
        
        const allAssets = assetsRes.data
        setFeaturedAssets(allAssets.slice(0, 4))
        setLatestAssets(allAssets.slice(0, 8))
        setCategories(catsRes.data)
        setLoading(false)
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching data:', error)
        }
        setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [])

  if (loading) return <LoadingScreen message="Loading Marketplace..." />

  const heroAsset = featuredAssets[0]

  return (
    <div className="homepage-container market-home">
      <AppHeader onSearch={(val) => navigate(`/marketplace?search=${encodeURIComponent(val)}`)} />

      <main className="homepage-layout-with-sidebar">
        {/* Sidebar */}
        <aside className="market-sidebar">
          <div className="sidebar-group">
            <h3 className="sidebar-title">FILTERS</h3>
            <Link to="/marketplace" className="sidebar-item active">
              <RiFilter3Line /> Popular Tags
            </Link>
          </div>

          <div className="sidebar-group">
            <h3 className="sidebar-title">UI STYLE</h3>
            <Link to="/marketplace?search=Fantasy" className="sidebar-item">Fantasy</Link>
            <Link to="/marketplace?search=Sci-Fi" className="sidebar-item">Sci-Fi</Link>
            <Link to="/marketplace?search=Pixel Art" className="sidebar-item">Pixel Art</Link>
            <Link to="/marketplace?search=Minimalist" className="sidebar-item">Minimalist</Link>
          </div>

          <div className="sidebar-group">
            <h3 className="sidebar-title">GAME GENRE</h3>
            <Link to="/marketplace?search=RPG" className="sidebar-item">RPG</Link>
            <Link to="/marketplace?search=Platformer" className="sidebar-item">Platformer</Link>
            <Link to="/marketplace?search=Strategy" className="sidebar-item">Strategy</Link>
            <Link to="/marketplace?search=Casual" className="sidebar-item">Casual</Link>
          </div>

          <div className="sidebar-group">
            <h3 className="sidebar-title">ENGINE</h3>
            <Link to="/marketplace?search=Unity" className="sidebar-item">Unity</Link>
            <Link to="/marketplace?search=Unreal Engine" className="sidebar-item">Unreal Engine</Link>
            <Link to="/marketplace?search=Godot" className="sidebar-item">Godot</Link>
          </div>

          <div className="sidebar-group">
            <h3 className="sidebar-title">PRICE</h3>
            <Link to="/marketplace?price=0" className="sidebar-item">Free</Link>
            <Link to="/marketplace?price_gt=0" className="sidebar-item">Paid</Link>
            <Link to="/marketplace?sort=rating" className="sidebar-item">Top Rated</Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="market-main-content">
          {/* Large Hero Banner */}
          {heroAsset && (
            <section className="hero-banner">
              <div className="hero-banner__content">
                <span className="featured-label">FEATURED ASSET</span>
                <h1>{heroAsset.title}</h1>
                <p>{heroAsset.description?.substring(0, 160)}...</p>
                <div className="hero-banner__footer">
                  <div className="price-info">
                    <small>PRICE</small>
                    <strong>{heroAsset.price === 0 ? 'FREE' : `$${heroAsset.price}`}</strong>
                  </div>
                  <Link to={`/marketplace/assets/${heroAsset.id}`} className="btn-get-pack">Get Asset Pack</Link>
                </div>
              </div>
              <div className="hero-banner__image">
                <img src={heroAsset.coverImageUrl} alt={heroAsset.title} />
              </div>
            </section>
          )}

          {/* Featured Packs */}
          <section className="section-block">
            <header className="market-section__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <RiFlashlightLine size={24} color="#6366f1" />
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Featured UI Packs</h2>
              </div>
              <Link to="/marketplace" className="view-all">View All</Link>
            </header>
            <div className="asset-grid">
              {featuredAssets.map((asset) => (
                <Link key={asset.id} to={`/marketplace/assets/${asset.id}`} className="asset-card surface-card">
                  <div className="asset-card__preview" style={{ height: '160px', background: `url(${asset.coverImageUrl}) center/cover`, borderRadius: '0.75rem 0.75rem 0 0', position: 'relative' }}>
                    <span className="asset-card__badge">
                      {asset.categoryData?.name || 'UI KIT'}
                    </span>
                  </div>
                  <div className="asset-card__body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{asset.title}</h3>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: asset.price === 0 ? '#10b981' : '#4f46e5' }}>
                        {asset.price === 0 ? 'FREE' : `$${asset.price}`}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>By {asset.author?.username}</p>
                    <div className="asset-card-tags" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem' }}>
                      <span className="tag-pill-micro">UNITY</span>
                      <span className="tag-pill-micro">4K</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Latest Assets */}
          <section className="section-block" style={{ marginTop: '3rem' }}>
            <header className="market-section__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <RiTimeLine size={24} color="#6366f1" />
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Latest Assets</h2>
              </div>
            </header>
            <div className="latest-grid">
              {latestAssets.map((asset) => (
                <Link key={asset.id} to={`/marketplace/assets/${asset.id}`} className="latest-card-item">
                  <img src={asset.coverImageUrl} alt={asset.title} />
                  <div className="latest-card-info">
                    <h4>{asset.title}</h4>
                    <div className="meta">
                      By {asset.author?.username} • <span className="price">{asset.price === 0 ? 'FREE' : `$${asset.price}`}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="market-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-logo-alt">
               <div className="logo-icon-grid">
                 <div /><div /><div /><div />
               </div>
               <strong>UIbrage</strong>
            </div>
            <p>The premier marketplace for high-quality game user interface assets.</p>
          </div>
          
          <div className="footer-links-container">
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
        </div>
        <div className="footer-bottom">
          <p>© 2026 UIbrage Marketplace. All rights reserved.</p>
          <div className="footer-social">
            {/* Icons placeholders */}
            <span className="social-icon"></span>
            <span className="social-icon"></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
