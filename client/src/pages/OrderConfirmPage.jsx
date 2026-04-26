import { Link } from 'react-router-dom'

export default function OrderConfirmPage() {
  return (
    <main className="order-success">
      <section className="order-success__card">
        <div className="confirm-badge">Payment successful</div>
        <h1>Order #UB-2026-0481 confirmed</h1>
        <p>
          Cảm ơn bạn! Hóa đơn và file tải về đã được gửi tới email. Bạn có thể theo dõi tiến độ giao
          license ngay trong dashboard.
        </p>

        <div className="order-success__actions">
          <button type="button" className="btn-solid">Track order</button>
          <Link to="/marketplace" className="btn-ghost">Continue shopping</Link>
        </div>

        <div className="order-success__meta">
          <p>Paid via Visa •••• 1029</p>
          <p>Delivery ETA: 12 May 2026</p>
          <p>Support: support@uibrage.com</p>
        </div>
      </section>
    </main>
  )
}
