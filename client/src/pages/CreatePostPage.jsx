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
    <div className="dashboard-layout">
      <div className="cyber-grid-bg" style={{ opacity: 0.05, position: 'fixed', inset: 0, zIndex: 0 }}></div>
      <AppHeader />

      <main className="dashboard-main" style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem', position: 'relative', zIndex: 10 }}>
        <button type="button" className="cyber-btn-outline" onClick={() => navigate('/community')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0.5rem 1rem', minHeight: 'auto', fontSize: '0.85rem', clipPath: 'none', background: 'var(--cyber-muted)' }}>
          <RiCloseLine /> CANCEL
        </button>

        <section className="cyber-card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--cyber-accent)' }}></div>

          <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--cyber-border)', paddingBottom: '1.5rem' }}>
            <h1 className="cyber-glitch-text" data-text="START_A_DISCUSSION" style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-cyber-heading)', textTransform: 'uppercase', color: '#fff' }}>START_A_DISCUSSION</h1>
            <p style={{ color: 'var(--cyber-accent-secondary)', fontSize: '0.9rem', fontFamily: 'var(--font-cyber-mono)', margin: 0, letterSpacing: '0.05em' }}>// CONNECT_WITH_THE_SYSTEM_COMMUNITY</p>
          </header>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: 'var(--cyber-accent)' }}>TITLE</label>
              <input
                type="text"
                name="title"
                className="cyber-input"
                style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                value={formData.title}
                onChange={handleChange}
                placeholder="ENTER_DISCUSSION_TITLE..."
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: 'var(--cyber-accent)' }}>COVER (OPTIONAL)</label>
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  height: '150px',
                  border: '1px dashed var(--cyber-accent-tertiary)',
                  background: previewUrl ? '#000' : 'rgba(0, 212, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {previewUrl ? (
                  <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--cyber-accent-tertiary)' }}>
                    <RiImageAddLine size={32} style={{ marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontSize: '0.85rem', fontFamily: 'var(--font-cyber-mono)' }}>CLICK_TO_UPLOAD_COVER</p>
                  </div>
                )}
                {previewUrl && <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--cyber-accent-tertiary)', pointerEvents: 'none' }}></div>}
              </div>
              <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: 'var(--cyber-accent)' }}>TAGS</label>
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {selectedTags.map(tag => (
                    <span key={tag.id} className="cyber-btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', minHeight: 'auto', clipPath: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,212,255,0.1)' }}>
                      #{tag.name} <RiCloseLine style={{ cursor: 'pointer' }} onClick={() => toggleTag(tag)} />
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="cyber-input"
                  style={{ width: '100%', padding: '1rem' }}
                  placeholder="SEARCH_AND_ADD_TAGS..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  onFocus={() => setShowTagDropdown(true)}
                  onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                />
                {showTagDropdown && filteredTags.length > 0 && (
                  <div className="cyber-card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: '0.5rem', padding: '0.5rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--cyber-accent-tertiary)' }}>
                    {filteredTags.map(tag => (
                      <div
                        key={tag.id}
                        onClick={() => { toggleTag(tag); setTagSearch(''); }}
                        style={{ padding: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.9rem', color: 'var(--cyber-foreground)', borderBottom: '1px solid rgba(0,212,255,0.1)' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,212,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        #{tag.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.85rem', color: 'var(--cyber-accent)' }}>BODY CONTENT</label>
              <div style={{ border: '1px solid var(--cyber-border)', background: 'rgba(5, 5, 10, 0.4)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', padding: '0.75rem', borderBottom: '1px solid var(--cyber-border)', background: 'rgba(0, 212, 255, 0.05)' }}>
                  <button type="button" onClick={() => insertMarkdown('**', '**')} style={{ background: 'none', border: 'none', color: 'var(--cyber-foreground)', padding: '0.4rem', cursor: 'pointer' }}><RiBold /></button>
                  <button type="button" onClick={() => insertMarkdown('*', '*')} style={{ background: 'none', border: 'none', color: 'var(--cyber-foreground)', padding: '0.4rem', cursor: 'pointer' }}><RiItalic /></button>
                  <button type="button" onClick={() => insertMarkdown('# ', '')} style={{ background: 'none', border: 'none', color: 'var(--cyber-foreground)', padding: '0.4rem', cursor: 'pointer' }}><RiHeading /></button>
                  <button type="button" onClick={() => insertMarkdown('```\n', '\n```')} style={{ background: 'none', border: 'none', color: 'var(--cyber-foreground)', padding: '0.4rem', cursor: 'pointer' }}><RiCodeLine /></button>
                  <button type="button" onClick={() => insertMarkdown('> ', '')} style={{ background: 'none', border: 'none', color: 'var(--cyber-foreground)', padding: '0.4rem', cursor: 'pointer' }}><RiDoubleQuotesL /></button>
                  <button type="button" onClick={() => insertMarkdown('- ', '')} style={{ background: 'none', border: 'none', color: 'var(--cyber-foreground)', padding: '0.4rem', cursor: 'pointer' }}><RiListOrdered /></button>
                  <button type="button" onClick={() => insertMarkdown('[', '](url)')} style={{ background: 'none', border: 'none', color: 'var(--cyber-foreground)', padding: '0.4rem', cursor: 'pointer' }}><RiLink /></button>
                  <div style={{ width: 1, height: 20, background: 'var(--cyber-border)', margin: '0 0.5rem' }} />
                  <label style={{ color: 'var(--cyber-accent-tertiary)', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <RiImageAddLine />
                    <input type="file" hidden multiple onChange={handleImageUpload} accept="image/*" />
                  </label>
                </div>
                <textarea
                  ref={textareaRef}
                  name="content"
                  className="cyber-input"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="INITIALIZE_DATA_STREAM..."
                  style={{
                    width: '100%',
                    minHeight: '250px',
                    border: 'none',
                    padding: '1.25rem',
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    resize: 'vertical',
                    background: 'transparent'
                  }}
                  required
                />
              </div>
              {uploadingImages.length > 0 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--cyber-accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-cyber-mono)' }}>
                  <RiLoader4Line className="spinning" /> TRANSMITTING {uploadingImages.length} FILE(s)...
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--cyber-border)', paddingTop: '2rem' }}>
              <button type="submit" className="cyber-btn" disabled={isSubmitting || uploadingImages.length > 0} style={{ padding: '0.75rem 2rem' }}>
                {isSubmitting ? 'TRANSMITTING...' : 'POST_DISCUSSION'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
