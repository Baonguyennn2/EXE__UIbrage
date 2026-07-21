import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { postService } from '../services/api'
import LoadingScreen from '../components/LoadingScreen.jsx'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { RiChat3Line, RiEyeLine, RiArrowLeftLine, RiSendPlane2Line } from 'react-icons/ri'
import '../dashboard-redesign.css'
import '../homepage-redesign.css'

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
    
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/auth/login')
      return
    }
    
    setIsSubmitting(true)
    try {
      await postService.addComment(id, { content: newComment })
      setNewComment('')
      fetchPost()
    } catch (error) {
      console.error('Error adding comment:', error)
      if (error.response?.status === 401) {
        navigate('/auth/login')
      } else {
        alert('Failed to add comment. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <LoadingScreen message="Loading Post..." />
  if (!post) return <div className="error-screen">Post not found</div>

  return (
    <div className="dashboard-layout">
      <div className="cyber-grid-bg" style={{ opacity: 0.05, position: 'fixed', inset: 0, zIndex: 0 }}></div>
      <AppHeader />
      
      <main className="dashboard-main" style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem', position: 'relative', zIndex: 10 }}>
        <button className="cyber-btn-outline" onClick={() => navigate('/community')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0.5rem 1rem', minHeight: 'auto', fontSize: '0.85rem', clipPath: 'none' }}>
          <RiArrowLeftLine /> BACK_TO_NETWORK
        </button>

        <article className="cyber-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--cyber-accent-tertiary)' }}></div>
          
          {post.coverImageUrl && (
            <img src={post.coverImageUrl} alt={post.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '4px', marginBottom: '2rem', border: '1px solid var(--cyber-border)' }} />
          )}

          <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--cyber-border)', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: 'rgba(0,212,255,0.1)', border: '1px solid var(--cyber-accent-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--cyber-accent-tertiary)' }}>
                {post.author?.avatarUrl ? <img src={post.author.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (post.author?.username?.[0]?.toUpperCase() || 'U')}
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'var(--cyber-foreground)' }}>@{post.author?.username}</h4>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'var(--font-cyber-mono)' }}>POSTED_ON {new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <h1 className="cyber-glitch-text" data-text={post.title} style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '1rem', fontFamily: 'var(--font-cyber-heading)', color: '#fff', textTransform: 'uppercase' }}>{post.title}</h1>
            
            <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.9rem', fontFamily: 'var(--font-cyber-mono)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RiChat3Line color="var(--cyber-accent)" /> {post.comments?.length || 0} COMMENTS</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RiEyeLine color="var(--cyber-accent-tertiary)" /> {post.viewCount || 0} VIEWS</span>
            </div>
          </header>

          <div className="post-content markdown-content" style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--cyber-foreground)' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {post.tags?.split(',').map(tag => (
              <span key={tag} className="cyber-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', minHeight: 'auto', clipPath: 'none' }}>
                #{tag.trim()}
              </span>
            ))}
          </div>
        </article>

        <section style={{ marginTop: '3rem' }}>
          <h3 style={{ fontFamily: 'var(--font-cyber-mono)', color: 'var(--cyber-accent-secondary)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>// COMMENTS ({post.comments?.length || 0})</h3>
          
          <form onSubmit={handleAddComment} className="cyber-card" style={{ padding: '1.5rem', marginTop: '1.5rem', borderLeft: '2px solid var(--cyber-accent)' }}>
            <textarea 
              className="cyber-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="ADD_TO_DATA_STREAM..."
              style={{ width: '100%', minHeight: '100px', padding: '1rem', marginBottom: '1rem', resize: 'vertical' }}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="cyber-btn" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem', minHeight: 'auto' }}>
                <RiSendPlane2Line /> {isSubmitting ? 'TRANSMITTING...' : 'POST_COMMENT'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {post.comments?.map((comment) => (
              <div key={comment.id} className="cyber-card" style={{ padding: '1.5rem', background: 'rgba(5,5,10,0.5)', borderLeft: '1px solid var(--cyber-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'rgba(255,0,255,0.1)', border: '1px solid var(--cyber-accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--cyber-accent-secondary)' }}>
                    {comment.user?.avatarUrl ? <img src={comment.user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (comment.user?.username?.[0]?.toUpperCase() || 'U')}
                  </div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--cyber-foreground)' }}>@{comment.user?.username || comment.userName}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-cyber-mono)' }}>• {new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ margin: 0, color: 'var(--cyber-foreground)', lineHeight: 1.6 }}>{comment.content}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
