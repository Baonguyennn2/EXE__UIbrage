import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { messageService, socket } from '../services/api'
import { RiSendPlane2Fill, RiMessage3Fill, RiMore2Fill } from 'react-icons/ri'

export default function MessagePage() {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  
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
      if (activeConversation && (msg.senderId === activeConversation.otherUser.id || msg.conversationId === activeConversation._id)) {
        setMessages(prev => [...prev, msg])
      }
      fetchConversations()
    })

    fetchConversations()
    setLoading(false)

    return () => {
      socket.off('newMessage')
      socket.disconnect()
    }
  }, [activeConversation])

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
              <RiMessage3Fill size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p>Select a creator or admin to start chatting</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
