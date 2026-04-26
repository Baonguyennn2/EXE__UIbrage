import AppHeader from '../components/AppHeader.jsx'

const myUploads = [
  { title: 'Ultimate Fantasy RPG UI', author: 'MythicStudios', tag: 'UI Kit' },
  { title: 'Neon Sci-Fi HUD Pack', author: 'CyberTech', tag: 'HUD' },
  { title: 'Retro Pixel Art Menu', author: '8BitMaster', tag: 'Menu' },
  { title: 'Mobile Casual Game UI', author: 'SoftPixels', tag: 'UI Kit' },
]

const purchases = [
  { title: 'CyberNeon HUD Pack', author: 'FutureVisions', price: '$29.99', date: 'OCT 24, 2026' },
  { title: 'Ancient RPG Inventory Pro', author: 'MythicForge', price: '$45.00', date: 'OCT 12, 2025' },
  { title: 'Retro 8-Bit UI Essentials', author: 'PixelPerfect', price: '$15.00', date: 'AUG 14, 2024' },
]

export default function MyLibraryPage() {
  return (
    <main className="market-home">
      <AppHeader />

      <section className="library-layout">
        <aside className="library-sidebar">
          <button type="button" className="library-sidebar__item library-sidebar__item--active">
            My Library
          </button>
          <button type="button" className="library-sidebar__item">Recommended Assets</button>
          <button type="button" className="library-sidebar__item">On Sale</button>
        </aside>

        <section className="library-content">
          <header className="library-head">
            <h1>My Library</h1>
            <p>Filter by: Recent</p>
          </header>

          <section className="library-block">
            <h2>My Uploads</h2>
            <div className="library-grid library-grid--uploads">
              {myUploads.map((item, index) => (
                <article key={item.title} className="library-card">
                  <div className={`library-card__thumb library-card__thumb--${index}`}>
                    <span>{item.tag}</span>
                  </div>
                  <div className="library-card__body">
                    <h3>{item.title}</h3>
                    <p>by {item.author}</p>
                    <button type="button" className="btn-solid">Edit</button>
                    <button type="button" className="library-btn-muted">Restore</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="library-block">
            <h2>My Purchases</h2>
            <div className="library-grid library-grid--purchases">
              {purchases.map((item, index) => (
                <article key={item.title} className="library-purchase">
                  <div className={`library-purchase__thumb library-purchase__thumb--${index}`} />
                  <div className="library-purchase__body">
                    <h3>{item.title}</h3>
                    <p>by {item.author}</p>
                    <div className="library-purchase__meta">
                      <strong>{item.price}</strong>
                      <span>{item.date}</span>
                    </div>
                    <div className="library-purchase__actions">
                      <button type="button" className="btn-solid">Download</button>
                      <button type="button" className="library-btn-muted">View Asset</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  )
}
