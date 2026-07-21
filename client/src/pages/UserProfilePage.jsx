import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import { assetService, userService } from '../services/api'
import { 
  RiMapPin2Line, 
  RiCalendarLine, 
  RiUserFollowLine,
  RiUserUnfollowLine,
  RiBriefcaseLine,
  RiGlobalLine,
  RiFacebookBoxFill,
  RiTwitterFill,
  RiGithubFill
} from 'react-icons/ri'

export default function UserProfilePage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [profileUser, setProfileUser] = useState(null)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('assets')
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const userRes = await userService.getProfile(username)
        setProfileUser(userRes.data)
        
        const assetsRes = await assetService.getAll({ authorId: userRes.data.id })
        setAssets(assetsRes.data)
        
        // Check if current user is following this profile
        if (currentUser && currentUser.id !== userRes.data.id) {
          try {
            const followRes = await userService.checkIsFollowing(userRes.data.id)
            setIsFollowing(followRes.data.isFollowing)
          } catch (e) {
            console.error('Failed to check follow status:', e)
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setLoading(false)
      }
    }
    fetchProfile()
  }, [username, currentUser])

  const handleToggleFollow = async () => {
    if (!currentUser) {
      navigate('/auth/login')
      return
    }
    
    setFollowLoading(true)
    try {
      const res = await userService.toggleFollow(profileUser.id)
      setIsFollowing(res.data.isFollowing)
      setProfileUser(prev => ({
        ...prev,
        followerCount: res.data.isFollowing ? (prev.followerCount || 0) + 1 : (prev.followerCount || 1) - 1
      }))
    } catch (error) {
      console.error('Error toggling follow:', error)
      alert('Failed to update follow status.')
    } finally {
      setFollowLoading(false)
    }
  }

  const handleMessage = () => {
    if (!currentUser) {
      navigate('/auth/login')
      return
    }
    navigate('/messages')
  }

  if (loading) return <LoadingScreen message="Loading Profile..." />
  if (!profileUser) return <div className="error-screen">User not found</div>

  return (
    <main className="market-home">
      <AppHeader />
      
      <div className="profile-v2-container">
        {/* Cover & Avatar Header */}
        <div className="profile-v2-header">
          <div className="profile-v2-cover" style={{ 
            height: '320px', 
            background: profileUser.coverImageUrl ? `url(${profileUser.coverImageUrl})` : '#312e81',
            backgroundSize: `${profileUser.coverZoom || 100}% auto`,
            backgroundPosition: `center ${profileUser.coverPosition || 50}%`,
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'var(--cyber-muted)',
            borderRadius: '0',
            position: 'relative'
          }}>
             <div className="cover-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))' }}></div>
          </div>
          
          <div className="profile-v2-info-bar" style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', padding: '0 3rem 1.5rem', marginTop: '-60px', position: 'relative', flexWrap: 'wrap' }}>
            <div className="profile-v2-avatar-wrap" style={{ 
              borderRadius: '0', 
              overflow: 'hidden', 
              background: 'var(--cyber-card)', 
              padding: '6px',
              border: '2px solid var(--cyber-accent)',
              boxShadow: 'var(--neon-glow-primary)',
              flexShrink: 0,
              clipPath: 'polygon(0 15px, 15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px))'
            }}>
              {profileUser.avatarUrl ? (
                <img src={profileUser.avatarUrl} className="profile-v2-avatar" alt={profileUser.username} style={{ width: '160px', height: '160px', objectFit: 'cover' }} />
              ) : (
                <div className="profile-v2-avatar" style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: 800, color: 'var(--cyber-bg)', background: 'var(--cyber-accent)', fontFamily: 'var(--font-cyber-mono)' }}>
                  {profileUser.username[0].toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="profile-v2-text" style={{ paddingBottom: '1rem', flex: 1 }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', color: 'var(--cyber-foreground)', fontFamily: 'var(--font-cyber-heading)', textTransform: 'uppercase' }}>{profileUser.fullName || profileUser.username}</h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--cyber-muted-foreground)', margin: 0, fontFamily: 'var(--font-cyber-mono)' }}>@{profileUser.username} • {profileUser.followerCount || 0} Followers • {profileUser.followingCount || 0} Following</p>
            </div>
            
            <div className="profile-v2-actions" style={{ paddingBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {currentUser && currentUser.id !== profileUser.id && (
                <>
                  <button 
                    className="btn-solid" 
                    style={{ padding: '0.75rem 2rem' }}
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                  >
                    {isFollowing ? <><RiUserUnfollowLine /> Unfollow</> : <><RiUserFollowLine /> Follow</>}
                  </button>
                  <button 
                    className="btn-ghost" 
                    style={{ padding: '0.75rem 1.5rem' }}
                    onClick={handleMessage}
                  >
                    Message
                  </button>
                </>
              )}
              {currentUser && currentUser.id === profileUser.id && (
                <button 
                  className="btn-ghost" 
                  style={{ padding: '0.75rem 1.5rem' }}
                  onClick={() => navigate('/profile/edit')}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <nav className="profile-v2-nav" style={{ padding: '0 3rem', borderTop: '1px solid var(--cyber-border)', fontFamily: 'var(--font-cyber-mono)', textTransform: 'uppercase' }}>
            <div className={`profile-nav-item ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>Assets ({assets.length})</div>
            <div className={`profile-nav-item ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About</div>
            <div className={`profile-nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</div>
          </nav>
        </div>

        {/* Content Layout */}
        <div className="profile-v2-content" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', padding: '2rem 3rem' }}>
          <aside className="profile-v2-sidebar">
            <section className="detail-v2-card intro-card">
              <h3>Intro</h3>
              <p style={{ marginBottom: '1.5rem', color: 'var(--cyber-foreground)' }}>{profileUser.bio || 'This creator hasn\'t added a bio yet.'}</p>
              
              {profileUser.jobTitle && <div className="intro-item"><RiBriefcaseLine /> {profileUser.jobTitle}</div>}
              {profileUser.location && <div className="intro-item"><RiMapPin2Line /> {profileUser.location}</div>}
              {profileUser.website && (
                <div className="intro-item">
                  <RiGlobalLine /> 
                  <a href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyber-accent)' }}>
                    {profileUser.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="intro-item"><RiCalendarLine /> Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', fontSize: '1.5rem', color: 'var(--cyber-accent-tertiary)' }}>
                {profileUser.facebookUrl && <a href={profileUser.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}><RiFacebookBoxFill /></a>}
                {profileUser.twitterUrl && <a href={profileUser.twitterUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}><RiTwitterFill /></a>}
                {profileUser.githubUrl && <a href={profileUser.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}><RiGithubFill /></a>}
              </div>
            </section>
          </aside>

          <section className="profile-v2-main-list">
             {assets.length === 0 ? (
               <div className="detail-v2-card" style={{ textAlign: 'center', padding: '4rem' }}>
                  <p>No assets uploaded yet.</p>
               </div>
             ) : (
               assets.map(asset => (
                 <article key={asset.id} className="detail-v2-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <Link to={`/marketplace/assets/${asset.id}`}>
                      <img src={asset.coverImageUrl} style={{ width: '100%', height: '320px', objectFit: 'cover' }} />
                    </Link>
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <Link to={`/marketplace/assets/${asset.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h2 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-cyber-heading)', textTransform: 'uppercase' }}>{asset.title}</h2>
                        </Link>
                        <strong style={{ fontSize: '1.5rem', color: 'var(--cyber-accent)' }}>${asset.price}</strong>
                      </div>
                      <p style={{ color: 'var(--cyber-muted-foreground)', margin: '0.5rem 0', fontFamily: 'var(--font-cyber-mono)' }}>{asset.description?.substring(0, 160)}...</p>
                    </div>
                 </article>
               ))
             )}
          </section>
        </div>
      </div>
    </main>
  )
}
