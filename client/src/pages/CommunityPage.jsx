import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { postService, metadataService } from '../services/api'
import { RiChat3Line, RiEyeLine, RiAddLine, RiSearchLine, RiFireLine } from 'react-icons/ri'

export default function CommunityPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
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
    <main className="market-home">
      <AppHeader />

      <section className="community-layout">
        <div className="community-main">
          <header className="community-search-container">
            <div className="community-search-mini">
              <RiSearchLine />
              <input 
                type="search" 
                placeholder="Search discussions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            <button 
              type="button" 
              className="btn-create-mini"
              onClick={() => navigate('/community/create')}
              title="Start a Discussion"
            >
              <RiAddLine />
            </button>
          </header>

          <section className="community-feed">
            {loading ? (
              <div className="loading-placeholder">Loading discussions...</div>
            ) : posts.length === 0 ? (
              <div className="empty-state">No posts found. Be the first to start a discussion!</div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="community-post surface-card">
                  <div className="community-post__head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="author-avatar-small" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                        {post.author?.avatarUrl ? <img src={post.author.avatarUrl} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : (post.author?.username?.[0]?.toUpperCase() || 'U')}
                      </div>
                      <strong>{post.author?.username}</strong>
                    </div>
                    <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
                    <div className="community-post__stats">
                      <span><RiChat3Line /> {post.commentCount || 0}</span>
                      <span><RiEyeLine /> {post.viewCount || 0}</span>
                    </div>
                  </div>
                  <Link to={`/community/posts/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h2>{post.title}</h2>
                  </Link>
                  <p>{post.content?.substring(0, 200)}...</p>
                  <div className="community-post__tags">
                    {post.tags?.split(',').map((tag) => (
                      <span key={tag} onClick={() => handleTagClick(tag.trim())} style={{ cursor: 'pointer' }}>#{tag.trim()}</span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </section>
        </div>

        <aside className="community-side">
          <section className="surface-card side-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RiFireLine color="#f59e0b" /> Featured Topics
            </h3>
            <div className="topic-list">
              {featuredTopics.length > 0 ? featuredTopics.map(topic => (
                <Link key={topic.id} to={`/community/posts/${topic.id}`} className="community-topic-mini">
                  <strong>{topic.title}</strong>
                  <div className="topic-meta">
                    <span>{topic.commentCount} replies</span>
                    <span>{topic.viewCount} views</span>
                  </div>
                </Link>
              )) : (
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No featured topics yet.</p>
              )}
            </div>
          </section>

          <section className="surface-card side-section">
            <h3>Trending Tags</h3>
            <div className="community-tags">
              {trendingTags.map(tag => (
                <span key={tag.id} onClick={() => handleTagClick(tag)}>#{tag.name}</span>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}
