import { ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar, { SidebarItem } from './Sidebar'
import TopBar from './TopBar'
import './DashboardLayout.css'

interface DashboardLayoutProps {
  children: ReactNode
  sidebarItems: SidebarItem[]
  portalTitle: string
  portalColor: string
  userName?: string
  userRole?: string
}

export default function DashboardLayout({
  children,
  sidebarItems,
  portalTitle,
  portalColor,
  userName,
  userRole
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar
        items={sidebarItems}
        portalTitle={portalTitle}
        portalColor={portalColor}
        onLogout={handleLogout}
      />
      
      <div className="dashboard-main">
        <TopBar
          userName={userName}
          userRole={userRole}
          portalColor={portalColor}
          onMenuClick={handleMenuClick}
          showMenuButton={true}
        />
        
        <main className="dashboard-content">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

