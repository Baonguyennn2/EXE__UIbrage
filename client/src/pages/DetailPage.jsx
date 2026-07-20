import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { assetService, commentService, userService } from '../services/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import StarRating from '../components/StarRating.jsx'
import { 
  RiStarFill, 
  RiShoppingBag3Line, 
  RiHeartLine, 
  RiHeartFill,
  RiLayout4Line,
  RiDatabaseLine,
  RiFileCopyLine
} from 'react-icons/ri'
import LoadingScreen from '../components/LoadingScreen.jsx'

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
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

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
  if (!asset) return <div className="error-screen">Asset not found</div>

  const isOwner = currentUser && (asset.authorId === currentUser.id || hasPurchased)
  const finalPrice = asset.price === 0 ? 0 : asset.price * 1.05

  return (
    <main className="market-home cyber-scanlines">
      <AppHeader />
      
      <div className="detail-v2-container">
        <section className="detail-v2-main">
          <header className="detail-v2-header">
            <div className="header-meta-row">
              <span className="eyebrow">CREATED BY <Link to={`/profile/${asset.author?.username}`} className="author-link">{asset.author?.fullName || asset.author?.username}</Link></span>
              <div className="rating-summary">
                <StarRating rating={4.9} interactive={false} size={16} />
                <strong>4.9</strong>
                <small>({comments.length} reviews)</small>
              </div>
            </div>
            <h1>{asset.title}</h1>
          </header>

          <div className="detail-gallery-v2">
             <img src={asset.coverImageUrl} alt={asset.title} className="detail-hero-img" style={{ width: '100%', borderRadius: '0', objectFit: 'cover', maxHeight: '500px', clipPath: 'polygon(0 15px, 15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px))' }} />
          </div>

          <article className="detail-v2-card">
            <h3>About this Asset</h3>
            <div className="about-asset-section markdown-content">
              {asset.description ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {asset.description}
                </ReactMarkdown>
              ) : (
                <p>No description provided for this asset.</p>
              )}
            </div>
          </article>

          <section className="detail-v2-card">
            <h3>User Reviews ({comments.length})</h3>
            <form onSubmit={handleAddComment} className="comment-form-v2">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your review..."
                className="review-textarea"
                required
                style={{ width: '100%', minHeight: '100px', padding: '1rem', borderRadius: '0', border: '1px solid var(--cyber-border)', background: 'var(--cyber-bg)', color: 'var(--cyber-foreground)', marginBottom: '1rem', fontFamily: 'var(--font-cyber-mono)' }}
              />
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="rating-select-v2" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 600 }}>Your Rating: </span>
                  <StarRating rating={rating} setRating={setRating} />
                </div>
                <button type="submit" className="btn-solid" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Review'}
                </button>
              </div>
            </form>

            <div className="comments-list" style={{ marginTop: '2rem' }}>
              {comments.map((c) => (
                <div key={c._id || c.id} className="comment-item-v2" style={{ borderTop: '1px solid var(--cyber-border)', padding: '1.5rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{c.userName}</strong>
                    <StarRating rating={c.rating || 5} interactive={false} size={14} />
                  </div>
                  <p>{c.content}</p>
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="sidebar-v2-stack">
          <section className="detail-v2-card price-card">
            <div className="price-display">
              <span>Price</span>
              <strong>{finalPrice === 0 ? 'FREE' : `$${finalPrice.toFixed(2)}`}</strong>
            </div>
            
            {isOwner ? (
              <button className="btn-solid" onClick={() => window.open(asset.fileUrl, '_blank')} style={{ background: 'var(--cyber-accent)', borderColor: 'var(--cyber-accent)', color: 'var(--cyber-bg)' }}>
                <RiFileCopyLine /> Download Asset
              </button>
            ) : (
              <button className="btn-purchase" onClick={() => navigate('/marketplace/checkout', { state: { asset: { ...asset, price: finalPrice.toFixed(2) } } })}>
                <RiShoppingBag3Line /> {finalPrice === 0 ? 'Claim for Free' : 'Purchase Now'}
              </button>
            )}

            <button 
              className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
            >
              {isWishlisted ? <><RiHeartFill color="#ef4444" /> Saved to Wishlist</> : <><RiHeartLine /> Add to Wishlist</>}
            </button>

            <div className="spec-list-v2" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--cyber-border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--cyber-muted-foreground)' }}>Supported Engines</span>
                <strong>{asset.engine || 'Unity, Unreal'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--cyber-muted-foreground)' }}>File Formats</span>
                <strong>PSD, PNG, SVG</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--cyber-muted-foreground)' }}>License</span>
                <Link to="#" style={{ color: 'var(--cyber-accent)', textDecoration: 'underline' }}>{asset.licenseType || 'Standard Commercial'}</Link>
              </div>
            </div>
          </section>

          <section className="detail-v2-card author-card-v2">
             <div className="author-header">
                <Link to={`/profile/${asset.author?.username}`} className="author-avatar-big" style={{ display: 'block', textDecoration: 'none' }}>
                  {asset.author?.avatarUrl ? <img src={asset.author.avatarUrl} style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} /> : (asset.author?.fullName?.[0] || asset.author?.username?.[0] || 'U')}
                </Link>
                <div className="author-info-text">
                  <h4><Link to={`/profile/${asset.author?.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>{asset.author?.fullName || asset.author?.username}</Link></h4>
                  <span>
                    {authorProfile ? `${authorProfile.assetCount || 0} Assets • ${authorProfile.followerCount || 0} Followers` : 'Loading stats...'}
                  </span>
                </div>
             </div>
             <p style={{ fontSize: '0.85rem', color: 'var(--cyber-muted-foreground)', margin: '0.5rem 0' }}>
               {authorProfile?.bio || 'No bio provided.'}
             </p>
             {currentUser?.id !== asset.authorId && (
               <button 
                  className={`btn-follow ${isFollowing ? 'following' : ''}`}
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  style={isFollowing ? { background: 'var(--cyber-bg)', color: 'var(--cyber-foreground)', borderColor: 'var(--cyber-border)' } : {}}
               >
                 {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
               </button>
             )}
          </section>

          <div className="recommended-section">
            <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--cyber-muted-foreground)', marginBottom: '1rem', fontFamily: 'var(--font-cyber-mono)' }}>You may also like</h4>
            <div className="recommended-list">
              {recommended.map(item => (
                <Link key={item.id} to={`/marketplace/assets/${item.id}`} className="recommended-item">
                  <img src={item.coverImageUrl} className="rec-thumb" alt={item.title} />
                  <div className="rec-info">
                    <h5>{item.title}</h5>
                    <span>${item.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
