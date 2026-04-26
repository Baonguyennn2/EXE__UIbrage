import { Link } from 'react-router-dom'

const viewContent = {
  users: { title: 'Creators Management', filter: 'Newest first', action: 'Invite Creator' },
}

const creators = [
  { name: 'Alex Rivera', email: 'alex.r@design.co', assets: '124', downloads: '12,450', sales: '$3,240.50', status: 'Active' },
  { name: 'Sarah Chen', email: 's.chen@uistudio.io', assets: '0', downloads: '0', sales: '$0.00', status: 'Pending' },
  { name: 'Michael Scott', email: 'm.scott@paper.com', assets: '56', downloads: '2,100', sales: '$890.75', status: 'Suspended' },
  { name: 'Lena Muller', email: 'lena.m@visuals.de', assets: '82', downloads: '8,920', sales: '$1,450.20', status: 'Active' },
  { name: 'David Kim', email: 'dkim@studio.kr', assets: '210', downloads: '45,100', sales: '$12,890.00', status: 'Active' },
]

const approvalQueue = [
  {
    asset: 'Ancient Realm UI Kit',
    type: 'RPG Kits',
    creator: 'Artyom_Design',
    price: '$24.00',
    date: 'Oct 24, 2023',
    status: 'Pending',
  },
  {
    asset: 'CyberNeon Dashboard',
    type: 'Sci-Fi',
    creator: 'PixelWiz',
    price: '$45.00',
    date: 'Oct 23, 2023',
    status: 'Pending',
  },
  {
    asset: '8-Bit Retro Menus',
    type: 'Pixel Art',
    creator: 'RetroSam',
    price: '$12.00',
    date: 'Oct 22, 2023',
    status: 'Approved',
  },
]

const dashboardStats = [
  { label: 'Total Assets', value: '128', trend: '+21%' },
  { label: 'Total Downloads', value: '12,482', trend: '+18%' },
  { label: 'Total Sales', value: '$3,240.50', trend: '+5%' },
  { label: 'Monthly Revenue', value: '$850.12', trend: '+22%' },
]

const bestSelling = [
  { asset: 'Epic RPG Inventory UI', category: 'Fantasy Kits', downloads: '1,204', revenue: '$34,916' },
  { asset: 'Futuristic Sci-Fi HUD', category: 'Tech', downloads: '842', revenue: '$37,890' },
  { asset: 'Mobile Skill Icons', category: 'Mobile', downloads: '1,502', revenue: '$18,024' },
]

const underperforming = [
  { asset: 'Pixel Art Game Menu', hint: '0 sales this month', visits: '42', conversion: '0%' },
  { asset: 'Draft: Cyberpunk UI', hint: 'awaiting review', visits: '0', conversion: 'N/A' },
  { asset: 'Minimalist Vector Kit', hint: 'Low engagement', visits: '156', conversion: '0.2%' },
]

