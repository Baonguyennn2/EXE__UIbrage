import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService, notificationService, messageService, socket, assetService } from '../services/api'
import MyLibraryPage from './MyLibraryPage.jsx'
import UploadAssetPage from './UploadAssetPage.jsx'
import ProfileEditPage from './ProfileEditPage.jsx'
import { 
  RiLayoutMasonryFill, RiGalleryFill, RiUploadCloud2Fill, RiGroupFill, 
  RiShieldCheckFill, RiMessage3Fill, RiNotification3Line, RiLogoutBoxRLine,
  RiSettings4Line, RiEyeLine, RiProhibitedLine, RiDeleteBin6Line, RiCheckLine,
  RiCloseLine, RiSendPlane2Fill, RiMore2Fill, RiStackFill, RiLockLine, RiArrowUpSLine,
  RiArrowDownSLine, RiWallet3Line, RiDownload2Line, RiShoppingCartLine
} from 'react-icons/ri'

export default function AdminDashboardPage({ variant = 'overview' }) {
  const [stats, setStats] = useState({ totalAssets: 0, revenue: 0, totalDownloads: 0, totalSales: 0, totalCreators: 0, pendingAssetsCount: 0, recentOrders: [] })
  const [myAssetStats, setMyAssetStats] = useState({ revenue: 0, downloads: 0, rating: 0 })
  const [creators, setCreators] = useState([])
  const [approvalQueue, setApprovalQueue] = useState([])
  const [allUserAssets, setAllUserAssets] = useState([])
  const [notifications, setNotifications] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [unreadMessages, setUnreadMessages] = useState(0)
  
  const navigate = useNavigate()
  const chatEndRef = useRef(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || user.role !== 'admin') {
       navigate('/auth/login')
       return
    }
    setAdminUser(user)
    
    socket.connect()
    socket.emit('join', user.id)
    
    socket.on('newMessage', (msg) => {
      if (activeConversation && (msg.senderId === activeConversation.otherUser.id || msg.conversationId === activeConversation._id)) {
        setMessages(prev => [...prev, msg])
      }
      fetchConversations()
    })

    return () => {
      socket.off('newMessage')
      socket.disconnect()
    }
  }, [activeConversation])

  const fetchData = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('user'))
      
      const [statsRes, creatorsRes, pendingRes, notifyRes, convRes, allAssetsRes, myAssetsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getCreators(),
        adminService.getPending(),
        notificationService.getAll(),
        messageService.getConversations(),
        assetService.getAll({}), // ALL assets
        assetService.getAll({ authorId: user.id }) // My assets
      ])
      
      console.log('Admin Stats:', statsRes.data)
      setStats({
        totalAssets: statsRes.data.totalAssets || 0,
        totalDownloads: statsRes.data.totalDownloads || 0,
        totalSales: statsRes.data.totalSales || 0,
        revenue: statsRes.data.revenue || 0,
        totalCreators: statsRes.data.totalCreators || 0,
        pendingAssetsCount: statsRes.data.pendingAssetsCount || 0
      })
      setCreators(creatorsRes.data)
      setApprovalQueue(pendingRes.data)
      setNotifications(notifyRes.data)
      setConversations(convRes.data)
      setAllUserAssets(allAssetsRes.data)
      
      const unread = convRes.data.filter(c => !c.lastMessage?.isRead && c.lastMessage?.senderId !== adminUser?.id).length
      setUnreadMessages(unread)

      const myAssets = myAssetsRes.data
      const totalDownloads = myAssets.reduce((sum, a) => sum + (a.downloads || 0), 0)
      const totalRev = myAssets.reduce((sum, a) => sum + (a.revenue || 0), 0)
      setMyAssetStats({ revenue: totalRev, downloads: totalDownloads, rating: 4.8 })

      setLoading(false)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchConversations = async () => {
    const res = await messageService.getConversations()
    setConversations(res.data)
    const unread = res.data.filter(c => !c.lastMessage?.isRead && c.lastMessage?.senderId !== adminUser?.id).length
    setUnreadMessages(unread)
  }

  const fetchMessages = async (conv) => {
    setActiveConversation(conv)
    const res = await messageService.getMessages(conv._id)
    setMessages(res.data)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return
    const msgData = { conversationId: activeConversation._id, receiverId: activeConversation.otherUser.id, text: newMessage }
    try {
      const res = await messageService.sendMessage(msgData)
      setMessages(prev => [...prev, res.data])
      setNewMessage('')
      socket.emit('sendMessage', { ...res.data, receiverId: msgData.receiverId })
      fetchConversations()
    } catch (error) { console.error('Send error:', error) }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/auth/login')
  }

  const renderOverview = () => (
    <div className="admin-view-fade">
      <section className="adminx-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dashboard</h1>
          <p style={{ color: '#64748b' }}>Welcome back, {adminUser?.fullName || adminUser?.username}. Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn-ghost" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><RiLayoutMasonryFill /> View Analytics</button>
           <button className="btn-solid" onClick={() => navigate('/admin/upload-asset')} style={{ background: '#4f46e5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><RiUploadCloud2Fill /> Upload New Asset</button>
        </div>
      </section>

      <section className="adminx-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Assets', value: stats.totalAssets || 0, trend: '+12%', icon: <RiGalleryFill />, color: '#4f46e5' },
          { label: 'Total Downloads', value: (stats.totalDownloads || 0).toLocaleString(), trend: '+18%', icon: <RiDownload2Line />, color: '#8b5cf6' },
          { label: 'Total Sales', value: `$${(stats.totalSales || 0).toLocaleString()}`, trend: '-5%', icon: <RiShoppingCartLine />, color: '#f59e0b' },
          { label: 'Monthly Revenue', value: `$${(stats.revenue || 0).toLocaleString()}`, trend: '+22%', icon: <RiWallet3Line />, color: '#10b981' }
        ].map((item) => (
          <article key={item.label} className="surface-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                {item.icon}
              </div>
              <span style={{ color: item.trend.startsWith('+') ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                {item.trend.startsWith('+') ? <RiArrowUpSLine /> : <RiArrowDownSLine />} {item.trend}
              </span>
            </div>
            <div>
              <small style={{ color: '#64748b', fontWeight: 600 }}>{item.label}</small>
              <h2 style={{ fontSize: '1.75rem', margin: '0.25rem 0' }}>{item.value}</h2>
            </div>
          </article>
        ))}
      </section>

      <section className="adminx-grid-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
         <article className="surface-card">
            <header style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ margin: 0 }}>Top 10 Best-Selling Assets</h3>
               <button className="btn-link" style={{ fontSize: '0.85rem' }}>View All</button>
            </header>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Asset</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>Downloads</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Revenue</th>
                  </tr>
               </thead>
               <tbody>
                  {allUserAssets.filter(a => a.downloads > 0).slice(0, 5).map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                       <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={a.coverImageUrl} style={{ width: '40px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.title}</div>
                            <small style={{ color: '#94a3b8' }}>{a.category}</small>
                          </div>
                       </td>
                       <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>{a.downloads || 0}</td>
                       <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#4f46e5' }}>${a.revenue || 0}</td>
                    </tr>
                  ))}
                  {allUserAssets.length === 0 && <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No data available</td></tr>}
               </tbody>
            </table>
         </article>

         <article className="surface-card">
            <header style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ margin: 0 }}>Underperforming Assets</h3>
               <button className="btn-link" style={{ fontSize: '0.85rem' }}>Improve All</button>
            </header>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Asset</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>Visits</th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Conversion</th>
                  </tr>
               </thead>
               <tbody>
                  {allUserAssets.filter(a => (a.downloads || 0) < 5).slice(0, 5).map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                       <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={a.coverImageUrl} style={{ width: '40px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.title}</div>
                            <small style={{ color: '#ef4444' }}>Needs attention</small>
                          </div>
                       </td>
                       <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>{a.viewCount || 0}</td>
                       <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#94a3b8' }}>0.2%</td>
                    </tr>
                  ))}
                  {allUserAssets.length === 0 && <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No data available</td></tr>}
               </tbody>
            </table>
         </article>
      </section>

      <section className="surface-card">
         <header style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Top Selling Creators</h3>
            <button className="btn-link" style={{ fontSize: '0.85rem' }}>View Full Leaderboard</button>
         </header>
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
               <tr>
                  <th style={{ padding: '1rem 2rem', textAlign: 'left' }}>Rank</th>
                  <th style={{ padding: '1rem 2rem', textAlign: 'left' }}>Creator</th>
                  <th style={{ padding: '1rem 2rem', textAlign: 'left' }}>Specialization</th>
                  <th style={{ padding: '1rem 2rem', textAlign: 'center' }}>Total Assets</th>
                  <th style={{ padding: '1rem 2rem', textAlign: 'right' }}>Total Revenue</th>
               </tr>
            </thead>
            <tbody>
               {creators.length > 0 ? creators.slice(0, 5).map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                     <td style={{ padding: '1rem 2rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i===0 ? '#fef3c7' : '#f1f5f9', color: i===0 ? '#d97706' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>{i+1}</div>
                     </td>
                     <td style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={c.avatarUrl} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                        <div>
                           <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.fullName || c.username}</div>
                           <small style={{ color: '#10b981' }}>Top Rated</small>
                        </div>
                     </td>
                     <td style={{ padding: '1rem 2rem', color: '#4f46e5', fontWeight: 600 }}>{c.jobTitle || 'Contributor'}</td>
                     <td style={{ padding: '1rem 2rem', textAlign: 'center' }}>{c.assetCount}</td>
                     <td style={{ padding: '1rem 2rem', textAlign: 'right', fontWeight: 800 }}>${(c.revenue || 0).toLocaleString()}</td>
                  </tr>
               )) : <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No creators found with role &apos;creator&apos;.</td></tr>}
            </tbody>
         </table>
      </section>
    </div>
  )

  const renderCreators = () => (
    <div className="admin-view-fade">
      <section className="adminx-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Creators Management</h1>
      </section>
      <section className="surface-card" style={{ padding: 0, borderRadius: '1.5rem', overflow: 'hidden' }}>
        <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left' }}>CREATOR</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left' }}>EMAIL</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>ASSETS</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>SALES</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left' }}>STATUS</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {creators.length === 0 ? <tr><td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>No creators found.</td></tr> : creators.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={c.avatarUrl} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <strong>{c.fullName || c.username}</strong>
                </td>
                <td style={{ padding: '1.25rem 2rem' }}>{c.email}</td>
                <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>{c.assetCount}</td>
                <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>{c.totalSales}</td>
                <td style={{ padding: '1.25rem 2rem' }}>
                  <span className="status-badge active" style={{ background: '#dcfce7', color: '#15803d', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>ACTIVE</span>
                </td>
                <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', color: '#94a3b8' }}>
                      <RiEyeLine size={20} style={{ cursor: 'pointer' }} />
                      <RiProhibitedLine size={20} style={{ cursor: 'pointer' }} />
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )

  const renderMessages = () => (
    <div className="messenger-container" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: 'calc(100vh - 180px)', background: '#fff', borderRadius: '1.5rem', overflow: 'hidden' }}>
      <aside style={{ borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}><h2>Messages</h2></header>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map(conv => (
            <div key={conv._id} onClick={() => fetchMessages(conv)} style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', cursor: 'pointer', background: activeConversation?._id === conv._id ? '#f8fafc' : 'transparent', borderLeft: activeConversation?._id === conv._id ? '4px solid #4f46e5' : '4px solid transparent' }}>
              <img src={conv.otherUser?.avatarUrl} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
              <div><div style={{ fontWeight: 700 }}>{conv.otherUser?.username}</div><div style={{ fontSize: '0.85rem', color: '#64748b' }}>{conv.lastMessage}</div></div>
            </div>
          ))}
        </div>
      </aside>
      <section style={{ display: 'flex', flexDirection: 'column' }}>
        {activeConversation ? (
          <>
            <header style={{ padding: '1rem 2rem', borderBottom: '1px solid #f1f5f9' }}><h3>{activeConversation.otherUser?.username}</h3></header>
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.senderId === adminUser.id ? 'flex-end' : 'flex-start', background: m.senderId === adminUser.id ? '#4f46e5' : '#f1f5f9', color: m.senderId === adminUser.id ? '#fff' : '#1e293b', padding: '0.8rem 1.2rem', borderRadius: '1rem' }}>{m.text}</div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1rem' }}>
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '2rem', border: '1px solid #e2e8f0' }} />
              <button type="submit" className="btn-solid">Send</button>
            </form>
          </>
        ) : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Select a chat</div>}
      </section>
    </div>
  )

  const renderAllAssets = () => (
    <div className="admin-view-fade">
       <section className="adminx-header" style={{ marginBottom: '2rem' }}>
        <h1>All Assets Management</h1>
      </section>
      <section className="surface-card" style={{ padding: 0, borderRadius: '1.5rem', overflow: 'hidden' }}>
        <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left' }}>ASSET</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left' }}>CREATOR</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>STATUS</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {allUserAssets.length === 0 ? <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>No assets found.</td></tr> : allUserAssets.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem 2rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={a.coverImageUrl} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div><strong>{a.title}</strong><div style={{ fontSize: '0.8rem', color: '#64748b' }}>{a.category}</div></div>
                   </div>
                </td>
                <td style={{ padding: '1.25rem 2rem' }}>{a.author?.username}</td>
                <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>
                   <span className={`status-badge ${a.status}`} style={{ padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, background: a.status === 'published' ? '#dcfce7' : '#fef9c3', color: a.status === 'published' ? '#15803d' : '#a16207' }}>{a.status?.toUpperCase()}</span>
                </td>
                <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>
                   <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}><RiEyeLine size={20} style={{ cursor: 'pointer' }} onClick={() => navigate(`/marketplace/assets/${a.id}`)} /><RiLockLine size={20} style={{ cursor: 'pointer' }} /></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )

  const renderApproval = () => (
    <div className="admin-view-fade">
       <section className="adminx-header" style={{ marginBottom: '2rem' }}>
        <h1>Asset Approval Management</h1>
      </section>
      <section className="surface-card" style={{ padding: 0, borderRadius: '1.5rem', overflow: 'hidden' }}>
        <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left' }}>ASSET REVIEW</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left' }}>CREATOR</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>PRICE</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>UPLOAD DATE</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {approvalQueue.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem 2rem' }}><strong>{a.title}</strong><div style={{ fontSize: '0.85rem', color: '#64748b' }}>{a.category}</div></td>
                <td style={{ padding: '1.25rem 2rem' }}>{a.author?.username}</td>
                <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>${a.price}</td>
                <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}><button onClick={() => setSelectedAsset(a)} className="btn-solid small">Review</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {selectedAsset && (
        <section className="surface-card" style={{ marginTop: '2rem', padding: '2rem' }}>
           <h3>Reviewing: {selectedAsset.title}</h3>
           <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} style={{ width: '100%', minHeight: '100px', margin: '1rem 0', padding: '1rem' }} placeholder="Rejection feedback..." />
           <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => adminService.approve(selectedAsset.id, { status: 'published' }).then(fetchData)} className="btn-solid" style={{ background: '#10b981' }}>Approve</button>
              <button onClick={() => adminService.approve(selectedAsset.id, { status: 'rejected', rejectionReason }).then(fetchData)} className="btn-solid" style={{ background: '#ef4444' }}>Reject</button>
           </div>
        </section>
      )}
    </div>
  )

  if (loading) return <div className="loading-screen">Loading Dashboard...</div>

  return (
    <main className="admin-shell" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <header className="admin-topbar" style={{ background: '#232a3b', color: '#fff', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '32px', height: '32px', background: '#4f46e5', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <RiLayoutMasonryFill size={20} color="#fff" />
          </div>
          <strong style={{ fontSize: '1.25rem', letterSpacing: '0.02em' }}>UIbrage</strong>
        </div>
        <div className="admin-user-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <RiNotification3Line size={24} />
            {notifications.filter(n => !n.isRead).length > 0 && <span style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #232a3b' }} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{adminUser?.fullName || adminUser?.username}</div>
              <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Admin</small>
            </div>
            <img src={adminUser?.avatarUrl} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
          </div>
        </div>
      </header>

      <section className="admin-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 60px)' }}>
        <aside className="admin-sidebar" style={{ background: '#232a3b', padding: '2rem 1rem', color: '#fff', display: 'flex', flexDirection: 'column', position: 'sticky', top: '60px', height: 'calc(100vh - 60px)' }}>
          <h4 style={{ color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1.5rem', padding: '0 1rem' }}>Main Menu</h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
            <button onClick={() => navigate('/admin/dashboard')} className={`side-link ${variant === 'overview' ? 'active' : ''}`}><RiLayoutMasonryFill /> Dashboard</button>
            <button onClick={() => navigate('/admin/my-assets')} className={`side-link ${variant === 'library' ? 'active' : ''}`}><RiGalleryFill /> My Assets</button>
            <button onClick={() => navigate('/admin/upload-asset')} className={`side-link ${variant === 'upload' ? 'active' : ''}`}><RiUploadCloud2Fill /> Upload Asset</button>
            <button onClick={() => navigate('/admin/creators')} className={`side-link ${variant === 'users' ? 'active' : ''}`}><RiGroupFill /> Creators</button>
            <button onClick={() => navigate('/admin/asset-approval')} className={`side-link ${variant === 'moderation' ? 'active' : ''}`}><RiShieldCheckFill /> Asset Approval</button>
            <button onClick={() => navigate('/admin/all-assets')} className={`side-link ${variant === 'all-assets' ? 'active' : ''}`}><RiStackFill /> All User Assets</button>
            <button onClick={() => navigate('/admin/messages')} className={`side-link ${variant === 'messages' ? 'active' : ''}`}>
              <RiMessage3Fill /> Messages {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
            </button>
          </nav>
          <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => navigate('/admin/settings')} className={`side-link ${variant === 'settings' ? 'active' : ''}`}><RiSettings4Line /> Settings</button>
            <button className="side-link danger" onClick={handleLogout}><RiLogoutBoxRLine /> Logout</button>
          </div>
        </aside>

        <div className="admin-page-content" style={{ padding: '2.5rem', overflowY: 'auto' }}>
           <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              {variant === 'overview' && renderOverview()}
              {variant === 'users' && renderCreators()}
              {variant === 'moderation' && renderApproval()}
              {variant === 'all-assets' && renderAllAssets()}
              {variant === 'messages' && renderMessages()}
              {variant === 'library' && <MyLibraryPage isAdmin={true} customStats={myAssetStats} />}
              {variant === 'upload' && <UploadAssetPage isAdmin={true} />}
              {variant === 'settings' && <ProfileEditPage isAdminContext={true} />}
           </div>
        </div>
      </section>

      <style>{`
        .side-link { display: flex; align-items: center; gap: 1rem; padding: 0.8rem 1rem; color: #94a3b8; text-decoration: none; border-radius: 0.75rem; transition: 0.2s; font-weight: 600; background: none; border: none; width: 100%; text-align: left; cursor: pointer; }
        .side-link:hover, .side-link.active { background: rgba(255,255,255,0.05); color: #fff; }
        .side-link.active { background: #4f46e5; }
        .side-link.danger:hover { background: #ef4444; }
        .side-link .badge { margin-left: auto; background: #ef4444; color: #fff; font-size: 0.7rem; padding: 0.1rem 0.5rem; border-radius: 1rem; }
        .btn-link { background: none; border: none; color: #4f46e5; font-weight: 600; cursor: pointer; }
        .admin-view-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  )
}
