import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getAuthToken } from '../services/httpClient'
import { isTokenValidForPortal } from '../utils/auth'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const token = getAuthToken()

  if (!isTokenValidForPortal(token, 'PHARMACY')) {
    if (typeof window !== 'undefined') localStorage.removeItem('token')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
