import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { 
  RiSecurePaymentLine, 
  RiShieldCheckLine, 
  RiLockPasswordLine,
  RiArrowRightLine,
  RiBankCardLine,
  RiPaypalLine,
  RiGoogleFill
} from 'react-icons/ri'

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [asset, setAsset] = useState(location.state?.asset || null)
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null')
    setUser(savedUser)
    
    if (!asset) {
      // If no asset in state, maybe redirect back
      // navigate('/marketplace')
    }
  }, [asset, navigate])

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: 'United States'
  })

  const handlePay = () => {
    // Integrate PayOS logic here
    alert('Redirecting to PayOS...')
  }

  if (!asset) return <div className="loading-screen">Preparing checkout...</div>

  return (
    <main className="market-home">
      <AppHeader />
      
      <div className="checkout-v2-grid">
        {/* Left Side: Forms */}
        <section className="checkout-v2-left">
          <div className="checkout-section-v2">
            <h2><span className="section-number">1</span> Billing Information</h2>
            <div className="billing-form-v2">
              <div className="input-group-v2 full-width-v2">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder={user?.fullName || "John Doe"} 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div className="input-group-v2">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder={user?.email || "john@example.com"} 
                  disabled
                />
              </div>
              <div className="input-group-v2">
                <label>Country</label>
                <select 
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                >
                  <option>United States</option>
                  <option>Vietnam</option>
                  <option>Singapore</option>
                </select>
              </div>
            </div>
          </div>

          <div className="checkout-section-v2">
            <h2><span className="section-number">2</span> Payment Method</h2>
            <div className="payment-methods-v2">
              <div className="method-card active">
                <RiBankCardLine size={24} />
                <span>PayOS</span>
              </div>
              <div className="method-card" onClick={() => alert('Only PayOS is currently supported')}>
                <RiPaypalLine size={24} />
                <span>PayPal</span>
              </div>
              <div className="method-card" onClick={() => alert('Only PayOS is currently supported')}>
                <RiGoogleFill size={24} />
                <span>G Pay</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Summary */}
        <aside className="checkout-v2-right">
          <div className="detail-v2-card order-summary-v2">
            <h3>Order Summary</h3>
            <div className="summary-product-v2">
              <img src={asset.coverImageUrl} className="summary-img-v2" alt={asset.title} />
              <div>
                <strong style={{ display: 'block' }}>{asset.title}</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Digital License</span>
              </div>
              <span style={{ marginLeft: 'auto', fontWeight: '600' }}>${asset.price}</span>
            </div>

            <div className="promo-row-v2">
              <input type="text" placeholder="Promo code" />
              <button className="btn-ghost">Apply</button>
            </div>

            <div className="summary-totals-v2">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>${asset.price}</span>
              </div>
              <div className="total-row-v2">
                <span>Total</span>
                <span style={{ color: '#4f46e5' }}>${asset.price}</span>
              </div>
            </div>

            <button className="btn-complete-v2" onClick={handlePay}>
              Pay & Complete Purchase <RiArrowRightLine />
            </button>

            <div className="security-badges-v2">
              <div className="badge-item-v2"><RiSecurePaymentLine size={20}/> SSL SECURED</div>
              <div className="badge-item-v2"><RiShieldCheckLine size={20}/> PCI COMPLIANT</div>
              <div className="badge-item-v2"><RiLockPasswordLine size={20}/> SAFE PAYMENT</div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '1.5rem' }}>
              Your payment is processed securely. We do not store your credit card information on our servers.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
