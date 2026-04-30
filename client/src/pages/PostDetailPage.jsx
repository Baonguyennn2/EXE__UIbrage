import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { postService } from '../services/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { RiChat3Line, RiEyeLine, RiArrowLeftLine, RiSendPlane2Line } from 'react-icons/ri'

export default function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchPost = async () => {
    try {
      const res = await postService.getById(id)
      setPost(res.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching post:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPost()
  }, [id])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    
    setIsSubmitting(true)
    try {
      await postService.addComment(id, { content: newComment })
      setNewComment('')
      fetchPost() // Refresh post to show new comment
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment. Please log in first.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="loading-screen">Loading Post...</div>
  if (!post) return <div className="error-screen">Post not found</div>

  return (
    <main className="market-home">
      <AppHeader />
      
      <div className="post-detail-container" style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <button className="btn-back" onClick={() => navigate('/community')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 600 }}>
          <RiArrowLeftLine /> Back to Community
        </button>

        <article className="post-detail-main surface-card" style={{ padding: '2.5rem', borderRadius: '1rem', background: '#fff', border: '1px solid #e2e8f0' }}>
          {post.coverImageUrl && (
            <img src={post.coverImageUrl} alt={post.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '0.75rem', marginBottom: '2rem' }} />
          )}

          <header className="post-header" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div className="author-avatar-big" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                {post.author?.avatarUrl ? <img src={post.author.avatarUrl} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : (post.author?.username?.[0]?.toUpperCase() || 'U')}
              </div>
              <div>
                <h4 style={{ margin: 0 }}>{post.author?.username}</h4>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Posted on {new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <h1 style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '1rem' }}>{post.title}</h1>
            <div className="post-meta-row" style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RiChat3Line /> {post.comments?.length || 0} Comments</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RiEyeLine /> {post.viewCount || 0} Views</span>
            </div>
          </header>

          <div className="post-content markdown-content" style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#334155' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="post-tags" style={{ marginTop: '3rem', display: 'flex', gap: '0.75rem' }}>
            {post.tags?.split(',').map(tag => (
              <span key={tag} style={{ background: '#f1f5f9', color: '#64748b', padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 600 }}>#{tag.trim()}</span>
            ))}
          </div>
        </article>

        <section className="post-comments-section" style={{ marginTop: '3rem' }}>
          <h3>Comments ({post.comments?.length || 0})</h3>
          
          <form onSubmit={handleAddComment} className="comment-form-v2" style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginTop: '1.5rem' }}>
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add to the discussion..."
              style={{ width: '100%', minHeight: '100px', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '1rem', resize: 'vertical' }}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-solid" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RiSendPlane2Line /> {isSubmitting ? 'Sending...' : 'Post Comment'}
              </button>
            </div>
          </form>

          <div className="comments-list" style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
            {post.comments?.map((comment) => (
              <div key={comment.id} className="comment-item surface-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="author-avatar-small" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                    {comment.user?.avatarUrl ? <img src={comment.user.avatarUrl} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : (comment.user?.username?.[0]?.toUpperCase() || 'U')}
                  </div>
                  <strong style={{ fontSize: '0.95rem' }}>{comment.user?.username || comment.userName}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>• {new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ margin: 0, color: '#334155' }}>{comment.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
