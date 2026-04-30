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
            height: '300px', 
            background: profileUser.coverImageUrl ? `url(${profileUser.coverImageUrl}) center/cover` : '#312e81',
            borderRadius: '1.5rem 1.5rem 0 0',
            position: 'relative'
          }}>
             <div className="cover-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))' }}></div>
          </div>
          
          <div className="profile-v2-info-bar">
            <div className="profile-v2-avatar-wrap" style={{ marginTop: '-80px', borderRadius: '50%', overflow: 'hidden', background: '#fff', padding: '4px' }}>
              {profileUser.avatarUrl ? (
                <img src={profileUser.avatarUrl} className="profile-v2-avatar" alt={profileUser.username} style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <div className="profile-v2-avatar" style={{ width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: 800, color: '#4f46e5', background: '#e2e8f0', borderRadius: '50%' }}>
                  {profileUser.username[0].toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="profile-v2-text">
              <h1>{profileUser.fullName || profileUser.username}</h1>
              <p>@{profileUser.username} • {profileUser.followerCount || 0} Followers • {profileUser.followingCount || 0} Following</p>
            </div>
            
            <div className="profile-v2-actions">
              <button className="btn-solid"><RiUserFollowLine /> Follow</button>
              <button className="btn-ghost">Message</button>
            </div>
          </div>

          <nav className="profile-v2-nav">
            <div className={`profile-nav-item ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>Assets ({assets.length})</div>
            <div className={`profile-nav-item ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About</div>
            <div className={`profile-nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</div>
          </nav>
        </div>

        {/* Content Layout */}
        <div className="profile-v2-content">
          {/* Left Sidebar: Intro */}
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

            <section className="detail-v2-card">
              <h3>Photos</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', borderRadius: '8px', overflow: 'hidden' }}>
                {assets.slice(0, 9).map(a => (
                  <img key={a.id} src={a.coverImageUrl} style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                ))}
              </div>
            </section>
          </aside>

          {/* Main Feed: Assets */}
          <section className="profile-v2-main-list">
             {assets.length === 0 ? (
               <div className="detail-v2-card" style={{ textAlign: 'center', padding: '4rem' }}>
                  <p>No assets uploaded yet.</p>
               </div>
             ) : (
               assets.map(asset => (
                 <article key={asset.id} className="detail-v2-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <Link to={`/marketplace/assets/${asset.id}`}>
                      <img src={asset.coverImageUrl} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                    </Link>
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <Link to={`/marketplace/assets/${asset.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{asset.title}</h2>
                        </Link>
                        <strong style={{ fontSize: '1.5rem', color: '#4f46e5' }}>${asset.price}</strong>
                      </div>
                      <p style={{ color: '#64748b', margin: '0.5rem 0' }}>{asset.description?.substring(0, 160)}...</p>
                      <div className="cta-row" style={{ marginTop: '1.5rem' }}>
                        <button className="btn-solid">View Details</button>
                        <button className="btn-ghost">Add to Wishlist</button>
                      </div>
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
