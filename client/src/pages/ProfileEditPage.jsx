import { useState, useEffect } from 'react'
import { userService } from '../services/api'
import AppHeader from '../components/AppHeader.jsx'
import Toast from '../components/Toast.jsx'
import { 
  RiUser3Fill, RiMailFill, RiShieldUserFill, RiSave3Line, RiImageEditFill,
  RiMapPin2Fill, RiGlobalFill, RiBriefcaseFill, RiFacebookBoxFill, 
  RiTwitterFill, RiGithubFill 
} from 'react-icons/ri'

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
    githubUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

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
        githubUrl: savedUser.githubUrl || ''
      })
    }
  }, [])

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
      setAvatarPreview(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        if (key !== 'email' && key !== 'username') { // Email/Username usually not editable directly if linked to auth
           data.append(key, formData[key])
        }
      })
      
      if (avatarFile) {
        data.append('avatar', avatarFile)
      }

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
    <main className="profile-edit-canvas" style={{ background: '#f8fafc', minHeight: '100vh' }}>
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

      <div className="profile-edit-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <header className="profile-edit-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#1e293b' }}>Edit Profile</h1>
          <p style={{ color: '#64748b' }}>Complete your profile to build trust in the community.</p>
        </header>

        <form onSubmit={handleSubmit} className="profile-form">
          <section className="surface-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Basic Information</h3>
            <div className="profile-avatar-section" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div 
                className="avatar-preview" 
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  background: '#e2e8f0',
                  backgroundImage: (avatarPreview || user.avatarUrl) ? `url(${avatarPreview || user.avatarUrl})` : 'none',
                  backgroundSize: 'cover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: '#4f46e5'
                }}
              >
                {!(avatarPreview || user.avatarUrl) && formData.username?.[0]?.toUpperCase()}
              </div>
              <div className="avatar-info">
                <input type="file" accept="image/*" hidden id="avatarUpload" onChange={handleAvatarChange} />
                <label htmlFor="avatarUpload" className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <RiImageEditFill /> Change Photo
                </label>
              </div>
            </div>

            <div className="form-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="field-group">
                <label>Full Name</label>
                <div className="input-v3">
                  <RiUser3Fill />
                  <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
              </div>
              <div className="field-group">
                <label>Job Title</label>
                <div className="input-v3">
                  <RiBriefcaseFill />
                  <input type="text" value={formData.jobTitle} placeholder="e.g. UI Designer" onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
                </div>
              </div>
              <div className="field-group" style={{ gridColumn: 'span 2' }}>
                <label>Bio</label>
                <textarea rows={4} value={formData.bio} style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }} placeholder="Tell the community about yourself..." onChange={e => setFormData({...formData, bio: e.target.value})} />
              </div>
            </div>
          </section>

          <section className="surface-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Social & Contact</h3>
            <div className="form-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="field-group">
                <label>Location</label>
                <div className="input-v3">
                  <RiMapPin2Fill />
                  <input type="text" value={formData.location} placeholder="City, Country" onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
              <div className="field-group">
                <label>Website</label>
                <div className="input-v3">
                  <RiGlobalFill />
                  <input type="text" value={formData.website} placeholder="https://yourportfolio.com" onChange={e => setFormData({...formData, website: e.target.value})} />
                </div>
              </div>
              <div className="field-group">
                <label>Facebook URL</label>
                <div className="input-v3">
                  <RiFacebookBoxFill />
                  <input type="text" value={formData.facebookUrl} onChange={e => setFormData({...formData, facebookUrl: e.target.value})} />
                </div>
              </div>
              <div className="field-group">
                <label>Twitter URL</label>
                <div className="input-v3">
                  <RiTwitterFill />
                  <input type="text" value={formData.twitterUrl} onChange={e => setFormData({...formData, twitterUrl: e.target.value})} />
                </div>
              </div>
              <div className="field-group">
                <label>Github URL</label>
                <div className="input-v3">
                  <RiGithubFill />
                  <input type="text" value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} />
                </div>
              </div>
            </div>
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="submit" className="btn-solid" style={{ padding: '0.8rem 2.5rem' }} disabled={loading}>
              <RiSave3Line /> {loading ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
