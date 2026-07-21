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
      const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : 'https://exe-uibrage.onrender.com/api')
      
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
    <div className={isAdmin ? "" : "dashboard-layout"}>
      {!isAdmin && (
        <>
          <div className="cyber-grid-bg" style={{ opacity: 0.05, position: 'fixed', inset: 0, zIndex: 0 }}></div>
          <AppHeader />
        </>
      )}
      
      <main className={isAdmin ? "" : "dashboard-main"} style={{ position: 'relative', zIndex: 10, flex: 1, padding: isAdmin ? '0' : '2rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1000px', width: '100%', display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontFamily: 'var(--font-cyber-heading)', fontSize: '2rem', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--cyber-foreground)' }}>
            [SYSTEM_ACCESS]: {variant === 'edit' ? 'EDIT_ASSET' : 'UPLOAD_NEW_ASSET'}
          </h1>
          
          <div className="cyber-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--cyber-accent-tertiary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em' }}>[ASSET_NAME]</label>
            <input 
              className="cyber-input"
              type="text" 
              name="title"
              placeholder="e.g. Cyberpunk Interface Kit v2.0"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--cyber-accent-tertiary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em' }}>[DESCRIPTION] (MARKDOWN SUPPORTED)</label>
            <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--cyber-card)', padding: '0.5rem', border: '1px solid var(--cyber-border)', borderBottom: 'none', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
              <button type="button" className="cyber-btn-ghost" style={{ padding: '0.4rem' }} title="Bold" onClick={() => insertMarkdown('**', '**')}><RiBold size={16} /></button>
              <button type="button" className="cyber-btn-ghost" style={{ padding: '0.4rem' }} title="Italic" onClick={() => insertMarkdown('_', '_')}><RiItalic size={16} /></button>
              <button type="button" className="cyber-btn-ghost" style={{ padding: '0.4rem' }} title="H1" onClick={() => insertMarkdown('# ', '')}><RiH1 size={16} /></button>
              <button type="button" className="cyber-btn-ghost" style={{ padding: '0.4rem' }} title="H2" onClick={() => insertMarkdown('## ', '')}><RiH2 size={16} /></button>
              <button type="button" className="cyber-btn-ghost" style={{ padding: '0.4rem' }} title="H3" onClick={() => insertMarkdown('### ', '')}><RiH3 size={16} /></button>
              <div style={{ width: 1, height: 20, background: 'var(--cyber-border)', margin: '0 4px', alignSelf: 'center' }} />
              <button type="button" className="cyber-btn-ghost" style={{ padding: '0.4rem' }} title="Quote" onClick={() => insertMarkdown('> ', '')}><RiDoubleQuotesL size={16} /></button>
              <button type="button" className="cyber-btn-ghost" style={{ padding: '0.4rem' }} title="Code" onClick={() => insertMarkdown('```\n', '\n```')}><RiCodeLine size={16} /></button>
              <button type="button" className="cyber-btn-ghost" style={{ padding: '0.4rem' }} title="Link" onClick={() => insertMarkdown('[', '](url)')}><RiLink size={16} /></button>
              <button type="button" className="cyber-btn-ghost" style={{ padding: '0.4rem' }} title="Unordered List" onClick={() => insertMarkdown('- ', '')}><RiListUnordered size={16} /></button>
              <button type="button" className="cyber-btn-ghost" style={{ padding: '0.4rem' }} title="Ordered List" onClick={() => insertMarkdown('1. ', '')}><RiListOrdered size={16} /></button>
            </div>

            <textarea 
              id="descriptionArea"
              className="cyber-input"
              rows={12} 
              name="description"
              placeholder="Explain what makes your asset special..."
              value={formData.description}
              onChange={handleInputChange}
              style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, minHeight: '300px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--cyber-accent-tertiary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em' }}>[PREVIEW_IMAGE] {variant === 'edit' && '(OPTIONAL)'}</label>
              <div style={{ flex: 1, border: '2px dashed var(--cyber-border)', borderRadius: '8px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.2s', ':hover': { borderColor: 'var(--cyber-accent)' } }} onClick={() => document.getElementById('coverInput').click()}>
                <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} hidden id="coverInput" />
                <RiImageAddLine size={32} color="var(--cyber-accent)" />
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>
                  {coverImage ? coverImage.name : (variant === 'edit' ? 'Keep current image' : 'Drop cover image here')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--cyber-accent-tertiary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em' }}>[SOURCE_FILE_.ZIP] {variant === 'edit' && '(OPTIONAL)'}</label>
              <div style={{ flex: 1, border: '2px dashed var(--cyber-border)', borderRadius: '8px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.2s', ':hover': { borderColor: 'var(--cyber-accent-secondary)' } }} onClick={() => document.getElementById('fileInput').click()}>
                <input type="file" accept=".zip,.rar" onChange={(e) => setAssetFile(e.target.files[0])} hidden id="fileInput" />
                <RiFileZipLine size={32} color="var(--cyber-accent-secondary)" />
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>
                  {assetFile ? assetFile.name : (variant === 'edit' ? 'Keep current ZIP' : 'Upload source files')}
                </p>
              </div>
              {variant === 'edit' && existingAsset?.fileUrl && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <button type="button" className="cyber-btn-outline" onClick={() => window.open(existingAsset.fileUrl, '_blank')} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    DOWNLOAD_CURRENT_ZIP
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--cyber-accent-tertiary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em' }}>[PRICING]</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>$</span>
                  <input 
                    className="cyber-input"
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    disabled={formData.isFree}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                <div style={{ display: 'flex', background: 'var(--cyber-input)', borderRadius: '4px', overflow: 'hidden' }}>
                  <button type="button" className={`cyber-btn-ghost ${!formData.isFree ? 'active' : ''}`} onClick={() => setFormData(p => ({ ...p, isFree: false }))} style={{ borderRadius: 0, padding: '0.5rem 1rem' }}>PAID</button>
                  <button type="button" className={`cyber-btn-ghost ${formData.isFree ? 'active' : ''}`} onClick={() => setFormData(p => ({ ...p, isFree: true, price: '' }))} style={{ borderRadius: 0, padding: '0.5rem 1rem' }}>FREE</button>
                </div>
              </div>
              
              {!formData.isFree && formData.price > 0 && (
                <div className="cyber-table" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--cyber-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#94a3b8' }}>
                    <span>Your Earnings:</span>
                    <strong style={{ color: 'var(--cyber-accent)' }}>${parseFloat(formData.price).toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#94a3b8' }}>
                    <span>Platform Fee (5%):</span>
                    <strong style={{ color: 'var(--cyber-destructive)' }}>+${(parseFloat(formData.price) * 0.05).toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--cyber-border)', color: 'var(--cyber-foreground)' }}>
                    <span>Final Marketplace Price:</span>
                    <span>${(parseFloat(formData.price) * 1.05).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--cyber-accent-tertiary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em' }}>[SYSTEM_TAGS]</label>
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {selectedTags.map(id => {
                    const tag = allTags.find(t => t.id === id)
                    return tag ? (
                      <span key={tag.uniqueId} className="tag-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {tag.name} <RiCloseLine style={{ cursor: 'pointer' }} onClick={() => toggleTag(id)} />
                      </span>
                    ) : null
                  })}
                </div>
                <input 
                  className="cyber-input"
                  type="text" 
                  placeholder="Type to search tags..." 
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  onFocus={() => setShowTagDropdown(true)}
                  onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                />
                {showTagDropdown && filteredTags.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--cyber-panel)', border: '1px solid var(--cyber-border)', zIndex: 50, maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredTags.map(tag => (
                      <div 
                        key={tag.uniqueId} 
                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--cyber-border)' }}
                        onClick={() => { toggleTag(tag.id); setTagSearch(''); setShowTagDropdown(false); }}
                      >
                        {tag.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading && variant === 'create' && (
            <div style={{ background: 'var(--cyber-input)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ width: '100%', height: '4px', background: 'var(--cyber-border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--cyber-accent)', transition: 'width 0.2s' }}></div>
              </div>
              <span style={{ color: 'var(--cyber-accent)', fontSize: '0.85rem' }}>[UPLOADING_DATA]... {uploadProgress}%</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--cyber-border)', paddingTop: '2rem' }}>
            <button className="cyber-btn-ghost" onClick={() => navigate(-1)}>CANCEL_SEQ</button>
            <button 
              className="cyber-btn interactive-ripple" 
              onClick={handlePublish}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RiSave3Line /> {loading ? (variant === 'edit' ? 'SAVING...' : 'PUBLISHING...') : (variant === 'edit' ? 'SAVE_CHANGES' : 'PUBLISH_ASSET')}
            </button>
          </div>
        </div>
        </div>
      </main>

      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="cyber-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(0,255,136,0.1)', color: 'var(--cyber-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '1px solid var(--cyber-accent)' }}>
              <RiCheckLine />
            </div>
            <h2 style={{ fontFamily: 'var(--font-cyber-heading)', letterSpacing: '0.1em' }}>UPLOAD_SUCCESS</h2>
            <p style={{ color: '#94a3b8' }}>Your data packet has been integrated into the central network.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '1rem' }}>
              <button className="cyber-btn" onClick={() => navigate('/marketplace')}>VIEW_MARKETPLACE</button>
              <button className="cyber-btn-outline" onClick={() => setShowSuccessModal(false)}>UPLOAD_ANOTHER</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
