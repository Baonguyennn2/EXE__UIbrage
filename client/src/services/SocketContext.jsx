import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://exe-uibrage.onrender.com')

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const userRef = useRef(null)

  useEffect(() => {
    // Lắng nghe sự thay đổi user từ localStorage
    const checkUser = () => {
      try {
        const raw = localStorage.getItem('user')
        const parsed = raw ? JSON.parse(raw) : null
        if (parsed && parsed.id) {
          userRef.current = parsed
        } else {
          userRef.current = null
        }
      } catch {
        userRef.current = null
      }
    }

    checkUser()

    // Tạo socket connection
    const s = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    setSocket(s)

    s.on('connect', () => {
      setIsConnected(true)
      // Join user room nếu đã đăng nhập
      if (userRef.current?.id) {
        s.emit('join', userRef.current.id)
      }
    })

    s.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message)
    })

    s.on('disconnect', () => {
      setIsConnected(false)
    })

    // Re-join on reconnect
    s.on('reconnect', (attempt) => {
      if (userRef.current?.id) {
        s.emit('join', userRef.current.id)
      }
    })

    // Tự động join lại khi user đăng nhập
    const handleLogin = (e) => {
      if (e.detail?.id) {
        userRef.current = e.detail
        s.emit('join', e.detail.id)
      }
    }

    const handleLogout = () => {
      userRef.current = null
    }

    window.addEventListener('user-login', handleLogin)
    window.addEventListener('user-logout', handleLogout)

    // Storage event cho cross-tab sync
    const handleStorage = (e) => {
      if (e.key === 'user') {
        checkUser()
        if (userRef.current?.id) {
          s.emit('join', userRef.current.id)
        }
      }
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('user-login', handleLogin)
      window.removeEventListener('user-logout', handleLogout)
      window.removeEventListener('storage', handleStorage)
      s.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}

export default SocketContext
