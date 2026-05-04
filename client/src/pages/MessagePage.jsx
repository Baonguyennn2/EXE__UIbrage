import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { messageService, userService } from '../services/api'
import { useSocket } from '../services/SocketContext'
import { RiSendPlane2Fill, RiMore2Fill, RiCustomerService2Fill, RiCheckDoubleFill, RiCheckLine } from 'react-icons/ri'

const TYPING_TIMEOUT = 2000 // 2 giây không gõ thì ngừng "đang soạn tin nhắn"

export default function MessagePage() {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [contactingAdmin, setContactingAdmin] = useState(false)

  // Typing states
  const [typingUsers, setTypingUsers] = useState({}) // { conversationId: true/false }
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)

  // Online status
  const [onlineUsers, setOnlineUsers] = useState({})

  const navigate = useNavigate()
  const chatEndRef = useRef(null)
  const { socket, isConnected } = useSocket()

  // Auto scroll xuống cuối khi có tin nhắn mới
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'))
    if (!savedUser) {
      navigate('/auth/login')
      return
    }
    setUser(savedUser)

    fetchConversations()
    setLoading(false)
  }, [])

  // Socket listeners - tách riêng để không bị re-subscribe khi activeConversation thay đổi
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (msg) => {
      // Nếu msg có senderId === current user và msg là từ socket echo về
      // thì chỉ refresh list, không thêm vào messages (vì đã có từ API response)
      const isOwnMessage = msg.senderId === user?.id

      if (activeConversation && !isOwnMessage) {
        const belongsToActiveConv =
          msg.conversationId === activeConversation._id ||
          msg.conversationId?.toString() === activeConversation._id?.toString()

        if (belongsToActiveConv) {
          setMessages(prev => {
            // Tránh trùng message
            if (prev.some(m => m._id === msg._id || m._id?.toString() === msg._id?.toString())) return prev
            return [...prev, msg]
          })
        }
      }

      // Luôn refresh conversation list để cập nhật lastMessage
      fetchConversations()
    }

    const handleUserTyping = (data) => {
      const { userId, conversationId } = data
      if (userId === user?.id) return // Bỏ qua typing của chính mình

      // Chỉ hiển thị typing nếu đang ở conversation đó
      if (activeConversation &&
        (conversationId === activeConversation._id ||
          conversationId?.toString() === activeConversation._id?.toString())) {
        setTypingUsers(prev => ({ ...prev, [conversationId]: true }))

        // Tự động tắt sau 3 giây nếu không nhận được typing tiếp theo
        setTimeout(() => {
          setTypingUsers(prev => ({ ...prev, [conversationId]: false }))
        }, TYPING_TIMEOUT + 1000)
      }
    }

    const handleUserStopTyping = (data) => {
      const { userId, conversationId } = data
      if (userId === user?.id) return
      setTypingUsers(prev => ({ ...prev, [conversationId]: false }))
    }

    const handleUserOnline = (data) => {
      setOnlineUsers(prev => ({ ...prev, [data.userId]: data.online }))
    }

    socket.on('newMessage', handleNewMessage)
    socket.on('userTyping', handleUserTyping)
    socket.on('userStopTyping', handleUserStopTyping)
    socket.on('userOnline', handleUserOnline)

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('userTyping', handleUserTyping)
      socket.off('userStopTyping', handleUserStopTyping)
      socket.off('userOnline', handleUserOnline)
    }
  }, [socket, activeConversation, user?.id])

  const fetchConversations = async () => {
    try {
      const res = await messageService.getConversations()
      setConversations(res.data)

      // Fetch online status cho tất cả participants
      const userIds = res.data.map(c => c.otherUser?.id).filter(Boolean)
      if (userIds.length > 0) {
        try {
          const statusRes = await userService.getOnlineStatus(userIds)
          if (statusRes.data) {
            setOnlineUsers(prev => ({ ...prev, ...statusRes.data }))
          }
        } catch (e) { /* ignore */ }
      }
    } catch (e) { }
  }

  const fetchMessages = async (conv) => {
    setActiveConversation(conv)
    setTypingUsers(prev => ({ ...prev, [conv._id]: false }))
    try {
      const res = await messageService.getMessages(conv._id)
      setMessages(res.data)
    } catch (e) { }
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

    // Reset timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      socket.emit('stopTyping', {
        receiverId: activeConversation.otherUser.id,
        conversationId: activeConversation._id
      })
    }, TYPING_TIMEOUT)
  }

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

    // Optimistic UI: thêm tin nhắn tạm thời
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

      // Thay thế tin nhắn tạm bằng tin nhắn thật
      setMessages(prev => prev.map(m => m._id === tempId ? { ...res.data, sending: false } : m))

      // Gửi socket real-time tới receiver
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
      console.error('Send error:', error)
      // Đánh dấu tin nhắn lỗi
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, error: true, sending: false } : m))
    }
  }

  // Gửi tin nhắn bằng Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const contactAdmin = async () => {
    try {
      setContactingAdmin(true)
      const existing = conversations.find(c => c.otherUser?.role === 'admin')
      if (existing) {
        fetchMessages(existing)
        setContactingAdmin(false)
        return
      }
      const res = await userService.getAdminContact()
      if (res.data && res.data.id) {
        const msgData = {
          receiverId: res.data.id,
          text: 'Hello, I need help from the admin.'
        }
        const msgRes = await messageService.sendMessage(msgData)
        if (msgRes.data && msgRes.data.conversationId) {
          setNewMessage('')
          await fetchConversations()
          const updatedConv = (await messageService.getConversations()).data
          const adminConv = updatedConv.find(c => c.otherUser?.id === res.data.id)
          if (adminConv) fetchMessages(adminConv)
        }
      }
      setContactingAdmin(false)
    } catch (error) {
      console.error('Contact admin error:', error)
      setContactingAdmin(false)
    }
  }

  if (loading) return <div className="loading-screen">Loading Messages...</div>

  return (
    <main className="market-home">
      <AppHeader />

      <div className="messenger-container" style={{
        maxWidth: '1200px',
        margin: '2rem auto',
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        height: 'calc(100vh - 160px)',
        background: '#fff',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Sidebar */}
        <aside style={{ borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
          <header style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Messages</h2>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isConnected ? '#22c55e' : '#ef4444',
              display: 'inline-block'
            }} title={isConnected ? 'Connected' : 'Disconnected'} />
          </header>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                No conversations yet
              </div>
            )}
            {conversations.map(conv => {
              const isActive = activeConversation?._id === conv._id
              const isOtherOnline = onlineUsers[conv.otherUser?.id]
              const isTyping = typingUsers[conv._id]

              return (
                <div
                  key={conv._id}
                  onClick={() => fetchMessages(conv)}
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    gap: '1rem',
                    cursor: 'pointer',
                    background: isActive ? '#f8fafc' : 'transparent',
                    borderLeft: isActive ? '4px solid #4f46e5' : '4px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={conv.otherUser?.avatarUrl || '/default-avatar.png'}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      alt=""
                    />
                    {isOtherOnline && (
                      <span style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 12, height: 12, borderRadius: '50%',
                        background: '#22c55e', border: '2px solid #fff'
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                      {conv.otherUser?.username || 'Unknown'}
                    </div>
                    <div style={{
                      fontSize: '0.82rem',
                      color: isTyping ? '#4f46e5' : '#64748b',
                      fontStyle: isTyping ? 'italic' : 'normal',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {isTyping ? 'đang soạn tin nhắn...' : (conv.lastMessage || 'Start a conversation')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Chat Area */}
        <section style={{ display: 'flex', flexDirection: 'column', background: '#fcfdfe' }}>
          {activeConversation ? (
            <>
              <header style={{
                padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={activeConversation.otherUser?.avatarUrl || '/default-avatar.png'}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      alt=""
                    />
                    {onlineUsers[activeConversation.otherUser?.id] && (
                      <span style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 10, height: 10, borderRadius: '50%',
                        background: '#22c55e', border: '2px solid #fff'
                      }} />
                    )}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>
                      {activeConversation.otherUser?.username}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: onlineUsers[activeConversation.otherUser?.id] ? '#22c55e' : '#94a3b8' }}>
                      {onlineUsers[activeConversation.otherUser?.id] ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <RiMore2Fill size={24} color="#64748b" style={{ cursor: 'pointer' }} />
              </header>

              <div style={{
                flex: 1, padding: '2rem', overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: '0.5rem'
              }}>
                {messages.map((msg, i) => {
                  const isMine = msg.senderId === user.id
                  const showDate = i === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[i - 1]?.createdAt).toDateString()

                  return (
                    <div key={msg._id || i}>
                      {showDate && (
                        <div style={{ textAlign: 'center', margin: '1rem 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                          {new Date(msg.createdAt).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      )}
                      <div style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%', marginLeft: isMine ? 'auto' : 0, marginRight: isMine ? 0 : 'auto' }}>
                        <div style={{
                          padding: '0.7rem 1.2rem',
                          borderRadius: isMine ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                          background: isMine ? '#4f46e5' : '#fff',
                          color: isMine ? '#fff' : '#1e293b',
                          boxShadow: isMine ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                          opacity: msg.sending ? 0.7 : 1,
                          border: msg.error ? '1px solid #ef4444' : 'none'
                        }}>
                          {msg.text}
                        </div>
                        <small style={{
                          display: 'block', marginTop: '0.25rem',
                          textAlign: isMine ? 'right' : 'left', color: '#94a3b8',
                          fontSize: '0.7rem'
                        }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMine && (
                            msg.sending
                              ? <RiCheckLine size={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                              : <RiCheckDoubleFill size={12} style={{ marginLeft: 4, verticalAlign: 'middle', color: msg.isRead ? '#4f46e5' : '#94a3b8' }} />
                          )}
                        </small>
                      </div>
                    </div>
                  )
                })}

                {/* Typing indicator */}
                {typingUsers[activeConversation._id] && (
                  <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                    <div style={{ display: 'flex', gap: '3px', padding: '0.5rem 1rem', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#94a3b8',
                        animation: 'typingAnim 1.4s infinite'
                      }} />
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#94a3b8',
                        animation: 'typingAnim 1.4s infinite 0.2s'
                      }} />
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#94a3b8',
                        animation: 'typingAnim 1.4s infinite 0.4s'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#4f46e5', fontStyle: 'italic' }}>
                      {activeConversation.otherUser?.username} đang soạn tin nhắn...
                    </span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} style={{
                padding: '1.5rem 2rem', background: '#fff', borderTop: '1px solid #f1f5f9',
                display: 'flex', gap: '1rem', alignItems: 'center'
              }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  style={{
                    flex: 1, padding: '0.75rem 1.5rem', borderRadius: '2rem',
                    border: '1px solid #e2e8f0', background: '#f8fafc',
                    outline: 'none', fontSize: '0.95rem'
                  }}
                />
                <button
                  type="submit"
                  className="btn-solid"
                  disabled={!newMessage.trim()}
                  style={{
                    width: '48px', height: '48px', borderRadius: '50%', padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: !newMessage.trim() ? 0.5 : 1,
                    cursor: !newMessage.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  <RiSendPlane2Fill size={20} />
                </button>
              </form>
            </>
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: '#94a3b8'
            }}>
              <RiCustomerService2Fill size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p style={{ marginBottom: '1.5rem' }}>Need help? Contact our support team.</p>
              <button
                onClick={contactAdmin}
                disabled={contactingAdmin}
                className="btn-solid"
                style={{
                  background: '#4f46e5', display: 'flex', alignItems: 'center',
                  gap: '0.5rem', padding: '0.75rem 2rem'
                }}
              >
                <RiCustomerService2Fill /> {contactingAdmin ? 'Connecting...' : 'Contact Admin'}
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Styles for typing animation */}
      <style>{`
        @keyframes typingAnim {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </main>
  )
}
