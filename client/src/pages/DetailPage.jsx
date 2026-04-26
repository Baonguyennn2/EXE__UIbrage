import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { assetService, commentService } from '../services/api'

export default function DetailPage() {
  const { id } = useParams()
  const [asset, setAsset] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetRes, commentsRes] = await Promise.all([
          assetService.getById(id),
          commentService.getByAsset(id)
        ])
        setAsset(assetRes.data)
        setComments(commentsRes.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching details:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const [newComment, setNewComment] = useState('')
  const [rating, setRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)

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

  if (loading) return <div className="loading-screen">Loading Asset Details...</div>
  if (!asset) return <div className="error-screen">Asset not found</div>

  return (
    <main className="market-home">
      <AppHeader />
      <section className="market-page">
        <div className="market-page__header">
          <p className="eyebrow">Asset detail</p>
          <h1>{asset.title}</h1>
          <p>{asset.description}</p>
        </div>

        <section className="market-page__content market-page__content--detail">
          <article className="surface-card">
            <div className="detail-gallery">
              <div className="detail-gallery__hero">
                <img src={asset.coverImageUrl} alt={asset.title} style={{ width: '100%', borderRadius: '8px' }} />
              </div>
              <div className="detail-gallery__list">
                {asset.media?.map((m) => (
                  <div key={m.id} className="gallery-thumb">
                    <img src={m.url} alt="screenshot" style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="comments-section" style={{ marginTop: '3rem' }}>
              <h3>Community Reviews ({comments.length})</h3>
              
              <form onSubmit={handleAddComment} className="comment-form" style={{ marginBottom: '2rem' }}>
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your review..."
                  required
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span>Rating:</span>
                  <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                  <button type="submit" className="btn-solid" disabled={submitting}>
                    {submitting ? 'Posting...' : 'Post Review'}
                  </button>
                </div>
              </form>

              <div className="comments-list">
                {comments.length === 0 ? <p>No reviews yet. Be the first!</p> : comments.map((c) => (
                  <div key={c._id || c.id} className="comment-item" style={{ borderBottom: '1px solid #eee', padding: '1.5rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{c.userName}</strong>
                      <span className="rating-badge">{'⭐'.repeat(c.rating || 5)}</span>
                    </div>
                    <p style={{ margin: '0.5rem 0' }}>{c.content}</p>
                    <small style={{ color: '#888' }}>{new Date(c.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="surface-card detail-summary">
            <div className="price-tag">
              <h2>${asset.price}</h2>
              {asset.isFree && <span className="free-badge">FREE</span>}
            </div>
            <p>By {asset.author?.fullName || asset.author?.username} • Updated {new Date(asset.updatedAt).toLocaleDateString()}</p>
            <ul className="spec-list">
              <li><strong>License:</strong> {asset.licenseType}</li>
              <li><strong>Engine:</strong> {asset.engine}</li>
              <li><strong>Category:</strong> {asset.category}</li>
              <li><strong>File:</strong> {asset.fileUrl ? 'Available for download' : 'Preview only'}</li>
            </ul>
            <div className="cta-row">
              <button 
                type="button" 
                className="btn-solid"
                onClick={() => alert('Added to cart! This feature is coming soon.')}
              >
                Add to cart
              </button>
              <button 
                type="button" 
                className="btn-ghost"
                onClick={() => alert('Saved to library!')}
              >
                Save to library
              </button>
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}
