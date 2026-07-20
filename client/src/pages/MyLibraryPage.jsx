import { useState, useEffect } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { Link } from 'react-router-dom'
import { userService } from '../services/api'
import { RiDownloadCloud2Line, RiTerminalBoxLine, RiHistoryLine, RiSearchLine } from 'react-icons/ri'
import '../dashboard-redesign.css'

export default function MyLibraryPage({ isAdmin = false, customStats }) {
  const [myAssets, setMyAssets] = useState([])
  const [orderHistory, setOrderHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('purchases')

  useEffect(() => {
    const fetchMyAssets = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        if (user) {
          const [purchasesRes, ordersRes] = await Promise.all([
            userService.getPurchases(),
            userService.getOrderHistory()
          ])
          setMyAssets(purchasesRes.data)
          setOrderHistory(ordersRes.data)
        }
      } catch (error) {
        console.error('Failed to fetch library', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMyAssets()
  }, [])

  const handleDownload = (fileUrl) => {
    if (!fileUrl) {
      alert('Download link not available for this asset.')
      return
    }
    window.open(fileUrl, '_blank')
  }

  if (loading) return <div className="loading-screen" style={{color: 'white', padding: '2rem'}}>Indexing Neural Library...</div>

  return (
    <div className="dashboard-layout">
      {/* Background Layers */}
      
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0"></div>
      
      {!isAdmin && <AppHeader />}
      
      <main className="dashboard-container">
        
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="dashboard-title-wrap">
            <h1 className="dashboard-title">My_Library</h1>
            <p className="dashboard-subtitle">Personal Data Nodes & Acquisitions</p>
          </div>
          
          <div className="dashboard-header-actions">
            <Link to="/marketplace" className="cyber-btn interactive-ripple" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RiSearchLine /> Explore_Market
            </Link>
          </div>
        </header>

        {/* Tab System */}
        <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--cyber-border)', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('purchases')}
            style={{ 
              background: 'none', border: 'none', 
              paddingBottom: '1rem', cursor: 'pointer', 
              color: activeTab === 'purchases' ? 'var(--cyber-cyan)' : '#64748b',
              borderBottom: activeTab === 'purchases' ? '2px solid var(--cyber-cyan)' : '2px solid transparent',
              fontFamily: 'var(--font-cyber-heading)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
            }}
          >
            <RiTerminalBoxLine size={16} /> Data_Nodes
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            style={{ 
              background: 'none', border: 'none', 
              paddingBottom: '1rem', cursor: 'pointer', 
              color: activeTab === 'transactions' ? 'var(--cyber-magenta)' : '#64748b',
              borderBottom: activeTab === 'transactions' ? '2px solid var(--cyber-magenta)' : '2px solid transparent',
              fontFamily: 'var(--font-cyber-heading)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
            }}
          >
            <RiHistoryLine size={16} /> Transaction_Log
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'purchases' ? (
          <div>
            {myAssets.length === 0 ? (
              <div className="cyber-card empty-state">
                <RiTerminalBoxLine className="empty-state-icon" />
                <p className="empty-state-text">No data nodes acquired. Your library is empty.</p>
              </div>
            ) : (
              <div className="library-grid">
                {myAssets.map(asset => (
                  <div className="cyber-card library-card" key={asset.id}>
                    <div className="library-card-thumb">
                      <img src={asset.coverImageUrl || 'https://picsum.photos/seed/cyber/400/225'} alt={asset.title} />
                    </div>
                    <div className="library-card-body">
                      <Link to={`/marketplace/${asset.id}`} className="library-card-title">{asset.title}</Link>
                      <span className="library-card-meta">By {asset.author?.fullName || asset.author?.username || 'Unknown_Entity'}</span>
                      <div className="library-card-actions">
                        <button onClick={() => handleDownload(asset.fileUrl)} className="cyber-btn interactive-ripple" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '9px', padding: '0.5rem' }}>
                          <RiDownloadCloud2Line /> Download_Stream
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Order_UID</th>
                  <th>Asset_Node</th>
                  <th>Timestamp</th>
                  <th>Credits</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No transaction records found.</td>
                  </tr>
                ) : (
                  orderHistory.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 900 }}>#{order.transactionId || order.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {order.asset && <img src={order.asset.coverImageUrl} className="table-thumbnail" alt="thumbnail" />}
                          <span style={{ fontWeight: 700, color: 'var(--cyber-cyan)' }}>{order.asset?.title || 'Unknown_Node'}</span>
                        </div>
                      </td>
                      <td style={{ color: '#64748b' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ fontWeight: 900, color: 'var(--cyber-green)' }}>
                        ${Number(order.amount).toFixed(2)}
                      </td>
                      <td>
                        <span className={`status-badge ${order.status === 'completed' ? 'status-success' : order.status === 'pending' ? 'status-pending' : 'status-danger'}`}>
                          {order.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
