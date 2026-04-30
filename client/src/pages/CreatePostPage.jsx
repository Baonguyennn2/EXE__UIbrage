import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { postService, metadataService } from '../services/api'
import { 
  RiBold, RiItalic, RiHeading, RiCodeLine, 
  RiDoubleQuotesL, RiListOrdered, RiImageAddLine,
  RiLink, RiCloseLine, RiLoader4Line
} from 'react-icons/ri'

export default function CreatePostPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    coverImage: null
  })
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allTags, setAllTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [tagSearch, setTagSearch] = useState('')
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [uploadingImages, setUploadingImages] = useState([])
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    metadataService.getTags().then(res => {
      setAllTags(res.data)
    })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }))
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const insertMarkdown = (before, after, textToInsert = null) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = textToInsert !== null ? textToInsert : text.substring(start, end)
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)
    const newCursorPos = start + before.length + selectedText.length
    
    setFormData(prev => ({ ...prev, content: newText }))
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
    
    return { start, end, newText, placeholder: textToInsert }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const textarea = textareaRef.current
    if (!textarea) return

    for (const file of files) {
      const id = Math.random().toString(36).substring(7)
      const placeholder = `\n![Uploading ${file.name}... (ID:${id})]()\n`
      
      insertMarkdown('', '', placeholder)
      setUploadingImages(prev => [...prev, id])
      
      const uploadData = new FormData()
      uploadData.append('image', file)

      try {
        const res = await postService.uploadImage(uploadData)
        const imageUrl = res.data.url
        const finalMarkdown = `\n![${file.name}](${imageUrl})\n`
        
        setFormData(prev => ({
          ...prev,
          content: prev.content.replace(placeholder, finalMarkdown)
        }))
      } catch (error) {
        console.error('Error uploading image:', error)
        setFormData(prev => ({
          ...prev,
          content: prev.content.replace(placeholder, `\n> ❌ Error uploading ${file.name}\n`)
        }))
      } finally {
        setUploadingImages(prev => prev.filter(item => item !== id))
      }
    }
  }

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.some(t => t.id === tag.id) 
        ? prev.filter(t => t.id !== tag.id) 
        : [...prev, tag]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (uploadingImages.length > 0) {
      return alert('Please wait for images to finish uploading.')
    }
    setIsSubmitting(true)

    const data = new FormData()
    data.append('title', formData.title)
    data.append('content', formData.content)
    const tagsString = selectedTags.map(t => t.name).join(', ')
    data.append('tags', tagsString)
    
    if (formData.coverImage) {
      data.append('coverImage', formData.coverImage)
    }

    try {
      await postService.create(data)
      navigate('/community')
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredTags = allTags.filter(t => 
    t.name.toLowerCase().includes(tagSearch.toLowerCase()) && 
    !selectedTags.some(st => st.id === t.id)
  ).slice(0, 10)

  return (
    <main className="market-home" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <AppHeader />
      
      <div className="post-create-container">
        <section className="post-create-card" style={{ maxWidth: '680px', padding: '1.5rem' }}>
          <header style={{ marginBottom: '1.25rem' }}>
            <h1 className="post-create-title" style={{ fontSize: '1.5rem' }}>Start a Discussion</h1>
            <p className="post-create-subtitle" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Connect with the UIbrage community.</p>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="post-form-group">
              <label style={{ fontSize: '0.75rem' }}>TITLE</label>
              <input 
                type="text" 
                name="title"
                className="post-input"
                style={{ padding: '0.6rem 0.85rem', fontSize: '0.95rem' }}
                value={formData.title}
                onChange={handleChange}
                placeholder="Give your discussion a catchy title..."
                required
              />
            </div>

            <div className="post-form-group">
              <label style={{ fontSize: '0.75rem' }}>COVER (OPTIONAL)</label>
              <div 
                className="image-upload-zone"
                onClick={() => fileInputRef.current.click()}
                style={{ 
                  height: '120px', 
                  border: '2px dashed #e2e8f0', 
                  borderRadius: '0.75rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: previewUrl ? '#fff' : '#f8fafc'
                }}
              >
                {previewUrl ? (
                  <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <RiImageAddLine size={24} />
                    <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>Click to upload</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
            </div>

            <div className="post-form-group">
              <label style={{ fontSize: '0.75rem' }}>TAGS</label>
              <div className="tag-input-wrapper-v3">
                <div className="selected-tags-v3">
                  {selectedTags.map(tag => (
                    <span key={tag.id} className="tag-pill-v3" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>
                      #{tag.name} <RiCloseLine onClick={() => toggleTag(tag)} />
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  className="post-input"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
                  placeholder="Type to search tags..." 
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  onFocus={() => setShowTagDropdown(true)}
                  onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                />
                {showTagDropdown && filteredTags.length > 0 && (
                  <div className="tag-results-v3">
                    {filteredTags.map(tag => (
                      <div key={tag.id} onClick={() => { toggleTag(tag); setTagSearch(''); }}>
                        {tag.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="post-form-group" style={{ marginTop: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem' }}>BODY CONTENT</label>
              <div className="markdown-toolbar" style={{ padding: '0.35rem' }}>
                <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('**', '**')}><RiBold /></button>
                <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('*', '*')}><RiItalic /></button>
                <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('# ', '')}><RiHeading /></button>
                <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('```\n', '\n```')}><RiCodeLine /></button>
                <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('> ', '')}><RiDoubleQuotesL /></button>
                <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('- ', '')}><RiListOrdered /></button>
                <button type="button" className="toolbar-btn" onClick={() => insertMarkdown('[', '](url)')}><RiLink /></button>
                <div style={{ width: 1, height: 18, background: '#e2e8f0', margin: '0 5px' }} />
                <label className="toolbar-btn" style={{ cursor: 'pointer' }}>
                  <RiImageAddLine />
                  <input type="file" hidden multiple onChange={handleImageUpload} accept="image/*" />
                </label>
              </div>
              <textarea 
                ref={textareaRef}
                id="postContentArea"
                name="content"
                className="post-input"
                value={formData.content}
                onChange={handleChange}
                placeholder="Share your story..."
                style={{ 
                  borderRadius: '0 0 0.75rem 0.75rem', 
                  minHeight: '220px',
                  borderTop: 'none',
                  fontSize: '0.9rem',
                  lineHeight: 1.6
                }}
                required
              />
              {uploadingImages.length > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <RiLoader4Line className="spinning" /> Uploading {uploadingImages.length} image(s)...
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-ghost" style={{ fontSize: '0.9rem' }} onClick={() => navigate('/community')}>Cancel</button>
              <button type="submit" className="btn-solid" disabled={isSubmitting || uploadingImages.length > 0} style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
                {isSubmitting ? 'Posting...' : 'Post Discussion'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