const topCreators = [
  { rank: '1', name: 'Alex Rivera (You)', role: 'Top Rated', spec: 'Game UI', assets: '128', revenue: '$142,850.12' },
  { rank: '2', name: 'Elena Kostic', role: 'Product Designer', spec: 'Icon Sets', assets: '412', revenue: '$121,420.00' },
  { rank: '3', name: 'Marcus Thorne', role: 'Illustration Artist', spec: 'Vector Art', assets: '85', revenue: '$98,110.50' },
]

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function AdminDashboardPage({ variant = 'overview' }) {
  const content = viewContent[variant] ?? viewContent.users
  const activeKey = variant === 'moderation' ? 'approval' : variant === 'users' ? 'creators' : 'dashboard'
  const isOverview = variant === 'overview'
  const isApproval = variant === 'moderation'

  const renderOverview = () => (
    <>
      <section className="adminx-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, Alex. Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <div className="adminx-header__actions">
          <button type="button" className="library-btn-muted">View Analytics</button>
          <Link to="/admin/upload-asset" className="btn-solid">+ Upload New Asset</Link>
        </div>
      </section>

      <section className="adminx-stat-grid">
        {dashboardStats.map((item) => (
          <article key={item.label} className="surface-card adminx-stat-card">
            <span>{item.trend}</span>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="adminx-two-col">
        <article className="surface-card adminx-list-card">
          <header>
            <h3>Top 10 Best-Selling Assets</h3>
            <button type="button">View All</button>
          </header>
          <div className="adminx-list-head">
            <span>Asset</span>
            <span>Downloads</span>
            <span>Revenue</span>
          </div>
          {bestSelling.map((row) => (
            <div key={row.asset} className="adminx-list-row">
              <div>
                <strong>{row.asset}</strong>
                <small>{row.category}</small>
              </div>
              <span>{row.downloads}</span>
              <strong>{row.revenue}</strong>
            </div>
          ))}
        </article>

        <article className="surface-card adminx-list-card">
          <header>
            <h3>Underperforming Assets</h3>
            <button type="button">Improve All</button>
          </header>
          <div className="adminx-list-head">
            <span>Asset</span>
            <span>Visits</span>
            <span>Conversion</span>
          </div>
          {underperforming.map((row) => (
            <div key={row.asset} className="adminx-list-row">
              <div>
                <strong>{row.asset}</strong>
                <small>{row.hint}</small>
              </div>
              <span>{row.visits}</span>
              <strong>{row.conversion}</strong>
            </div>
          ))}
        </article>
      </section>

      <section className="surface-card adminx-leaderboard">
        <header>
          <h3>Top Selling Creators</h3>
          <small>Timeframe: This Month</small>
        </header>
        <div className="adminx-leaderboard__head">
          <span>Rank</span>
          <span>Creator</span>
          <span>Specialization</span>
          <span>Total Assets</span>
          <span>Total Revenue</span>
        </div>
        {topCreators.map((row) => (
          <div key={row.name} className="adminx-leaderboard__row">
            <span>{row.rank}</span>
            <div>
              <strong>{row.name}</strong>
              <small>{row.role}</small>
            </div>
            <span>{row.spec}</span>
            <span>{row.assets}</span>
            <strong>{row.revenue}</strong>
          </div>
        ))}
        <footer>
          <button type="button">View Full Leaderboard</button>
        </footer>
      </section>
    </>
  )

  const renderCreators = () => (
    <>
      <section className="surface-card admin-filters">
        <input type="search" placeholder="Search for creator or email..." />
        <div className="admin-filters__chips">
          <span className="active">All</span>
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
          <div key={row.name} className="admin-table__row">
            <div className="admin-table__creator">
              <span className="admin-avatar">{getInitials(row.name)}</span>
              <strong>{row.name}</strong>
            </div>
            <span>{row.email}</span>
            <span>{row.assets}</span>
            <span>{row.downloads}</span>
            <span>{row.sales}</span>
            <span className={`state state--${row.status.toLowerCase()}`}>{row.status}</span>
            <span className="admin-table__actions">View Edit Remove</span>
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
    </>
  )

  const renderApproval = () => (
    <>
      <section className="adminx-header adminx-header--compact">
        <div>
          <h1>Asset Approval Management</h1>
        </div>
      </section>

      <section className="surface-card admin-filters">
        <input type="search" placeholder="Search by asset or creator" />
        <div className="admin-filters__chips">
          <span className="active">All</span>
          <span>Pending</span>
          <span>Approved</span>
          <span>Rejected</span>
        </div>
        <button type="button" className="library-btn-muted">{content.filter}</button>
      </section>

      <section className="surface-card admin-table admin-table--approval">
        <header>
          <span>Asset Review</span>
          <span>Creator</span>
          <span>Price</span>
          <span>Upload Date</span>
          <span>Status</span>
          <span>Action</span>
        </header>
        {approvalQueue.map((row) => (
          <div key={row.asset} className="admin-table__row">
            <div>
              <strong>{row.asset}</strong>
              <small>{row.type}</small>
            </div>
            <span>{row.creator}</span>
            <span>{row.price}</span>
            <span>{row.date}</span>
            <span className={`state state--${row.status.toLowerCase()}`}>{row.status}</span>
            <span className="admin-table__actions">Approve Reject</span>
          </div>
        ))}
        <footer>
          <small>Showing 3 of 24 pending assets</small>
          <div>
            <button type="button" className="library-btn-muted">Previous</button>
            <button type="button" className="library-btn-muted">Next</button>
          </div>
        </footer>
      </section>

      <section className="surface-card adminx-preview">
        <header>
          <h3>Asset Detailed Preview: Ancient Realm UI Kit</h3>
          <span>ID: #AST-99324</span>
        </header>
        <div className="adminx-preview__content">
          <div className="adminx-preview__image" />
          <div className="adminx-preview__meta">
            <p><strong>Description</strong></p>
            <p>Test1</p>
            <p><strong>Compatibility</strong></p>
            <div>
              <span>Unity 2021+</span>
              <span>Unreal Engine 5</span>
              <span>Godot</span>
            </div>
            <p><strong>Asset File (ZIP)</strong></p>
          </div>
        </div>
      </section>

      <section className="surface-card admin-review-note">
        <h3>Reviewer Feedback for Ancient Realm UI Kit</h3>
        <textarea rows={5} placeholder="Type feedback for creator..." />
        <div className="admin-review-note__actions">
          <button type="button" className="library-btn-muted">Send Feedback</button>
          <button type="button" className="library-btn-muted">Reject Asset</button>
          <button type="button" className="btn-solid">Approve Asset</button>
        </div>
      </section>
    </>
  )

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
          <Link to="/admin/dashboard" className={activeKey === 'dashboard' ? 'active' : ''}>Dashboard</Link>
          <Link to="/admin/my-assets">My Assets</Link>
          <Link to="/admin/upload-asset">Upload Asset</Link>
          <Link to="/admin/creators" className={activeKey === 'creators' ? 'active' : ''}>Creators</Link>
          <Link to="/admin/asset-approval" className={activeKey === 'approval' ? 'active' : ''}>Asset Approval</Link>
          <Link to="/community">Messages</Link>
          <div className="admin-sidebar__bottom">
            <button type="button">Settings</button>
            <button type="button" className="danger">Logout</button>
          </div>
        </aside>

        <div className="admin-content">
          {isOverview && renderOverview()}
          {!isOverview && !isApproval && renderCreators()}
          {isApproval && renderApproval()}
        </div>
      </section>
    </main>
  )
}
