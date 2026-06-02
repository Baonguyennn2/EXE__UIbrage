import { useEffect, useState } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { userService } from '../services/api'
import {
  RiBankCardLine,
  RiMoneyDollarCircleLine,
  RiRefund2Line,
  RiLineChartLine,
  RiWallet3Line,
  RiArrowUpSLine,
  RiTimerLine,
  RiCheckLine,
  RiCloseLine,
} from 'react-icons/ri'

const money = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function EarningsPage() {
  const [earningsData, setEarningsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ amount: '', payoutMethod: 'bank', payoutDetails: '', note: '' })
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null')

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      const res = await userService.getEarnings()
      setEarningsData(res.data)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load earnings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [])

  const handleSubmitWithdrawal = async (event) => {
    event.preventDefault()
    try {
      setSubmitting(true)
      setError('')
      await userService.requestWithdrawal(form)
      setForm({ amount: '', payoutMethod: 'bank', payoutDetails: '', note: '' })
      await fetchEarnings()
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to submit withdrawal request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading-screen">Calculating earnings...</div>

  const totalSales = earningsData?.salesBreakdown?.reduce((sum, item) => sum + Number(item.salesCount || 0), 0) || 0
  const isCreator = currentUser?.role === 'creator'

  return (
    <main className="market-home" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)', minHeight: '100vh' }}>
      <AppHeader />

      <div className="earnings-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.8rem', borderRadius: '999px', background: '#e0e7ff', color: '#4338ca', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <RiWallet3Line /> Creator finance
          </div>
          <h1 style={{ fontSize: '2.5rem', margin: '1rem 0 0.4rem', color: '#0f172a' }}>Earnings & withdrawals</h1>
          <p style={{ color: '#475569', maxWidth: '720px' }}>Revenue is split into creator earnings and platform commission. Creator balance can be withdrawn after admin review.</p>
        </header>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.9rem 1rem', borderRadius: '0.9rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Creator balance', value: money(earningsData?.availableBalance), icon: <RiMoneyDollarCircleLine />, color: '#10b981' },
            { label: 'Pending withdrawals', value: money(earningsData?.pendingWithdrawalAmount), icon: <RiRefund2Line />, color: '#f59e0b' },
            { label: 'Lifetime earnings', value: money(earningsData?.totalEarnings), icon: <RiLineChartLine />, color: '#4f46e5' },
            { label: 'Platform commission', value: `${Number(earningsData?.commissionPercent || 0).toFixed(2)}%`, icon: <RiBankCardLine />, color: '#0ea5e9' },
          ].map((card) => (
            <article key={card.label} className="surface-card" style={{ padding: '1.25rem', borderRadius: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <small style={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{card.label}</small>
                  <h2 style={{ margin: '0.5rem 0 0', fontSize: '1.8rem', color: '#0f172a' }}>{card.value}</h2>
                </div>
                <div style={{ width: 42, height: 42, borderRadius: '0.9rem', background: `${card.color}18`, color: card.color, display: 'grid', placeItems: 'center', fontSize: '1.25rem' }}>
                  {card.icon}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '1rem', marginBottom: '1rem' }}>
          <article className="surface-card" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Sales breakdown</h3>
                <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>{totalSales} completed sales across {earningsData?.salesBreakdown?.length || 0} assets</p>
              </div>
              <RiArrowUpSLine size={20} color="#94a3b8" />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'left' }}>Asset</th>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>Sales</th>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Creator revenue</th>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Gross sale</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsData?.salesBreakdown?.length ? earningsData.salesBreakdown.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.95rem 1rem', fontWeight: 600 }}>{item.title}</td>
                      <td style={{ padding: '0.95rem 1rem', textAlign: 'center', color: '#475569' }}>{item.salesCount}</td>
                      <td style={{ padding: '0.95rem 1rem', textAlign: 'right', fontWeight: 700, color: '#4f46e5' }}>{money(item.revenue)}</td>
                      <td style={{ padding: '0.95rem 1rem', textAlign: 'right', color: '#475569' }}>{money(item.grossRevenue)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{ padding: '2.75rem', textAlign: 'center', color: '#94a3b8' }}>No sales yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="surface-card" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
            <h3 style={{ marginTop: 0 }}>Request withdrawal</h3>
            <p style={{ color: '#64748b', marginTop: 0 }}>You can request up to your available balance. The request will wait for admin approval.</p>

            {isCreator ? (
              <form onSubmit={handleSubmitWithdrawal} style={{ display: 'grid', gap: '0.85rem', marginTop: '1rem' }}>
                <label style={{ display: 'grid', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Amount</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="10.00"
                    style={{ padding: '0.85rem 1rem', borderRadius: '0.9rem', border: '1px solid #cbd5e1' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Payout method</span>
                  <select
                    value={form.payoutMethod}
                    onChange={(event) => setForm((current) => ({ ...current, payoutMethod: event.target.value }))}
                    style={{ padding: '0.85rem 1rem', borderRadius: '0.9rem', border: '1px solid #cbd5e1' }}
                  >
                    <option value="bank">Bank transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="crypto">Crypto wallet</option>
                  </select>
                </label>
                <label style={{ display: 'grid', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Payout details</span>
                  <textarea
                    rows="3"
                    value={form.payoutDetails}
                    onChange={(event) => setForm((current) => ({ ...current, payoutDetails: event.target.value }))}
                    placeholder="Account number or payout address"
                    style={{ padding: '0.85rem 1rem', borderRadius: '0.9rem', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Note</span>
                  <textarea
                    rows="2"
                    value={form.note}
                    onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                    placeholder="Optional note for admin"
                    style={{ padding: '0.85rem 1rem', borderRadius: '0.9rem', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  />
                </label>
                <button type="submit" className="btn-solid" style={{ background: '#4f46e5' }} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit request'}
                </button>
              </form>
            ) : (
              <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.9rem', background: '#f8fafc', color: '#475569' }}>
                Creator withdrawal requests are available to creator accounts only.
              </div>
            )}
          </article>
        </section>

        <section className="surface-card" style={{ padding: '1.5rem', borderRadius: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Withdrawal history</h3>
            <RiTimerLine size={18} color="#94a3b8" />
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {earningsData?.withdrawals?.length ? earningsData.withdrawals.map((request) => (
              <div key={request.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '1rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: '#fff' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{money(request.amount)}</div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{new Date(request.createdAt).toLocaleString()}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>{request.adminNote || request.note || 'No note'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: request.status === 'approved' ? '#dcfce7' : request.status === 'rejected' ? '#fee2e2' : '#fef3c7', color: request.status === 'approved' ? '#15803d' : request.status === 'rejected' ? '#b91c1c' : '#a16207' }}>
                    {request.status === 'approved' ? <RiCheckLine /> : request.status === 'rejected' ? <RiCloseLine /> : <RiRefund2Line />}
                    {request.status}
                  </span>
                </div>
              </div>
            )) : (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>No withdrawal requests yet.</div>
            )}
          </div>
        </section>

        <section className="surface-card" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Transaction log</h3>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{earningsData?.transactions?.length || 0} records</span>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {earningsData?.transactions?.length ? earningsData.transactions.map((tx) => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '1rem', borderRadius: '1rem', background: '#f8fafc' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{tx.title || tx.type.replace('_', ' ')}</div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{new Date(tx.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#4f46e5' }}>{money(tx.amount)}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{tx.type}</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>No transactions yet.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}