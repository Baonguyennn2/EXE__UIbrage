import { useState, useEffect } from 'react'
import AppHeader from '../components/AppHeader.jsx'
import { userService } from '../services/api'
import { RiMoneyDollarCircleLine, RiShoppingBag3Line, RiArrowUpSLine, RiLineChartLine } from 'react-icons/ri'

export default function EarningsPage() {
  const [earningsData, setEarningsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await userService.getEarnings()
        setEarningsData(res.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching earnings:', error)
        setLoading(false)
      }
    }
    fetchEarnings()
  }, [])

  if (loading) return <div className="loading-screen">Calculating earnings...</div>

  return (
    <main className="market-home" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <AppHeader />
      
      <div className="earnings-container" style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 2rem' }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', color: '#1e293b' }}>Revenue Dashboard</h1>
          <p style={{ color: '#64748b' }}>Track your sales and total earnings from the marketplace.</p>
        </header>

        <div className="earnings-summary-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          <div className="surface-card" style={{ padding: '2rem', borderLeft: '4px solid #4f46e5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', marginBottom: '1rem' }}>
              <RiMoneyDollarCircleLine size={24} />
              <span style={{ fontWeight: 600, letterSpacing: '0.05em' }}>TOTAL REVENUE</span>
            </div>
            <h2 style={{ fontSize: '3rem', margin: 0, color: '#1e293b' }}>${earningsData?.totalEarnings?.toLocaleString()}</h2>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
              <RiArrowUpSLine /> +12.5% from last month
            </div>
          </div>

          <div className="surface-card" style={{ padding: '2rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', marginBottom: '1rem' }}>
              <RiShoppingBag3Line size={24} />
              <span style={{ fontWeight: 600, letterSpacing: '0.05em' }}>TOTAL SALES</span>
            </div>
            <h2 style={{ fontSize: '3rem', margin: 0, color: '#1e293b' }}>
              {earningsData?.salesBreakdown?.reduce((sum, item) => sum + item.salesCount, 0)}
            </h2>
            <div style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
              Across {earningsData?.salesBreakdown?.length} published assets
            </div>
          </div>
        </div>

        <section className="surface-card">
          <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Sales Breakdown by Asset</h3>
            <RiLineChartLine size={20} color="#94a3b8" />
          </header>
          <div className="earnings-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: '1rem 2rem', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>ASSET TITLE</th>
                  <th style={{ padding: '1rem 2rem', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>SALES</th>
                  <th style={{ padding: '1rem 2rem', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>REVENUE</th>
                </tr>
              </thead>
              <tbody>
                {earningsData?.salesBreakdown?.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.25rem 2rem', fontWeight: 500, color: '#1e293b' }}>{item.title}</td>
                    <td style={{ padding: '1.25rem 2rem', color: '#64748b' }}>{item.salesCount} units</td>
                    <td style={{ padding: '1.25rem 2rem', fontWeight: 700, color: '#4f46e5', textAlign: 'right' }}>${item.revenue?.toLocaleString()}</td>
                  </tr>
                ))}
                {earningsData?.salesBreakdown?.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                      No sales data available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
