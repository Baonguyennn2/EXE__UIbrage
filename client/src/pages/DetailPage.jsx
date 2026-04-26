import AppHeader from '../components/AppHeader.jsx'

export default function DetailPage() {
  return (
    <main className="market-home">
      <AppHeader />
      <section className="market-page">
        <div className="market-page__header">
          <p className="eyebrow">Asset detail</p>
          <h1>Ultimate Fantasy UI Pack</h1>
          <p>Production-ready 4K interface kit for RPG and adventure titles.</p>
        </div>

        <section className="market-page__content market-page__content--detail">
          <article className="surface-card">
            <div className="detail-gallery">
              <div className="detail-gallery__hero">Hero Preview</div>
              <div className="detail-gallery__list">
                <div>Screen A</div>
                <div>Screen B</div>
                <div>Screen C</div>
                <div>Components</div>
              </div>
            </div>
          </article>

          <aside className="surface-card detail-summary">
            <h2>$29.99</h2>
            <p>By Studio Arcane • Updated 2 days ago</p>
            <ul>
              <li>License: Commercial</li>
              <li>Files: Figma, PNG, SVG</li>
              <li>Compatible: Unity, Unreal, Godot</li>
              <li>Resolution: up to 4K</li>
            </ul>
            <div className="cta-row">
              <button type="button" className="btn-solid">Add to cart</button>
              <button type="button" className="btn-ghost">Save to library</button>
            </div>
          </aside>
        </section>
      </section>
    </main>
  )
}
