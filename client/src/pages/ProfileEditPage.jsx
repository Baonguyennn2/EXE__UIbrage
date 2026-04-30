import { useState, useEffect } from 'react'
import { userService } from '../services/api'
import AppHeader from '../components/AppHeader.jsx'
import Toast from '../components/Toast.jsx'
import { 
  RiUser3Fill, RiMailFill, RiShieldUserFill, RiSave3Line, RiImageEditFill,
  RiMapPin2Fill, RiGlobalFill, RiBriefcaseFill, RiFacebookBoxFill, 
  RiTwitterFill, RiGithubFill, RiLayoutTopLine, RiMagicLine
} from 'react-icons/ri'

const FRAMES = [
  { id: 'none', name: 'Original', class: '' },
  { id: 'sakura', name: 'Sakura Petals', class: 'frame-sakura' },
  { id: 'pixel', name: 'Pixel Knight', class: 'frame-pixel' },
  { id: 'modern_vn', name: 'Modern VN', class: 'frame-modern-vn' }
]

export default function ProfileEditPage() {
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
    profileFrame: 'none'
  })
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

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
        profileFrame: savedUser.profileFrame || 'none'
      })
    }
  }, [])

  const handleFileChange = (e, setter, previewSetter) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0])
      previewSetter(URL.createObjectURL(e.target.files[0]))
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

  const selectedFrameClass = FRAMES.find(f => f.id === formData.profileFrame)?.class || ''

  return (
    <main className="profile-edit-canvas">
      <AppHeader />
      
      {notification && (
        <div className="toast-container">
          <Toast 
            type={notification.type} 
            message={notification.message} 
            onClose={() => setNotification(null)} 
          />
        </div>
      )}

      <div className="profile-edit-content" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <header className="profile-edit-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#1e293b' }}>Professional Settings</h1>
          <p style={{ color: '#64748b' }}>Customize your presence on UIbrage.</p>
        </header>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Cover & Avatar Preview Section */}
          <section className="surface-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
            <div className="edit-cover-preview" style={{ 
              height: '200px', 
              background: (coverPreview || user.coverImageUrl) ? `url(${coverPreview || user.coverImageUrl}) center/cover` : '#312e81',
              position: 'relative'
            }}>
              <input type="file" accept="image/*" hidden id="coverUpload" onChange={(e) => handleFileChange(e, setCoverFile, setCoverPreview)} />
              <label htmlFor="coverUpload" className="btn-solid small" style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                <RiImageEditFill /> Change Cover
              </label>
            </div>
            
            <div style={{ padding: '0 2rem 2rem', marginTop: '-50px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '2rem' }}>
              <div className="avatar-frame-container">
                <div className={`profile-frame-overlay ${selectedFrameClass}`}></div>
                <div className="profile-avatar-wrap-v3" style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  background: '#e2e8f0',
                  backgroundImage: (avatarPreview || user.avatarUrl) ? `url(${avatarPreview || user.avatarUrl})` : 'none',
                  backgroundSize: 'cover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  fontWeight: 700,
                  color: '#4f46e5',
                  overflow: 'hidden'
                }}>
                  {!(avatarPreview || user.avatarUrl) && formData.username?.[0]?.toUpperCase()}
                </div>
                <input type="file" accept="image/*" hidden id="avatarUpload" onChange={(e) => handleFileChange(e, setAvatarFile, setAvatarPreview)} />
                <label htmlFor="avatarUpload" className="avatar-edit-badge" style={{ position: 'absolute', bottom: 12, right: 12, background: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', zindex: 10 }}>
                  <RiImageEditFill color="#4f46e5" />
                </label>
              </div>
              
              <div style={{ paddingBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{formData.fullName || formData.username}</h2>
                <p style={{ margin: 0, color: '#64748b' }}>@{formData.username}</p>
              </div>
            </div>
          </section>

          {/* Frame Selection */}
          <section className="surface-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RiMagicLine color="#6366f1" /> Profile Decoration
            </h3>
            <div className="frame-selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {FRAMES.map(frame => (
                <div 
                  key={frame.id} 
                  className={`frame-option ${formData.profileFrame === frame.id ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, profileFrame: frame.id})}
                  style={{ 
                    border: formData.profileFrame === frame.id ? '2px solid #6366f1' : '2px solid #e2e8f0',
                    borderRadius: '1rem',
                    padding: '1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: formData.profileFrame === frame.id ? '#eff6ff' : '#fff',
                    transition: 'all 0.2s'
                  }}
                >
                  <div className={`preview-circle ${frame.class}`} style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    margin: '0 auto 0.5rem', 
                    background: frame.id === 'none' ? '#f1f5f9' : `url(/assets/frames/${frame.id === 'modern_vn' ? 'vietnam' : frame.id}.png) center/120% no-repeat`,
                    backgroundColor: '#1e293b',
                    mixBlendMode: frame.id === 'none' ? 'normal' : 'screen',
                    position: 'relative' 
                  }}></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{frame.name}</span>
                </div>
              ))}
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
              
              <div style={{ gridColumn: 'span 2', height: '1px', background: '#f1f5f9', margin: '1rem 0' }} />
              
              <div className="field-group">
                <label>Facebook</label>
                <div className="input-v3">
                  <RiFacebookBoxFill color="#1877F2" />
                  <input type="text" value={formData.facebookUrl} placeholder="facebook.com/username" onChange={e => setFormData({...formData, facebookUrl: e.target.value})} />
                </div>
              </div>
              <div className="field-group">
                <label>Twitter</label>
                <div className="input-v3">
                  <RiTwitterFill color="#1DA1F2" />
                  <input type="text" value={formData.twitterUrl} placeholder="twitter.com/username" onChange={e => setFormData({...formData, twitterUrl: e.target.value})} />
                </div>
              </div>
              <div className="field-group">
                <label>Github</label>
                <div className="input-v3">
                  <RiGithubFill color="#333" />
                  <input type="text" value={formData.githubUrl} placeholder="github.com/username" onChange={e => setFormData({...formData, githubUrl: e.target.value})} />
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
    </main>
  )
}
