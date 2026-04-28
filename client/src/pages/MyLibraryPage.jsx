import { useState, useEffect } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { Link } from 'react-router-dom'

import { assetService } from '../services/api'

export default function MyLibraryPage({ isAdmin = false }) {
  const [myAssets, setMyAssets] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) return <div className="loading-screen">Loading Library...</div>
  return (
    <main className={isAdmin ? "" : "market-home"}>
      {!isAdmin && <AppHeader />}
      
      <section className="market-page">
        <header className="market-page__header">
          <h1>My Library</h1>
          <p>Manage your purchased assets and downloads.</p>
        </header>

        <section className="market-page__content">
          <div className="surface-card">
            <div className="library-grid">
              {myAssets.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't purchased any assets yet.</p>
                  <Link to="/marketplace" className="btn-solid">Browse Marketplace</Link>
                </div>
              ) : (
                <div className="admin-table">
                   <header>
                    <span>Asset</span>
                    <span>Purchased Date</span>
                    <span>Price</span>
                    <span>Action</span>
                  </header>
                  {myAssets.map((asset) => (
                    <div key={asset.id} className="admin-table__row">
                      <div>
                        <strong>{asset.title}</strong>
                        <small>{asset.engine || 'General'}</small>
                      </div>
                      <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                      <span>{asset.price === 0 ? 'Free' : `$${asset.price}`}</span>
                      <span className="admin-table__actions">
                        <a href={asset.fileUrl} target="_blank" rel="noreferrer" className="btn-ghost" style={{ textDecoration: 'none' }}>Download</a>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
