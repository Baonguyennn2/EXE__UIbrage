import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen.jsx'

export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const code = params.get('code')
    
    if (code) {
      // Redirect to the backend callback handler with the same code
      const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : 'https://exe-uibrage.onrender.com/api')
      
      window.location.href = `${apiUrl}/auth/google/callback?code=${code}`
    } else {
      navigate('/auth/login?error=no_code')
    }
  }, [location, navigate])

  return <LoadingScreen message="Authenticating with Google..." />
}
