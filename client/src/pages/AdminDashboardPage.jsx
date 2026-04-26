import { Link } from 'react-router-dom'

const viewContent = {
  overview: { title: 'Creators Management', filter: 'Newest first', chip: 'All' },
  sales: { title: 'Sales Performance', filter: 'Revenue', chip: 'Top Seller' },
  users: { title: 'User Activity', filter: 'Active users', chip: 'Verified' },
  moderation: { title: 'Asset Approval Queue', filter: 'Pending review', chip: 'Needs action' },
  reports: { title: 'Reports & Insights', filter: 'Last 30 days', chip: 'Executive' },
}

const creators = [
  ['Alex Rivera', 'alex.r@design.co', '124', '12,450', '$3,240.50', 'Active'],
  ['Sarah Chen', 's.chen@uistudio.io', '0', '0', '$0.00', 'Pending'],
  ['Michael Scott', 'm.scott@paper.com', '56', '2,100', '$890.75', 'Suspended'],
  ['Lena Muller', 'lena.m@visuals.de', '82', '8,920', '$1,450.20', 'Active'],
  ['David Kim', 'dkim@studio.kr', '210', '45,100', '$12,890.00', 'Active'],
]

export default function AdminDashboardPage({ variant = 'overview' }) {
  const content = viewContent[variant] ?? viewContent.overview

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
          <Link to="/dashboard/overview">Dashboard</Link>
          <Link to="/library">My Assets</Link>
          <Link to="/dashboard/assets/upload">Upload Asset</Link>
          <Link to="/dashboard/users" className="active">Creators</Link>
          <Link to="/dashboard/moderation">Asset Approval</Link>
          <Link to="/community">Messages</Link>
          <div className="admin-sidebar__bottom">
            <button type="button">Settings</button>
            <button type="button" className="danger">Logout</button>
          </div>
        </aside>

        <div className="admin-content">
          <header className="admin-content__header">
            <h1>{content.title}</h1>
            <button type="button" className="btn-solid">Invite Creator</button>
          </header>

          <section className="surface-card admin-filters">
            <input type="search" placeholder="Search for creator or email..." />
            <div className="admin-filters__chips">
              <span className="active">{content.chip}</span>
              <span>Active</span>
              <span>Pending</span>
              <span>Suspended</span>
            </div>
            <button type="button" className="library-btn-muted">{content.filter}</button>
          </section>

          <section className="surface-card admin-table">
            <header>
              <span>Creator</span>
              <span>Email</span>
              <span>Assets</span>
              <span>Downloads</span>
              <span>Total Sales</span>
              <span>Status</span>
              <span>Actions</span>
            </header>
            {creators.map((row) => (
              <div key={row[0]} className="admin-table__row">
                <strong>{row[0]}</strong>
                <span>{row[1]}</span>
                <span>{row[2]}</span>
                <span>{row[3]}</span>
                <span>{row[4]}</span>
                <span className={`state state--${row[5].toLowerCase()}`}>{row[5]}</span>
                <span>👁 ⊘ 🗑</span>
              </div>
            ))}
            <footer>
              <small>Showing 1 to 5 of 84 results</small>
              <div>
                <button type="button" className="library-btn-muted">Previous</button>
                <button type="button" className="library-btn-muted">1</button>
                <button type="button" className="library-btn-muted">2</button>
                <button type="button" className="library-btn-muted">Next</button>
              </div>
            </footer>
          </section>
        </div>
      </section>
    </main>
  )
}
