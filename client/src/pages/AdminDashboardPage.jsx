import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminService, notificationService, messageService, socket } from '../services/api'
import MyLibraryPage from './MyLibraryPage.jsx'
import UploadAssetPage from './UploadAssetPage.jsx'
import { 
  RiLayoutMasonryFill, RiGalleryFill, RiUploadCloud2Fill, RiGroupFill, 
  RiShieldCheckFill, RiMessage3Fill, RiNotification3Line, RiLogoutBoxRLine,
  RiSettings4Line, RiEyeLine, RiProhibitedLine, RiDeleteBin6Line, RiCheckLine,
  RiCloseLine, RiSendPlane2Fill, RiUser3Line, RiMore2Fill
} from 'react-icons/ri'

export default function AdminDashboardPage({ variant = 'overview' }) {
  const [stats, setStats] = useState({ totalAssets: 0, revenue: 0, totalCreators: 0, pendingAssetsCount: 0, recentOrders: [] })
  const [creators, setCreators] = useState([])
  const [approvalQueue, setApprovalQueue] = useState([])
  const [notifications, setNotifications] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedAsset, setSelectedAsset] = useState(null)
  
  const navigate = useNavigate()
  const chatEndRef = useRef(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || user.role !== 'admin') {
       navigate('/auth/login')
       return
    }
    setAdminUser(user)
    
    // Connect Socket
    socket.connect()
    socket.emit('join', user.id)
    
    socket.on('newMessage', (msg) => {
      if (activeConversation && (msg.senderId === activeConversation.otherUser.id || msg.conversationId === activeConversation._id)) {
        setMessages(prev => [...prev, msg])
      }
      // Refresh conversations list
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
      const [statsRes, creatorsRes, pendingRes, notifyRes, convRes] = await Promise.all([
        adminService.getStats(),
        adminService.getCreators(),
        adminService.getPending(),
        notificationService.getAll(),
        messageService.getConversations()
      ])
      setStats(statsRes.data)
      setCreators(creatorsRes.data)
      setApprovalQueue(pendingRes.data)
      setNotifications(notifyRes.data)
      setConversations(convRes.data)
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
  }

  const fetchMessages = async (conv) => {
    setActiveConversation(conv)
    const res = await messageService.getMessages(conv._id)
    setMessages(res.data)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return

    const msgData = {
      conversationId: activeConversation._id,
      receiverId: activeConversation.otherUser.id,
      text: newMessage
    }

    try {
      const res = await messageService.sendMessage(msgData)
      setMessages(prev => [...prev, res.data])
      setNewMessage('')
      socket.emit('sendMessage', { ...res.data, receiverId: msgData.receiverId })
      fetchConversations()
    } catch (error) {
      console.error('Send error:', error)
    }
  }

  const handleApprove = async (id, status, reason = '') => {
    try {
      await adminService.approve(id, { status, rejectionReason: reason })
      setApprovalQueue(prev => prev.filter(a => a.id !== id))
      setSelectedAsset(null)
      setRejectionReason('')
      // Refresh stats
      const statsRes = await adminService.getStats()
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error updating asset status:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/auth/login')
  }

  if (loading) return <div className="loading-screen">Loading Dashboard...</div>

  const renderOverview = () => (
    <div className="admin-view-fade">
      <section className="adminx-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back, {adminUser.fullName || adminUser.username}. Here&apos;s your platform's status.</p>
        </div>
      </section>

      <section className="adminx-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Assets', value: stats.totalAssets, trend: '+12%' },
          { label: 'Total Revenue', value: `$${stats.revenue}`, trend: '+8%' },
          { label: 'Active Creators', value: stats.totalCreators, trend: '+3%' },
          { label: 'Pending Reviews', value: stats.pendingAssetsCount, trend: '' }
        ].map((item) => (
          <article key={item.label} className="surface-card" style={{ padding: '1.5rem' }}>
            <small style={{ color: '#64748b', fontWeight: 600 }}>{item.label}</small>
            <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{item.value}</h2>
            <span style={{ color: '#10b981', fontSize: '0.85rem' }}>{item.trend} since last month</span>
          </article>
        ))}
      </section>

      <section className="adminx-two-col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <article className="surface-card">
          <header style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0 }}>Recent Orders</h3>
          </header>
          <div className="admin-table">
             {stats.recentOrders?.length === 0 ? <p style={{ padding: '2rem', textAlign: 'center' }}>No recent orders.</p> : (
               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <tbody>
                   {stats.recentOrders.map(order => (
                     <tr key={order.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                       <td style={{ padding: '1rem' }}><strong>{order.Asset?.title}</strong></td>
                       <td style={{ padding: '1rem' }}>{order.User?.username}</td>
                       <td style={{ padding: '1rem' }}>${order.amount}</td>
                       <td style={{ padding: '1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
          </div>
        </article>
      </section>
    </div>
  )

  const renderCreators = () => (
    <div className="admin-view-fade">
      <section className="admin-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input type="search" placeholder="Search for creator or email..." style={{ flex: 1, padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }} />
        <div className="filter-chips" style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="chip active">All</span>
          <span className="chip">Active</span>
          <span className="chip">Suspended</span>
        </div>
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
            {creators.map(c => (
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
                      <RiDeleteBin6Line size={20} style={{ cursor: 'pointer' }} />
                   </div>
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
      <section className="surface-card" style={{ padding: 0, borderRadius: '1.5rem', overflow: 'hidden' }}>
        <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left' }}>ASSET REVIEW</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left' }}>CREATOR</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>PRICE</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>UPLOAD DATE</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'left' }}>STATUS</th>
              <th style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {approvalQueue.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem 2rem' }}>
                  <strong>{a.title}</strong>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{a.category}</div>
                </td>
                <td style={{ padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <img src={a.author?.avatarUrl} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                   <span>{a.author?.username}</span>
                </td>
                <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>${a.price}</td>
                <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1.25rem 2rem' }}>
                   <span className="status-badge pending" style={{ background: '#fef9c3', color: '#a16207', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>PENDING</span>
                </td>
                <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                      <button onClick={() => setSelectedAsset(a)} className="btn-solid small" style={{ background: '#1e293b' }}>Review</button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedAsset && (
        <section className="surface-card" style={{ marginTop: '2rem', padding: '2rem' }}>
          <h3>Reviewing: {selectedAsset.title}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
             <img src={selectedAsset.coverImageUrl} style={{ width: '100%', borderRadius: '1rem' }} />
             <div>
                <p><strong>Description:</strong> {selectedAsset.description}</p>
                <div style={{ marginTop: '2rem' }}>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Feedback / Rejection Reason</label>
                   <textarea 
                     value={rejectionReason} 
                     onChange={e => setRejectionReason(e.target.value)}
                     style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', minHeight: '100px' }} 
                     placeholder="Enter reason if rejecting..."
                   />
                   <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <button onClick={() => handleApprove(selectedAsset.id, 'published')} className="btn-solid" style={{ flex: 1, background: '#10b981' }}><RiCheckLine /> Approve Asset</button>
                      <button onClick={() => handleApprove(selectedAsset.id, 'rejected', rejectionReason)} className="btn-solid" style={{ flex: 1, background: '#ef4444' }}><RiCloseLine /> Reject Asset</button>
                   </div>
                </div>
             </div>
          </div>
        </section>
      )}
    </div>
  )

  const renderMessages = () => (
    <div className="messenger-container" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: 'calc(100vh - 180px)', background: '#fff', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      {/* Conversations List */}
      <aside style={{ borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Messages</h2>
        </header>
        <div className="conversations-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map(conv => (
            <div 
              key={conv._id} 
              onClick={() => fetchMessages(conv)}
              className={`conv-item ${activeConversation?._id === conv._id ? 'active' : ''}`}
              style={{ 
                padding: '1.25rem 1.5rem', 
                display: 'flex', 
                gap: '1rem', 
                cursor: 'pointer',
                background: activeConversation?._id === conv._id ? '#f8fafc' : 'transparent',
                borderLeft: activeConversation?._id === conv._id ? '4px solid #4f46e5' : '4px solid transparent'
              }}
            >
              <img src={conv.otherUser?.avatarUrl} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{conv.otherUser?.username}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.lastMessage || 'Start a conversation'}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Window */}
      <section style={{ display: 'flex', flexDirection: 'column', background: '#fcfdfe' }}>
        {activeConversation ? (
          <>
            <header style={{ padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={activeConversation.otherUser?.avatarUrl} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                <h3 style={{ margin: 0 }}>{activeConversation.otherUser?.username}</h3>
              </div>
              <RiMore2Fill size={24} color="#64748b" />
            </header>

            <div className="messages-flow" style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg, i) => {
                const isMine = msg.senderId === adminUser.id
                return (
                  <div key={i} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div style={{ 
                      padding: '0.8rem 1.2rem', 
                      borderRadius: isMine ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                      background: isMine ? '#4f46e5' : '#fff',
                      color: isMine ? '#fff' : '#1e293b',
                      boxShadow: isMine ? 'none' : '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      {msg.text}
                    </div>
                    <small style={{ display: 'block', marginTop: '0.25rem', textAlign: isMine ? 'right' : 'left', color: '#94a3b8' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '1.5rem 2rem', background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..." 
                style={{ flex: 1, padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} 
              />
              <button type="submit" className="btn-solid" style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RiSendPlane2Fill size={20} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <RiMessage3Fill size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </section>
    </div>
  )

  return (
    <main className="admin-shell">
      <header className="admin-topbar" style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '32px', height: '32px', background: '#4f46e5', borderRadius: '0.5rem' }} />
          <strong style={{ fontSize: '1.25rem', color: '#1e293b' }}>UIbrage</strong>
        </div>
        <div className="admin-user-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div className="admin-notif" style={{ position: 'relative', cursor: 'pointer' }}>
            <RiNotification3Line size={24} color="#64748b" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span style={{ position: 'absolute', top: -2, right: -2, width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />
            )}
          </div>
          <div className="admin-profile-btn" onClick={() => navigate('/profile/edit')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{adminUser.fullName || adminUser.username}</div>
              <small style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Administrator</small>
            </div>
            <img src={adminUser.avatarUrl} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #f1f5f9' }} />
          </div>
        </div>
      </header>

      <section className="admin-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 72px)' }}>
        <aside className="admin-sidebar" style={{ background: '#1e293b', padding: '2rem 1rem', color: '#fff' }}>
          <h4 style={{ color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1.5rem', padding: '0 1rem' }}>Main Menu</h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/admin/dashboard" className={`side-link ${variant === 'overview' ? 'active' : ''}`}><RiLayoutMasonryFill /> Dashboard</Link>
            <Link to="/admin/my-assets" className={`side-link ${variant === 'library' ? 'active' : ''}`}><RiGalleryFill /> My Assets</Link>
            <Link to="/admin/upload-asset" className={`side-link ${variant === 'upload' ? 'active' : ''}`}><RiUploadCloud2Fill /> Upload Asset</Link>
            <Link to="/admin/creators" className={`side-link ${variant === 'users' ? 'active' : ''}`}><RiGroupFill /> Creators</Link>
            <Link to="/admin/asset-approval" className={`side-link ${variant === 'moderation' ? 'active' : ''}`}><RiShieldCheckFill /> Asset Approval</Link>
            <Link to="/admin/messages" className={`side-link ${variant === 'messages' ? 'active' : ''}`}>
              <RiMessage3Fill /> Messages
              <span className="badge">4</span>
            </Link>
          </nav>
          
          <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #334155' }}>
            <button className="side-link"><RiSettings4Line /> Settings</button>
            <button className="side-link danger" onClick={handleLogout}><RiLogoutBoxRLine /> Logout</button>
          </div>
        </aside>

        <div className="admin-page-content" style={{ padding: '2.5rem', background: '#f8fafc', overflowY: 'auto', maxHeight: 'calc(100vh - 72px)' }}>
          {variant === 'overview' && renderOverview()}
          {variant === 'users' && renderCreators()}
          {variant === 'moderation' && renderApproval()}
          {variant === 'messages' && renderMessages()}
          {variant === 'library' && <MyLibraryPage isAdmin={true} />}
          {variant === 'upload' && <UploadAssetPage isAdmin={true} />}
        </div>
      </section>

      <style>{`
        .side-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1rem;
          color: #94a3b8;
          text-decoration: none;
          border-radius: 0.75rem;
          transition: all 0.2s;
          font-weight: 500;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        .side-link:hover, .side-link.active {
          background: #334155;
          color: #fff;
        }
        .side-link.active {
          background: #4f46e5;
        }
        .side-link.danger:hover {
          background: #ef4444;
        }
        .side-link .badge {
          margin-left: auto;
          background: #ef4444;
          color: #fff;
          font-size: 0.7rem;
          padding: 0.1rem 0.5rem;
          border-radius: 1rem;
        }
        .status-badge.published { background: #dcfce7; color: #15803d; }
        .status-badge.pending { background: #fef9c3; color: #a16207; }
        .admin-view-fade { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
