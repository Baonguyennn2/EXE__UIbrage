import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { assetService, metadataService } from '../services/api'
import { RiFireFill, RiFlashlightFill, RiLayoutGridFill } from 'react-icons/ri'
import LoadingScreen from '../components/LoadingScreen.jsx'
import '../homepage-redesign.css'

export default function HomepagePage() {
  const navigate = useNavigate()
  const [featuredAssets, setFeaturedAssets] = useState([])
  const [latestAssets, setLatestAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [activeStyle, setActiveStyle] = useState('scifi')
  const [activeGenre, setActiveGenre] = useState('')
  const [activeEngine, setActiveEngine] = useState('all')

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
  const displayLatest = latestAssets.slice(0, 4)

  const handleSearch = (val) => navigate(`/marketplace?search=${encodeURIComponent(val)}`)

  return (
    <div className="home-layout">
      
      <div className="cyber-grid-bg home-bg-gradient" style={{ opacity: 0.1 }}></div>
      <div className="home-bg-gradient"></div>

      <AppHeader onSearch={handleSearch} />

      <main className="home-container">
        {/* Sidebar */}
        <aside className="home-sidebar">
          <div className="home-sidebar-section">
            <h3 className="home-sidebar-title">SYSTEM_FILTERS</h3>
            <button 
              onClick={() => navigate('/marketplace?sort=popular')} 
              className="cyber-btn" 
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-start', background: '#1c1c2e', border: 'none', borderLeft: '4px solid #f97316', color: '#fff', padding: '0.75rem', clipPath: 'none' }}
            >
              <RiFireFill style={{ color: '#f97316' }} className="flicker" />
              <span>POPULAR TAGS</span>
            </button>
          </div>

          <div className="home-sidebar-section">
            <h3 className="home-sidebar-title">// UI Style</h3>
            <div>
              <button onClick={() => setActiveStyle('fantasy')} className={`sidebar-link-v2 ${activeStyle === 'fantasy' ? 'active' : ''}`} style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>FANTASY_CORE</button>
              <button onClick={() => setActiveStyle('scifi')} className={`sidebar-link-v2 ${activeStyle === 'scifi' ? 'active' : ''}`} style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>SCI-FI_NEON</button>
              <button onClick={() => setActiveStyle('pixel')} className={`sidebar-link-v2 ${activeStyle === 'pixel' ? 'active' : ''}`} style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>PIXEL_GLITCH</button>
              <button onClick={() => setActiveStyle('minimal')} className={`sidebar-link-v2 ${activeStyle === 'minimal' ? 'active' : ''}`} style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>MINIMAL_GRID</button>
            </div>
          </div>

          <div className="home-sidebar-section">
            <h3 className="home-sidebar-title">// Game Genre</h3>
            <div>
              <button onClick={() => setActiveGenre('rpg')} className={`sidebar-link-v2 ${activeGenre === 'rpg' ? 'active' : ''}`} style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>RPG_TACTICAL</button>
              <button onClick={() => setActiveGenre('cyber')} className={`sidebar-link-v2 ${activeGenre === 'cyber' ? 'active' : ''}`} style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>CYBER_PLATFORMER</button>
              <button onClick={() => setActiveGenre('strat')} className={`sidebar-link-v2 ${activeGenre === 'strat' ? 'active' : ''}`} style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>STRATEGY_VOID</button>
              <button onClick={() => setActiveGenre('casual')} className={`sidebar-link-v2 ${activeGenre === 'casual' ? 'active' : ''}`} style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>CASUAL_FLOW</button>
            </div>
          </div>

          <div className="home-sidebar-section">
            <h3 className="home-sidebar-title">// Neural Engine</h3>
            <div>
              <button onClick={() => setActiveEngine('all')} className={`sidebar-link-v2 ${activeEngine === 'all' ? 'active' : ''}`} style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>ALL_ENGINES</button>
              <button onClick={() => setActiveEngine('unity')} className={`sidebar-link-v2 ${activeEngine === 'unity' ? 'active' : ''}`} style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>UNITY_C#</button>
              <button onClick={() => setActiveEngine('unreal')} className={`sidebar-link-v2 ${activeEngine === 'unreal' ? 'active' : ''}`} style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>UNREAL_BP</button>
              <button onClick={() => setActiveEngine('godot')} className={`sidebar-link-v2 ${activeEngine === 'godot' ? 'active' : ''}`} style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}>GODOT_GD</button>
            </div>
          </div>

          <div className="home-sidebar-section">
            <h3 className="home-sidebar-title">// Credits</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => navigate('/marketplace?price=0')} className="cyber-btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '10px', minHeight: 'auto', clipPath: 'none', background: '#12121a' }}>FREE</button>
              <button onClick={() => navigate('/marketplace?price_gt=0')} className="cyber-btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '10px', minHeight: 'auto', clipPath: 'none', background: '#12121a' }}>PAID</button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="home-main-area">
          <header className="discover-header">
            <h1 className="discover-title">DISCOVER_ASSETS</h1>
            <p className="discover-status">
              <span className="discover-status-online">[STATUS: ONLINE]</span> SHOWING_{latestAssets.length}_DATA_PACKS
            </p>
          </header>

          {/* Mini Hero Integrated Card */}
          {heroAsset && (
            <div className="mini-hero-card">
              <div className="mini-hero-image-col">
                <div className="mini-hero-image-wrapper group">
                  <div className="mini-hero-overlay"></div>
                  <img src={heroAsset.coverImageUrl} alt={heroAsset.title} className="mini-hero-img" />
                  <span className="mini-hero-badge pulse-soft">FEATURED_ASSET</span>
                </div>
              </div>
              <div className="mini-hero-content">
                <div className="mini-hero-title-row">
                  <div>
                    <h2 className="mini-hero-title">{heroAsset.title}</h2>
                    <p className="mini-hero-author">By <span style={{ color: 'var(--cyber-accent-tertiary)' }}>{heroAsset.author?.username || 'Cyber_Core'}</span> // System Protocol 2.0</p>
                  </div>
                  <span className="mini-hero-price">{heroAsset.price === 0 ? '$0.00' : `$${heroAsset.price}`}</span>
                </div>
                <p className="mini-hero-desc">
                  {heroAsset.description?.substring(0, 160) || "Deploy the Alea protocol's primary companion. Optimized for modular rigging, high-fidelity LOD sets, and multi-engine neural pipelines. Includes 4 unique expressions and 12 animation nodes."}...
                </p>
                <div className="mini-hero-actions">
                  <Link to={`/marketplace/assets/${heroAsset.id}`} className="cyber-btn interactive-ripple" style={{ padding: '0.5rem 1.5rem', minHeight: 'auto' }}>VIEW_ASSET</Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="tag-pill">{heroAsset.engine || 'UNITY'}_COMPATIBLE</span>
                    <span className="tag-pill">4K_TEXTURES</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Featured Packs Horizontal Carousel */}
          <div className="featured-carousel-wrapper">
            <div className="featured-carousel-header">
              <h2 className="section-heading">
                <RiFlashlightFill style={{ color: 'var(--cyber-accent)' }} />
                Featured UI Packs
              </h2>
              <Link to="/marketplace" className="view-all-link">[View All]</Link>
            </div>
            <div className="featured-carousel custom-scrollbar">
              {featuredAssets.map((asset, i) => (
                <Link key={asset.id} to={`/marketplace/assets/${asset.id}`} className="featured-card">
                  <div className="featured-card-img-wrapper">
                    <img src={asset.coverImageUrl} alt={asset.title} className="featured-card-img" />
                    <div className={`featured-card-badge ${i % 3 === 0 ? 'badge-cyan' : i % 3 === 1 ? 'badge-magenta' : 'badge-green'}`}>
                      {asset.categoryData?.name || 'UI KIT'}
                    </div>
                  </div>
                  <div className="featured-card-body">
                    <div className="featured-card-title-row">
                      <h3 className="featured-card-title">{asset.title}</h3>
                      <span className="featured-card-price" style={{ color: 'var(--cyber-accent)' }}>{asset.price === 0 ? '$0.00' : `$${asset.price}`}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--cyber-border)' }}>{asset.engine || 'Unity'}</span>
                      <span style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--cyber-border)' }}>4K</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Latest Assets Grid */}
          <h2 className="section-heading" style={{ marginBottom: '2rem' }}>
            <RiLayoutGridFill style={{ color: 'var(--cyber-accent-tertiary)' }} />
            Latest Assets
          </h2>
          <div className="latest-assets-grid">
            {displayLatest.map((asset, i) => (
              <Link key={asset.id} to={`/marketplace/assets/${asset.id}`} className="cyber-card cyber-card-dynamic dynamic-card-link group" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                <div className="dynamic-card-img-wrapper">
                  <div className="dynamic-card-overlay" style={{ backgroundColor: i % 2 === 0 ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 0, 255, 0.1)' }}></div>
                  <img src={asset.coverImageUrl} alt={asset.title} className="dynamic-card-img" />
                  <div className="dynamic-card-badge pulse-soft" style={{ color: i % 2 === 0 ? 'var(--cyber-accent-tertiary)' : 'var(--cyber-accent-secondary)', borderColor: i % 2 === 0 ? 'rgba(0, 212, 255, 0.5)' : 'rgba(255, 0, 255, 0.5)' }}>
                    {asset.categoryData?.name || 'UI_KIT'} v.2
                  </div>
                  <div className="dynamic-card-bottom-line"></div>
                </div>
                <div className="dynamic-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 className="dynamic-card-title">{asset.title}</h3>
                    <span style={{ color: 'var(--cyber-accent)', fontSize: '12px', fontWeight: 700 }}>{asset.price === 0 ? '$0.00' : `$${asset.price}`}</span>
                  </div>
                  <div className="dynamic-card-desc-wrapper">
                    <p className="dynamic-card-desc">
                      {asset.description?.substring(0, 100) || "Advanced asset pack featuring modular nodes and multi-engine neural pipelines. Ready to deploy."}
                    </p>
                  </div>
                  <div className="dynamic-card-footer">
                    <span className="dynamic-card-author">BY <span style={{ color: '#64748b' }}>{asset.author?.username || 'CYBER_CORE'}</span></span>
                    <span className="dynamic-card-engine">{asset.engine || 'UNITY'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* PageFooter */}
      <footer className="home-footer-v2">
        <div className="home-footer-v2-left">
          <span className="home-footer-v2-loc">SYSTEM_LOC: EARTH_NODE_01</span>
          <span className="home-footer-v2-status flicker">CONNECTION_STABLE: 99.9%</span>
        </div>
        <div className="home-footer-v2-right">
          © 2077 UIBRAGE_CORP. ALL_RIGHTS_ENCRYPTED.
        </div>
      </footer>
    </div>
  )
}
