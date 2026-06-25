import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { paymentService } from '../services/api'

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
        setStatus('error')
      }
    }

    verify()
  }, [orderCode])

  return (
    <main className="order-success">
      <section className="order-success__card">
        {status === 'verifying' && (
          <>
            <div className="confirm-badge" style={{ background: '#f59e0b' }}>Verifying Payment...</div>
            <h1>Please wait</h1>
            <p>We are verifying your transaction with the payment gateway.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="confirm-badge">Payment successful</div>
            <h1>Order #{orderCode} confirmed</h1>
            <p>
              Thank you! Your purchase has been recorded successfully. You can now download your asset from your library.
            </p>

            <div className="order-success__actions">
              <Link to="/library" className="btn-solid">Go to My Purchases</Link>
              <Link to="/marketplace" className="btn-ghost">Continue shopping</Link>
            </div>

            {orderDetails && (
              <div className="order-success__meta">
                <p>Transaction ID: {orderDetails.transactionId}</p>
                <p>Amount: ${orderDetails.amount?.toFixed(2)}</p>
                <p>Support: support@uibrage.com</p>
              </div>
            )}
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="confirm-badge" style={{ background: '#f59e0b' }}>Payment Pending</div>
            <h1>Order #{orderCode} is pending</h1>
            <p>
              Your payment is still being processed or hasn't been completed yet. Please check your bank app.
            </p>
            <div className="order-success__actions">
              <button type="button" className="btn-solid" onClick={() => window.location.reload()}>Refresh Status</button>
              <Link to="/library" className="btn-ghost">Go to My Purchases</Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="confirm-badge" style={{ background: '#ef4444' }}>Verification Failed</div>
            <h1>Unable to verify order</h1>
            <p>
              We couldn't verify your order status. If you have been charged, please contact support.
            </p>
            <div className="order-success__actions">
              <Link to="/marketplace/checkout" className="btn-solid">Return to Checkout</Link>
              <Link to="/marketplace" className="btn-ghost">Continue shopping</Link>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
