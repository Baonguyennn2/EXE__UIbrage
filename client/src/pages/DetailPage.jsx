import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { assetService, commentService, userService } from '../services/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import StarRating from '../components/StarRating.jsx'
import { 
  RiStarFill, 
  RiHeartLine, 
  RiHeartFill,
  RiArrowLeftLine,
  RiFullscreenLine,
  RiPlayCircleLine,
  RiUserLine,
  RiShoppingCartLine,
  RiCheckLine,
  RiTerminalBoxLine,
  RiTwitterFill,
  RiGithubFill
} from 'react-icons/ri'
import LoadingScreen from '../components/LoadingScreen.jsx'
import '../detail-redesign.css'
import '../homepage-redesign.css' // Import for home-footer-v2

export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [asset, setAsset] = useState(null)
  const [comments, setComments] = useState([])
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(true)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [authorProfile, setAuthorProfile] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  
  // New States for Redesign
  const [activeTab, setActiveTab] = useState('description')
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetRes, commentsRes, recRes] = await Promise.all([
          assetService.getById(id),
          commentService.getByAssetId(id),
          assetService.getAll({ limit: 3 })
        ])
        setAsset(assetRes.data)
        setComments(commentsRes.data)
        setRecommended(recRes.data.filter(a => a.id !== id))
        
        try {
          const profileRes = await userService.getProfile(assetRes.data.author.username)
          setAuthorProfile(profileRes.data)
        } catch (e) {
          console.error('Failed to fetch author profile:', e)
        }
        
        setLoading(false)

        const token = localStorage.getItem('token')
        if (token) {
          const [wishlistRes, purchasesRes] = await Promise.all([
            userService.getWishlist(),
            userService.getPurchases()
          ])
          setIsWishlisted(wishlistRes.data.some(item => item.id === id))
          setHasPurchased(purchasesRes.data.some(item => item.id === id))
          
          try {
             const followRes = await userService.checkIsFollowing(assetRes.data.authorId)
             setIsFollowing(followRes.data.isFollowing)
          } catch (e) {
             console.error('Failed to fetch follow status:', e)
          }
        }
      } catch (error) {
        console.error('Error fetching details:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleToggleWishlist = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/auth/login')
      return
    }

    setWishlistLoading(true)
    try {
      const res = await userService.toggleWishlist(id)
      setIsWishlisted(res.data.isWishlisted)
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleToggleFollow = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/auth/login')
      return
    }

    setFollowLoading(true)
    try {
      const res = await userService.toggleFollow(asset.authorId)
      setIsFollowing(res.data.isFollowing)
      if (authorProfile) {
        setAuthorProfile({
           ...authorProfile,
           followerCount: res.data.isFollowing ? authorProfile.followerCount + 1 : authorProfile.followerCount - 1
        })
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  const [newComment, setNewComment] = useState('')
  const [rating, setRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [currentUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    
    setSubmitting(true)
    try {
      const response = await commentService.add({
        assetId: id,
        content: newComment,
        rating
      })
      setComments([response.data, ...comments])
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment. Please log in first.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingScreen message="Fetching Asset Details..." />
  if (!asset) return <div className="error-screen" style={{ color: 'white', padding: '2rem' }}>Asset not found. ERROR_404</div>

  const isOwner = currentUser && (asset.authorId === currentUser.id || hasPurchased)
  const finalPrice = asset.price === 0 ? 0 : asset.price * 1.05

  // Collect images (cover + some mock placeholders to simulate the gallery if they don't have multiple)
  const images = [
    asset.coverImageUrl,
    'https://picsum.photos/seed/cyber1/1200/675',
    'https://picsum.photos/seed/cyber2/1200/675',
    'video'
  ]

  const handleSearch = (val) => navigate(`/marketplace?search=${encodeURIComponent(val)}`)

  return (
    <div className="detail-layout">
      <div className="cyber-scanlines"></div>
      <div className="cyber-grid-bg home-bg-gradient" style={{ opacity: 0.05 }}></div>
      <div className="home-bg-gradient"></div>

      <AppHeader onSearch={handleSearch} />

      <main className="detail-main-container">
        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <Link to="/marketplace" className="breadcrumb-link group">
            <RiArrowLeftLine className="breadcrumb-icon" /> Return_to_Marketplace
          </Link>
          <span className="breadcrumb-current">/ DATA_STREAM / CHARACTER_MODELS / {asset.title.toUpperCase()}</span>
        </div>

        {/* Product Main Section */}
        <div className="product-main-section">
          {/* Left: Media Gallery */}
          <div className="media-gallery-col">
            <div className="media-gallery-stack">
              <div className="zoom-container">
                <img 
                  src={images[activeImageIndex] !== 'video' ? images[activeImageIndex] : asset.coverImageUrl} 
                  alt="Preview" 
                  className="zoom-overlay" 
                />
                <div className="asset-badge pulse-soft">PREMIUM_ASSET_ENCRYPTED</div>
                <button className="maximize-btn" onClick={() => window.open(images[activeImageIndex], '_blank')}>
                  <RiFullscreenLine size={20} />
                </button>
              </div>
              <div className="thumbnail-grid">
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumbnail-item ${activeImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    {img === 'video' ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#12121a', color: '#64748b' }}>
                        <RiPlayCircleLine size={24} />
                      </div>
                    ) : (
                      <img src={img} alt={`Thumb ${idx}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Asset Core Info */}
          <div className="asset-info-col">
            <div>
              <div className="asset-meta-row">
                <span className="verified-node">VERIFIED_NODE</span>
                <span className="asset-uid">UID: {asset.id.substring(0, 8)}-{asset.title.substring(0, 4).toUpperCase()}-PROTO</span>
              </div>
              <h1 className="asset-title">{asset.title}</h1>
              <div className="asset-author-row" style={{ marginTop: '1rem' }}>
                <Link to={`/profile/${asset.author?.username}`} className="author-link-group">
                  <div className="author-avatar-wrap">
                    <div className="author-avatar-inner">
                      {asset.author?.avatarUrl ? <img src={asset.author.avatarUrl} alt="avatar" /> : <RiUserLine color="white" />}
                    </div>
                  </div>
                  <span className="author-name">BY {asset.author?.username || 'CYBER_CORE'}</span>
                </Link>
                <div className="divider-vert"></div>
                <div className="rating-group">
                  <RiStarFill />
                  <RiStarFill />
                  <RiStarFill />
                  <RiStarFill />
                  <RiStarFill style={{ opacity: 0.3 }} />
                  <span className="review-count">({comments.length} REVIEWS)</span>
                </div>
              </div>
            </div>

            <div className="price-box">
              <div className="price-box-header">
                <div className="price-val-wrapper">
                  <span className="market-val-label">Market_Valuation</span>
                  <div className="price-main">
                    {finalPrice === 0 ? '$0.00' : `$${finalPrice.toFixed(2)}`}
                    {finalPrice === 0 && <span className="price-strike">$19.99</span>}
                  </div>
                </div>
                <div className="price-meta">
                  {finalPrice === 0 && <span className="promo-text">Promo: Free_Protocol_Enabled</span>}
                  <span className="size-text">Size: {(asset.fileSize || 482)}MB ENCRYPTED</span>
                </div>
              </div>

              <div className="action-buttons">
                {isOwner ? (
                  <button className="cyber-btn btn-deploy" onClick={() => window.open(asset.fileUrl, '_blank')}>
                    <RiCheckLine size={20} /> DEPLOY_DOWNLOAD
                  </button>
                ) : (
                  <button className="cyber-btn btn-deploy" onClick={() => navigate('/marketplace/checkout', { state: { asset: { ...asset, price: finalPrice.toFixed(2) } } })}>
                    <RiShoppingCartLine size={20} /> DEPLOY_TO_CART
                  </button>
                )}
                
                <button 
                  className={`btn-save ${isWishlisted ? 'active' : ''}`}
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                >
                  {isWishlisted ? <RiHeartFill color="#f0f" size={20} /> : <RiHeartLine color="#f36" size={20} />}
                  SAVE_STREAM
                </button>
              </div>
            </div>

            <div>
              <h3 className="specs-heading">// Core_Specs</h3>
              <div className="specs-grid">
                <div className="spec-row">
                  <span className="spec-label">Neural_Engine</span>
                  <span className="spec-value">{asset.engine || 'Unity 2022+'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">LOD_Sets</span>
                  <span className="spec-value">4 Levels</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Texture_Res</span>
                  <span className="spec-value">4K PBR</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Animation_Nodes</span>
                  <span className="spec-value">12 Ready</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Category</span>
                  <span className="spec-value">{asset.categoryData?.name || 'Humanoid'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">License</span>
                  <span className="spec-value">{asset.licenseType || 'Standard CC'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="split-content-section">
          {/* Main Column: Description & Reviews */}
          <div className="desc-reviews-col">
            <div className="tabs-header">
              <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
              <button className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>Specifications</button>
              <button className={`tab-btn ${activeTab === 'changelog' ? 'active' : ''}`} onClick={() => setActiveTab('changelog')}>Changelog</button>
            </div>

            {activeTab === 'description' && (
              <div className="desc-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {asset.description || "Deploy the primary companion. Optimized for modular rigging, high-fidelity LOD sets, and multi-engine neural pipelines. Includes 4 unique expressions and 12 animation nodes."}
                </ReactMarkdown>
                
                <h4 className="orbitron" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-cyber-heading)' }}>KEY_SYSTEM_FEATURES:</h4>
                <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', listStyle: 'none', padding: 0 }}>
                  <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <RiCheckLine color="#00ff88" size={18} style={{ marginTop: '0.125rem' }} />
                    <span style={{ fontSize: '0.75rem' }}>Fully rigged Humanoid Skeleton.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <RiCheckLine color="#00ff88" size={18} style={{ marginTop: '0.125rem' }} />
                    <span style={{ fontSize: '0.75rem' }}>4K PBR textures with emissive masks.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <RiCheckLine color="#00ff88" size={18} style={{ marginTop: '0.125rem' }} />
                    <span style={{ fontSize: '0.75rem' }}>Highly optimized mesh for high-fidelity combat.</span>
                  </li>
                </ul>
              </div>
            )}
            
            {activeTab === 'specs' && <div className="desc-content">Specifications data unavailable.</div>}
            {activeTab === 'changelog' && <div className="desc-content">v1.0.0 - Initial encrypted deployment.</div>}

            <div className="reviews-section">
              <div className="reviews-header">
                <h2 className="reviews-title">Neural_Feedback // <span>Reviews</span></h2>
              </div>

              <div className="review-form-container">
                <form onSubmit={handleAddComment}>
                  <textarea 
                    className="review-form-textarea"
                    placeholder="ENTER_LOG_DATA..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                  <div className="review-form-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-cyber-mono)', textTransform: 'uppercase' }}>Rating:</span>
                      <StarRating rating={rating} setRating={setRating} />
                    </div>
                    <button type="submit" className="cyber-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '10px', minHeight: 'auto', border: '1px solid var(--cyber-border)', color: 'white', background: 'transparent', cursor: 'pointer' }} disabled={submitting}>
                      {submitting ? 'TRANSMITTING...' : 'SUBMIT_LOG'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="reviews-list">
                {comments.length === 0 && <p style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'var(--font-cyber-mono)' }}>No neural feedback found.</p>}
                {comments.map((c, i) => (
                  <div key={c._id || c.id || i} className="review-card">
                    <div className="review-card-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          <RiTerminalBoxLine color={i % 2 === 0 ? '#00ff88' : '#f0f'} />
                        </div>
                        <div>
                          <p className="reviewer-name">{c.userName || 'USER_NULL_92'}</p>
                          <p className="review-date">2077.05.12 // 09:42:15</p>
                        </div>
                      </div>
                      <div className="rating-group" style={{ gap: 0 }}>
                        <StarRating rating={c.rating || 5} interactive={false} size={12} />
                      </div>
                    </div>
                    <p className="review-text">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Col: Creator & Related */}
          <div className="sidebar-col">
            {/* Creator Card */}
            <div>
              <h3 className="source-heading">// Source_Entity</h3>
              <div className="source-entity-card">
                <div className="source-entity-header">
                  <div className="source-avatar-wrap">
                    <img 
                      src={asset.author?.avatarUrl || `https://ui-avatars.com/api/?name=${asset.author?.username}&background=0a0a0f&color=fff`} 
                      alt="avatar" 
                      className="source-avatar-img" 
                    />
                  </div>
                  <div>
                    <h4 className="source-name">{asset.author?.username || 'CYBER_CORE'}</h4>
                    <p className="source-title">Senior Asset Architect</p>
                    <div className="source-socials">
                      <RiTwitterFill size={14} color="#64748b" style={{ cursor: 'pointer' }} />
                      <RiGithubFill size={14} color="#64748b" style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>
                <div className="source-stats">
                  <div className="source-stat-box">
                    <p className="stat-val">{authorProfile?.assetCount || 142}</p>
                    <p className="stat-label">Assets</p>
                  </div>
                  <div className="source-stat-box">
                    <p className="stat-val">{authorProfile?.followerCount || 49}</p>
                    <p className="stat-label">Followers</p>
                  </div>
                </div>
                <Link to={`/profile/${asset.author?.username}`} className="btn-view-port">
                  View_Entity_Port
                </Link>
                {currentUser?.id !== asset.authorId && (
                  <button 
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                    className="btn-view-port"
                    style={{ marginTop: '0.5rem', background: isFollowing ? 'var(--cyber-accent-tertiary)' : 'transparent', color: isFollowing ? 'black' : 'white' }}
                  >
                    {followLoading ? '...' : isFollowing ? 'FOLLOWING_NODE' : 'FOLLOW_ENTITY'}
                  </button>
                )}
              </div>
            </div>

            {/* Related Assets */}
            <div>
              <h3 className="related-heading">// Related_Nodes</h3>
              <div className="related-list">
                {recommended.length > 0 ? recommended.map((item, i) => (
                  <Link key={item.id} to={`/marketplace/assets/${item.id}`} className="related-item">
                    <div className="related-thumb-wrap">
                      <img src={item.coverImageUrl} alt={item.title} className="related-thumb" />
                    </div>
                    <div className="related-info">
                      <h5 className="related-title">{item.title}</h5>
                      <p className="related-price">{item.price === 0 ? '$0.00' : `$${item.price.toFixed(2)}`}</p>
                      <span className={`related-badge ${i % 3 === 0 ? 'badge-unity' : i % 3 === 1 ? 'badge-unreal' : 'badge-godot'}`}>
                        {item.engine || 'UNITY'}
                      </span>
                    </div>
                  </Link>
                )) : (
                  <p style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'var(--font-cyber-mono)' }}>No related nodes found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

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
