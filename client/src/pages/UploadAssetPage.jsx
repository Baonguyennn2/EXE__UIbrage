import AppHeader from '../components/AppHeader.jsx'

const uploadVariants = {
  create: {
    title: 'Upload New Asset',
    subtitle: 'Submit your UI kit files and metadata for publishing.',
    action: 'Publish Asset',
  },
  review: {
    title: 'Review Uploaded Asset',
    subtitle: 'Double-check previews, pricing and legal metadata before go-live.',
    action: 'Submit for Approval',
  },
}

const checklist = [
  'PNG/JPG preview images',
  'Source package (FIG/PSD/SVG)',
  'License declaration',
  'Version and changelog',
]

export default function UploadAssetPage({ variant = 'create' }) {
  const content = uploadVariants[variant] ?? uploadVariants.create

  return (
    <main className="market-home">
      <AppHeader />
      <section className="upload-layout">
        <aside className="upload-steps">
          <h3>Publishing Flow</h3>
          <ol>
            <li className="active">Upload files</li>
            <li>Asset details</li>
            <li>Price & license</li>
            <li>Review & publish</li>
          </ol>
        </aside>

        <section className="upload-main">
          <header className="upload-main__head">
            <p className="eyebrow">Creator Studio</p>
            <h1>{content.title}</h1>
            <p>{content.subtitle}</p>
          </header>

          <div className="upload-main__grid">
            <article className="surface-card">
              <div className="drop-zone">Drop files here or click to browse</div>
              <div className="upload-preview-list">
                <div>Preview 1</div>
                <div>Preview 2</div>
                <div>Preview 3</div>
              </div>
            </article>

            <article className="surface-card form-grid">
              <label>
                Asset name
                <input type="text" placeholder="Fantasy HUD Collection" />
              </label>
              <label>
                Category
                <input type="text" placeholder="UI Kit" />
              </label>
              <label>
                Tags
                <input type="text" placeholder="fantasy, rpg, hud, 4k" />
              </label>
              <label>
                Price
                <input type="text" placeholder="$29.99" />
              </label>
              <button type="button" className="btn-solid">{content.action}</button>
            </article>
          </div>

          <section className="surface-card upload-checklist">
            <h3>Validation checklist</h3>
            <ul>
              {checklist.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
          </section>
        </section>
      </section>
    </main>
  )
}
