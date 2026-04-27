import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!token || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If user is logged in but doesn't have the right role
    // Redirect admins to dashboard, customers to marketplace
    return user.role === 'admin' 
      ? <Navigate to="/admin/dashboard" replace /> 
      : <Navigate to="/marketplace" replace />
  }

  return children
}
