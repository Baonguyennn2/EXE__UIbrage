import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { assetService, metadataService } from '../services/api'

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
    <div className="marketplace-container">
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
            {uiStyles.map(style => {
              const matchedCat = categories.find(c => c.name.toLowerCase() === style.toLowerCase())
              const isActive = matchedCat ? filters.categoryId == matchedCat.id : filters.search === style
              
              return (
                <button 
                  key={style}
                  className={`filter-link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (matchedCat) {
                      handleFilterChange('categoryId', isActive ? '' : matchedCat.id)
                    } else {
                      handleFilterChange('search', isActive ? '' : style)
                    }
                  }}
                >
                  {style}
                </button>
              )
            })}
          </div>

          <div className="filter-group">
            <h3 className="filter-label">GAME GENRE</h3>
            {gameGenres.map(genre => {
              const matchedTag = tags.find(t => t.name.toLowerCase() === genre.toLowerCase())
              const isActive = matchedTag ? filters.tagId == matchedTag.id : filters.search === genre
              
              return (
                <button 
                  key={genre}
                  className={`filter-link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (matchedTag) {
                      handleFilterChange('tagId', isActive ? '' : matchedTag.id)
                    } else {
                      handleFilterChange('search', isActive ? '' : genre)
                    }
                  }}
                >
                  {genre}
                </button>
              )
            })}
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
          </div>
        </aside>

        <section className="content-area">
          <header className="marketplace-header">
            <h1>{filters.search ? `Results for "${filters.search}"` : 'Discover Assets'}</h1>
            <p>Showing {assets.length} items</p>
          </header>

          <div className="asset-grid">
            {assets.length > 0 ? assets.map((asset) => (
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
      </main>
    </div>
  )
}
