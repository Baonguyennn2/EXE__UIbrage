import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RiDeleteBin6Line, RiEdit2Line, RiAddLine, RiLink, RiFile2Line, RiArrowDownSLine } from 'react-icons/ri';
import { metadataService } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://exe-uibrage.onrender.com/api');

export default function AdminManuals() {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    type: 'link',
    content_url: ''
  });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [catSearch, setCatSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [manualsRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/manuals`),
        metadataService.getCategories()
      ]);
      setManuals(manualsRes.data);
      setCategories(catRes.data.map(c => c.name));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('type', formData.type);
    
    if (formData.type === 'file' && file) {
      data.append('file', file);
    } else {
      data.append('content_url', formData.content_url);
    }

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/manuals/${editingId}`, data, { headers });
      } else {
        await axios.post(`${API_URL}/manuals`, data, { headers });
      }
      setShowModal(false);
      fetchData();
      setFormData({ title: '', category: '', type: 'link', content_url: '' });
      setFile(null);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving manual:', error);
      alert('Failed to save manual');
    }
  };

  const handleEdit = (manual) => {
    setFormData({
      title: manual.title,
      category: manual.category,
      type: manual.type,
      content_url: manual.content_url
    });
    setEditingId(manual.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this manual?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/manuals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting manual:', error);
      alert('Failed to delete manual');
    }
  };

  if (loading) return <div style={{ color: 'var(--cyber-muted-foreground)', padding: '2rem' }}>Loading manuals...</div>;

  return (
    <div className="admin-view-fade">
      <section className="adminx-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="cyber-glitch-text" data-text="USER MANUALS" style={{ fontFamily: "var(--font-cyber-heading)", fontSize: "2.25rem", marginBottom: "0.4rem", textTransform: "uppercase", color: "var(--cyber-accent)" }}>USER MANUALS</h1>
          <p style={{ color: "var(--cyber-muted-foreground)", fontFamily: "var(--font-cyber-mono)", margin: 0 }}>Manage user guides and Notion links.</p>
        </div>
        <button className="cyber-btn" onClick={() => { setEditingId(null); setShowModal(true); }} style={{ background: "var(--cyber-accent)", color: "#000", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RiAddLine /> Add Manual
        </button>
      </section>

      <section className="cyber-card" style={{ padding: 0, borderRadius: '1.5rem', overflow: 'hidden' }}>
        <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: "var(--cyber-muted)", color: "var(--cyber-muted-foreground)", textTransform: 'uppercase', fontSize: '0.75rem', borderBottom: "1px solid var(--cyber-border)" }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {manuals.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: "var(--cyber-muted-foreground)" }}>No manuals found.</td></tr>
            ) : manuals.map(m => (
              <tr key={m.id} style={{ borderBottom: "1px solid var(--cyber-border)" }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>{m.title}</td>
                <td style={{ padding: '1rem 1.5rem', color: "var(--cyber-muted-foreground)" }}>{m.category}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', background: 'rgba(0,212,255,0.1)', color: 'var(--cyber-accent-tertiary)', fontSize: '0.75rem' }}>
                    {m.type === 'link' ? <RiLink /> : <RiFile2Line />} {m.type.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', color: "var(--cyber-muted-foreground)" }}>
                    <RiEdit2Line size={20} style={{ cursor: 'pointer' }} onClick={() => handleEdit(m)} />
                    <RiDeleteBin6Line size={20} style={{ cursor: 'pointer', color: 'var(--cyber-destructive)' }} onClick={() => handleDelete(m.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="cyber-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--cyber-accent)' }}>{editingId ? 'Edit Manual' : 'Add Manual'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--cyber-muted-foreground)' }}>Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--cyber-muted)', border: '1px solid var(--cyber-border)', borderRadius: '0.5rem', color: '#fff' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--cyber-muted-foreground)' }}>Category (Multiple)</label>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {formData.category ? formData.category.split(',').filter(Boolean).map(cat => (
                    <span key={cat.trim()} style={{ background: 'var(--cyber-accent)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {cat.trim()}
                      <RiDeleteBin6Line 
                        size={12} 
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentCats = formData.category.split(',').map(c => c.trim()).filter(Boolean);
                          const newCats = currentCats.filter(c => c !== cat.trim());
                          setFormData(prev => ({ ...prev, category: newCats.join(', ') }));
                        }}
                      />
                    </span>
                  )) : null}
                </div>

                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="cyber-input" 
                    placeholder="Type to search or add new category..." 
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    onFocus={() => setShowCatDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCatDropdown(false), 200)}
                    style={{ width: '100%', padding: '0.75rem 1rem' }}
                  />
                  
                  {showCatDropdown && (
                    <div className="cyber-card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999, marginTop: '0.5rem', padding: '0.5rem', maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--cyber-accent-tertiary)', background: '#0f172a', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--cyber-muted-foreground)', display: 'flex', alignItems: 'center' }}>Quick Select:</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="button" className="cyber-btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onMouseDown={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, category: categories.join(', ') })) }}>SELECT ALL</button>
                          <button type="button" className="cyber-btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onMouseDown={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, category: '' })) }}>CLEAR</button>
                        </div>
                      </div>
                      
                      {categories.filter(c => c.toLowerCase().includes(catSearch.toLowerCase())).map(c => {
                        const isSelected = formData.category && formData.category.split(',').map(cat => cat.trim()).includes(c);
                        return (
                          <div 
                            key={c}
                            onClick={() => { 
                              const currentCats = formData.category ? formData.category.split(',').map(cat => cat.trim()).filter(Boolean) : [];
                              if (isSelected) {
                                setFormData(prev => ({ ...prev, category: currentCats.filter(cat => cat !== c).join(', ') }));
                              } else {
                                setFormData(prev => ({ ...prev, category: [...currentCats, c].join(', ') }));
                              }
                            }}
                            style={{ 
                              padding: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.9rem', 
                              color: isSelected ? 'var(--cyber-accent)' : 'var(--cyber-foreground)', 
                              borderBottom: '1px solid rgba(255,255,255,0.1)',
                              display: 'flex', justifyContent: 'space-between'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,212,255,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            {c}
                            {isSelected && <span>✓</span>}
                          </div>
                        )
                      })}
                      
                      {catSearch.trim() && !categories.some(c => c.toLowerCase() === catSearch.trim().toLowerCase()) && (
                        <div 
                          onClick={() => { 
                            const currentCats = formData.category ? formData.category.split(',').map(cat => cat.trim()).filter(Boolean) : [];
                            setFormData(prev => ({ ...prev, category: [...currentCats, catSearch.trim()].join(', ') }));
                            setCatSearch('');
                          }} 
                          style={{ padding: '0.75rem', cursor: 'pointer', color: 'var(--cyber-accent)', fontFamily: 'var(--font-cyber-mono)', fontSize: '0.9rem' }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,212,255,0.1)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          + Add "{catSearch.trim()}"
                        </div>
                      )}

                      {categories.filter(c => c.toLowerCase().includes(catSearch.toLowerCase())).length === 0 && !catSearch.trim() && (
                        <div style={{ padding: '0.75rem', color: 'var(--cyber-muted-foreground)', fontSize: '0.85rem', textAlign: 'center', fontFamily: 'var(--font-cyber-mono)' }}>
                          No categories found.<br/>Type above to add one.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--cyber-muted-foreground)' }}>Type</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="type" value="link" checked={formData.type === 'link'} onChange={handleInputChange} /> Link (Notion)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="type" value="file" checked={formData.type === 'file'} onChange={handleInputChange} /> File Upload
                  </label>
                </div>
              </div>

              {formData.type === 'link' ? (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--cyber-muted-foreground)' }}>Content URL</label>
                  <input type="url" name="content_url" value={formData.content_url} onChange={handleInputChange} placeholder="https://notion.so/..." style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--cyber-muted)', border: '1px solid var(--cyber-border)', borderRadius: '0.5rem', color: '#fff' }} />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--cyber-muted-foreground)' }}>Upload File</label>
                  <input type="file" onChange={handleFileChange} style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--cyber-muted)', border: '1px solid var(--cyber-border)', borderRadius: '0.5rem', color: '#fff' }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="cyber-btn-outline" style={{ border: '1px solid var(--cyber-border)' }}>Cancel</button>
                <button type="submit" className="cyber-btn" style={{ background: 'var(--cyber-accent)', color: '#000' }}>Save Manual</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
