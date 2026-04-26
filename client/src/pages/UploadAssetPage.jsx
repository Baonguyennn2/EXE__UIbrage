import { Link } from 'react-router-dom'

const uploadVariants = {
  create: { title: 'Upload New Asset', action: 'Publish Asset' },
  review: { title: 'Upload New Asset', action: 'Publish Asset' },
}

export default function UploadAssetPage({ variant = 'create' }) {
  const content = uploadVariants[variant] ?? uploadVariants.create

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
          <Link to="/admin/my-assets">My Assets</Link>
          <Link to="/admin/upload-asset" className="active">Upload Asset</Link>
          <Link to="/admin/creators">Creators</Link>
          <Link to="/admin/asset-approval">Asset Approval</Link>
          <Link to="/community">Messages</Link>
          <div className="admin-sidebar__bottom">
            <button type="button">Settings</button>
            <button type="button" className="danger">Logout</button>
          </div>
        </aside>

        <section className="admin-content upload-admin">
          <section className="adminx-header adminx-header--compact">
            <h1>{content.title}</h1>
          </section>

          <section className="surface-card adminx-upload-section">
            <h3><span>1</span> Media Assets</h3>
            <label>Main Cover Image</label>
            <div className="adminx-upload-cover">Drop your 1920x1080 cover image here or browse</div>
            <label>Screenshots (Up to 10)</label>
            <div className="adminx-upload-shots">
              <button type="button">+</button>
              <div />
              <div />
            </div>
          </section>

          <section className="surface-card adminx-upload-section">
            <h3><span>2</span> Asset Details</h3>
            <div className="adminx-upload-form-grid">
              <label>
                Asset Title
                <input type="text" placeholder="e.g. Modern Cyberpunk HUD Pack" />
              </label>
              <label>
                Description
                <textarea rows={4} placeholder="Describe the features, layout, and contents of your pack..." />
              </label>
              <label>
                Tags
                <input type="text" placeholder="Separated by commas (e.g. rpg, sci-fi, 4k, vector)" />
              </label>
            </div>
          </section>

          <section className="surface-card adminx-upload-section">
            <h3><span>3</span> Technical Spec</h3>
            <div className="adminx-checkbox-grid">
              <label><input type="checkbox" /> RPG</label>
              <label><input type="checkbox" /> Sci-Fi</label>
              <label><input type="checkbox" defaultChecked /> Unity</label>
              <label><input type="checkbox" defaultChecked /> Unreal Engine</label>
              <label><input type="checkbox" defaultChecked /> Fantasy</label>
              <label><input type="checkbox" /> Mobile / Casual</label>
              <label><input type="checkbox" /> Godot</label>
              <label><input type="checkbox" /> Figma / Source</label>
            </div>
          </section>

          <section className="surface-card adminx-upload-section">
            <h3><span>4</span> Pricing & Distribution</h3>
            <div className="adminx-upload-form-grid adminx-upload-form-grid--two-col">
              <label>
                Price (USD)
                <input type="text" placeholder="$ 29.99" />
              </label>
              <label>
                License Type
                <select defaultValue="standard">
                  <option value="standard">Standard Commercial</option>
                  <option value="extended">Extended Commercial</option>
                </select>
              </label>
              <label className="adminx-upload-check-row">
                <input type="checkbox" /> Make this asset available for free
              </label>
            </div>
          </section>

          <div className="adminx-upload-actions">
            <button type="button" className="library-btn-muted">Save Draft</button>
            <button type="button" className="btn-solid">{content.action}</button>
          </div>
        </section>
      </section>
    </main>
  )
}
