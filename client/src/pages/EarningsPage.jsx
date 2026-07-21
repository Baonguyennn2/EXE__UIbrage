import { useEffect, useState } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { userService } from '../services/api'
import {
  RiBankCardLine,
  RiMoneyDollarCircleLine,
  RiRefund2Line,
  RiLineChartLine,
  RiCheckLine,
  RiCloseLine,
  RiDatabase2Line
} from 'react-icons/ri'
import '../dashboard-redesign.css'

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
      setError(requestError?.response?.data?.message || 'Failed to load telemetry')
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

  if (loading) return <div className="loading-screen" style={{color: 'white', padding: '2rem'}}>Syncing Revenue Data...</div>

  const totalSales = earningsData?.salesBreakdown?.reduce((sum, item) => sum + Number(item.salesCount || 0), 0) || 0
  const isCreator = currentUser?.role === 'creator'

  return (
    <div className="dashboard-layout">
      
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0"></div>
      <AppHeader />

      <main className="dashboard-container">
        
        <header className="dashboard-header">
          <div className="dashboard-title-wrap">
            <h1 className="dashboard-title">Revenue_Dashboard</h1>
            <p className="dashboard-subtitle">Financial Telemetry & Transmissions</p>
          </div>
        </header>

        {error && (
          <div className="cyber-card" style={{ borderColor: 'var(--cyber-red)', color: 'var(--cyber-red)', marginBottom: '2rem', padding: '1rem' }}>
            [ERR]: {error}
          </div>
        )}

        {/* Metrics Overview */}
        <section className="metrics-grid">
          <div className="cyber-card metric-card border-green">
            <div className="metric-header">
              <span>Creator_Balance</span>
              <RiMoneyDollarCircleLine className="metric-icon" />
            </div>
            <h2 className="metric-value">{money(earningsData?.availableBalance)}</h2>
          </div>
          <div className="cyber-card metric-card border-orange">
            <div className="metric-header">
              <span>Pending_Transfers</span>
              <RiRefund2Line className="metric-icon" />
            </div>
            <h2 className="metric-value">{money(earningsData?.pendingWithdrawalAmount)}</h2>
          </div>
          <div className="cyber-card metric-card border-cyan">
            <div className="metric-header">
              <span>Lifetime_Yield</span>
              <RiLineChartLine className="metric-icon" />
            </div>
            <h2 className="metric-value">{money(earningsData?.totalEarnings)}</h2>
          </div>
          <div className="cyber-card metric-card border-magenta">
            <div className="metric-header">
              <span>Network_Tax</span>
              <RiBankCardLine className="metric-icon" />
            </div>
            <h2 className="metric-value">{Number(earningsData?.commissionPercent || 0).toFixed(2)}%</h2>
          </div>
        </section>

        <div className="payout-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '3rem', marginTop: '3rem' }}>
          
          {/* Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* Sales Breakdown */}
            <section className="cyber-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--cyber-border)' }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-cyber-heading)', fontSize: '1.125rem', color: 'white', textTransform: 'uppercase' }}>Sales_Telemetry</h3>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {totalSales} completed transmissions across {earningsData?.salesBreakdown?.length || 0} nodes
                </p>
              </div>
              <div className="table-container" style={{ border: 'none' }}>
                <table className="cyber-table">
                  <thead>
                    <tr>
                      <th>Asset_Node</th>
                      <th style={{ textAlign: 'center' }}>Cycles</th>
                      <th style={{ textAlign: 'right' }}>Creator_Yield</th>
                      <th style={{ textAlign: 'right' }}>Gross_Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earningsData?.salesBreakdown?.length ? earningsData.salesBreakdown.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700, color: 'var(--cyber-cyan)' }}>{item.title}</td>
                        <td style={{ textAlign: 'center' }}>{item.salesCount}</td>
                        <td style={{ textAlign: 'right', fontWeight: 900, color: 'var(--cyber-green)' }}>{money(item.revenue)}</td>
                        <td style={{ textAlign: 'right', color: '#64748b' }}>{money(item.grossRevenue)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" style={{ padding: '3rem', textAlign: 'center' }}>No telemetry data found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Withdrawal History */}
            <section className="cyber-card" style={{ padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem', fontFamily: 'var(--font-cyber-heading)', fontSize: '1.125rem', color: 'white', textTransform: 'uppercase' }}>Transfer_Logs</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {earningsData?.withdrawals?.length ? earningsData.withdrawals.map((request) => (
                  <div key={request.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--cyber-border)', background: 'rgba(0,0,0,0.3)' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-cyber-heading)', fontSize: '1.25rem', color: 'white' }}>{money(request.amount)}</div>
                      <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
                        {new Date(request.createdAt).toLocaleString()} • {request.payoutMethod?.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`status-badge ${request.status === 'approved' ? 'status-success' : request.status === 'rejected' ? 'status-danger' : 'status-pending'}`}>
                        {request.status === 'approved' ? <RiCheckLine style={{ verticalAlign: 'middle', marginRight: '4px' }} /> : request.status === 'rejected' ? <RiCloseLine style={{ verticalAlign: 'middle', marginRight: '4px' }} /> : <RiRefund2Line style={{ verticalAlign: 'middle', marginRight: '4px' }} />}
                        {request.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>No transfers recorded.</div>
                )}
              </div>
            </section>

          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            <section className="cyber-card" style={{ padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--font-cyber-heading)', fontSize: '1.125rem', color: 'var(--cyber-magenta)', textTransform: 'uppercase' }}>Initiate_Transfer</h3>
              <p style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>
                Extract available credits to external account.
              </p>

              {isCreator ? (
                <form onSubmit={handleSubmitWithdrawal} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="cyber-label">Extraction_Amount</label>
                    <input
                      type="number" min="1" step="0.01"
                      className="cyber-input"
                      value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="10.00"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="cyber-label">Protocol</label>
                    <select
                      className="cyber-select"
                      value={form.payoutMethod} onChange={(e) => setForm({ ...form, payoutMethod: e.target.value })}
                    >
                      <option value="bank">Bank Wire</option>
                      <option value="paypal">PayPal</option>
                      <option value="crypto">Crypto Wallet</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="cyber-label">Destination_Node</label>
                    <textarea
                      rows="3" className="cyber-input"
                      value={form.payoutDetails} onChange={(e) => setForm({ ...form, payoutDetails: e.target.value })}
                      placeholder="Account number / Wallet Address"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="cyber-label">Data_Packet (Note)</label>
                    <input
                      type="text" className="cyber-input"
                      value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="cyber-btn interactive-ripple" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
                    {submitting ? 'Transmitting...' : 'Execute_Transfer'}
                  </button>
                </form>
              ) : (
                <div style={{ padding: '1rem', border: '1px solid var(--cyber-border)', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>
                  Restricted: Creator privilege required.
                </div>
              )}
            </section>

          </div>

        </div>
      </main>
    </div>
  )
}