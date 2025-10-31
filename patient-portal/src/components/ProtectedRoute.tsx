import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const isTokenValidForPortal = (jwt: string | null, expectedPortal: string) => {
    if (!jwt) return false
    const parts = jwt.split('.')
    if (parts.length !== 3) return false
    try {
      const payload = JSON.parse(atob(parts[1])) as { exp?: number; portal?: string }
      if (!payload.exp) return false
      const nowSeconds = Math.floor(Date.now() / 1000)
      if (payload.exp <= nowSeconds) return false
      if (payload.portal !== expectedPortal) return false
      return true
    } catch {
      return false
    }
  }

  if (!isTokenValidForPortal(token, 'PATIENT')) {
    if (typeof window !== 'undefined') localStorage.removeItem('token')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
