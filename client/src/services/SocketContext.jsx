import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://exe-uibrage.onrender.com')

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const socketRef = useRef(null)
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
    const socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      // Join user room nếu đã đăng nhập
      if (userRef.current?.id) {
        socket.emit('join', userRef.current.id)
      }
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    // Tự động join lại khi user đăng nhập
    window.addEventListener('user-login', (e) => {
      if (e.detail?.id) {
        userRef.current = e.detail
        socket.emit('join', e.detail.id)
      }
    })

    window.addEventListener('user-logout', () => {
      userRef.current = null
    })

    // Storage event cho cross-tab sync
    window.addEventListener('storage', (e) => {
      if (e.key === 'user') {
        checkUser()
        if (userRef.current?.id) {
          socket.emit('join', userRef.current.id)
        }
      }
    })

    return () => {
      window.removeEventListener('user-login', () => {})
      window.removeEventListener('user-logout', () => {})
      window.removeEventListener('storage', () => {})
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
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
