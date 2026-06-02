import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../services/SocketContext'
import MyLibraryPage from './MyLibraryPage.jsx'
import UploadAssetPage from './UploadAssetPage.jsx'
import ProfileEditPage from './ProfileEditPage.jsx'
import { 
  RiLayoutMasonryFill, RiGalleryFill, RiUploadCloud2Fill, RiGroupFill, 
  RiShieldCheckFill, RiMessage3Fill, RiNotification3Line, RiLogoutBoxRLine,
  RiSettings4Line, RiEyeLine, RiProhibitedLine, RiDeleteBin6Line, RiCheckLine,
  RiCloseLine, RiSendPlane2Fill, RiMore2Fill, RiStackFill, RiLockLine, RiArrowUpSLine,
  RiArrowDownSLine, RiWallet3Line, RiArrowLeftLine, RiDownload2Line, RiShoppingCartLine,
  RiMenuLine, RiCheckDoubleFill, RiCustomerService2Fill, RiImageAddLine,
  RiBankCardLine, RiRefund2Line, RiPercentLine, RiFileList3Line, RiCheckboxCircleLine, RiCloseCircleLine
} from 'react-icons/ri'
import { adminService, notificationService, messageService, assetService, userService } from '../services/api'
import LoadingScreen from '../components/LoadingScreen.jsx'

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [typingUsers, setTypingUsers] = useState({}) // { conversationId: true/false }
  const [onlineUsers, setOnlineUsers] = useState({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const [withdrawals, setWithdrawals] = useState([])
  const [commissionPercent, setCommissionPercent] = useState(5)
  const [commissionDraft, setCommissionDraft] = useState(5)
  const [withdrawalReviewNote, setWithdrawalReviewNote] = useState('')
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState(null)
  const [commissionSaving, setCommissionSaving] = useState(false)
  
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)
  
  const navigate = useNavigate()
  const chatEndRef = useRef(null)
  const activeConvRef = useRef(null)
  const adminUserRef = useRef(null)
  const { socket } = useSocket()

  // Cập nhật ref khi state thay đổi
  useEffect(() => { activeConvRef.current = activeConversation }, [activeConversation])
  useEffect(() => { adminUserRef.current = adminUser }, [adminUser])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || user.role !== 'admin') {
       navigate('/auth/login')
       return
    }
    setAdminUser(user)
    adminUserRef.current = user
    
    if (!socket) return

    const handleNewMessage = (msg) => {
      const currentConv = activeConvRef.current
      if (currentConv && msg.conversationId === currentConv._id) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id || (m.text === msg.text && m.senderId === msg.senderId && m.createdAt === msg.createdAt))) return prev
          return [...prev, msg]
        })
      }
      fetchConversationsRef.current()
    }

    const handleTyping = (data) => {
      const { userId, conversationId } = data
      const currentUser = adminUserRef.current
      if (userId === currentUser?.id) return

      const currentConv = activeConvRef.current
      if (currentConv && (conversationId === currentConv._id || conversationId?.toString() === currentConv._id?.toString())) {
        setTypingUsers(prev => ({ ...prev, [conversationId]: true }))
      }
    }

    const handleStopTyping = (data) => {
      const { userId, conversationId } = data
      setTypingUsers(prev => ({ ...prev, [conversationId]: false }))
    }

    socket.on('newMessage', handleNewMessage)
    socket.on('userTyping', handleTyping)
    socket.on('userStopTyping', handleStopTyping)

    socket.on('userOnline', (data) => {
      setOnlineUsers(prev => ({ ...prev, [data.userId]: data.online }))
    })

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('userTyping', handleTyping)
      socket.off('userStopTyping', handleStopTyping)
      socket.off('userOnline')
    }
  }, [socket]) // Chỉ chạy 1 lần, dùng ref để truy cập state mới nhất

  const fetchConversationsRef = useRef()
  const fetchData = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('user'))
      
      const [statsRes, creatorsRes, pendingRes, notifyRes, convRes, allAssetsRes, myAssetsRes, withdrawalsRes, commissionRes] = await Promise.all([
        adminService.getStats(),
        adminService.getCreators(),
        adminService.getPending(),
        notificationService.getAll(),
        messageService.getConversations(),
        assetService.getAll({ isAdmin: 'true' }), // All assets (admin view)
        assetService.getAll({ authorId: user.id }), // Admin's own assets
        adminService.getWithdrawals({ status: 'all' }),
        adminService.getCommission()
      ])
      
      console.log('Admin Dashboard Stats:', statsRes.data)
      
      // Calculate real trends by comparing with data from stats API
      // If the API provides previousPeriod data, use it; otherwise compute from what we have
      const statsData = statsRes.data
      setStats({
        totalAssets: statsData.totalAssets || 0,
        totalDownloads: statsData.totalDownloads || 0,
        totalSales: statsData.totalSales || 0,
        revenue: statsData.revenue || 0,
        totalCreators: statsData.totalCreators || 0,
        pendingAssetsCount: statsData.pendingAssetsCount || 0,
        // Real trends calculated from available data
        trends: {
          totalAssets: statsData.assetTrend !== undefined ? statsData.assetTrend : null,
          downloads: statsData.downloadTrend !== undefined ? statsData.downloadTrend : null,
          sales: statsData.salesTrend !== undefined ? statsData.salesTrend : null,
          revenue: statsData.revenueTrend !== undefined ? statsData.revenueTrend : null
        }
      })
      setCreators(creatorsRes.data)
      setApprovalQueue(pendingRes.data)
      setNotifications(notifyRes.data)
      setConversations(convRes.data)
      setAllUserAssets(allAssetsRes.data)
      setWithdrawals(withdrawalsRes.data || [])
      setCommissionPercent(Number(commissionRes.data?.commissionPercent || statsData.commissionPercent || 5))
      setCommissionDraft(Number(commissionRes.data?.commissionPercent || statsData.commissionPercent || 5))
      
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

    // Fetch online status
    const userIds = res.data.map(c => c.otherUser?.id).filter(Boolean)
    if (userIds.length > 0) {
      try {
        const statusRes = await userService.getOnlineStatus(userIds)
        if (statusRes.data) {
          setOnlineUsers(prev => ({ ...prev, ...statusRes.data }))
        }
      } catch (e) { /* ignore */ }
    }
  }
  fetchConversationsRef.current = fetchConversations

  const fetchMessages = async (conv) => {
    setActiveConversation(conv)
    setTypingUsers(prev => ({ ...prev, [conv._id]: false }))
    const res = await messageService.getMessages(conv._id)
    setMessages(res.data)
    
    // Mark as read
    if (conv.lastMessage && !conv.lastMessage.isRead && conv.lastMessage.senderId !== adminUser.id) {
       socket?.emit('markRead', { conversationId: conv._id, userId: adminUser.id })
       fetchConversations()
    }
  }

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value)

    if (!socket || !activeConversation) return

    if (!isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('typing', {
        receiverId: activeConversation.otherUser.id,
        conversationId: activeConversation._id
      })
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      socket.emit('stopTyping', {
        receiverId: activeConversation.otherUser.id,
        conversationId: activeConversation._id
      })
    }, 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return

    const msgText = newMessage
    setNewMessage('')

    // Stop typing
    if (isTypingRef.current) {
      isTypingRef.current = false
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      socket?.emit('stopTyping', {
        receiverId: activeConversation.otherUser.id,
        conversationId: activeConversation._id
      })
    }

    const msgData = { conversationId: activeConversation._id, receiverId: activeConversation.otherUser.id, text: msgText }
    try {
      const res = await messageService.sendMessage(msgData)
      setMessages(prev => [...prev, res.data])
      socket.emit('sendMessage', { ...res.data, receiverId: msgData.receiverId, senderId: adminUser.id })
      fetchConversations()
    } catch (error) { console.error('Send error:', error) }
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeConversation) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const uploadRes = await messageService.uploadImage(formData)
      const imageUrl = uploadRes.data.url

      const msgData = { 
        conversationId: activeConversation._id, 
        receiverId: activeConversation.otherUser.id, 
        image: imageUrl 
      }
      
      const res = await messageService.sendMessage(msgData)
      setMessages(prev => [...prev, res.data])
      
      if (socket) {
        socket.emit('sendMessage', { 
          ...res.data, 
          receiverId: msgData.receiverId, 
          senderId: adminUser.id,
          conversationId: activeConversation._id
        })
      }
      fetchConversations()
    } catch (error) {
      console.error('Upload image error:', error)
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/auth/login')
  }

  const handleSaveCommission = async () => {
    try {
      setCommissionSaving(true)
      await adminService.updateCommission({ commissionPercent: commissionDraft })
      await fetchData()
    } catch (error) {
      console.error('Error updating commission:', error)
      alert(error?.response?.data?.message || 'Failed to update commission')
    } finally {
      setCommissionSaving(false)
    }
  }

  const handleReviewWithdrawal = async (requestId, status) => {
    try {
      setProcessingWithdrawalId(requestId)
      await adminService.reviewWithdrawal(requestId, { status, reviewNote: withdrawalReviewNote })
      setWithdrawalReviewNote('')
      await fetchData()
    } catch (error) {
      console.error('Error reviewing withdrawal:', error)
      alert(error?.response?.data?.message || 'Failed to review withdrawal')
    } finally {
      setProcessingWithdrawalId(null)
    }
  }

  const renderWithdrawals = () => {
    const pendingCount = withdrawals.filter((item) => item.status === 'pending').length
    const pendingAmount = withdrawals
      .filter((item) => item.status === 'pending')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    const formatMoney = (value) => `$${Number(value || 0).toLocaleString()}`

    return (
      <div className="admin-view-fade">
        <section className="adminx-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>Withdrawal Requests</h1>
            <p style={{ color: '#64748b' }}>Review creator payout requests and keep commission settings in sync.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontWeight: 700 }}>
            <RiBankCardLine size={20} /> Finance
          </div>
        </section>

        <section className="adminx-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <article className="surface-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <small style={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.08em' }}>COMMISSION</small>
                <h2 style={{ margin: '0.4rem 0 0' }}>{commissionPercent.toFixed(2)}%</h2>
              </div>
              <RiPercentLine size={22} color="#4f46e5" />
            </div>
          </article>
          <article className="surface-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <small style={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.08em' }}>PENDING REQUESTS</small>
                <h2 style={{ margin: '0.4rem 0 0' }}>{pendingCount}</h2>
              </div>
              <RiFileList3Line size={22} color="#f59e0b" />
            </div>
          </article>
          <article className="surface-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <small style={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.08em' }}>PENDING AMOUNT</small>
                <h2 style={{ margin: '0.4rem 0 0' }}>{formatMoney(pendingAmount)}</h2>
              </div>
              <RiWallet3Line size={22} color="#10b981" />
            </div>
          </article>
        </section>

        <section className="surface-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0 }}>Platform commission</h3>
              <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>Adjust the fee added on top of creator asset price when a sale completes.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="number"
                min="0"
                step="0.1"
                value={commissionDraft}
                onChange={(e) => setCommissionDraft(e.target.value)}
                style={{ width: '140px', padding: '0.8rem 1rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}
              />
              <button onClick={handleSaveCommission} className="btn-solid" disabled={commissionSaving} style={{ background: '#4f46e5' }}>
                {commissionSaving ? 'Saving...' : 'Save commission'}
              </button>
            </div>
          </div>
        </section>

        <section className="surface-card" style={{ padding: 0, overflow: 'hidden' }}>
          <header style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Review queue</h3>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                value={withdrawalReviewNote}
                onChange={(e) => setWithdrawalReviewNote(e.target.value)}
                placeholder="Admin note for approval/rejection"
                style={{ minWidth: '280px', padding: '0.7rem 0.9rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}
              />
            </div>
          </header>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Creator</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Requested</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Note</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No withdrawal requests yet.</td></tr>
                ) : withdrawals.map((request) => (
                  <tr key={request.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={request.creator?.avatarUrl || '/default-avatar.png'} alt="creator" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 700 }}>{request.creator?.fullName || request.creator?.username || 'Unknown creator'}</div>
                          <small style={{ color: '#94a3b8' }}>{request.creator?.email || request.userId}</small>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 800 }}>{formatMoney(request.amount)}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
                        background: request.status === 'approved' ? '#dcfce7' : request.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: request.status === 'approved' ? '#15803d' : request.status === 'rejected' ? '#b91c1c' : '#a16207'
                      }}>
                        {request.status === 'approved' ? <RiCheckboxCircleLine /> : request.status === 'rejected' ? <RiCloseCircleLine /> : <RiRefund2Line />}
                        {request.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{new Date(request.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{request.note || request.adminNote || '-'}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      {request.status === 'pending' ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleReviewWithdrawal(request.id, 'rejected')}
                            disabled={processingWithdrawalId === request.id}
                            className="btn-ghost"
                            style={{ border: '1px solid #fecaca', color: '#b91c1c' }}
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleReviewWithdrawal(request.id, 'approved')}
                            disabled={processingWithdrawalId === request.id}
                            className="btn-solid"
                            style={{ background: '#10b981' }}
                          >
                            {processingWithdrawalId === request.id ? 'Working...' : 'Approve'}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    )
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
        {(() => {
          const t = stats.trends || {}
          const trendItems = [
            { key: 'totalAssets', label: 'Total Assets', value: stats.totalAssets || 0, icon: <RiGalleryFill />, color: '#4f46e5' },
            { key: 'downloads', label: 'Total Downloads', value: (stats.totalDownloads || 0).toLocaleString(), icon: <RiDownload2Line />, color: '#8b5cf6' },
            { key: 'sales', label: 'Total Sales', value: `$${(stats.totalSales || 0).toLocaleString()}`, icon: <RiShoppingCartLine />, color: '#f59e0b' },
            { key: 'revenue', label: 'Monthly Revenue', value: `$${(stats.revenue || 0).toLocaleString()}`, icon: <RiWallet3Line />, color: '#10b981' }
          ]
          return trendItems.map((item) => {
            const trendVal = t[item.key]
            const trendDisplay = trendVal != null ? (trendVal >= 0 ? `+${trendVal}%` : `${trendVal}%`) : null
            return (
              <article key={item.label} className="surface-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    {item.icon}
                  </div>
                  <span style={{ color: trendDisplay && trendDisplay.startsWith('+') ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    {trendDisplay && trendDisplay.startsWith('+') ? <RiArrowUpSLine /> : <RiArrowDownSLine />} {trendDisplay || '--'}
                  </span>
                </div>
                <div>
                  <small style={{ color: '#64748b', fontWeight: 600 }}>{item.label}</small>
                  <h2 style={{ fontSize: '1.75rem', margin: '0.25rem 0' }}>{item.value}</h2>
                </div>
              </article>
            )
          })
        })()}
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
                  {allUserAssets.length > 0 ? [...allUserAssets].sort((a,b) => (b.downloads||0) - (a.downloads||0)).slice(0, 5).map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                       <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={a.coverImageUrl} style={{ width: '40px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.title}</div>
                            <small style={{ color: '#94a3b8' }}>{a.category || 'General'}</small>
                          </div>
                       </td>
                       <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>{a.downloads || 0}</td>
                       <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#4f46e5' }}>${a.revenue || 0}</td>
                    </tr>
                  )) : <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No data available</td></tr>}
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
                  {allUserAssets.length > 0 ? [...allUserAssets].sort((a,b) => (a.downloads||0) - (b.downloads||0)).slice(0, 5).map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                       <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={a.coverImageUrl} style={{ width: '40px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.title}</div>
                            <small style={{ color: '#ef4444' }}>Needs attention</small>
                          </div>
                       </td>
                       <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>{a.viewCount || 0}</td>
                       <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#94a3b8' }}>{a.downloads && a.viewCount ? ((a.downloads / a.viewCount) * 100).toFixed(1) + '%' : '—'}</td>
                    </tr>
                  )) : <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No data available</td></tr>}
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
               {creators.length > 0 ? creators.sort((a,b) => (b.revenue||0) - (a.revenue||0)).slice(0, 5).map((c, i) => (
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
               )) : <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No data available</td></tr>}
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
    <div className="messenger-container" style={{ 
      display: 'grid', 
      gridTemplateColumns: '320px 1fr', 
      height: 'calc(100vh - 200px)', 
      gap: '1.5rem',
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      <aside style={{ 
        background: '#fff', 
        borderRadius: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #f1f5f9'
      }}>
        <header style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 800 }}>Messages</h2>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#22c55e',
            border: '2px solid #fff',
            boxShadow: '0 0 0 2px #dcfce7'
          }} title="Server Connected" />
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {conversations.length === 0 && (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
              <RiMessage3Fill size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No conversations found</p>
            </div>
          )}
          {conversations.map(conv => {
            const isActive = activeConversation?._id === conv._id
            const isTyping = typingUsers[conv._id]
            const isOtherOnline = onlineUsers[conv.otherUser?.id]

            return (
              <div key={conv._id} onClick={() => fetchMessages(conv)} style={{ 
                padding: '1rem 1.25rem', 
                display: 'flex', 
                gap: '1rem', 
                cursor: 'pointer', 
                borderRadius: '1rem',
                margin: '2px 0',
                background: isActive ? '#f1f5ff' : 'transparent', 
                transition: 'all 0.2s ease',
                position: 'relative'
              }}>
                {isActive && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '4px', background: '#4f46e5', borderRadius: '0 4px 4px 0' }} />}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={conv.otherUser?.avatarUrl || '/default-avatar.png'} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                  {isOtherOnline && (
                    <span style={{
                      position: 'absolute', bottom: 2, right: 2,
                      width: 12, height: 12, borderRadius: '50%',
                      background: '#22c55e', border: '2px solid #fff'
                    }} />
                  )}
                </div>
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{conv.otherUser?.username || 'Unknown'}</span>
                    {conv.lastMessage?.createdAt && (
                       <small style={{ fontWeight: 400, color: '#94a3b8' }}>
                         {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </small>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '0.82rem', 
                    color: isTyping ? '#4f46e5' : '#64748b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontStyle: isTyping ? 'italic' : 'normal',
                    marginTop: '2px'
                  }}>
                    {isTyping ? 'đang soạn tin...' : (conv.lastMessage?.image ? 'Sent an image' : (conv.lastMessage?.text || conv.lastMessage || 'Start a conversation'))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      <section style={{ 
        background: '#fff', 
        borderRadius: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #f1f5f9'
      }}>
        {activeConversation ? (
          <>
            <header style={{ 
              padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <img src={activeConversation.otherUser?.avatarUrl || '/default-avatar.png'} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  {onlineUsers[activeConversation.otherUser?.id] && (
                    <span style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 10, height: 10, borderRadius: '50%',
                      background: '#22c55e', border: '2px solid #fff'
                    }} />
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{activeConversation.otherUser?.username}</h3>
                  <span style={{ fontSize: '0.75rem', color: onlineUsers[activeConversation.otherUser?.id] ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>
                    {onlineUsers[activeConversation.otherUser?.id] ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <RiMore2Fill size={24} color="#64748b" style={{ cursor: 'pointer' }} />
              </div>
            </header>
            
            <div style={{ 
              flex: 1, padding: '2rem', overflowY: 'auto', 
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
              background: '#f8fafc'
            }}>
              {messages.map((m, i) => {
                const isMine = m.senderId === adminUser.id
                const showDate = i === 0 || new Date(m.createdAt).toDateString() !== new Date(messages[i - 1]?.createdAt).toDateString()
                
                return (
                  <div key={m._id || i}>
                    {showDate && (
                      <div style={{ textAlign: 'center', margin: '1.5rem 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {new Date(m.createdAt).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    )}
                    <div style={{ 
                      alignSelf: isMine ? 'flex-end' : 'flex-start', 
                      maxWidth: '75%',
                      marginLeft: isMine ? 'auto' : 0,
                      marginRight: isMine ? 0 : 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMine ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{ 
                        padding: m.image ? '0.5rem' : '0.75rem 1.25rem', 
                        borderRadius: isMine ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                        background: isMine ? '#4f46e5' : '#fff', 
                        color: isMine ? '#fff' : '#1e293b', 
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        border: m.error ? '1px solid #ef4444' : 'none',
                        position: 'relative'
                      }}>
                        {m.image ? (
                           <img 
                             src={m.image} 
                             alt="Sent image" 
                             style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '0.75rem', display: 'block', cursor: 'pointer' }} 
                             onClick={() => window.open(m.image, '_blank')}
                           />
                        ) : m.text}
                      </div>
                      <small style={{ 
                        display: 'flex', alignItems: 'center', gap: '4px',
                        marginTop: '0.35rem', 
                        color: '#94a3b8',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMine && (
                          m.sending
                            ? <RiCheckLine size={12} />
                            : <RiCheckDoubleFill size={12} style={{ color: m.isRead ? '#4f46e5' : '#94a3b8' }} />
                        )}
                      </small>
                    </div>
                  </div>
                )
              })}
              
              {typingUsers[activeConversation._id] && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0' }}>
                  <div className="typing-dots" style={{ display: 'flex', gap: '4px', padding: '0.6rem 1.2rem', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#4f46e5', fontStyle: 'italic', fontWeight: 600 }}>{activeConversation.otherUser?.username} đang soạn tin...</span>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} style={{ 
              padding: '1.25rem 2rem', background: '#fff', borderTop: '1px solid #f1f5f9', 
              display: 'flex', gap: '0.75rem', alignItems: 'center' 
            }}>
              <label style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.2s' }} className="hover-bg-f1">
                <input type="file" accept="image/*" hidden onChange={handleImageSelect} disabled={uploadingImage} />
                <RiImageAddLine size={24} color={uploadingImage ? "#cbd5e1" : "#64748b"} />
              </label>
              
              <input 
                type="text" 
                value={newMessage} 
                onChange={handleTyping} 
                onKeyDown={handleKeyDown}
                placeholder={uploadingImage ? "Uploading image..." : "Type your message..."}
                disabled={uploadingImage}
                style={{ 
                  flex: 1, padding: '0.85rem 1.5rem', borderRadius: '2rem', 
                  border: '1px solid #e2e8f0', background: '#f8fafc',
                  outline: 'none', fontSize: '0.95rem',
                  transition: 'all 0.2s'
                }} 
              />
              <button 
                type="submit" 
                className="btn-solid" 
                disabled={!newMessage.trim() || uploadingImage} 
                style={{ 
                  width: '45px', height: '45px', borderRadius: '50%', padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: (!newMessage.trim() || uploadingImage) ? 0.5 : 1,
                  cursor: (!newMessage.trim() || uploadingImage) ? 'not-allowed' : 'pointer',
                  background: '#4f46e5'
                }}
              >
                <RiSendPlane2Fill size={20} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: '#f8fafc' }}>
            <RiCustomerService2Fill size={80} style={{ marginBottom: '1.5rem', opacity: 0.1 }} />
            <h3 style={{ margin: 0, color: '#64748b' }}>Select a conversation</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Choose a user from the list to start chatting</p>
          </div>
        )}
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
                      <div><strong>{a.title}</strong><div style={{ fontSize: '0.8rem', color: '#64748b' }}>{a.category || 'General'}</div></div>
                   </div>
                </td>
                <td style={{ padding: '1.25rem 2rem' }}>{a.author?.username || 'Unknown'}</td>
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

  if (loading) return <LoadingScreen message="Syncing Dashboard Data..." />

  return (
    <main className="admin-shell" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <header className="admin-topbar" style={{ background: '#232a3b', color: '#fff', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="mobile-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
          </button>
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
            <div className="admin-user-info" style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{adminUser?.fullName || adminUser?.username}</div>
              <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Admin</small>
            </div>
            <img src={adminUser?.avatarUrl} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
          </div>
        </div>
      </header>

      <section className="admin-layout" style={{ display: 'grid', minHeight: 'calc(100vh - 60px)' }}>
        <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ background: '#232a3b', padding: '2rem 1rem', color: '#fff', display: 'flex', flexDirection: 'column', position: 'sticky', top: '60px', height: 'calc(100vh - 60px)' }}>
          <h4 style={{ color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1.5rem', padding: '0 1rem' }}>Main Menu</h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
            <button onClick={() => navigate('/admin/dashboard')} className={`side-link ${variant === 'overview' ? 'active' : ''}`}><RiLayoutMasonryFill /> Dashboard</button>
            <button onClick={() => navigate('/admin/my-assets')} className={`side-link ${variant === 'library' ? 'active' : ''}`}><RiGalleryFill /> My Assets</button>
            <button onClick={() => navigate('/admin/upload-asset')} className={`side-link ${variant === 'upload' ? 'active' : ''}`}><RiUploadCloud2Fill /> Upload Asset</button>
            <button onClick={() => navigate('/admin/creators')} className={`side-link ${variant === 'users' ? 'active' : ''}`}><RiGroupFill /> Creators</button>
            <button onClick={() => navigate('/admin/asset-approval')} className={`side-link ${variant === 'moderation' ? 'active' : ''}`}><RiShieldCheckFill /> Asset Approval</button>
            <button onClick={() => navigate('/admin/withdrawals')} className={`side-link ${variant === 'withdrawals' ? 'active' : ''}`}><RiBankCardLine /> Withdrawals</button>
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

        <div className="admin-page-content" style={{ padding: '2.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <div style={{ width: '100%', maxWidth: '1200px' }}>
              {variant === 'overview' && renderOverview()}
              {variant === 'users' && renderCreators()}
              {variant === 'moderation' && renderApproval()}
              {variant === 'withdrawals' && renderWithdrawals()}
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
        .admin-view-fade { animation: fadeIn 0.4s ease-out; width: 100%; }
        
        .hover-bg-f1:hover { background: #f1f5f9; }
        
        .typing-dots .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #94a3b8;
          animation: dot-pulse 1.4s infinite ease-in-out;
        }
        .typing-dots .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots .dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes dot-pulse {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  )
}
