import { useMemo, useState } from 'react'
import { Link, matchPath } from 'react-router-dom'
import { canonicalFrameRoutes, qaRoutePatterns } from '../data/routeCatalog.js'

function evaluateRoute(path) {
  const matchedPattern = qaRoutePatterns.find((pattern) =>
    matchPath({ path: pattern, end: true }, path),
  )

  return {
    passed: Boolean(matchedPattern),
    matchedPattern: matchedPattern ?? null,
  }
}

export default function RouteIndexPage() {
  const [qaResults, setQaResults] = useState(null)

  function runQaCheck() {
    const results = canonicalFrameRoutes.map((route) => ({
      path: route.path,
      ...evaluateRoute(route.path),
    }))
    setQaResults(results)
  }

  const qaMap = useMemo(() => {
    if (!qaResults) {
      return {}
    }

    return Object.fromEntries(qaResults.map((item) => [item.path, item]))
  }, [qaResults])

  const qaSummary = useMemo(() => {
    if (!qaResults) {
      return null
    }

    const passed = qaResults.filter((item) => item.passed).length
    const failed = qaResults.length - passed

    return { total: qaResults.length, passed, failed }
  }, [qaResults])

  return (
    <main className="route-index">
      <section className="route-index__hero">
        <div>
          <p className="eyebrow">Route index</p>
          <h1>Professional URL Map (17/17)</h1>
          <p>
            Mỗi frame trên Page 1 đã có URL chuyên nghiệp riêng. Bạn có thể chạy QA tự động và mở
            nhanh từng page bên dưới.
          </p>
        </div>
      </section>

      <section className="route-qa">
        <button type="button" className="frame-card__button route-qa__button" onClick={runQaCheck}>
          Run QA 17 pages
        </button>
        {qaSummary ? (
          <p className="route-qa__summary">
            Passed: <strong>{qaSummary.passed}</strong> / {qaSummary.total} • Failed:{' '}
            <strong>{qaSummary.failed}</strong>
          </p>
        ) : (
          <p className="route-qa__summary">Chưa chạy QA.</p>
        )}
      </section>

      <section className="route-index__grid">
        {canonicalFrameRoutes.map((route) => {
          const qa = qaMap[route.path]

          return (
            <article key={route.path} className="frame-card">
              <div className="frame-card__header">
                <div>
                  <p className="frame-card__eyebrow">Canonical route</p>
                  <h3>{route.title}</h3>
                </div>
                {qa ? (
                  <span className={`route-qa__badge ${qa.passed ? 'route-qa__badge--pass' : 'route-qa__badge--fail'}`}>
                    {qa.passed ? 'PASS' : 'FAIL'}
                  </span>
                ) : null}
              </div>
              <p className="frame-card__meta">
                URL: <span>{route.path}</span>
              </p>
              <p className="frame-card__meta">{route.note}</p>
              {qa && !qa.passed ? (
                <p className="frame-card__meta route-qa__error">No matching route pattern.</p>
              ) : null}
              <Link to={route.path} className="frame-card__button">
                Open page
              </Link>
            </article>
          )
        })}
      </section>
    </main>
  )
}
