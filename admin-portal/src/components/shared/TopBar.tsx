import { Bell, Search, Menu, User } from 'lucide-react'
import './TopBar.css'

interface TopBarProps {
  userName?: string
  userRole?: string
  portalColor: string
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export default function TopBar({ 
  userName = 'User', 
  userRole = 'Role',
  portalColor,
  onMenuClick,
  showMenuButton = false
}: TopBarProps) {
  return (
    <header 
      className="topbar"
      style={{ '--portal-color': portalColor } as React.CSSProperties}
    >
      <div className="topbar-left">
        {showMenuButton && (
          <button className="menu-button" onClick={onMenuClick} aria-label="Toggle menu">
            <Menu size={24} />
          </button>
        )}
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="search"
            placeholder="Search..."
            className="search-input"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-button" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <div className="user-menu">
          <button className="user-button">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">{userRole}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}

