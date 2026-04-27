import { useState, useEffect } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import Toast from '../components/Toast.jsx'
import { RiUser3Fill, RiMailFill, RiShieldUserFill, RiSave3Line } from 'react-icons/ri'

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Placeholder for actual update logic
    setTimeout(() => {
      setNotification({ type: 'success', message: 'Profile updated successfully!' })
      setLoading(false)
      // Update local storage too
      const updated = { ...user, ...formData }
      localStorage.setItem('user', JSON.stringify(updated))
    }, 1000)
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
              <div className="avatar-preview">
                {formData.username?.[0]?.toUpperCase()}
              </div>
              <div className="avatar-info">
                <h3>Profile Picture</h3>
                <p>Upload a new avatar to personalize your account.</p>
                <button type="button" className="btn-ghost small">Change Avatar</button>
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
