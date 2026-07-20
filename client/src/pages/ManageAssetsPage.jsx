import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { assetService } from '../services/api'
import { RiEdit2Line, RiDeleteBin6Line, RiEyeLine, RiAddLine, RiFileZipLine, RiTerminalBoxLine } from 'react-icons/ri'
import '../dashboard-redesign.css'

export default function ManageAssetsPage() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMyAssets = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (!user.id) return navigate('/auth/login')
        
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
    if (!window.confirm('WARNING: Deletion is permanent. Remove this neural node from the network?')) return
    
    try {
      await assetService.deleteAsset(id)
      setAssets(prev => prev.filter(a => a.id !== id))
      alert('Node purged from network.')
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to purge node.')
    }
  }

  return (
    <div className="dashboard-layout">
      
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0"></div>
      
      <AppHeader />
      
      <main className="dashboard-container">
        
        <header className="dashboard-header">
          <div className="dashboard-title-wrap">
            <h1 className="dashboard-title">Asset_Manager</h1>
            <p className="dashboard-subtitle">Control & Distribute Neural Nodes</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="cyber-btn interactive-ripple" onClick={() => navigate('/assets/upload')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none' }}>
              <RiAddLine /> Upload_New_Node
            </button>
          </div>
        </header>

        {loading ? (
          <div className="loading-screen" style={{color: 'white', padding: '2rem'}}>Accessing Network Vault...</div>
        ) : assets.length === 0 ? (
          <div className="cyber-card empty-state">
            <RiTerminalBoxLine className="empty-state-icon" />
            <p className="empty-state-text">No active nodes. Initiate a new upload sequence.</p>
            <button className="btn-ghost-cyber" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/assets/upload')}>Commence_Upload</button>
          </div>
        ) : (
          <div className="table-container">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Visual_Hash</th>
                  <th>Node_Designation</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Admin_Overrides</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => (
                  <tr key={asset.id}>
                    <td>
                      <img src={asset.coverImageUrl || 'https://picsum.photos/seed/cyber/60/40'} className="table-thumbnail" alt={asset.title} style={{ width: '80px', height: '50px' }} />
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-cyber-heading)', fontSize: '1.125rem', color: 'white', marginBottom: '0.25rem' }}>{asset.title}</div>
                      <div style={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Engine: {asset.engine || 'General'}</div>
                    </td>
                    <td style={{ fontWeight: 900, color: 'var(--cyber-cyan)' }}>
                      ${asset.price}
                    </td>
                    <td>
                      <span className="status-badge status-success">Active_Stream</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Link to={`/marketplace/${asset.id}`} className="btn-ghost-cyber" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }} title="Inspect Node">
                          <RiEyeLine />
                        </Link>
                        <button className="btn-ghost-cyber" onClick={() => navigate(`/assets/edit/${asset.id}`)} style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', borderColor: 'var(--cyber-magenta)', color: 'var(--cyber-magenta)' }} title="Reconfigure">
                          <RiEdit2Line />
                        </button>
                        <button className="btn-ghost-cyber" onClick={() => handleDelete(asset.id)} style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', borderColor: 'var(--cyber-red)', color: 'var(--cyber-red)' }} title="Purge Data">
                          <RiDeleteBin6Line />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
