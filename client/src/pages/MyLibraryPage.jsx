import { useState, useEffect } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { Link } from 'react-router-dom'
import { assetService } from '../services/api'
import { RiEditLine, RiEyeLine, RiDeleteBin6Line, RiUploadCloud2Line, RiDownloadCloud2Line, RiStarLine, RiBarChartFill } from 'react-icons/ri'

export default function MyLibraryPage({ isAdmin = false, customStats }) {
  const [myAssets, setMyAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All Categories')

  useEffect(() => {
    const fetchMyAssets = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        if (user) {
          const res = await assetService.getAll({ authorId: user.id })
          setMyAssets(res.data)
        }
      } catch (error) {
        console.error('Failed to fetch library', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMyAssets()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset? This will also remove it from Cloudinary and R2.')) {
      try {
        await assetService.delete(id)
        setMyAssets(prev => prev.filter(a => a.id !== id))
      } catch (error) {
        alert('Failed to delete asset')
      }
    }
  }

  const stats = [
    { label: 'Monthly Revenue', value: customStats ? `$${customStats.revenue}` : '$2,450.00', icon: <RiBarChartFill />, color: '#6366f1' },
    { label: 'Total Downloads', value: customStats ? customStats.downloads : '18.2k', icon: <RiDownloadCloud2Line />, color: '#3b82f6' },
    { label: 'Avg. Rating', value: customStats ? customStats.rating : '4.8', icon: <RiStarLine />, color: '#10b981' }
  ]

  if (loading) return <div className="loading-screen">Loading My Assets...</div>

  return (
    <main className={isAdmin ? "admin-my-assets" : "market-home"}>
      {!isAdmin && <AppHeader />}
      
      <section className="my-assets-container" style={{ padding: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Assets</h1>
          </div>
          <Link to={isAdmin ? "/admin/upload-asset" : "/upload-asset"} className="btn-solid" style={{ borderRadius: '0.75rem', padding: '0.8rem 1.5rem' }}>
            <RiUploadCloud2Line /> Upload New Asset
          </Link>
        </header>

        <nav className="asset-filter-nav" style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          {['All Categories', 'RPG', 'Sci-Fi', 'Pixel Art', 'Fantasy'].map(cat => (
            <button 
              key={cat} 
              className={activeCategory === cat ? 'filter-chip active' : 'filter-chip'}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: activeCategory === cat ? '#1e293b' : '#fff',
                color: activeCategory === cat ? '#fff' : '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              {cat}
            </button>
          ))}
        </nav>

        <div className="surface-card" style={{ padding: 0, borderRadius: '1.5rem', overflow: 'hidden' }}>
          <table className="asset-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1.25rem 2rem', textAlign: 'left', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Asset Preview</th>
                <th style={{ padding: '1.25rem 2rem', textAlign: 'left', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Title & Category</th>
                <th style={{ padding: '1.25rem 2rem', textAlign: 'left', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1.25rem 2rem', textAlign: 'left', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Price</th>
                <th style={{ padding: '1.25rem 2rem', textAlign: 'left', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Downloads</th>
                <th style={{ padding: '1.25rem 2rem', textAlign: 'left', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myAssets.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>No assets found.</td>
                </tr>
              ) : (
                myAssets.map(asset => (
                  <tr key={asset.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <img src={asset.coverImageUrl} style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{asset.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{asset.category || 'General'}</div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <span className={`status-badge ${asset.status}`} style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '2rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: asset.status === 'published' ? '#dcfce7' : asset.status === 'pending' ? '#fef9c3' : '#f1f5f9',
                        color: asset.status === 'published' ? '#15803d' : asset.status === 'pending' ? '#a16207' : '#64748b'
                      }}>
                        ● {asset.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1.5rem 2rem', fontWeight: 700 }}>
                      {asset.price === 0 ? 'Free' : `$${asset.price}`}
                    </td>
                    <td style={{ padding: '1.5rem 2rem', color: '#64748b' }}>
                      {asset.downloads || 0}
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', color: '#94a3b8' }}>
                        <Link to={`/upload-asset?edit=${asset.id}`} style={{ color: 'inherit' }}><RiEditLine size={20} /></Link>
                        <Link to={`/marketplace/assets/${asset.id}`} style={{ color: 'inherit' }}><RiEyeLine size={20} /></Link>
                        <button onClick={() => handleDelete(asset.id)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}><RiDeleteBin6Line size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <footer style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing {myAssets.length} assets</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="page-btn">Previous</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">Next</button>
            </div>
          </footer>
        </div>

        <section className="my-assets-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '3rem' }}>
          {stats.map(stat => (
            <div key={stat.label} className="surface-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{stat.label}</p>
                <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>{stat.value}</h3>
              </div>
            </div>
          ))}
        </section>
      </section>
      <style>{`
        .page-btn {
          border: 1px solid #e2e8f0;
          background: #fff;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          color: #64748b;
        }
        .page-btn.active {
          background: #1e293b;
          color: #fff;
          border-color: #1e293b;
        }
      `}</style>
    </main>
  )
}
