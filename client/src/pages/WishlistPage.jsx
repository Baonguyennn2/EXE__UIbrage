import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { userService } from '../services/api'
import { RiHeartLine, RiShoppingBag3Line, RiDeleteBinLine } from 'react-icons/ri'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const res = await userService.getWishlist()
      setWishlist(res.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setLoading(false)
    }
  }

  const handleRemove = async (id) => {
    try {
      await userService.toggleWishlist(id)
      setWishlist(wishlist.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  return (
    <main className="market-home">
      <AppHeader />
      <section className="market-page">
        <div className="market-page__header">
          <p className="eyebrow">User account</p>
          <h1>My Wishlist</h1>
          <p>You have {wishlist.length} assets saved in your wishlist.</p>
        </div>

        {loading ? (
          <div className="loading-placeholder">Loading your wishlist...</div>
        ) : wishlist.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <RiHeartLine size={64} color="#cbd5e1" />
            <h3>Your wishlist is empty</h3>
            <p>Explore the marketplace and save your favorite assets!</p>
            <Link to="/marketplace" className="btn-solid" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((asset) => (
              <div key={asset.id} className="asset-card surface-card" style={{ padding: '0', overflow: 'hidden' }}>
                <Link to={`/marketplace/assets/${asset.id}`}>
                  <img src={asset.coverImageUrl} alt={asset.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                </Link>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Link to={`/marketplace/assets/${asset.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h4 style={{ margin: '0 0 0.5rem' }}>{asset.title}</h4>
                    </Link>
                    <button 
                      onClick={() => handleRemove(asset.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <RiDeleteBinLine size={20} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem' }}>
                    By {asset.author?.username}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '1.25rem' }}>${asset.price}</strong>
                    <button 
                      className="btn-solid" 
                      onClick={() => navigate('/marketplace/checkout', { state: { asset } })}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      <RiShoppingBag3Line /> Checkout
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
