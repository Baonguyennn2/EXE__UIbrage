import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'

const heroPreviewUrl = 'https://www.figma.com/api/mcp/asset/8b6a8cb2-137b-4fd3-824d-348246480897'

const homepageVariants = {
  v1: {
    pill: 'Featured Asset',
    heading: 'Ultimate Fantasy UI Pack',
    copy: 'Professional 4K game interface assets for high-end RPGs and Adventure games. Vector-based and fully customizable.',
    price: '$29.99',
    cta: 'Get Asset Pack',
    sectionTitle: 'Featured UI Packs',
  },
  v2: {
    pill: 'New Release',
    heading: 'Seasonal Marketplace Collection',
    copy: 'Fresh storefront-ready HUD, card, and menu components curated for teams shipping faster this quarter.',
    price: '$39.00',
    cta: 'Explore Collection',
    sectionTitle: 'Top Picks This Week',
  },
}

const featuredAssets = [
  {
    id: 'hud',
    title: 'Cyber HUD...',
    author: 'NeonSystems',
    description: 'Complete futuristic interface with 50+ animated HUD modules.',
    price: '$19',
    tags: ['Unity', '4K'],
    tone: 'market-card__image--cyan',
  },
  {
    id: 'pixel-art',
    title: 'Pixel Art',
    author: 'BitPixels',
    description: 'Charming 16-bit style UI for platformers and adventures.',
    price: 'Free',
    tags: ['Godot', 'PNG'],
    tone: 'market-card__image--green',
  },
  {
    id: 'dragon-realm',
    title: 'DragonRealm',
    author: 'DesignFlux',
    description: 'A clean, distraction-free UI set for modern mobile games.',
    price: '$12',
    tags: ['Vector', 'Unreal'],
    tone: 'market-card__image--purple',
  },
  {
    id: 'empire-strategy',
    title: 'Empire Strategy',
    author: 'LogicArts',
    description: 'Comprehensive UI kit designed for deep real-time strategy.',
    price: '$45',
    tags: ['4K', 'PSD'],
    tone: 'market-card__image--amber',
  },
]

const latestAssets = [
  { id: 'latest-1', title: 'Elemental Spell Icons', author: 'Firefly Studio', price: '$5' },
  { id: 'latest-2', title: 'Rustic Wood UI Kit', author: 'NatureBits', price: 'Free' },
  { id: 'latest-3', title: 'Glass UI Pack', author: 'LucidDesign', price: 'Free' },
  { id: 'latest-4', title: 'Classic Inventory Grid', author: 'RPGMaster', price: 'Free' },
]

const trendingAssets = [
  {
    id: 'trend-1',
    title: 'Cyberpunk Menu Suite',
    copy: 'Fast growing popularity in Sci-Fi category',
    price: '$25',
    badge: 'Hot Asset',
  },
  {
    id: 'trend-2',
    title: 'Parchment Quest Journals',
    copy: 'Over 500 downloads this week',
    price: 'Free',
    badge: '',
  },
]

