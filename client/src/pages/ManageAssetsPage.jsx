import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { assetService } from '../services/api'
import { RiEdit2Line, RiDeleteBin6Line, RiEyeLine, RiAddLine, RiFileZipLine } from 'react-icons/ri'

export default function ManageAssetsPage() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMyAssets = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (!user.id) return navigate('/auth/login')
        
        // Use getAll with authorId filter
        const res = await assetService.getAll({ authorId: user.id })
        setAssets(res.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching assets:', error)
        setLoading(false)
      }
    }
    fetchMyAssets()
  }, [navigate])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset? This will permanently remove all files from cloud storage.')) return
    
    try {
      await assetService.deleteAsset(id)
      setAssets(prev => prev.filter(a => a.id !== id))
      alert('Asset deleted successfully.')
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete asset.')
    }
  }

  return (
    <main className="market-home" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <AppHeader />
      
      <div className="manage-assets-container" style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#1e293b', margin: 0 }}>My Uploaded Assets</h1>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Manage, edit, or remove your published content.</p>
          </div>
          <button className="btn-solid" onClick={() => navigate('/assets/upload')}>
            <RiAddLine /> Upload New Asset
          </button>
        </header>

        {loading ? (
          <div className="loading-placeholder">Loading your assets...</div>
        ) : assets.length === 0 ? (
          <div className="surface-card" style={{ padding: '5rem', textAlign: 'center' }}>
            <RiFileZipLine size={64} color="#e2e8f0" style={{ marginBottom: '1.5rem' }} />
            <h2>No assets found</h2>
            <p style={{ color: '#64748b' }}>You haven't uploaded any assets yet. Start sharing your work today!</p>
            <button className="btn-solid" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/assets/upload')}>Upload Now</button>
          </div>
        ) : (
          <div className="manage-assets-grid" style={{ display: 'grid', gap: '1.5rem' }}>
            {assets.map(asset => (
              <div key={asset.id} className="surface-card manage-asset-item" style={{ display: 'flex', padding: '1rem', alignItems: 'center', gap: '1.5rem' }}>
                <img src={asset.coverImageUrl} style={{ width: '120px', height: '80px', borderRadius: '0.5rem', objectFit: 'cover' }} alt={asset.title} />
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{asset.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <span>Price: <strong style={{ color: '#4f46e5' }}>${asset.price}</strong></span>
                    <span>Status: <span style={{ color: '#10b981', fontWeight: 600 }}>Published</span></span>
                    <span>Type: {asset.engine || 'General'}</span>
                  </div>
                </div>

                <div className="manage-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to={`/marketplace/assets/${asset.id}`} className="btn-ghost small" title="View Detail">
                    <RiEyeLine /> View
                  </Link>
                  <button className="btn-ghost small" onClick={() => navigate(`/assets/edit/${asset.id}`)} title="Edit Asset">
                    <RiEdit2Line /> Edit
                  </button>
                  <button className="btn-ghost small" style={{ color: '#ef4444' }} onClick={() => handleDelete(asset.id)} title="Delete Asset">
                    <RiDeleteBin6Line /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
