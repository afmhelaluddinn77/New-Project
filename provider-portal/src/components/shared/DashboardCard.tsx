import { ReactNode } from 'react'
import './DashboardCard.css'

interface DashboardCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  icon?: ReactNode
  loading?: boolean
  onClick?: () => void
  className?: string
}

export default function DashboardCard({
  title,
  subtitle,
  children,
  icon,
  loading = false,
  onClick,
  className = '',
}: DashboardCardProps) {
  return (
    <div
      className={`dashboard-card ${onClick ? 'dashboard-card-clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {loading ? (
        <div className="dashboard-card-loading">
          <div className="spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-card-header">
            {icon && <div className="dashboard-card-icon">{icon}</div>}
            <div className="dashboard-card-title-group">
              <h3 className="dashboard-card-title">{title}</h3>
              {subtitle && <p className="dashboard-card-subtitle">{subtitle}</p>}
            </div>
          </div>
          <div className="dashboard-card-content">{children}</div>
        </>
      )}
    </div>
  )
}