export default function HomepagePage({ variant = 'v1' }) {
  const content = homepageVariants[variant] ?? homepageVariants.v1

  return (
    <main className="market-home">
      <AppHeader />

      <section className="market-layout">
        <aside className="market-filters">
          <h2>Filters</h2>
          <button type="button" className="market-tag-button">Popular Tags</button>

          <div className="market-filter-group">
            <h3>UI Style</h3>
            <a href="#fantasy">Fantasy</a>
            <a href="#sci-fi">Sci-Fi</a>
            <a href="#pixel-art">Pixel Art</a>
            <a href="#minimalist">Minimalist</a>
          </div>

          <div className="market-filter-group">
            <h3>Game Genre</h3>
            <a href="#rpg">RPG</a>
            <a href="#platformer">Platformer</a>
            <a href="#strategy">Strategy</a>
            <a href="#casual">Casual</a>
          </div>

          <div className="market-filter-group">
            <h3>Engine</h3>
            <a href="#unity">Unity</a>
            <a href="#unreal">Unreal Engine</a>
            <a href="#godot">Godot</a>
          </div>

          <div className="market-filter-group">
            <h3>Price</h3>
            <a href="#free">Free</a>
            <a href="#paid">Paid</a>
            <a href="#top-rated">Top Rated</a>
          </div>
        </aside>

        <div className="market-content">
          <section className="market-hero">
            <div className="market-hero__content">
              <p className="market-pill">{content.pill}</p>
              <h1>{content.heading}</h1>
              <p>{content.copy}</p>
              <div className="market-hero__cta">
                <div>
                  <small>Price</small>
                  <strong>{content.price}</strong>
                </div>
                <button type="button">{content.cta}</button>
              </div>
            </div>
            <div className="market-hero__preview">
              <img src={heroPreviewUrl} alt="Fantasy UI pack preview" />
            </div>
          </section>

          <section className="market-section">
            <div className="market-section__header">
              <h2>{content.sectionTitle}</h2>
              <Link to="/marketplace/assets/ultimate-fantasy-ui-pack">View All</Link>
            </div>

            <div className="market-cards market-cards--four">
              {featuredAssets.map((asset) => (
                <article key={asset.id} className="market-card">
                  <div className={`market-card__image ${asset.tone}`} />
                  <div className="market-card__body">
                    <div className="market-card__title-row">
                      <h3>{asset.title}</h3>
                      <strong>{asset.price}</strong>
                    </div>
                    <p className="market-card__author">By {asset.author}</p>
                    <p>{asset.description}</p>
                    <div className="market-tags">
                      {asset.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="market-section">
            <div className="market-section__header">
              <h2>Latest Assets</h2>
            </div>

            <div className="market-cards market-cards--latest">
              {latestAssets.map((asset, index) => (
                <article key={asset.id} className="market-latest-card">
                  <div className={`market-latest-card__thumb market-latest-card__thumb--${index}`} />
                  <h3>{asset.title}</h3>
                  <p>By {asset.author}</p>
                  <strong>{asset.price}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="market-section market-section--trending">
            <div className="market-section__header">
              <h2>Trending This Week</h2>
            </div>

            <div className="market-cards market-cards--two">
              {trendingAssets.map((asset, index) => (
                <article key={asset.id} className="market-trend-card">
                  <div className={`market-trend-card__thumb market-trend-card__thumb--${index}`} />
                  <div>
                    <h3>{asset.title}</h3>
                    <p>{asset.copy}</p>
                    <div className="market-trend-card__meta">
                      <strong>{asset.price}</strong>
                      {asset.badge ? <span>{asset.badge}</span> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="market-footer">
            <div className="market-footer__cols">
              <div>
                <div className="market-nav__brand">
                  <span className="market-brand-tile" aria-hidden="true">
                    <div />
                    <div />
                    <div />
                    <div />
                  </span>
                  <strong>UIbrage</strong>
                </div>
                <p>The premier marketplace for high-quality game user interface assets.</p>
              </div>
              <div>
                <h4>Explore</h4>
                <Link to="/marketplace">Featured Assets</Link>
                <Link to="/marketplace/discover">New Releases</Link>
                <Link to="/marketplace">Top Rated</Link>
                <Link to="/marketplace">Freebies</Link>
              </div>
              <div>
                <h4>Community</h4>
                <Link to="/community">Forums</Link>
                <Link to="/community">Discord</Link>
                <Link to="/community">Blog</Link>
                <Link to="/community">Events</Link>
              </div>
              <div>
                <h4>Help</h4>
                <Link to="/routes">Contact Support</Link>
                <Link to="/community">Sell your assets</Link>
                <Link to="/routes">Privacy Policy</Link>
                <Link to="/routes">Terms of Service</Link>
              </div>
            </div>
            <div className="market-footer__bottom">
              <small>© 2026 UIbrage Marketplace. All rights reserved.</small>
              <div>↗︎ ◎</div>
            </div>
          </footer>
        </div>
      </section>
    </main>
  )
}
