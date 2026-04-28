import { useState, useEffect } from 'react'
import { userService } from '../services/api'
import AppHeader from '../components/AppHeader.jsx'
import Toast from '../components/Toast.jsx'
import { RiUser3Fill, RiMailFill, RiShieldUserFill, RiSave3Line, RiImageEditFill } from 'react-icons/ri'

export default function ProfileEditPage() {
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    bio: ''
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
        bio: savedUser.bio || ''
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
      data.append('fullName', formData.fullName)
      data.append('bio', formData.bio)
      // Note: username update might require a different flow in Cognito if supported, so we skip username for now or just pass it if backend handles it
      
      if (avatarFile) {
        data.append('avatar', avatarFile)
      }

      const res = await userService.updateProfile(data)
      const updatedUser = res.data
      
      setNotification({ type: 'success', message: 'Profile updated successfully!' })
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Update Error:', error)
      setNotification({ type: 'error', message: error.response?.data?.message || 'Update failed' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

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

      <div className="profile-edit-content">
        <header className="profile-edit-header">
          <h1>Account Settings</h1>
          <p>Update your personal information and profile details.</p>
        </header>

        <section className="surface-card profile-form-card">
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-avatar-section">
              <div className="avatar-preview" style={ (avatarPreview || user.avatarUrl) ? { backgroundImage: `url(${avatarPreview || user.avatarUrl})`, backgroundSize: 'cover' } : {} }>
                {!(avatarPreview || user.avatarUrl) && formData.username?.[0]?.toUpperCase()}
              </div>
              <div className="avatar-info">
                <h3>Profile Picture</h3>
                <p>Upload a new avatar to personalize your account.</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  hidden 
                  id="avatarUpload" 
                  onChange={handleAvatarChange} 
                />
                <label htmlFor="avatarUpload" className="btn-ghost small">
                  <RiImageEditFill style={{marginRight: 4}}/> Change Avatar
                </label>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Full Name
                <div className="input-with-icon">
                  <RiUser3Fill />
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </label>

              <label>
                Username
                <div className="input-with-icon">
                  <RiShieldUserFill />
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
              </label>

              <label className="full-width">
                Email Address
                <div className="input-with-icon disabled">
                  <RiMailFill />
                  <input type="email" value={formData.email} disabled />
                </div>
                <small>Email cannot be changed as it is linked to your AWS account.</small>
              </label>

              <label className="full-width">
                Bio
                <textarea 
                  rows={4} 
                  value={formData.bio}
                  placeholder="Tell us about yourself..."
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </label>
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="btn-solid" disabled={loading}>
                <RiSave3Line /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
