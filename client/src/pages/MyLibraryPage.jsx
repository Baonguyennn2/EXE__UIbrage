import AppHeader from '../components/AppHeader.jsx'
import { Link } from 'react-router-dom'

const myAssets = [
  { id: 1, title: 'Epic Fantasy Pack V2', category: 'RPG, Fantasy', date: 'Oct 24, 2023', price: '$24.00' },
  { id: 2, title: 'Cyber HUD Assets', category: 'Sci-Fi, Tech', date: 'Oct 20, 2023', price: '$29.00' },
]

export default function MyLibraryPage() {
  return (
    <main className="market-home">
      <AppHeader />
      
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
                        <small>{asset.category}</small>
                      </div>
                      <span>{asset.date}</span>
                      <span>{asset.price}</span>
                      <span className="admin-table__actions">
                        <button className="btn-ghost" onClick={() => alert('Downloading...')}>Download</button>
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
