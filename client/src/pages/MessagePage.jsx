import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import '../dashboard-redesign.css'
import { messageService, userService } from '../services/api'
import { useSocket } from '../services/SocketContext'
import {
  RiSendPlane2Fill, RiMore2Fill, RiCustomerService2Fill,
  RiCheckDoubleFill, RiCheckLine, RiImageAddFill,
  RiEmotionHappyLine, RiCloseFill, RiFileCopyLine,
  RiSearchLine, RiArrowDownSLine
} from 'react-icons/ri'

const TYPING_TIMEOUT = 2500
const MSG_PAGE_SIZE = 50

export default function MessagePage() {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [contactingAdmin, setContactingAdmin] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})
  const [onlineUsers, setOnlineUsers] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCounts, setUnreadCounts] = useState({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const navigate = useNavigate()
  const chatEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const fileInputRef = useRef(null)
  const { socket, isConnected } = useSocket()

  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)
  const activeConvRef = useRef(activeConversation)
  const userRef = useRef(user)

  // Sync refs
  useEffect(() => {
    activeConvRef.current = activeConversation
    userRef.current = user
  }, [activeConversation, user])

  // Auto scroll
  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
      }
    }, 50)
  }, [])

  useEffect(() => {
    if (messages.length > 0) scrollToBottom()
  }, [messages, scrollToBottom])

  // Init - rejoin socket room để đảm bảo
  useEffect(() => {
    let savedUser = null
    try {
      const userData = localStorage.getItem('user')
      savedUser = userData ? JSON.parse(userData) : null
    } catch (e) {
      console.error('Error parsing user data', e)
    }

    if (!savedUser) {
      navigate('/auth/login')
      return
    }
    setUser(savedUser)
    // Gán ngay vào ref để các effect khác dùng được
    userRef.current = savedUser

    // Đảm bảo socket join room của user
    if (socket && isConnected) {
      socket.emit('join', savedUser.id)
    }

    fetchConversations()
    setLoading(false)
  }, [socket, isConnected])

  // Socket listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (msg) => {
      const currentUser = userRef.current
      const currentConv = activeConvRef.current
      const isOwnMessage = msg.senderId === currentUser?.id

      // Nếu đang xem conversation này, thêm message vào list
      if (currentConv && (
        msg.conversationId === currentConv._id ||
        msg.conversationId?.toString() === currentConv._id?.toString()
      )) {
        if (!isOwnMessage) {
          setMessages(prev => {
            if (prev.some(m => m._id === msg._id || m._id?.toString() === msg._id?.toString())) return prev
            return [...prev, msg]
          })
        }
      } else {
        // Nếu không phải conversation đang xem, vẫn đánh dấu để hiển thị badge
        console.log('New message in other conversation:', msg.conversationId)
      }
      // Refresh danh sách conversations để cập nhật lastMessage
      fetchConversations()
    }

    const handleUserTyping = (data) => {
      const { userId, conversationId } = data
      const currentConv = activeConvRef.current
      if (userId === userRef.current?.id) return
      if (currentConv && (
        conversationId === currentConv._id ||
        conversationId?.toString() === currentConv._id?.toString()
      )) {
        setTypingUsers(prev => ({ ...prev, [conversationId]: true }))
      } else {
        // Nếu typing ở conversation khác, set cho đúng conversationId
        setTypingUsers(prev => ({ ...prev, [conversationId]: true }))
      }
    }

    const handleUserStopTyping = (data) => {
      const { userId, conversationId } = data
      if (userId === userRef.current?.id) return
      setTypingUsers(prev => ({ ...prev, [conversationId]: false }))
    }

    const handleUserOnline = (data) => {
      setOnlineUsers(prev => ({ ...prev, [data.userId]: data.online }))
    }

    socket.on('newMessage', handleNewMessage)
    socket.on('userTyping', handleUserTyping)
    socket.on('userStopTyping', handleUserStopTyping)
    socket.on('userOnline', handleUserOnline)

    // Đảm bảo join room mỗi khi socket listeners được setup lại
    const currentUser = userRef.current
    if (currentUser && socket.connected) {
      socket.emit('join', currentUser.id)
    }

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('userTyping', handleUserTyping)
      socket.off('userStopTyping', handleUserStopTyping)
      socket.off('userOnline', handleUserOnline)
    }
  }, [socket])

  const fetchConversations = async () => {
    try {
      const res = await messageService.getConversations()
      setConversations(res.data)
      const userIds = res.data.map(c => c.otherUser?.id).filter(Boolean)
      if (userIds.length > 0) {
        try {
          const statusRes = await userService.getOnlineStatus(userIds)
          if (statusRes.data) setOnlineUsers(prev => ({ ...prev, ...statusRes.data }))
        } catch (e) { /* ignore */ }
      }
    } catch (e) { /* ignore */ }
  }

  const fetchMessages = async (conv) => {
    setActiveConversation(conv)
    setTypingUsers(prev => ({ ...prev, [conv._id]: false }))
    try {
      const res = await messageService.getMessages(conv._id)
      setMessages(res.data)
    } catch (e) { /* ignore */ }
  }

  // Handle typing
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
    }, TYPING_TIMEOUT)
  }

  const stopTyping = () => {
    if (isTypingRef.current) {
      isTypingRef.current = false
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      socket?.emit('stopTyping', {
        receiverId: activeConversation.otherUser.id,
        conversationId: activeConversation._id
      })
    }
  }

  // Send text message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && !uploadingImage) || !activeConversation) return

    const msgText = newMessage.trim()
    setNewMessage('')
    stopTyping()
    setShowEmojiPicker(false)

    const tempId = 'temp_' + Date.now()
    const tempMsg = {
      _id: tempId,
      conversationId: activeConversation._id,
      senderId: user.id,
      text: msgText,
      createdAt: new Date().toISOString(),
      sending: true
    }
    setMessages(prev => [...prev, tempMsg])

    try {
      const res = await messageService.sendMessage({
        conversationId: activeConversation._id,
        receiverId: activeConversation.otherUser.id,
        text: msgText
      })
      setMessages(prev => prev.map(m => m._id === tempId ? { ...res.data, sending: false } : m))
      if (socket) {
        socket.emit('sendMessage', {
          ...res.data,
          receiverId: activeConversation.otherUser.id,
          senderId: user.id,
          conversationId: activeConversation._id
        })
      }
      fetchConversations()
    } catch (error) {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, error: true, sending: false } : m))
    }
  }

  // Send image message
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeConversation) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const uploadRes = await messageService.uploadImage(formData)
      const imageUrl = uploadRes.data.url

      const tempId = 'temp_' + Date.now()
      const tempMsg = {
        _id: tempId,
        conversationId: activeConversation._id,
        senderId: user.id,
        image: imageUrl,
        createdAt: new Date().toISOString(),
        sending: true
      }
      setMessages(prev => [...prev, tempMsg])

      const res = await messageService.sendMessage({
        conversationId: activeConversation._id,
        receiverId: activeConversation.otherUser.id,
        image: imageUrl
      })
      setMessages(prev => prev.map(m => m._id === tempId ? { ...res.data, sending: false } : m))
      if (socket) {
        socket.emit('sendMessage', {
          ...res.data,
          receiverId: activeConversation.otherUser.id,
          senderId: user.id,
          conversationId: activeConversation._id
        })
      }
      fetchConversations()
    } catch (error) {
      console.error('Upload image error:', error)
    }
    setUploadingImage(false)
    e.target.value = ''
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  // Simple emoji list
  const EMOJIS = ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '👂', '👃', '👣', '👀', '👁️']

  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const contactAdmin = async () => {
    try {
      setContactingAdmin(true)
      // Check if already has conversation with admin
      const existing = conversations.find(c => c.otherUser?.role === 'admin')
      if (existing) {
        fetchMessages(existing)
        setContactingAdmin(false)
        return
      }

      // Get admin contact info and send auto-message
      const res = await userService.getAdminContact()
      if (res.data && res.data.id) {
        const msgData = {
          receiverId: res.data.id,
          text: 'Hello, I need help from the admin.'
        }
        await messageService.sendMessage(msgData)

        // Refresh conversations and open admin chat
        await fetchConversations()
        const updatedConv = (await messageService.getConversations()).data
        const adminConv = updatedConv.find(c => c.otherUser?.id === res.data.id)
        if (adminConv) {
          fetchMessages(adminConv)
        }
      }
      setContactingAdmin(false)
    } catch (error) {
      console.error('Contact admin error:', error)
      setContactingAdmin(false)
    }
  }

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    const name = (conv.otherUser?.username || '').toLowerCase()
    const lastMsg = (conv.lastMessage || '').toLowerCase()
    const q = searchQuery.toLowerCase()
    return name.includes(q) || lastMsg.includes(q)
  })

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua'
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  }

  const formatDateSeparator = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) return 'Hôm nay'
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua'
    return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) return <div className="loading-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748b' }}>Loading Messages...</div>

  return (
    <div className="dashboard-layout"><div className="fixed inset-0 cyber-grid pointer-events-none z-0"></div>\n    <main className="market-home" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10, position: 'relative' }}>
      <AppHeader />

      <div style={{
        flex: 1,
        display: 'flex',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '1rem',
        gap: '0',
        height: 'calc(100vh - 70px)',
        overflow: 'hidden'
      }}>
        {/* ===== SIDEBAR: Danh sách hội thoại ===== */}
        <aside style={{
          width: '360px',
          minWidth: '360px',
          background: 'var(--cyber-panel)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e0e0e0',
          borderTopLeftRadius: '12px',
          borderBottomLeftRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.25rem 0.75rem',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'white' }}>Đoạn chat</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: isConnected ? '#22c55e' : '#ef4444',
                  display: 'inline-block'
                }} />
                <span style={{ fontSize: '0.75rem', color: isConnected ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--cyber-panel)', borderRadius: '24px',
              padding: '0.5rem 1rem'
            }}>
              <RiSearchLine size={18} color="#94a3b8" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm đoạn chat..."
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  width: '100%', fontSize: '0.85rem', color: 'white'
                }}
              />
              {searchQuery && (
                <RiCloseFill size={16} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
              )}
            </div>
          </div>

          {/* Danh sách */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {filteredConversations.length === 0 && (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                {searchQuery ? 'Không tìm thấy đoạn chat nào' : 'Chưa có đoạn chat nào'}
              </div>
            )}
            {filteredConversations.map(conv => {
              const isActive = activeConversation?._id === conv._id
              const isOtherOnline = onlineUsers[conv.otherUser?.id]
              const isTyping = typingUsers[conv._id]

              return (
                <div
                  key={conv._id}
                  onClick={() => fetchMessages(conv)}
                  style={{
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    gap: '0.85rem',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                    transition: 'background 0.15s',
                    borderLeft: isActive ? '3px solid var(--cyber-cyan)' : '3px solid transparent'
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f5f5f5' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={conv.otherUser?.avatarUrl || '/default-avatar.png'}
                      style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                      alt=""
                      onError={(e) => { e.target.src = '/default-avatar.png' }}
                    />
                    {isOtherOnline && (
                      <span style={{
                        position: 'absolute', bottom: 1, right: 1,
                        width: 13, height: 13, borderRadius: '50%',
                        background: '#22c55e', border: '2.5px solid #fff'
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                        {conv.otherUser?.username || 'Unknown'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0 }}>
                        {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.82rem',
                      color: isTyping ? '#4f46e5' : '#64748b',
                      fontStyle: isTyping ? 'italic' : 'normal',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.4
                    }}>
                      {isTyping ? 'đang soạn tin nhắn...' : (conv.lastMessage || 'Chưa có tin nhắn')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* ===== CHAT AREA: Khung chat chính ===== */}
        <section style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--cyber-panel)',
          borderTopRightRadius: '12px',
          borderBottomRightRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          minWidth: 0
        }}>
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div style={{
                padding: '0.85rem 1.5rem',
                background: 'var(--cyber-panel)',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={activeConversation.otherUser?.avatarUrl || '/default-avatar.png'}
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                      alt=""
                      onError={(e) => { e.target.src = '/default-avatar.png' }}
                    />
                    {onlineUsers[activeConversation.otherUser?.id] && (
                      <span style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 11, height: 11, borderRadius: '50%',
                        background: '#22c55e', border: '2.5px solid #fff'
                      }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>
                      {activeConversation.otherUser?.username}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: onlineUsers[activeConversation.otherUser?.id] ? '#22c55e' : '#94a3b8' }}>
                      {onlineUsers[activeConversation.otherUser?.id] ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>
                <RiMore2Fill size={22} color="#64748b" style={{ cursor: 'pointer' }} />
              </div>

              {/* Messages area - scrollable */}
              <div
                ref={chatContainerRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  padding: '1.25rem 1.5rem',
                  background: 'transparent',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {messages.length === 0 && (
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#94a3b8', fontSize: '0.9rem'
                  }}>
                    Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isMine = String(msg.senderId) === String(user?.id)
                  const showDate = i === 0 ||
                    new Date(msg.createdAt).toDateString() !== new Date(messages[i - 1]?.createdAt).toDateString()

                  return (
                    <div key={msg._id || i} style={{ marginBottom: '0.25rem' }}>
                      {showDate && (
                        <div style={{
                          textAlign: 'center', margin: '0.75rem 0 1rem',
                          fontSize: '0.72rem', color: '#94a3b8',
                          fontWeight: 600
                        }}>
                          <span style={{
                            background: 'rgba(0,0,0,0.5)', padding: '0.25rem 0.75rem',
                            borderRadius: '12px'
                          }}>
                            {formatDateSeparator(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                        marginBottom: '0.3rem'
                      }}>
                        <div style={{
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start'
                        }}>
                          {/* Image message */}
                          {msg.image && (
                            <div style={{ marginBottom: msg.text ? '0.4rem' : 0 }}>
                              <img
                                src={msg.image}
                                alt=""
                                style={{
                                  maxWidth: '280px', maxHeight: '320px',
                                  borderRadius: '12px',
                                  objectFit: 'cover',
                                  display: 'block',
                                  opacity: msg.sending ? 0.7 : 1,
                                  cursor: 'pointer'
                                }}
                                onClick={() => window.open(msg.image, '_blank')}
                              />
                            </div>
                          )}
                          {/* Text message */}
                          {msg.text && (
                            <div style={{
                              padding: '0.6rem 1rem',
                              borderRadius: isMine
                                ? '18px 18px 4px 18px'
                                : '18px 18px 18px 4px',
                              background: isMine ? 'var(--cyber-accent)' : 'var(--cyber-panel)',
                              color: isMine ? 'white' : 'white',
                              boxShadow: isMine
                                ? 'rgb(0 255 136) 0px 2px 8px'
                                : '0 1px 4px rgba(255, 255, 255, 0.06)',
                              opacity: msg.sending ? 0.7 : 1,
                              border: msg.error ? '1px solid #ef4444' : 'none',
                              fontSize: '0.92rem',
                              lineHeight: 1.45,
                              wordBreak: 'break-word'
                            }}>
                              {msg.text}
                            </div>
                          )}
                          {/* Time + status */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            marginTop: '0.15rem',
                            padding: '0 0.25rem'
                          }}>
                            <span style={{
                              fontSize: '0.65rem', color: '#94a3b8'
                            }}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMine && (
                              msg.sending
                                ? <RiCheckLine size={12} color="#94a3b8" />
                                : <RiCheckDoubleFill size={12} color={msg.isRead ? '#4f46e5' : '#94a3b8'} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Typing indicator */}
                {typingUsers[activeConversation._id] && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0', marginTop: '0.25rem'
                  }}>
                    <div style={{
                      display: 'flex', gap: '4px', padding: '0.6rem 1rem',
                      background: 'var(--cyber-panel)', borderRadius: '18px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#94a3b8',
                        animation: 'typingBounce 1.4s infinite'
                      }} />
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#94a3b8',
                        animation: 'typingBounce 1.4s infinite 0.2s'
                      }} />
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#94a3b8',
                        animation: 'typingBounce 1.4s infinite 0.4s'
                      }} />
                      <span style={{
                        fontSize: '0.75rem', color: '#4f46e5', fontStyle: 'italic',
                        marginLeft: '0.35rem'
                      }}>
                        {activeConversation.otherUser?.username} đang soạn...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input area */}
              <div style={{
                padding: '0.75rem 1.5rem 1rem',
                background: 'var(--cyber-panel)',
                borderTop: '1px solid #f0f0f0',
                flexShrink: 0
              }}>
                {/* Emoji picker */}
                {showEmojiPicker && (
                  <div style={{
                    position: 'relative',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      background: 'var(--cyber-panel)',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '0.75rem',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      width: '312px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.35rem',
                      zIndex: 10
                    }}>
                      {EMOJIS.map((emoji, idx) => (
                        <span
                          key={idx}
                          onClick={() => insertEmoji(emoji)}
                          style={{
                            cursor: 'pointer', fontSize: '1.3rem',
                            padding: '0.2rem', borderRadius: '6px',
                            transition: 'background 0.15s',
                            lineHeight: 1
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--cyber-border)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {emoji}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendMessage} style={{
                  display: 'flex', gap: '0.5rem', alignItems: 'flex-end'
                }}>
                  {/* Image button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      border: 'none', background: 'var(--cyber-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: uploadingImage ? 'not-allowed' : 'pointer',
                      color: '#64748b', flexShrink: 0, transition: 'all 0.15s'
                    }}
                    title="Gửi ảnh"
                    onMouseEnter={e => { if (!uploadingImage) e.currentTarget.style.background = 'var(--cyber-border)' }}
                    onMouseLeave={e => { if (!uploadingImage) e.currentTarget.style.background = 'var(--cyber-border)' }}
                  >
                    <RiImageAddFill size={20} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                  />

                  {/* Emoji button */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      border: 'none', background: 'var(--cyber-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#64748b', flexShrink: 0,
                      transition: 'all 0.15s'
                    }}
                    title="Biểu tượng cảm xúc"
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cyber-border)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--cyber-border)'}
                  >
                    <RiEmotionHappyLine size={20} />
                  </button>

                  {/* Text input */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--cyber-panel)',
                    borderRadius: '24px',
                    padding: '0 1.25rem',
                    minHeight: '44px'
                  }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyDown={handleKeyDown}
                      placeholder="Nhập tin nhắn..."
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '0.95rem',
                        color: 'white',
                        padding: '0.5rem 0'
                      }}
                    />
                  </div>

                  {/* Send button */}
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || uploadingImage}
                    style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      border: 'none',
                      background: newMessage.trim() ? '#4f46e5' : 'var(--cyber-border)',
                      color: 'var(--cyber-panel)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: (!newMessage.trim() || uploadingImage) ? 'not-allowed' : 'pointer',
                      flexShrink: 0, transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => {
                      if (newMessage.trim() && !uploadingImage) e.currentTarget.style.background = '#4338ca'
                    }}
                    onMouseLeave={e => {
                      if (newMessage.trim() && !uploadingImage) e.currentTarget.style.background = '#4f46e5'
                    }}
                  >
                    <RiSendPlane2Fill size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* No active conversation - placeholder */
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
              background: 'transparent', gap: '1rem'
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                justifyContent: 'center'
              }}>
                <RiCustomerService2Fill size={40} style={{ opacity: 0.3, color: '#64748b' }} />
              </div>
              <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0 }}>
                Chọn một đoạn chat để bắt đầu trò chuyện
              </p>
              <button
                onClick={contactAdmin}
                disabled={contactingAdmin}
                style={{
                  background: '#4f46e5', color: 'white',
                  border: 'none', borderRadius: '24px',
                  padding: '0.75rem 2rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  cursor: 'pointer', fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(79,70,229,0.25)'
                }}
              >
                <RiCustomerService2Fill size={18} />
                {contactingAdmin ? 'Đang kết nối...' : 'Liên hệ Admin'}
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </main>
    </div>
  )
}
