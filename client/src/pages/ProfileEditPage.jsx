import { useState, useEffect } from 'react'
import { userService } from '../services/api'
import AppHeader from '../components/AppHeader.jsx'
import Toast from '../components/Toast.jsx'
import { 
  RiUser3Fill, RiMailFill, RiShieldUserFill, RiSave3Line, RiImageEditFill,
  RiMapPin2Fill, RiGlobalFill, RiBriefcaseFill, RiFacebookBoxFill, 
  RiTwitterFill, RiGithubFill, RiCloseLine, RiCheckLine, RiZoomInLine, RiDragMoveLine
} from 'react-icons/ri'

export default function ProfileEditPage({ isAdminContext = false }) {
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    bio: '',
    jobTitle: '',
    location: '',
    website: '',
    facebookUrl: '',
    twitterUrl: '',
    githubUrl: '',
    coverPosition: 50,
    coverZoom: 100
  })
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [showCoverModal, setShowCoverModal] = useState(false)

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null')
    if (savedUser) {
      setUser(savedUser)
      setFormData({
        fullName: savedUser.fullName || '',
        username: savedUser.username || '',
        email: savedUser.email || '',
        bio: savedUser.bio || '',
        jobTitle: savedUser.jobTitle || '',
        location: savedUser.location || '',
        website: savedUser.website || '',
        facebookUrl: savedUser.facebookUrl || '',
        twitterUrl: savedUser.twitterUrl || '',
        githubUrl: savedUser.githubUrl || '',
        coverPosition: savedUser.coverPosition || 50,
        coverZoom: savedUser.coverZoom || 100
      })
    }
  }, [])

  const handleFileChange = (e, setter, previewSetter) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0])
      previewSetter(URL.createObjectURL(e.target.files[0]))
      if (setter === setCoverFile) {
        setShowCoverModal(true)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        if (key !== 'email' && key !== 'username') {
           data.append(key, formData[key])
        }
      })
      
      if (avatarFile) data.append('avatar', avatarFile)
      if (coverFile) data.append('coverImage', coverFile)

      const res = await userService.updateProfile(data)
      const updatedUser = res.data
      
      setNotification({ type: 'success', message: 'Profile updated successfully!' })
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      window.dispatchEvent(new Event('authChange'))
    } catch (error) {
      console.error('Update Error:', error)
      setNotification({ type: 'error', message: error.response?.data?.message || 'Update failed' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <main className="profile-edit-canvas" style={{ padding: isAdminContext ? 0 : 'inherit' }}>
      {!isAdminContext && <AppHeader />}
      
      {notification && (
        <div className="toast-container">
          <Toast 
            type={notification.type} 
            message={notification.message} 
            onClose={() => setNotification(null)} 
          />
        </div>
      )}

      <div className="profile-edit-content" style={{ maxWidth: '900px', margin: isAdminContext ? '0' : '0 auto', padding: isAdminContext ? '0 0 2rem 0' : '2rem' }}>
        <header className="profile-edit-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#1e293b' }}>Professional Settings</h1>
          <p style={{ color: '#64748b' }}>Customize your presence on UIbrage.</p>
        </header>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* LinkedIn-style Cover Section */}
          <section className="surface-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem', background: '#fff' }}>
            <div className="edit-cover-preview" style={{ 
              height: '240px', 
              background: (coverPreview || user.coverImageUrl) ? `url(${coverPreview || user.coverImageUrl})` : '#312e81',
              backgroundSize: `${formData.coverZoom}% auto`,
              backgroundPosition: `center ${formData.coverPosition}%`,
              backgroundRepeat: 'no-repeat',
              position: 'relative'
            }}>
              {/* Change Cover Button in corner */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                <input type="file" accept="image/*" hidden id="coverUpload" onChange={(e) => handleFileChange(e, setCoverFile, setCoverPreview)} />
                <label htmlFor="coverUpload" style={{ 
                  background: '#fff', 
                  color: '#4f46e5', 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} title="Change Cover">
                  <RiImageEditFill size={20} />
                </label>
              </div>
              
              {(coverPreview || user.coverImageUrl) && (
                <button 
                  type="button" 
                  onClick={() => setShowCoverModal(true)}
                  style={{ 
                    position: 'absolute', 
                    bottom: '1rem', 
                    right: '1rem',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  Edit Position
                </button>
              )}
            </div>
            
            <div style={{ padding: '0 2rem 2rem', marginTop: '-60px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '2rem' }}>
              <div className="avatar-frame-container" style={{ position: 'relative' }}>
                <div className="profile-avatar-wrap-v3" style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  background: '#e2e8f0',
                  backgroundImage: (avatarPreview || user.avatarUrl) ? `url(${avatarPreview || user.avatarUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  fontWeight: 700,
                  color: '#4f46e5',
                  overflow: 'hidden',
                  border: '4px solid #fff',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  {!(avatarPreview || user.avatarUrl) && formData.username?.[0]?.toUpperCase()}
                </div>
                <input type="file" accept="image/*" hidden id="avatarUpload" onChange={(e) => handleFileChange(e, setAvatarFile, setAvatarPreview)} />
                <label htmlFor="avatarUpload" className="avatar-edit-badge" style={{ position: 'absolute', bottom: 4, right: 4, background: '#4f46e5', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', cursor: 'pointer', border: '3px solid #fff' }}>
                  <RiImageEditFill color="#fff" size={18} />
                </label>
              </div>
              
              <div style={{ paddingBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>{formData.fullName || formData.username}</h2>
                <p style={{ margin: 0, color: '#64748b' }}>@{formData.username}</p>
              </div>
            </div>
          </section>

          {/* Form Fields */}
          <section className="surface-card" style={{ padding: '2rem' }}>
            <div className="form-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="field-group">
                <label>Full Name</label>
                <div className="input-v3">
                  <RiUser3Fill color="#94a3b8" />
                  <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
              </div>
              <div className="field-group">
                <label>Job Title</label>
                <div className="input-v3">
                  <RiBriefcaseFill color="#94a3b8" />
                  <input type="text" value={formData.jobTitle} placeholder="e.g. Senior UI/UX Designer" onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
                </div>
              </div>
              <div className="field-group" style={{ gridColumn: 'span 2' }}>
                <label>Bio</label>
                <textarea rows={4} value={formData.bio} className="textarea-v3" style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', minHeight: '120px' }} placeholder="Write a short bio..." onChange={e => setFormData({...formData, bio: e.target.value})} />
              </div>
              <div className="field-group">
                <label>Location</label>
                <div className="input-v3">
                  <RiMapPin2Fill color="#94a3b8" />
                  <input type="text" value={formData.location} placeholder="City, Country" onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
              <div className="field-group">
                <label>Website</label>
                <div className="input-v3">
                  <RiGlobalFill color="#94a3b8" />
                  <input type="text" value={formData.website} placeholder="https://yourportfolio.com" onChange={e => setFormData({...formData, website: e.target.value})} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
              <button type="submit" className="btn-solid" style={{ padding: '0.8rem 3rem', borderRadius: '1rem' }} disabled={loading}>
                <RiSave3Line /> {loading ? 'Processing...' : 'Save Profile'}
              </button>
            </div>
          </section>
        </form>
      </div>

      {/* LinkedIn-style Cover Modal */}
      {showCoverModal && (
        <div className="modal-overlay" style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.85)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="cover-modal" style={{ 
            background: '#fff', 
            width: '100%', 
            maxWidth: '800px', 
            borderRadius: '1rem', 
            overflow: 'hidden'
          }}>
            <header style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Edit Cover Photo</h2>
              <button onClick={() => setShowCoverModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><RiCloseLine size={24} /></button>
            </header>

            <div style={{ background: '#000', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                width: '100%', 
                height: '240px', 
                background: `url(${coverPreview || user.coverImageUrl})`,
                backgroundSize: `${formData.coverZoom}% auto`,
                backgroundPosition: `center ${formData.coverPosition}%`,
                backgroundRepeat: 'no-repeat',
                border: '1px dashed rgba(255,255,255,0.5)',
                transition: 'all 0.1s ease'
              }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }} />
                <div style={{ height: '240px' }} />
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }} />
              </div>
            </div>

            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '0.75rem' }}>
                  <RiZoomInLine /> Zoom
                </label>
                <input 
                  type="range" 
                  min="100" 
                  max="300" 
                  value={formData.coverZoom} 
                  onChange={(e) => setFormData({...formData, coverZoom: parseInt(e.target.value)})}
                  style={{ width: '100%', height: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '0.75rem' }}>
                  <RiDragMoveLine /> Straighten / Position
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={formData.coverPosition} 
                  onChange={(e) => setFormData({...formData, coverPosition: parseInt(e.target.value)})}
                  style={{ width: '100%', height: '6px' }}
                />
              </div>
            </div>

            <footer style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setShowCoverModal(false)} className="btn-ghost" style={{ padding: '0.6rem 1.5rem' }}>Cancel</button>
              <button onClick={() => setShowCoverModal(false)} className="btn-solid" style={{ padding: '0.6rem 2rem' }}>Apply</button>
            </footer>
          </div>
        </div>
      )}
    </main>
  )
}
