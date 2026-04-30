import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { assetService, metadataService } from '../services/api'
import axios from 'axios'
import AppHeader from '../components/AppHeader.jsx'
import { 
  RiUploadCloud2Fill, RiImageAddLine, RiCheckLine, RiCloseLine,
  RiPriceTag3Line, RiFileZipLine,
  RiBold, RiItalic, RiH1, RiH2, RiH3, RiDoubleQuotesL, RiLink, RiListUnordered, RiListOrdered, RiCodeLine,
  RiSave3Line
} from 'react-icons/ri'

export default function UploadAssetPage({ isAdmin = false, variant = 'create' }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [allTags, setAllTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [tagSearch, setTagSearch] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(variant === 'edit')
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isFree: false,
    engine: 'Unity'
  })
  const [coverImage, setCoverImage] = useState(null)
  const [assetFile, setAssetFile] = useState(null)
  const [existingAsset, setExistingAsset] = useState(null)

  const insertMarkdown = (before, after) => {
    const textarea = document.getElementById('descriptionArea')
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end)
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)
    
    setFormData(prev => ({ ...prev, description: newText }))
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  useEffect(() => {
    Promise.all([
      metadataService.getCategories(),
      metadataService.getTags()
    ]).then(([catsRes, tagsRes]) => {
      const merged = [
        ...catsRes.data.map(c => ({ ...c, uniqueId: `cat-${c.id}` })),
        ...tagsRes.data.map(t => ({ ...t, uniqueId: `tag-${t.id}` }))
      ]
      const unique = Array.from(new Map(merged.map(item => [item.slug, item])).values())
      setAllTags(unique)
    })

    if (variant === 'edit' && id) {
      assetService.getById(id).then(res => {
        const asset = res.data
        setExistingAsset(asset)
        setFormData({
          title: asset.title,
          description: asset.description,
          price: asset.price,
          isFree: asset.isFree,
          engine: asset.engine || 'Unity'
        })
        if (asset.tags) {
           setSelectedTags(asset.tags.map(t => t.id))
        }
        setFetching(false)
      }).catch(err => {
        console.error('Error fetching asset', err)
        setFetching(false)
      })
    }
  }, [variant, id])

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
    if (variant === 'create' && (!coverImage || !assetFile)) return alert('Please upload both image and file')
    
    setLoading(true)
    
    const data = new FormData()
    data.append('title', formData.title)
    data.append('description', formData.description)
    data.append('price', formData.isFree ? 0 : (formData.price || 0))
    data.append('isFree', formData.isFree)
    data.append('engine', formData.engine)
    
    selectedTags.forEach(id => data.append('tagIds[]', id))
    
    if (coverImage) data.append('coverImage', coverImage)
    if (assetFile) data.append('assetFile', assetFile)

    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      if (variant === 'edit') {
        await axios.put(`${apiUrl}/assets/${id}`, data, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        })
        alert('Asset updated successfully!')
        navigate('/assets/manage')
      } else {
        await axios.post(`${apiUrl}/assets`, data, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          }
        })
        setShowSuccessModal(true)
      }
    } catch (error) {
      console.error('Upload/Update Error:', error)
      alert('Operation failed: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  if (fetching) return <div className="loading-screen">Loading asset data...</div>

  const cleanSearch = tagSearch.replace(/^#/, '').toLowerCase()
  const filteredTags = allTags.filter(t => 
    t.name.toLowerCase().includes(cleanSearch) && !selectedTags.includes(t.id)
  ).slice(0, 15)

  return (
    <div className={isAdmin ? "" : "upload-page-v3"}>
      {!isAdmin && <AppHeader />}
      
      <main className={isAdmin ? "" : "upload-container-v3"}>
        <h1 className="upload-title-v3">{variant === 'edit' ? 'Edit Asset' : 'Upload New Asset'}</h1>
        
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
            <label className="label-v3">DESCRIPTION (MARKDOWN SUPPORTED)</label>
            
            <div className="markdown-toolbar">
              <button type="button" className="toolbar-btn" title="Bold" onClick={() => insertMarkdown('**', '**')}><RiBold /></button>
              <button type="button" className="toolbar-btn" title="Italic" onClick={() => insertMarkdown('_', '_')}><RiItalic /></button>
              <button type="button" className="toolbar-btn" title="H1" onClick={() => insertMarkdown('# ', '')}><RiH1 /></button>
              <button type="button" className="toolbar-btn" title="H2" onClick={() => insertMarkdown('## ', '')}><RiH2 /></button>
              <button type="button" className="toolbar-btn" title="H3" onClick={() => insertMarkdown('### ', '')}><RiH3 /></button>
              <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 4px' }} />
              <button type="button" className="toolbar-btn" title="Quote" onClick={() => insertMarkdown('> ', '')}><RiDoubleQuotesL /></button>
              <button type="button" className="toolbar-btn" title="Code" onClick={() => insertMarkdown('```\n', '\n```')}><RiCodeLine /></button>
              <button type="button" className="toolbar-btn" title="Link" onClick={() => insertMarkdown('[', '](url)')}><RiLink /></button>
              <button type="button" className="toolbar-btn" title="Unordered List" onClick={() => insertMarkdown('- ', '')}><RiListUnordered /></button>
              <button type="button" className="toolbar-btn" title="Ordered List" onClick={() => insertMarkdown('1. ', '')}><RiListOrdered /></button>
            </div>

            <textarea 
              id="descriptionArea"
              className="textarea-v3"
              rows={12} 
              name="description"
              placeholder="Explain what makes your asset special..."
              value={formData.description}
              onChange={handleInputChange}
              style={{ borderRadius: '0 0 0.75rem 0.75rem' }}
            />
          </div>

          <div className="upload-row-v3">
            <div className="upload-box-v3">
              <label className="label-v3">PREVIEW IMAGE {variant === 'edit' && '(LEAVE BLANK TO KEEP CURRENT)'}</label>
              <div className="drop-zone-v3">
                <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} hidden id="coverInput" />
                <label htmlFor="coverInput" className="drop-content-v3">
                  <RiImageAddLine className="icon-v3" />
                  <p className="truncate-text">{coverImage ? coverImage.name : (variant === 'edit' ? 'Keep current image' : 'Drop cover image here')}</p>
                </label>
              </div>
            </div>

            <div className="upload-box-v3">
              <label className="label-v3">ASSET FILE (ZIP) {variant === 'edit' && '(LEAVE BLANK TO KEEP CURRENT)'}</label>
              <div className="drop-zone-v3">
                <input type="file" accept=".zip,.rar" onChange={(e) => setAssetFile(e.target.files[0])} hidden id="fileInput" />
                <label htmlFor="fileInput" className="drop-content-v3">
                  <RiFileZipLine className="icon-v3" />
                  <p className="truncate-text">{assetFile ? assetFile.name : (variant === 'edit' ? 'Keep current ZIP' : 'Upload source files')}</p>
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
                  <button type="button" className={!formData.isFree ? 'active' : ''} onClick={() => setFormData(p => ({ ...p, isFree: false }))}>PAID</button>
                  <button type="button" className={formData.isFree ? 'active' : ''} onClick={() => setFormData(p => ({ ...p, isFree: true, price: '' }))}>FREE</button>
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
                      <span key={tag.uniqueId} className="tag-pill-v3">
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
                  onFocus={() => setShowTagDropdown(true)}
                  onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                />
                {showTagDropdown && filteredTags.length > 0 && (
                  <div className="tag-results-v3">
                    {filteredTags.map(tag => (
                      <div key={tag.uniqueId} onClick={() => { toggleTag(tag.id); setTagSearch(''); setShowTagDropdown(false); }}>
                        {tag.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading && variant === 'create' && (
            <div className="upload-progress-container-v3">
              <div className="progress-bar-v3">
                <div className="progress-fill-v3" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span>{uploadProgress}% Uploading...</span>
            </div>
          )}

          <div className="form-actions-v3">
            <button className="btn-cancel-v3" onClick={() => navigate(-1)}>Cancel</button>
            <button 
              className="btn-publish-v3" 
              onClick={handlePublish}
              disabled={loading}
            >
              {loading ? (variant === 'edit' ? 'Saving...' : 'Publishing...') : (variant === 'edit' ? 'Save Changes' : 'Publish Asset')}
            </button>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon-bg"><RiCheckLine /></div>
            <h2>Upload Successful!</h2>
            <p>Your asset has been published successfully.</p>
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
