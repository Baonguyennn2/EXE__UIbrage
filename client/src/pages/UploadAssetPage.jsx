import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assetService } from '../services/api'
import AppHeader from '../components/AppHeader.jsx'
import { RiUploadCloud2Fill, RiImageAddLine, RiFileZipLine, RiArrowLeftLine } from 'react-icons/ri'

export default function UploadAssetPage() {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  
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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setIsAdmin(user.role === 'admin')
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e, setter) => {
    if (e.target.files) setter(e.target.files[0])
  }

  const handleScreenshotsChange = (e) => {
    if (e.target.files) setScreenshots(Array.from(e.target.files))
  }

  const handlePublish = async () => {
    setLoading(true)
    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    if (coverImage) data.append('coverImage', coverImage)
    if (assetFile) data.append('assetFile', assetFile)
    screenshots.forEach(file => data.append('screenshots', file))

    try {
      await assetService.add(data)
      alert('Asset uploaded successfully and pending approval!')
      navigate(isAdmin ? '/admin/dashboard' : '/marketplace')
    } catch (error) {
      console.error('Error uploading asset:', error)
      alert('Upload failed: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const renderForm = () => (
    <div className="upload-form-wrapper">
      <header className="upload-header">
        <div className="upload-header__content">
          <h1>Upload New Asset</h1>
          <p>Share your creative game assets with the UIbrage community.</p>
        </div>
        {!isAdmin && (
          <button className="btn-ghost" onClick={() => navigate(-1)}>
            <RiArrowLeftLine /> Back
          </button>
        )}
      </header>

      <div className="upload-grid">
        <div className="upload-main-col">
          <section className="surface-card upload-section">
            <div className="section-title">
              <RiImageAddLine />
              <h3>Media & Files</h3>
            </div>
            
            <div className="file-upload-row">
              <div className="file-drop-zone">
                <label>
                  <span>Cover Image</span>
                  <input type="file" onChange={(e) => handleFileChange(e, setCoverImage)} accept="image/*" />
                  <div className="drop-zone-display">
                    {coverImage ? coverImage.name : 'Select or drop a cover image (16:9 recommended)'}
                  </div>
                </label>
              </div>

              <div className="file-drop-zone">
                <label>
                  <span>Asset Package (ZIP)</span>
                  <input type="file" onChange={(e) => handleFileChange(e, setAssetFile)} accept=".zip,.rar,.7z" />
                  <div className="drop-zone-display drop-zone-display--blue">
                    {assetFile ? assetFile.name : 'Select your asset file (ZIP/RAR)'}
                  </div>
                </label>
              </div>
            </div>

            <div className="screenshot-upload">
              <label>
                <span>Screenshots (Max 10)</span>
                <input type="file" multiple onChange={handleScreenshotsChange} accept="image/*" />
                <div className="screenshot-placeholder">
                  {screenshots.length > 0 ? `${screenshots.length} files selected` : 'Upload gallery images to show off your asset'}
                </div>
              </label>
            </div>
          </section>

          <section className="surface-card upload-section">
            <div className="section-title">
              <RiUploadCloud2Fill />
              <h3>General Information</h3>
            </div>
            <div className="form-group">
              <label>Asset Title</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Fantasy RPG Icons Pack" 
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                rows={6} 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your asset features, content, and instructions..." 
              />
            </div>
          </section>
        </div>

        <aside className="upload-side-col">
          <section className="surface-card upload-section">
            <div className="section-title"><h3>Properties</h3></div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="Fantasy">Fantasy</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="RPG">RPG</option>
                <option value="Minimalist">Minimalist</option>
              </select>
            </div>
            <div className="form-group">
              <label>Engine</label>
              <select name="engine" value={formData.engine} onChange={handleInputChange}>
                <option value="Unity">Unity</option>
                <option value="Unreal">Unreal</option>
                <option value="Godot">Godot</option>
              </select>
            </div>
          </section>

          <section className="surface-card upload-section">
            <div className="section-title"><h3>Pricing</h3></div>
            <div className="form-group">
              <label>Price (USD)</label>
              <input 
                type="number" 
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                disabled={formData.isFree}
              />
            </div>
            <label className="checkbox-row">
              <input 
                type="checkbox" 
                name="isFree"
                checked={formData.isFree}
                onChange={handleInputChange}
              /> Free Asset
            </label>
          </section>

          <button 
            className="btn-solid btn-full-width" 
            onClick={handlePublish}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Publish Asset'}
          </button>
        </aside>
      </div>
    </div>
  )

  if (!isAdmin) {
    return (
      <div className="customer-upload-layout">
        <AppHeader />
        <main className="upload-container">
          {renderForm()}
        </main>
      </div>
    )
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <span className="admin-brand__tile" />
          <strong>UIbrage</strong>
        </div>
        <div className="admin-user">
          <div className="avatar-circle">A</div>
          <div>
            <strong>Admin Panel</strong>
            <small>Administrator</small>
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
          <div className="admin-sidebar__bottom">
            <button type="button" onClick={() => navigate('/marketplace')}>Exit Admin</button>
          </div>
        </aside>

        <section className="admin-content">
          {renderForm()}
        </section>
      </section>
    </main>
  )
}
