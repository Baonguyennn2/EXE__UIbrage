import AppHeader from '../components/AppHeader.jsx'

const posts = [
  {
    user: 'unity_wizard',
    time: '2 hours ago',
    title: 'How to integrate RPG health bars in Unity?',
    body: "I'm working on a classic RPG and purchased the Elder Fantasy UI Pack. I'm struggling with the dynamic scaling of the HP bars when the player...",
    tags: ['#unity', '#rpg-ui', '#help'],
    comments: '24',
    views: '1.2k',
  },
  {
    user: 'cyber_dev_2077',
    time: '5 hours ago',
    title: 'Showcase: My Cyberpunk Indie Game UI',
    body: 'Just finished the main menu and HUD for my upcoming neon-noir detective game. Everything was made using the UIbrage Vector Kit...',
    tags: ['#showcase', '#cyberpunk', '#indie-game'],
    comments: '156',
    views: '8.4k',
  },
  {
    user: 'pixel_pro',
    time: 'Yesterday',
    title: 'Tips for creating pixel art icons',
    body: "Pixel art is making a comeback. Here's my definitive guide on color palettes, sub-pixel positioning, and scaling for modern HD resolutions.",
    tags: ['#pixel-art', '#tutorial', '#icons'],
    comments: '89',
    views: '3.1k',
  },
]

export default function CommunityPage() {
  return (
    <main className="market-home">
      <AppHeader />

      <section className="community-layout">
        <div className="community-main">
          <header className="community-searchbar">
            <label>
              <span>⌕</span>
              <input type="search" placeholder="Search community posts..." />
            </label>
            <button type="button" className="btn-solid">+ Start a Discussion</button>
          </header>

          <section className="community-feed">
            {posts.map((post) => (
              <article key={post.title} className="community-post">
                <div className="community-post__head">
                  <strong>{post.user}</strong>
                  <span>• {post.time}</span>
                  <div className="community-post__stats">
                    <span>💬 {post.comments}</span>
                    <span>👁 {post.views}</span>
                  </div>
                </div>
                <h2>{post.title}</h2>
                <p>{post.body}</p>
                <div className="community-post__tags">
                  {post.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <button type="button" className="library-btn-muted community-load">Load More Posts</button>
        </div>

        <aside className="community-side">
          <section className="surface-card">
            <h3>Featured Topics</h3>
            <article className="community-topic">
              <div className="community-topic__thumb" />
              <small>WEEKLY EVENT</small>
              <strong>Weekly UI Challenge: Inventory Systems</strong>
              <p>Design the best fantasy RPG inventory screen for a chance to win store credits.</p>
            </article>
            <article className="community-spotlight">
              <div />
              <div>
                <strong>New Creator Spotlight: AeroStudio</strong>
                <p>Minimalist sci-fi interface experts.</p>
              </div>
            </article>
          </section>

          <section className="surface-card">
            <h3>Trending Tags</h3>
            <div className="community-tags">
              <span>#unreal</span>
              <span>#flat-design</span>
              <span>#mobile-ui</span>
              <span>#vector</span>
              <span>#godot</span>
              <span>#inventory</span>
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}
