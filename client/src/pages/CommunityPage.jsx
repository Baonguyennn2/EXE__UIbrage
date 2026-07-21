import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { postService, metadataService } from '../services/api'
import { RiChat3Line, RiEyeLine, RiAddLine, RiSearchLine, RiFireLine } from 'react-icons/ri'
import '../dashboard-redesign.css'
import '../homepage-redesign.css'

export default function CommunityPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeMobileTab, setActiveMobileTab] = useState('feed')
  const [searchTerm, setSearchTerm] = useState('')
  const [trendingTags, setTrendingTags] = useState([])
  const [featuredTopics, setFeaturedTopics] = useState([])
  const navigate = useNavigate()

  const fetchData = async (params = {}) => {
    setLoading(true)
    try {
      const [postsRes, tagsRes] = await Promise.all([
        postService.getAll(params),
        metadataService.getTags()
      ])

      setPosts(postsRes.data)
      setTrendingTags(tagsRes.data.slice(0, 8))

      // For featured topics, take top 3 most viewed posts or most commented
      const sortedByViews = [...postsRes.data].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      setFeaturedTopics(sortedByViews.slice(0, 3))

      setLoading(false)
    } catch (error) {
      console.error('Error fetching community data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchData({ search: searchTerm })
    }
  }

  const handleTagClick = (tag) => {
    const cleanTag = typeof tag === 'string' ? tag.replace('#', '') : tag.name
    fetchData({ tag: cleanTag })
  }

  return (
    <div className="dashboard-layout">
      <div className="cyber-grid-bg" style={{ opacity: 0.05, position: 'fixed', inset: 0, zIndex: 0 }}></div>
      <AppHeader />

      <main className="dashboard-main community-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '3rem', alignItems: 'flex-start', maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 10 }}>

        <div className="mobile-tab-nav" style={{ gridColumn: '1 / -1' }}>
          <button 
            className={`mobile-tab-btn ${activeMobileTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveMobileTab('feed')}
          >
            DISCUSSIONS
          </button>
          <button 
            className={`mobile-tab-btn ${activeMobileTab === 'sidebar' ? 'active' : ''}`}
            onClick={() => setActiveMobileTab('sidebar')}
          >
            TOP_SIGNALS
          </button>
        </div>

        {/* Main Content Area */}
        <section className={`${activeMobileTab !== 'feed' ? 'mobile-hidden' : ''}`} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--cyber-border)', paddingBottom: '1.5rem' }}>
            <div>
              <h1 className="cyber-glitch-text" data-text="SYSTEM_COMMUNITY" style={{ fontFamily: 'var(--font-cyber-heading)', textTransform: 'uppercase', fontSize: '2.2rem', margin: '0 0 0.5rem 0', color: '#fff' }}>
                SYSTEM_COMMUNITY
              </h1>
              <p style={{ color: 'var(--cyber-accent)', fontSize: '12px', fontWeight: 'bold', margin: 0, letterSpacing: '0.1em' }}>
                <span className="flicker">[STATUS: SECURE]</span> ACTIVE_DISCUSSIONS: {posts.length}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <RiSearchLine style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--cyber-accent-tertiary)' }} />
                <input
                  className="cyber-input"
                  style={{ paddingLeft: '2.5rem', width: '250px', height: '40px' }}
                  type="search"
                  placeholder="SEARCH_DISCUSSIONS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
              <button
                type="button"
                className="cyber-btn"
                onClick={() => navigate('/community/create')}
                title="Start a Discussion"
                style={{ padding: '0 1.5rem', height: '40px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RiAddLine /> NEW_POST
              </button>
            </div>
          </header>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--cyber-accent)' }} className="flicker">[FETCHING_DATA_PACKETS...]</div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--cyber-card)', border: '1px solid var(--cyber-border)', borderRadius: '8px' }}>
                <h3 style={{ color: 'var(--cyber-foreground)' }}>NO_SIGNAL_FOUND</h3>
                <p style={{ color: '#94a3b8' }}>Initialize the first transmission to start a discussion.</p>
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="cyber-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--cyber-accent-tertiary)' }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'rgba(0,212,255,0.1)', border: '1px solid var(--cyber-accent-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'var(--cyber-accent-tertiary)' }}>
                        {post.author?.avatarUrl ? <img src={post.author.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (post.author?.username?.[0]?.toUpperCase() || 'U')}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--cyber-foreground)', fontSize: '0.95rem' }}>@{post.author?.username}</strong>
                        <div style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'var(--font-cyber-mono)' }}>{new Date(post.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'var(--font-cyber-mono)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><RiChat3Line color="var(--cyber-accent)" /> {post.commentCount || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><RiEyeLine color="var(--cyber-accent-tertiary)" /> {post.viewCount || 0}</span>
                    </div>
                  </div>

                  <Link to={`/community/posts/${post.id}`} style={{ textDecoration: 'none' }}>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--cyber-foreground)', margin: '0.5rem 0', fontWeight: 600 }}>{post.title}</h2>
                  </Link>

                  <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0, fontSize: '0.9rem' }}>{post.content?.substring(0, 200)}...</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {post.tags?.split(',').map((tag) => (
                      <span key={tag} onClick={() => handleTagClick(tag.trim())} className="cyber-btn-outline" style={{ cursor: 'pointer', padding: '0.2rem 0.6rem', fontSize: '10px', minHeight: 'auto', clipPath: 'none' }}>
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </section>
        </section>

        {/* Sidebar */}
        <aside className={`home-sidebar community-sidebar ${activeMobileTab !== 'sidebar' ? 'mobile-hidden' : ''}`} style={{ borderLeft: '1px solid var(--cyber-border)', borderRight: 'none' }}>
          <div className="home-sidebar-section">
            <h3 className="home-sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
              <RiFireLine /> // TOP_SIGNALS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {featuredTopics.length > 0 ? featuredTopics.map(topic => (
                <Link
                  key={topic.id}
                  to={`/community/posts/${topic.id}`}
                  className="sidebar-link-v2"
                  style={{ background: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0.75rem' }}
                >
                  <strong style={{ fontSize: '0.85rem', color: 'var(--cyber-foreground)', marginBottom: '0.25rem' }}>{topic.title}</strong>
                  <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.75rem', fontFamily: 'var(--font-cyber-mono)' }}>
                    <span>{topic.commentCount} REPLIES</span>
                    <span>{topic.viewCount} VIEWS</span>
                  </div>
                </Link>
              )) : (
                <p style={{ fontSize: '0.85rem', color: '#64748b', padding: '0 0.75rem' }}>NO_ACTIVE_SIGNALS</p>
              )}
            </div>
          </div>

          <div className="home-sidebar-section">
            <h3 className="home-sidebar-title">// NETWORK_NODES</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0 0.75rem' }}>
              {trendingTags.map(tag => (
                <span
                  key={tag.id}
                  onClick={() => handleTagClick(tag)}
                  className="cyber-btn-outline"
                  style={{ cursor: 'pointer', padding: '0.25rem 0.75rem', fontSize: '10px', minHeight: 'auto', clipPath: 'none' }}
                >
                  #{tag.name.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
