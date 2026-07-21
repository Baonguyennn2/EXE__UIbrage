import { useState, useEffect } from 'react'
import { userService } from '../services/api'
import AppHeader from '../components/AppHeader.jsx'
import Toast from '../components/Toast.jsx'
import { 
  RiUser3Fill, RiBriefcaseFill, RiMapPin2Fill, RiGlobalFill,
  RiImageEditFill, RiSave3Line, RiCloseLine, RiZoomInLine, RiDragMoveLine,
  RiTerminalBoxLine
} from 'react-icons/ri'
import '../dashboard-redesign.css'

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
  const [activeFileType, setActiveFileType] = useState(null)

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null')
    if (!savedUser) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login'
      return
    }
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
  }, [])

  const handleFileChange = (e, fileType) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      if (fileType === 'avatar') {
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
      } else if (fileType === 'cover') {
        setCoverFile(file)
        setCoverPreview(URL.createObjectURL(file))
        setActiveFileType('cover')
        setShowCoverModal(true)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const data = new FormData()
      // Include username in the update
      Object.keys(formData).forEach(key => {
        if (key !== 'email') {
           data.append(key, formData[key])
        }
      })
      
      if (avatarFile) data.append('avatar', avatarFile)
      if (coverFile) data.append('coverImage', coverFile)

      const res = await userService.updateProfile(data)
      const updatedUser = res.data
      
      setNotification({ type: 'success', message: 'Identity node updated successfully.' })
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      window.dispatchEvent(new Event('authChange'))
    } catch (error) {
      console.error('Update Error:', error)
      setNotification({ type: 'error', message: error.response?.data?.message || 'Handshake failed.' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="loading-screen" style={{color: 'white', padding: '2rem'}}>Accessing Identity...</div>

  return (
    <div className="dashboard-layout" style={{ minHeight: isAdminContext ? 'auto' : '100vh' }}>
      
      {!isAdminContext && (
        <>
          
          <div className="fixed inset-0 cyber-grid pointer-events-none z-0"></div>
          <AppHeader />
        </>
      )}
      
      {notification && (
        <div className="toast-container" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }}>
          <Toast 
            type={notification.type} 
            message={notification.message} 
            onClose={() => setNotification(null)} 
          />
        </div>
      )}

      <main className="dashboard-container" style={{ padding: isAdminContext ? '0' : '3rem 1.5rem', maxWidth: isAdminContext ? '100%' : '1000px' }}>
        
        {!isAdminContext && (
          <header className="dashboard-header">
            <div className="dashboard-title-wrap">
              <h1 className="dashboard-title">Profile_Config</h1>
              <p className="dashboard-subtitle">Adjust neural identity parameters</p>
            </div>
          </header>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Cover & Avatar Section */}
          <section className="cyber-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '3rem' }}>
            {/* Cover Image */}
            <div style={{ 
              height: '240px', 
              background: (coverPreview || user.coverImageUrl) ? `url(${coverPreview || user.coverImageUrl})` : '#0a0a0f',
              backgroundSize: `${formData.coverZoom}% auto`,
              backgroundPosition: `center ${formData.coverPosition}%`,
              backgroundRepeat: 'no-repeat',
              position: 'relative',
              borderBottom: '1px solid var(--cyber-border)'
            }}>
              
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                <input type="file" accept="image/*" hidden id="coverUpload" onChange={(e) => handleFileChange(e, 'cover')} />
                <label htmlFor="coverUpload" style={{ 
                  background: 'rgba(0,0,0,0.8)', color: 'var(--cyber-cyan)', width: '40px', height: '40px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '1px solid var(--cyber-border)', transition: 'all 0.2s'
                }} title="Change Cover Node">
                  <RiImageEditFill size={20} />
                </label>
              </div>
              
              {(coverPreview || user.coverImageUrl) && (
                <button 
                  type="button" 
                  onClick={() => setShowCoverModal(true)}
                  style={{ 
                    position: 'absolute', bottom: '1.5rem', right: '1.5rem',
                    background: 'rgba(0,0,0,0.8)', color: 'white', border: '1px solid var(--cyber-border)',
                    padding: '0.5rem 1rem', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Edit_Calibration
                </button>
              )}
            </div>
            
            {/* Avatar & User Details */}
            <div style={{ padding: '0 2rem 2rem', marginTop: '-60px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '2rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '120px', height: '120px', 
                  background: '#05050a',
                  backgroundImage: (avatarPreview || user.avatarUrl) ? `url(${avatarPreview || user.avatarUrl})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem', fontWeight: 900, color: 'var(--cyber-cyan)',
                  border: '2px solid var(--cyber-cyan)',
                  boxShadow: '0 0 20px rgba(0,212,255,0.2)'
                }}>
                  {!(avatarPreview || user.avatarUrl) && formData.username?.[0]?.toUpperCase()}
                </div>
                
                <input type="file" accept="image/*" hidden id="avatarUpload" onChange={(e) => handleFileChange(e, 'avatar')} />
                <label htmlFor="avatarUpload" style={{ 
                  position: 'absolute', bottom: '-0.5rem', right: '-0.5rem', 
                  background: 'var(--cyber-cyan)', color: 'black', 
                  width: '2rem', height: '2rem', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', border: '1px solid var(--cyber-cyan)' 
                }}>
                  <RiImageEditFill size={16} />
                </label>
              </div>
              
              <div style={{ paddingBottom: '0.5rem' }}>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-cyber-heading)', fontSize: '2rem', color: 'white', textTransform: 'uppercase' }}>
                  {formData.fullName || formData.username}
                </h2>
                <p style={{ margin: 0, color: 'var(--cyber-cyan)', fontFamily: 'var(--font-cyber-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  ID: @{formData.username}
                </p>
              </div>
            </div>
          </section>

          {/* Core Settings */}
          <section className="cyber-card" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-cyber-heading)', fontSize: '1.25rem', color: 'white', textTransform: 'uppercase', marginBottom: '2rem', borderBottom: '1px solid var(--cyber-border)', paddingBottom: '1rem' }}>
              <RiTerminalBoxLine style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Node_Parameters
            </h3>
            
            <div className="profile-form-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="cyber-label">Username</label>
                  <div style={{ position: 'relative' }}>
                    <RiUser3Fill style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input type="text" className="cyber-input" style={{ paddingLeft: '2.5rem' }} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="@gameder_pro" />
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="cyber-label">Alias</label>
                  <div style={{ position: 'relative' }}>
                    <RiUser3Fill style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input type="text" className="cyber-input" style={{ paddingLeft: '2.5rem' }} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Display Name" />
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="cyber-label">Role_Designation</label>
                  <div style={{ position: 'relative' }}>
                    <RiBriefcaseFill style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input type="text" className="cyber-input" style={{ paddingLeft: '2.5rem' }} placeholder="e.g. Netrunner, UI Construct" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="cyber-label">System_Loc</label>
                  <div style={{ position: 'relative' }}>
                    <RiMapPin2Fill style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input type="text" className="cyber-input" style={{ paddingLeft: '2.5rem' }} placeholder="Sector 7, Neo Tokyo" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="cyber-label">External_Node</label>
                  <div style={{ position: 'relative' }}>
                    <RiGlobalFill style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input type="text" className="cyber-input" style={{ paddingLeft: '2.5rem' }} placeholder="https://yourlink.com" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="cyber-label">Bio_Signature</label>
                <textarea rows={8} className="cyber-input" style={{ width: '100%', minHeight: '200px', resize: 'vertical' }} placeholder="Input data stream..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
              <button type="submit" className="cyber-btn interactive-ripple" style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={loading}>
                <RiSave3Line /> {loading ? 'Transmitting...' : 'Upload_Config'}
              </button>
            </div>
          </section>
        </form>
      </main>

      {/* Cover Modal */}
      {showCoverModal && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', 
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
        }}>
          <div className="cyber-card" style={{ width: '100%', maxWidth: '800px', padding: 0 }}>
            <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--cyber-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-cyber-heading)', fontSize: '1.25rem', color: 'white', textTransform: 'uppercase' }}>Cover_Calibration</h2>
              <button onClick={() => setShowCoverModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><RiCloseLine size={24} /></button>
            </header>

            <div style={{ background: '#000', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                width: '100%', height: '240px', 
                background: `url(${coverPreview || user.coverImageUrl})`,
                backgroundSize: `${formData.coverZoom}% auto`,
                backgroundPosition: `center ${formData.coverPosition}%`,
                backgroundRepeat: 'no-repeat',
                border: '1px dashed rgba(0,212,255,0.5)'
              }} />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.7)' }} />
                <div style={{ height: '240px' }} />
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.7)' }} />
              </div>
            </div>

            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900, marginBottom: '1rem' }}>
                  <RiZoomInLine /> Zoom_Level
                </label>
                <input 
                  type="range" min="100" max="300" value={formData.coverZoom} 
                  onChange={(e) => setFormData({...formData, coverZoom: parseInt(e.target.value)})}
                  style={{ width: '100%', accentColor: 'var(--cyber-cyan)' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900, marginBottom: '1rem' }}>
                  <RiDragMoveLine /> Y-Axis_Align
                </label>
                <input 
                  type="range" min="0" max="100" value={formData.coverPosition} 
                  onChange={(e) => setFormData({...formData, coverPosition: parseInt(e.target.value)})}
                  style={{ width: '100%', accentColor: 'var(--cyber-cyan)' }}
                />
              </div>
            </div>

            <footer style={{ padding: '1.5rem', borderTop: '1px solid var(--cyber-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setShowCoverModal(false)} className="btn-ghost-cyber">Cancel</button>
              <button onClick={() => setShowCoverModal(false)} className="cyber-btn interactive-ripple" style={{ border: 'none' }}>Apply_Parameters</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
