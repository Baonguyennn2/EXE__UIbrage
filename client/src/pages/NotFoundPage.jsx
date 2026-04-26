import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="route-index route-index--not-found">
      <section className="route-index__hero">
        <div>
          <p className="eyebrow">404</p>
          <h1>Page not found</h1>
          <p>The URL you opened does not exist or has been moved.</p>
        </div>

        <Link to="/marketplace" className="page-shell__home">
          Back to marketplace
        </Link>
      </section>
    </main>
  )
}
