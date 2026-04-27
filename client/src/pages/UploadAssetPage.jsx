import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assetService, metadataService } from '../services/api'
import AppHeader from '../components/AppHeader.jsx'
import { 
  RiUploadCloud2Fill, RiImageAddLine, RiCheckLine, RiCloseLine,
  RiPriceTag3Line, RiFileZipLine
} from 'react-icons/ri'

export default function UploadAssetPage() {
  const navigate = useNavigate()
  const [allTags, setAllTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [tagSearch, setTagSearch] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isFree: false,
    engine: 'Unity'
  })
  const [coverImage, setCoverImage] = useState(null)
  const [assetFile, setAssetFile] = useState(null)

  useEffect(() => {
    // Load both categories and tags to use as hashtags
    Promise.all([
      metadataService.getCategories(),
      metadataService.getTags()
    ]).then(([catsRes, tagsRes]) => {
      // Merge categories and tags into a single "Hashtag" pool
      const merged = [...catsRes.data, ...tagsRes.data]
      // Remove duplicates by slug if any
      const unique = Array.from(new Map(merged.map(item => [item.slug, item])).values())
      setAllTags(unique)
    })
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const handlePublish = async () => {
    if (!formData.title) return alert('Please enter asset name')
    if (!coverImage || !assetFile) return alert('Please upload both image and file')
    
    setLoading(true)
    const data = new FormData()
    data.append('title', formData.title)
    data.append('description', formData.description)
    data.append('price', formData.isFree ? 0 : (formData.price || 0))
    data.append('isFree', formData.isFree)
    data.append('engine', formData.engine)
    
    // Send selected tags
    selectedTags.forEach(id => data.append('tagIds[]', id))
    
    // Files
    data.append('coverImage', coverImage)
    data.append('assetFile', assetFile)

    try {
      await assetService.add(data)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Upload Error:', error)
      alert('Upload failed: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const filteredTags = allTags.filter(t => 
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  ).slice(0, 10) // Show top 10 matches

  return (
    <div className="upload-page-v3">
      <AppHeader />
      
      <main className="upload-container-v3">
        <h1 className="upload-title-v3">Upload New Asset</h1>
        
        <div className="upload-card-v3">
          <div className="form-section-v3">
            <label className="label-v3">ASSET NAME</label>
            <input 
              className="input-v3"
              type="text" 
              name="title"
              placeholder="e.g. Cyberpunk Interface Kit v2.0"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-section-v3">
            <label className="label-v3">DESCRIPTION</label>
            <textarea 
              className="textarea-v3"
              rows={5} 
              name="description"
              placeholder="Explain what makes your asset special..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="upload-row-v3">
            <div className="upload-box-v3">
              <label className="label-v3">PREVIEW IMAGE</label>
              <div className="drop-zone-v3">
                <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} hidden id="coverInput" />
                <label htmlFor="coverInput" className="drop-content-v3">
                  <RiImageAddLine className="icon-v3" />
                  <p>{coverImage ? coverImage.name : 'Drop cover image here'}</p>
                  <small>PNG, JPG up to 10MB</small>
                </label>
              </div>
            </div>

            <div className="upload-box-v3">
              <label className="label-v3">ASSET FILE (ZIP)</label>
              <div className="drop-zone-v3">
                <input type="file" accept=".zip,.rar" onChange={(e) => setAssetFile(e.target.files[0])} hidden id="fileInput" />
                <label htmlFor="fileInput" className="drop-content-v3">
                  <RiFileZipLine className="icon-v3" />
                  <p>{assetFile ? assetFile.name : 'Upload source files'}</p>
                  <small>ZIP, 7Z or RAR</small>
                </label>
              </div>
            </div>
          </div>

          <div className="upload-row-v3">
            <div className="pricing-section-v3">
              <label className="label-v3">PRICING</label>
              <div className="price-control-v3">
                <div className="price-input-v3">
                  <span>$</span>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    disabled={formData.isFree}
                  />
                </div>
                <div className="toggle-v3">
                  <button 
                    className={!formData.isFree ? 'active' : ''} 
                    onClick={() => setFormData(p => ({ ...p, isFree: false }))}
                  >PAID</button>
                  <button 
                    className={formData.isFree ? 'active' : ''} 
                    onClick={() => setFormData(p => ({ ...p, isFree: true }))}
                  >FREE</button>
                </div>
              </div>
            </div>

            <div className="tags-section-v3">
              <label className="label-v3">TAGS</label>
              <div className="tag-input-wrapper-v3">
                <div className="selected-tags-v3">
                  {selectedTags.map(id => {
                    const tag = allTags.find(t => t.id === id)
                    return tag ? (
                      <span key={id} className="tag-pill-v3">
                        {tag.name} <RiCloseLine onClick={() => toggleTag(id)} />
                      </span>
                    ) : null
                  })}
                </div>
                <input 
                  type="text" 
                  placeholder="Add tag..." 
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                />
                {tagSearch && (
                  <div className="tag-results-v3">
                    {filteredTags.map(tag => (
                      <div key={tag.id} onClick={() => { toggleTag(tag.id); setTagSearch(''); }}>
                        {tag.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions-v3">
            <button className="btn-cancel-v3" onClick={() => navigate(-1)}>Cancel</button>
            <button 
              className="btn-publish-v3" 
              onClick={handlePublish}
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish Asset'}
            </button>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon-bg"><RiCheckLine /></div>
            <h2>Upload Successful!</h2>
            <p>Your asset is pending approval.</p>
            <div className="modal-actions">
              <button className="btn-solid" onClick={() => navigate('/marketplace')}>Go to Marketplace</button>
              <button className="btn-ghost" onClick={() => setShowSuccessModal(false)}>Upload Another</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
