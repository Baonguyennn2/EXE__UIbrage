import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { messageService, socket, userService } from '../services/api'
import { RiSendPlane2Fill, RiMessage3Fill, RiMore2Fill, RiCustomerService2Fill } from 'react-icons/ri'

export default function MessagePage() {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [contactingAdmin, setContactingAdmin] = useState(false)
  const [adminConv, setAdminConv] = useState(null)
  
  const navigate = useNavigate()
  const chatEndRef = useRef(null)

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'))
    if (!savedUser) {
      navigate('/auth/login')
      return
    }
    setUser(savedUser)
    
    socket.connect()
    socket.emit('join', savedUser.id)
    
    socket.on('newMessage', (msg) => {
      // Nếu đang ở conversation active và tin nhắn thuộc conversation đó -> thêm vào messages
      if (activeConversation && 
          (msg.conversationId === activeConversation._id || 
           (msg.senderId === activeConversation.otherUser?.id || msg.senderId === savedUser.id) &&
           msg.conversationId === activeConversation._id)) {
        setMessages(prev => {
          // Tránh trùng message
          if (prev.some(m => m._id === msg._id || (m.text === msg.text && m.senderId === msg.senderId && m.createdAt === msg.createdAt))) return prev
          return [...prev, msg]
        })
      }
      // Luôn refresh conversation list
      fetchConversations()
    })

    fetchConversations()
    setLoading(false)

    return () => {
      socket.off('newMessage')
      socket.disconnect()
    }
  }, []) // Bỏ activeConversation khỏi dependency!

  const fetchConversations = async () => {
    try {
      const res = await messageService.getConversations()
      setConversations(res.data)
    } catch (e) {}
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

  const contactAdmin = async () => {
    try {
      setContactingAdmin(true)
      // Find admin user by checking if any conversation already exists with an admin
      const existing = conversations.find(c => c.otherUser?.role === 'admin')
      if (existing) {
        fetchMessages(existing)
        setContactingAdmin(false)
        return
      }
      // Otherwise get admin profile (first admin user)
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
          // Find the new admin conversation
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
        <aside style={{ borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
          <header style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>My Conversations</h2>
          </header>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.map(conv => (
              <div 
                key={conv._id} 
                onClick={() => fetchMessages(conv)}
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

              <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg, i) => {
                  const isMine = msg.senderId === user.id
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
              <RiCustomerService2Fill size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p style={{ marginBottom: '1.5rem' }}>Need help? Contact our support team.</p>
              <button onClick={contactAdmin} disabled={contactingAdmin} className="btn-solid" style={{ background: '#4f46e5', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
                <RiCustomerService2Fill /> {contactingAdmin ? 'Connecting...' : 'Contact Admin'}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
