import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { 
  RiCheckLine, 
  RiCloseLine, 
  RiTimeLine,
  RiArrowRightSLine
} from 'react-icons/ri'
import { paymentService } from '../services/api'
import '../checkout-redesign.css'

export default function OrderConfirmPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const orderCode = searchParams.get('orderCode')
  
  const [status, setStatus] = useState('verifying')
  const [orderDetails, setOrderDetails] = useState(null)

  useEffect(() => {
    if (!orderCode) {
      setStatus('error')
      return
    }

    const verify = async () => {
      try {
        const res = await paymentService.verifyPayment(orderCode)
        setOrderDetails(res.data)
        if (res.data.status === 'completed') {
          setStatus('success')
        } else {
          setStatus('pending')
        }
      } catch (error) {
        console.error('Failed to verify payment', error)
        if (error.response?.data) {
          setOrderDetails(error.response.data)
        }
        setStatus('error')
      }
    }

    verify()
  }, [orderCode])

  return (
    <div className="checkout-layout">
      <div className="scanlines"></div>
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0"></div>
      
      <AppHeader />

      <main className="checkout-main-container">
        
        {/* Breadcrumbs Top Left */}
        <div className="checkout-breadcrumbs" style={{ position: 'absolute', top: '2rem', left: '1.5rem' }}>
          <div className="breadcrumb-step">
            <span>01_Cart</span>
            <RiArrowRightSLine />
          </div>
          <div className="breadcrumb-step">
            <span>02_Checkout</span>
            <RiArrowRightSLine />
          </div>
          <div className="breadcrumb-step active">
            <span>03_Success</span>
          </div>
        </div>

        <div className="success-layout">
          <div className="cyber-card success-card">
            
            {status === 'verifying' && (
              <>
                <div className="success-icon-wrap pending">
                  <RiTimeLine />
                </div>
                <div className="success-badge pending">Verifying_Payment</div>
                <h1 className="success-title">Please_Wait</h1>
                <p className="success-desc">
                  We are verifying your neural transaction with the payment gateway. Stand by for handshake completion.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="success-icon-wrap">
                  <RiCheckLine />
                </div>
                <div className="success-badge">Payment_Successful</div>
                <h1 className="success-title">Order_{orderCode}_Confirmed</h1>
                <p className="success-desc">
                  Transmission complete! Your purchase has been successfully recorded in the node. You can now download your asset from the library terminal.
                </p>

                <div className="success-actions">
                  <Link to="/library" className="cyber-btn interactive-ripple" style={{ textDecoration: 'none' }}>
                    Access_Library
                  </Link>
                  <Link to="/marketplace" className="btn-ghost-cyber">
                    Continue_Shopping
                  </Link>
                </div>

                {orderDetails && (
                  <div className="success-meta">
                    <div className="meta-grid">
                      <div className="meta-item">
                        <span className="meta-label">Transaction_ID</span>
                        <span className="meta-val">{orderDetails.transactionId}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Total_Credits</span>
                        <span className="meta-val" style={{ color: 'var(--cyber-green)' }}>${Number(orderDetails.amount).toFixed(2)}</span>
                      </div>
                      <div className="meta-item" style={{ gridColumn: '1 / -1' }}>
                        <span className="meta-label">Support_Node</span>
                        <span className="meta-val">support@uibrage.link</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {status === 'pending' && (
              <>
                <div className="success-icon-wrap pending">
                  <RiTimeLine />
                </div>
                <div className="success-badge pending">Payment_Pending</div>
                <h1 className="success-title">Order_{orderCode}_Pending</h1>
                <p className="success-desc">
                  Your transaction is still propagating through the network. Please check your external bank app or wait for confirmation.
                </p>
                <div className="success-actions">
                  <button type="button" className="cyber-btn interactive-ripple" onClick={() => window.location.reload()} style={{ border: 'none' }}>
                    Refresh_Status
                  </button>
                  <Link to="/library" className="btn-ghost-cyber">
                    Access_Library
                  </Link>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="success-icon-wrap error">
                  <RiCloseLine />
                </div>
                <div className="success-badge error">Verification_Failed</div>
                <h1 className="success-title">Error_Encountered</h1>
                <p className="success-desc">
                  We couldn't verify the order transmission. If credits were deducted, please contact the support node immediately.
                  {orderDetails?.details && <><br /><span style={{color: '#ef4444', marginTop: '0.5rem', display: 'block'}}>[ERR]: {orderDetails.details}</span></>}
                </p>
                <div className="success-actions">
                  <Link to="/marketplace" className="cyber-btn interactive-ripple" style={{ background: 'var(--cyber-red)', textDecoration: 'none' }}>
                    Return_to_Market
                  </Link>
                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
