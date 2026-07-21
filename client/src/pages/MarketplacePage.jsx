import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { RiFireFill } from 'react-icons/ri'
import AppHeader from '../components/AppHeader.jsx'
import { assetService, metadataService } from '../services/api'
import '../dashboard-redesign.css'
import '../homepage-redesign.css'

export default function MarketplacePage() {
  const location = useLocation()
  const [assets, setAssets] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  
  const uiStyles = ['Fantasy', 'Sci-Fi', 'Pixel Art', 'Minimalist']
  const gameGenres = ['RPG', 'Platformer', 'Strategy', 'Casual']
  const engines = ['Unity', 'Unreal Engine', 'Godot']
  
  const [filters, setFilters] = useState({ 
    categoryId: new URLSearchParams(location.search).get('categoryId') || '', 
    tagId: new URLSearchParams(location.search).get('tagId') || '', 
    engine: new URLSearchParams(location.search).get('engine') || '', 
    search: new URLSearchParams(location.search).get('search') || '', 
    priceRange: new URLSearchParams(location.search).get('priceRange') || '' 
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setFilters({
      categoryId: params.get('categoryId') || '',
      tagId: params.get('tagId') || '',
      search: params.get('search') || '',
      engine: params.get('engine') || '',
      priceRange: params.get('priceRange') || ''
    })
  }, [location.search])

  const fetchData = async () => {
    setLoading(true)
    try {
      const apiParams = { ...filters }
      if (filters.priceRange === 'free') apiParams.maxPrice = 0
      
      const [assetsRes, catsRes, tagsRes] = await Promise.all([
        assetService.getAll(apiParams),
        metadataService.getCategories(),
        metadataService.getTags()
      ])
      
      setAssets(assetsRes.data)
      setCategories(catsRes.data)
      setTags(tagsRes.data)
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
    const params = new URLSearchParams(location.search)
    if (value) params.set(key, value)
    else params.delete(key)
    // Update local state and URL
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0"></div>
      
      <main className="marketplace-container" style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppHeader onSearch={(val) => handleFilterChange('search', val)} />

        <div className="main-layout" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem', flex: 1 }}>
          
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
                <button onClick={() => handleFilterChange('priceRange', 'free')} className="cyber-btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '10px', minHeight: 'auto', clipPath: 'none', background: filters.priceRange === 'free' ? 'var(--cyber-accent-tertiary)' : '#12121a', color: filters.priceRange === 'free' ? '#000' : '' }}>FREE</button>
                <button onClick={() => handleFilterChange('priceRange', 'paid')} className="cyber-btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '10px', minHeight: 'auto', clipPath: 'none', background: filters.priceRange === 'paid' ? 'var(--cyber-accent-tertiary)' : '#12121a', color: filters.priceRange === 'paid' ? '#000' : '' }}>PAID</button>
              </div>
            </div>
          </aside>

          <section className="content-area">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--cyber-border)', paddingBottom: '1.5rem' }}>
              <div>
                <h1 className="cyber-glitch-text" data-text={filters.search ? `RESULTS_FOR: "${filters.search}"` : 'DATA_MARKETPLACE'} style={{ fontFamily: 'var(--font-cyber-heading)', textTransform: 'uppercase', fontSize: '2.2rem', margin: '0 0 0.5rem 0', color: '#fff' }}>
                  {filters.search ? `RESULTS_FOR: "${filters.search}"` : 'DATA_MARKETPLACE'}
                </h1>
                <p style={{ color: 'var(--cyber-accent)', fontSize: '12px', fontWeight: 'bold', margin: 0, letterSpacing: '0.1em' }}>
                  <span className="flicker">[STATUS: OK]</span> QUERY_RETURNED_{assets.length}_MATCHES
                </p>
              </div>
            </header>

            <div className="asset-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {assets.length > 0 ? assets.map((asset, i) => (
                <Link key={asset.id} to={`/marketplace/assets/${asset.id}`} className="cyber-card cyber-card-dynamic dynamic-card-link group" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                  <div className="dynamic-card-img-wrapper">
                    <div className="dynamic-card-overlay" style={{ backgroundColor: i % 2 === 0 ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 0, 255, 0.1)' }}></div>
                    <img src={asset.coverImageUrl} alt={asset.title} className="dynamic-card-img" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                    <div className="dynamic-card-badge pulse-soft" style={{ color: i % 2 === 0 ? 'var(--cyber-accent-tertiary)' : 'var(--cyber-accent-secondary)', borderColor: i % 2 === 0 ? 'rgba(0, 212, 255, 0.5)' : 'rgba(255, 0, 255, 0.5)' }}>
                      {asset.categoryData?.name || 'UI_KIT'} v.2
                    </div>
                    <div className="dynamic-card-bottom-line"></div>
                  </div>
                  <div className="dynamic-card-body" style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 className="dynamic-card-title" style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontFamily: 'var(--font-cyber-heading)' }}>{asset.title}</h3>
                      <span style={{ color: 'var(--cyber-accent)', fontSize: '14px', fontWeight: 900 }}>{asset.price === 0 ? 'FREE' : `$${(asset.price * 1.05).toFixed(2)}`}</span>
                    </div>
                    <div className="dynamic-card-desc-wrapper" style={{ flex: 1, marginBottom: '1rem' }}>
                      <p className="dynamic-card-desc" style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5, margin: 0 }}>
                        {asset.description?.substring(0, 80) || "Advanced cyber-node asset package."}...
                      </p>
                    </div>
                    <div className="dynamic-card-footer" style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.1em' }}>BY <span style={{ color: 'var(--cyber-accent-tertiary)' }}>{asset.author?.username || 'CYBER_CORE'}</span></span>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 900, textTransform: 'uppercase' }}>{asset.engine || 'UNITY'}</span>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="no-data-placeholder" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: 'rgba(0,0,0,0.5)', border: '1px dashed var(--cyber-border)', gridColumn: '1 / -1', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--cyber-accent-secondary)' }}>[ERROR_404]</div>
                  <div style={{ fontSize: '12px', letterSpacing: '0.1em', fontFamily: 'var(--font-cyber-mono)' }}>DATA_NOT_FOUND // NO_ASSETS_MATCH_CURRENT_PARAMETERS</div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
