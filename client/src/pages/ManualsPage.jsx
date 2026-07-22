import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { metadataService } from '../services/api';
import { RiLinksLine, RiFileDownloadLine, RiCheckboxCircleFill } from 'react-icons/ri';
import AppHeader from '../components/AppHeader';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://exe-uibrage.onrender.com/api');

export default function ManualsPage() {
  const [manuals, setManuals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]); // Array of selected category names

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [manualsRes, catRes] = await Promise.all([
          axios.get(`${API_URL}/manuals`),
          metadataService.getCategories()
        ]);
        setManuals(manualsRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const toggleCategory = (catName) => {
    setSelectedCategories(prev => {
      if (prev.includes(catName)) {
        return prev.filter(c => c !== catName);
      } else {
        return [...prev, catName];
      }
    });
  };

  const selectAll = () => {
    setSelectedCategories([]); // Empty means "All"
  };

  const filteredManuals = selectedCategories.length === 0 
    ? manuals 
    : manuals.filter(m => selectedCategories.includes(m.category));

  // Group by category for display
  const groupedManuals = filteredManuals.reduce((acc, manual) => {
    if (!acc[manual.category]) acc[manual.category] = [];
    acc[manual.category].push(manual);
    return acc;
  }, {});

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh', background: 'var(--cyber-bg)', display: 'flex', flexDirection: 'column' }}>
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0"></div>
      <AppHeader />
      
      <main className="dashboard-container" style={{ position: 'relative', zIndex: 10, flex: 1, padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <h1 className="cyber-glitch-text" data-text="USER MANUALS" style={{ fontFamily: "var(--font-cyber-heading)", fontSize: "3.5rem", marginBottom: "1rem", textTransform: "uppercase", color: "var(--cyber-accent)" }}>
              USER MANUALS
            </h1>
            <p style={{ color: "var(--cyber-muted-foreground)", fontFamily: "var(--font-cyber-mono)", fontSize: '1.1rem' }}>
              [SYSTEM_MESSAGE]: Access technical documentation and guides.
            </p>
          </header>

          <section className="cyber-card" style={{ padding: '2rem', marginBottom: '3rem', borderRadius: '1rem', border: '1px solid var(--cyber-border)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--cyber-foreground)' }}>Filter by Categories</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <button 
                onClick={selectAll}
                className={`cyber-btn ${selectedCategories.length === 0 ? '' : 'cyber-btn-outline'}`}
                style={{
                  background: selectedCategories.length === 0 ? 'var(--cyber-accent)' : 'transparent',
                  color: selectedCategories.length === 0 ? '#000' : 'var(--cyber-accent)',
                  borderColor: 'var(--cyber-accent)'
                }}
              >
                {selectedCategories.length === 0 && <RiCheckboxCircleFill style={{ marginRight: '0.5rem' }}/>}
                ALL_SYSTEMS
              </button>
              
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => toggleCategory(cat.name)}
                  className={`cyber-btn ${selectedCategories.includes(cat.name) ? '' : 'cyber-btn-outline'}`}
                  style={{
                    background: selectedCategories.includes(cat.name) ? 'var(--cyber-accent-secondary)' : 'transparent',
                    color: selectedCategories.includes(cat.name) ? '#fff' : 'var(--cyber-foreground)',
                    borderColor: 'var(--cyber-border)'
                  }}
                >
                  {selectedCategories.includes(cat.name) && <RiCheckboxCircleFill style={{ marginRight: '0.5rem' }}/>}
                  {cat.name.toUpperCase()}
                </button>
              ))}
            </div>
          </section>

          <section>
            {Object.keys(groupedManuals).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--cyber-muted-foreground)', background: 'var(--cyber-card)', borderRadius: '1rem', border: '1px dashed var(--cyber-border)' }}>
                [ERROR]: No data streams found for selected filters.
              </div>
            ) : (
              Object.keys(groupedManuals).map(category => (
                <div key={category} style={{ marginBottom: '4rem' }}>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--cyber-accent)', marginBottom: '1.5rem', borderBottom: '1px solid var(--cyber-border)', paddingBottom: '0.5rem' }}>
                    // {category.toUpperCase()}
                  </h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {groupedManuals[category].map((manual, index) => (
                      <div key={manual.id} className="cyber-card" style={{ 
                        padding: '1.5rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '1.5rem',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                          <div style={{ 
                            width: '40px', height: '40px', background: 'rgba(0, 212, 255, 0.1)', 
                            color: 'var(--cyber-accent-tertiary)', borderRadius: '8px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '1.2rem', flexShrink: 0
                          }}>
                            {index + 1}
                          </div>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--cyber-foreground)' }}>
                            {manual.title}
                          </h3>
                        </div>
                        
                        <a 
                          href={manual.content_url} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{
                            background: 'var(--cyber-muted)',
                            padding: '1rem',
                            borderRadius: '8px',
                            color: 'var(--cyber-accent)',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            wordBreak: 'break-all',
                            fontSize: '0.9rem',
                            border: '1px solid var(--cyber-border)'
                          }}
                        >
                          {manual.type === 'link' ? <RiLinksLine size={20} /> : <RiFileDownloadLine size={20} />}
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {manual.content_url}
                          </span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
