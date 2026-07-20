import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { 
  RiShoppingBagLine, 
  RiArrowRightSLine, 
  RiMapPinLine, 
  RiBankCardLine,
  RiWalletLine,
  RiLockLine
} from 'react-icons/ri'
import { paymentService } from '../services/api'
import '../checkout-redesign.css'

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const isCanceled = searchParams.get('canceled') === 'true'
  
  const [asset, setAsset] = useState(location.state?.asset || null)
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null')
    setUser(savedUser)
    
    if (isCanceled) {
      alert('Payment was canceled. You can try again when you are ready.')
    }

    if (!asset && !isCanceled) {
      // navigate('/marketplace')
    }
  }, [asset, navigate, isCanceled])

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postal: ''
  })
  
  const [paymentMethod, setPaymentMethod] = useState('pay-card')

  const [isProcessing, setIsProcessing] = useState(false)

  const handlePay = async () => {
    if (!asset || isProcessing) return
    try {
      setIsProcessing(true)
      const res = await paymentService.createLink(asset.id)
      if (res.data && res.data.isFree) {
        navigate(`/marketplace/order-success?orderCode=${res.data.orderCode}`)
        return
      }
      if (res.data && res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl
      }
    } catch (error) {
      console.error('PayOS error:', error)
      alert(error.response?.data?.message || 'Failed to initiate payment. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!asset) return <div className="loading-screen" style={{color: 'white', padding: '2rem'}}>Preparing checkout...</div>

  const numericPrice = Number(asset.price || 0)
  const networkFee = numericPrice * 0.05
  const totalCredits = numericPrice + networkFee

  return (
    <div className="checkout-layout">
      {/* Background Layers */}
      
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0"></div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'linear-gradient(to top, #0a0a0f, transparent)' }}></div>

      <AppHeader />

      <main className="checkout-main-container">
        {/* Header Section */}
        <div className="checkout-header-row">
          <div className="checkout-title-wrap">
            <RiShoppingBagLine size={36} color="white" />
            <h1 className="checkout-title">Finalize_Order</h1>
          </div>
          
          <div className="checkout-breadcrumbs">
            <div className="breadcrumb-step">
              <span>01_Cart</span>
              <RiArrowRightSLine />
            </div>
            <div className="breadcrumb-step active">
              <span>02_Checkout</span>
              <RiArrowRightSLine />
            </div>
            <div className="breadcrumb-step">
              <span>03_Success</span>
            </div>
          </div>
        </div>

        <div className="checkout-grid">
          {/* Left Column: Forms */}
          <div className="checkout-left-col">
            
            <section className="cyber-card checkout-section-card">
              <div className="checkout-section-header">
                <RiMapPinLine size={24} color="var(--cyber-green)" />
                <h2 className="checkout-section-title">Billing_Protocol</h2>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="cyber-label">Full_Name</label>
                  <input 
                    type="text" 
                    className="cyber-input"
                    placeholder={user?.fullName || "NEURAL_IDENTITY_01"} 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="cyber-label">Email_Address</label>
                  <input 
                    type="email" 
                    className="cyber-input"
                    placeholder={user?.email || "user@cybernet.link"} 
                    disabled
                  />
                </div>
                <div className="form-group col-span-2">
                  <label className="cyber-label">HQ_Address</label>
                  <input 
                    type="text" 
                    className="cyber-input"
                    placeholder="Sector 7, Neo Tokyo, Grid 45" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="cyber-label">City_Node</label>
                  <input 
                    type="text" 
                    className="cyber-input"
                    placeholder="Chiba City" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="cyber-label">Postal_Code</label>
                  <input 
                    type="text" 
                    className="cyber-input"
                    placeholder="7702-01" 
                    value={formData.postal}
                    onChange={(e) => setFormData({...formData, postal: e.target.value})}
                  />
                </div>
              </div>
            </section>

            <section className="cyber-card checkout-section-card">
              <div className="checkout-section-header">
                <RiBankCardLine size={24} color="var(--cyber-magenta)" />
                <h2 className="checkout-section-title">Payment_Gateway</h2>
              </div>

              <div className="payment-methods-grid">
                <div>
                  <input 
                    type="radio" 
                    name="payment" 
                    id="pay-card" 
                    className="payment-radio" 
                    checked={paymentMethod === 'pay-card'}
                    onChange={() => setPaymentMethod('pay-card')}
                  />
                  <label htmlFor="pay-card" className="payment-label">
                    <RiBankCardLine size={20} />
                    <span className="payment-label-text">PayOS</span>
                  </label>
                </div>
                <div>
                  <input 
                    type="radio" 
                    name="payment" 
                    id="pay-wallet" 
                    className="payment-radio" 
                    checked={paymentMethod === 'pay-wallet'}
                    onChange={() => setPaymentMethod('pay-wallet')}
                  />
                  <label htmlFor="pay-wallet" className="payment-label" onClick={(e) => {
                      e.preventDefault()
                      alert('Only PayOS is currently supported')
                    }}>
                    <RiWalletLine size={20} />
                    <span className="payment-label-text">Digital_Vault</span>
                  </label>
                </div>
              </div>

              {/* Fake CC Input just for aesthetics */}
              <div style={{ marginTop: '2rem' }}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="cyber-label">Card_Number</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" placeholder="XXXX-XXXX-XXXX-XXXX" className="cyber-input" disabled />
                    <RiLockLine style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#2a2a3a' }} />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="cyber-label">Expiry_Date</label>
                    <input type="text" placeholder="MM/YY" className="cyber-input" disabled />
                  </div>
                  <div className="form-group">
                    <label className="cyber-label">CVV_Node</label>
                    <input type="text" placeholder="***" className="cyber-input" disabled />
                  </div>
                </div>
              </div>

            </section>
          </div>

          {/* Right Column: Manifest */}
          <div className="checkout-right-col">
            <div className="cyber-card manifest-card">
              <h2 className="manifest-header">Order_Manifest</h2>
              
              <div className="manifest-item">
                <div className="manifest-item-thumb">
                  <img src={asset.coverImageUrl || 'https://picsum.photos/seed/cyber/64/48'} alt={asset.title} />
                </div>
                <div className="manifest-item-info">
                  <h4 className="manifest-item-title">{asset.title}</h4>
                  <p className="manifest-item-meta">System Protocol 2.0</p>
                </div>
                <span className="manifest-item-price">${numericPrice.toFixed(2)}</span>
              </div>

              <div className="manifest-totals">
                <div className="manifest-row">
                  <span>Subtotal</span>
                  <span className="manifest-val">${numericPrice.toFixed(2)}</span>
                </div>
                <div className="manifest-row">
                  <span>Network_Fee</span>
                  <span className="manifest-val">${networkFee.toFixed(2)}</span>
                </div>
                <div className="manifest-row final-total">
                  <span>Total_Credits</span>
                  <span className="manifest-val-final">${totalCredits.toFixed(2)}</span>
                </div>
              </div>

              <button 
                className="cyber-btn interactive-ripple btn-proceed" 
                onClick={handlePay} 
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing_Link...' : numericPrice === 0 ? 'Claim_Free_Node' : 'Proceed_to_Transmission'}
              </button>

              <p className="terms-text">
                Secure neural-link verified. By proceeding, you agree to the <a href="#" className="terms-link">Protocol_Terms</a>.
              </p>
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}
