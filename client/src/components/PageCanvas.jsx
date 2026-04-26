import { Link } from 'react-router-dom'

export default function PageCanvas({
  frame,
  kicker,
  title,
  description,
  spotlight,
  sidebarTitle,
  sidebarItems,
  metaContent,
  mainContent,
  sidebarContent,
}) {
  return (
    <main className="page-shell">
      <header className="page-shell__topbar">
        <div>
          <p className="eyebrow">Page 1 route</p>
          <h1>{title}</h1>
          <p className="page-shell__subtitle">
            {description} <span className="page-shell__subtitle-id">{frame.id}</span>
          </p>
        </div>

        <Link to="/" className="page-shell__home">
          Route index
        </Link>
      </header>

      <section className="page-shell__canvas page-shell__canvas--stacked">
        <div className="page-shell__canvas-card page-shell__canvas-card--highlighted">
          <p className="page-shell__eyebrow">{kicker}</p>
          <h2>{frame.id}</h2>
          <p>
            URL: <span>/page-1/{frame.slug}</span>
          </p>
          {metaContent ?? <p>{spotlight}</p>}
        </div>

        <div className="page-shell__workspace">
          <div className="page-shell__workspace-main">{mainContent ?? spotlight}</div>
          <aside className="page-shell__workspace-sidebar">
            <p className="page-shell__eyebrow">{sidebarTitle}</p>
            {sidebarContent ?? (
              <ul>
                {sidebarItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
