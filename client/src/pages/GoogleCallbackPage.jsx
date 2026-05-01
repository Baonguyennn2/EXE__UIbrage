import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LoadingScreen from '../components/LoadingScreen.jsx'

export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    console.log('Google Callback reached. Search params:', location.search);
    const params = new URLSearchParams(location.search)
    const code = params.get('code')
    const error = params.get('error')
    const errorDescription = params.get('error_description')

    if (error) {
      console.error('Cognito returned error:', error, errorDescription);
      navigate(`/auth/login?error=${error}&desc=${encodeURIComponent(errorDescription || '')}`)
      return;
    }
    
    if (code) {
      console.log('Code found, forwarding to backend...');
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
