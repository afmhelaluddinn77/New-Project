import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react'
import './Sidebar.css'

export interface SidebarItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
}

interface SidebarProps {
  items: SidebarItem[]
  portalTitle: string
  portalColor: string
  onLogout: () => void
}

export default function Sidebar({ items, portalTitle, portalColor, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside 
      className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}
      style={{ '--portal-color': portalColor } as React.CSSProperties}
    >
      <div className="sidebar-header">
        {!collapsed && (
          <h2 className="sidebar-title">{portalTitle}</h2>
        )}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {items.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={20} className="sidebar-icon" />
                  {!collapsed && <span className="sidebar-label">{item.label}</span>}
                  {isActive && <div className="active-indicator" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button
          className="logout-button"
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

