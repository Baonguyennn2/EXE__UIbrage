import AppHeader from '../components/AppHeader.jsx'

export default function CheckoutPage() {
  return (
    <main className="market-home">
      <AppHeader />
      <section className="market-page">
        <div className="market-page__header">
          <p className="eyebrow">Checkout</p>
          <h1>Secure Payment</h1>
          <p>Complete your purchase with shipping and payment details below.</p>
        </div>

        <section className="market-page__content market-page__content--checkout">
          <article className="surface-card form-grid">
            <label>
              Recipient
              <input type="text" placeholder="Tran Thi B" />
            </label>
            <label>
              Phone
              <input type="text" placeholder="0901 234 567" />
            </label>
            <label>
              Delivery address
              <input type="text" placeholder="District 1, HCMC" />
            </label>
            <label>
              Voucher code
              <input type="text" placeholder="SUMMER26" />
            </label>
          </article>

          <article className="surface-card summary-card summary-card--checkout">
            <h4>Order summary</h4>
            <p>Ultimate Fantasy UI Pack</p>
            <p>License extension</p>
            <p className="price-chip">$132.00</p>
            <button type="button" className="btn-solid">Place order</button>
          </article>
        </section>
      </section>
    </main>
  )
}
