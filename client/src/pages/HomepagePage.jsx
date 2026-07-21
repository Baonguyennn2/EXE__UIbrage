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
  const [tags, setTags] = useState([])

  const uiStyles = ['Fantasy', 'Sci-Fi', 'Pixel Art', 'Minimalist']
  const gameGenres = ['RPG', 'Platformer', 'Strategy', 'Casual']
  const engines = ['Unity', 'Unreal Engine', 'Godot']
  
  const [filters, setFilters] = useState({
    categoryId: '',
    tagId: '',
    engine: '',
    search: '',
    priceRange: ''
  })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    const controller = new AbortController()
    
    const fetchData = async () => {
      setLoading(true)
      try {
        const apiParams = { ...filters }
        if (filters.priceRange === 'free') apiParams.maxPrice = 0
        
        const [assetsRes, catsRes, tagsRes] = await Promise.all([
          assetService.getAll(apiParams, { signal: controller.signal }),
          metadataService.getCategories({ signal: controller.signal }),
          metadataService.getTags({ signal: controller.signal })
        ])
        
        const allAssets = assetsRes.data
        setFeaturedAssets(allAssets.slice(0, 4))
        setLatestAssets(allAssets.slice(0, 8))
        setCategories(catsRes.data)
        setTags(tagsRes.data)
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
  }, [filters])

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
        <aside className="home-sidebar" style={{ position: 'sticky', top: '2rem' }}>
          <div className="home-sidebar-section">
            <h3 className="home-sidebar-title">SYSTEM_FILTERS</h3>
            <button 
              onClick={() => handleFilterChange('search', '')} 
              className="cyber-btn" 
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-start', background: '#1c1c2e', border: 'none', borderLeft: '4px solid #f97316', color: '#fff', padding: '0.75rem', clipPath: 'none' }}
            >
              <RiFireFill style={{ color: '#f97316' }} className="flicker" />
              <span>RESET_ALL</span>
            </button>
          </div>

          <div className="home-sidebar-section">
            <h3 className="home-sidebar-title">// UI Style</h3>
            <div>
              {uiStyles.map(style => {
                const matchedCat = categories.find(c => c.name.toLowerCase() === style.toLowerCase())
                const isActive = matchedCat ? filters.categoryId == matchedCat.id : filters.search === style
                
                return (
                  <button 
                    key={style}
                    className={`sidebar-link-v2 ${isActive ? 'active' : ''}`}
                    style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
                    onClick={() => {
                      if (matchedCat) {
                        handleFilterChange('categoryId', isActive ? '' : matchedCat.id)
                      } else {
                        handleFilterChange('search', isActive ? '' : style)
                      }
                    }}
                  >
                    {style.toUpperCase().replace(' ', '_')}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="home-sidebar-section">
            <h3 className="home-sidebar-title">// Game Genre</h3>
            <div>
              {gameGenres.map(genre => {
                const matchedTag = tags.find(t => t.name.toLowerCase() === genre.toLowerCase())
                const isActive = matchedTag ? filters.tagId == matchedTag.id : filters.search === genre
                
                return (
                  <button 
                    key={genre}
                    className={`sidebar-link-v2 ${isActive ? 'active' : ''}`}
                    style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
                    onClick={() => {
                      if (matchedTag) {
                        handleFilterChange('tagId', isActive ? '' : matchedTag.id)
                      } else {
                        handleFilterChange('search', isActive ? '' : genre)
                      }
                    }}
                  >
                    {genre.toUpperCase().replace(' ', '_')}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="home-sidebar-section">
            <h3 className="home-sidebar-title">// Neural Engine</h3>
            <div>
              <button 
                className={`sidebar-link-v2 ${filters.engine === '' ? 'active' : ''}`} 
                onClick={() => handleFilterChange('engine', '')}
                style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
              >
                ALL_ENGINES
              </button>
              {engines.map(engine => (
                <button 
                  key={engine}
                  className={`sidebar-link-v2 ${filters.engine === engine ? 'active' : ''}`}
                  onClick={() => handleFilterChange('engine', engine)}
                  style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
                >
                  {engine.toUpperCase().replace(' ', '_')}
                </button>
              ))}
            </div>
          </div>

          <div className="home-sidebar-section">
            <h3 className="home-sidebar-title">// Credits</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleFilterChange('priceRange', 'free')} className={`cyber-btn-outline ${filters.priceRange === 'free' ? 'active' : ''}`} style={{ padding: '0.25rem 0.75rem', fontSize: '10px', minHeight: 'auto', clipPath: 'none', background: filters.priceRange === 'free' ? 'var(--cyber-accent-tertiary)' : '#12121a', color: filters.priceRange === 'free' ? '#000' : '' }}>FREE</button>
              <button onClick={() => handleFilterChange('priceRange', 'paid')} className={`cyber-btn-outline ${filters.priceRange === 'paid' ? 'active' : ''}`} style={{ padding: '0.25rem 0.75rem', fontSize: '10px', minHeight: 'auto', clipPath: 'none', background: filters.priceRange === 'paid' ? 'var(--cyber-accent-tertiary)' : '#12121a', color: filters.priceRange === 'paid' ? '#000' : '' }}>PAID</button>
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
                <Link key={asset.id} to={`/marketplace/assets/${asset.id}`} className="cyber-card cyber-card-dynamic dynamic-card-link group" style={{ minWidth: '320px', padding: 0, display: 'flex', flexDirection: 'column' }}>
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
