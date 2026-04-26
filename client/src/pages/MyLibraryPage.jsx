import { Link } from 'react-router-dom'

const myAssets = [
  { title: 'Epic Fantasy Pack V2', category: 'RPG, Fantasy', status: 'Published', price: '$24.00', downloads: '1,240' },
  { title: 'Cyber HUD Assets', category: 'Sci-Fi, Tech', status: 'Reviewing', price: '$29.00', downloads: '0' },
  { title: 'Pixel Art Essentials', category: 'Pixel Art, Retro', status: 'Draft', price: '$15.00', downloads: '0' },
  { title: 'Survival UI Kit', category: 'Survival, Realistic', status: 'Published', price: '$19.99', downloads: '542' },
]

export default function MyLibraryPage() {
  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <span className="admin-brand__tile" />
          <strong>UIbrage</strong>
        </div>
        <div className="admin-user">
          <span>🔔</span>
          <div>
            <strong>Alex Rivera</strong>
            <small>Admin</small>
          </div>
        </div>
      </header>

      <section className="admin-layout">
        <aside className="admin-sidebar">
          <h4>Main Menu</h4>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/my-assets" className="active">My Assets</Link>
          <Link to="/admin/upload-asset">Upload Asset</Link>
          <Link to="/admin/creators">Creators</Link>
          <Link to="/admin/asset-approval">Asset Approval</Link>
          <Link to="/community">Messages</Link>
          <div className="admin-sidebar__bottom">
            <button type="button">Settings</button>
            <button type="button" className="danger">Logout</button>
          </div>
        </aside>

        <section className="admin-content admin-library-content">
          <header className="adminx-header">
            <h1>My Assets</h1>
            <Link to="/admin/upload-asset" className="btn-solid">+ Upload New Asset</Link>
          </header>

          <section className="adminx-chip-row">
            <span className="active">All Categories</span>
            <span>RPG</span>
            <span>Sci-Fi</span>
            <span>Pixel Art</span>
            <span>Fantasy</span>
          </section>

          <section className="surface-card adminx-my-assets">
            <header>
              <span>Asset Preview</span>
              <span>Title & Category</span>
              <span>Status</span>
              <span>Price</span>
              <span>Downloads</span>
              <span>Actions</span>
            </header>
            {myAssets.map((asset, index) => (
              <div key={asset.title} className="adminx-my-assets__row">
                <div className={`adminx-thumb adminx-thumb--${index}`} />
                <div>
                  <strong>{asset.title}</strong>
                  <small>{asset.category}</small>
                </div>
                <span className={`state state--${asset.status.toLowerCase()}`}>{asset.status}</span>
                <span>{asset.price}</span>
                <span>{asset.downloads}</span>
                <span className="admin-table__actions">Edit View Delete</span>
              </div>
            ))}
            <footer>
              <small>Showing 4 of 12 assets</small>
              <div>
                <button type="button" className="library-btn-muted">Previous</button>
                <button type="button" className="library-btn-muted">Next</button>
              </div>
            </footer>
          </section>

          <section className="adminx-summary-cards">
            <article className="surface-card">
              <p>Monthly Revenue</p>
              <strong>$2,450.00</strong>
            </article>
            <article className="surface-card">
              <p>Total Downloads</p>
              <strong>18.2k</strong>
            </article>
            <article className="surface-card">
              <p>Avg. Rating</p>
              <strong>4.8</strong>
            </article>
          </section>
        </section>
      </section>
    </main>
  )
}
