import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { assetService, userService } from '../services/api'
import { 
  RiMapPin2Line, 
  RiCalendarLine, 
  RiUserFollowLine, 
  RiBriefcaseLine,
  RiGlobalLine,
  RiFacebookBoxFill,
  RiTwitterFill,
  RiGithubFill
} from 'react-icons/ri'

export default function UserProfilePage() {
  const { username } = useParams()
  const [profileUser, setProfileUser] = useState(null)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('assets')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const userRes = await userService.getProfile(username)
        setProfileUser(userRes.data)
        
        const assetsRes = await assetService.getAll({ username })
        setAssets(assetsRes.data)
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setLoading(false)
      }
    }
    fetchProfile()
  }, [username])

  if (loading) return <div className="loading-screen">Loading Profile...</div>
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
            backgroundColor: '#312e81',
            borderRadius: '1.5rem 1.5rem 0 0',
            position: 'relative'
          }}>
             <div className="cover-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))' }}></div>
          </div>
          
          <div className="profile-v2-info-bar" style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', padding: '0 3rem 1.5rem', marginTop: '-60px', position: 'relative' }}>
            <div className="profile-v2-avatar-wrap" style={{ 
              borderRadius: '50%', 
              overflow: 'hidden', 
              background: '#fff', 
              padding: '6px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              flexShrink: 0
            }}>
              {profileUser.avatarUrl ? (
                <img src={profileUser.avatarUrl} className="profile-v2-avatar" alt={profileUser.username} style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <div className="profile-v2-avatar" style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: 800, color: '#4f46e5', background: '#e2e8f0', borderRadius: '50%' }}>
                  {profileUser.username[0].toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="profile-v2-text" style={{ paddingBottom: '1rem', flex: 1 }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', color: '#1e293b' }}>{profileUser.fullName || profileUser.username}</h1>
              <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>@{profileUser.username} • {profileUser.followerCount || 0} Followers • {profileUser.followingCount || 0} Following</p>
            </div>
            
            <div className="profile-v2-actions" style={{ paddingBottom: '1rem', display: 'flex', gap: '1rem' }}>
              <button className="btn-solid" style={{ padding: '0.75rem 2rem' }}><RiUserFollowLine /> Follow</button>
              <button className="btn-ghost" style={{ padding: '0.75rem 1.5rem' }}>Message</button>
            </div>
          </div>

          <nav className="profile-v2-nav" style={{ padding: '0 3rem', borderTop: '1px solid #f1f5f9' }}>
            <div className={`profile-nav-item ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>Assets ({assets.length})</div>
            <div className={`profile-nav-item ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About</div>
            <div className={`profile-nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</div>
          </nav>
        </div>

        {/* Content Layout */}
        <div className="profile-v2-content">
          <aside className="profile-v2-sidebar">
            <section className="detail-v2-card intro-card">
              <h3>Intro</h3>
              <p style={{ marginBottom: '1.5rem', color: '#475569' }}>{profileUser.bio || 'This creator hasn\'t added a bio yet.'}</p>
              
              {profileUser.jobTitle && <div className="intro-item"><RiBriefcaseLine /> {profileUser.jobTitle}</div>}
              {profileUser.location && <div className="intro-item"><RiMapPin2Line /> {profileUser.location}</div>}
              {profileUser.website && (
                <div className="intro-item">
                  <RiGlobalLine /> 
                  <a href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>
                    {profileUser.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="intro-item"><RiCalendarLine /> Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', fontSize: '1.5rem', color: '#64748b' }}>
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
                          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{asset.title}</h2>
                        </Link>
                        <strong style={{ fontSize: '1.5rem', color: '#4f46e5' }}>${asset.price}</strong>
                      </div>
                      <p style={{ color: '#64748b', margin: '0.5rem 0' }}>{asset.description?.substring(0, 160)}...</p>
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
