import './App.css'
import AppRoutes from './routes/AppRoutes.jsx'
import { SocketProvider } from './services/SocketContext.jsx'

function App() {
  return (
    <SocketProvider>
      <AppRoutes />
    </SocketProvider>
  )
}

export default App
