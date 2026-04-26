import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminService } from '../services/api'

const uploadVariants = {
  create: { title: 'Upload New Asset', action: 'Publish Asset' },
  review: { title: 'Upload New Asset', action: 'Publish Asset' },
}

export default function UploadAssetPage({ variant = 'create' }) {
  const content = uploadVariants[variant] ?? uploadVariants.create
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    price: '',
    engine: 'Unity',
    category: 'Fantasy',
    licenseType: 'standard',
    isFree: false
  })
  const [coverImage, setCoverImage] = useState(null)
  const [assetFile, setAssetFile] = useState(null)
  const [screenshots, setScreenshots] = useState([])
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e, setter) => {
    if (e.target.files) {
      setter(e.target.files[0])
    }
  }

  const handleScreenshotsChange = (e) => {
    if (e.target.files) {
      setScreenshots(Array.from(e.target.files))
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    if (coverImage) data.append('coverImage', coverImage)
    if (assetFile) data.append('assetFile', assetFile)
    screenshots.forEach(file => data.append('screenshots', file))

    try {
      await adminService.upload(data)
      alert('Asset uploaded successfully and pending approval!')
      navigate('/admin/dashboard')
    } catch (error) {
      console.error('Error uploading asset:', error)
      alert('Upload failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <span className="admin-brand__tile" />
          <strong>UIbrage</strong>
        </div>
        <div className="admin-user">
          <span>🔔</span>
          <div>
            <strong>Alex Rivera</strong>
            <small>Admin</small>
          </div>
        </div>
      </header>

      <section className="admin-layout">
        <aside className="admin-sidebar">
          <h4>Main Menu</h4>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/my-assets">My Assets</Link>
          <Link to="/admin/upload-asset" className="active">Upload Asset</Link>
          <Link to="/admin/creators">Creators</Link>
          <Link to="/admin/asset-approval">Asset Approval</Link>
          <Link to="/community">Messages</Link>
          <div className="admin-sidebar__bottom">
            <button type="button">Settings</button>
            <button type="button" className="danger">Logout</button>
          </div>
        </aside>

        <section className="admin-content upload-admin">
          <section className="adminx-header adminx-header--compact">
            <h1>{content.title}</h1>
          </section>

          <section className="surface-card adminx-upload-section">
            <h3><span>1</span> Media Assets</h3>
            <label>Main Cover Image</label>
            <input type="file" onChange={(e) => handleFileChange(e, setCoverImage)} />
            
            <label>Asset File (ZIP/RAR)</label>
            <input type="file" onChange={(e) => handleFileChange(e, setAssetFile)} />

            <label>Screenshots (Up to 10)</label>
            <input type="file" multiple onChange={handleScreenshotsChange} />
          </section>

          <section className="surface-card adminx-upload-section">
            <h3><span>2</span> Asset Details</h3>
            <div className="adminx-upload-form-grid">
              <label>
                Asset Title
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Modern Cyberpunk HUD Pack" 
                />
              </label>
              <label>
                Description
                <textarea 
                  rows={4} 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the features, layout, and contents of your pack..." 
                />
              </label>
              <label>
                Tags
                <input 
                  type="text" 
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Separated by commas (e.g. rpg, sci-fi, 4k, vector)" 
                />
              </label>
            </div>
          </section>

          <section className="surface-card adminx-upload-section">
            <h3><span>3</span> Technical Spec</h3>
            <div className="adminx-upload-form-grid">
               <label>
                Engine
                <select name="engine" value={formData.engine} onChange={handleInputChange}>
                  <option value="Unity">Unity</option>
                  <option value="Unreal">Unreal</option>
                  <option value="Godot">Godot</option>
                </select>
              </label>
              <label>
                Category
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="RPG">RPG</option>
                  <option value="Casual">Casual</option>
                </select>
              </label>
            </div>
          </section>

          <section className="surface-card adminx-upload-section">
            <h3><span>4</span> Pricing & Distribution</h3>
            <div className="adminx-upload-form-grid adminx-upload-form-grid--two-col">
              <label>
                Price (USD)
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="29.99" 
                />
              </label>
              <label>
                License Type
                <select name="licenseType" value={formData.licenseType} onChange={handleInputChange}>
                  <option value="standard">Standard Commercial</option>
                  <option value="extended">Extended Commercial</option>
                </select>
              </label>
              <label className="adminx-upload-check-row">
                <input 
                  type="checkbox" 
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleInputChange}
                /> Make this asset available for free
              </label>
            </div>
          </section>

          <div className="adminx-upload-actions">
            <button type="button" className="library-btn-muted">Save Draft</button>
            <button 
              type="button" 
              className="btn-solid" 
              onClick={handlePublish}
              disabled={loading}
            >
              {loading ? 'Uploading...' : content.action}
            </button>
          </div>
        </section>
      </section>
    </main>
  )
}
