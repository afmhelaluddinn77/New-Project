import { 
  User, 
  Stethoscope, 
  Shield, 
  FlaskConical, 
  Pill, 
  CreditCard, 
  Scan,
  ArrowRight,
  LucideIcon
} from 'lucide-react'
import './PortalCard.css'

interface PortalCardProps {
  id: string
  name: string
  url: string
  icon: string
  color: string
  description: string
}

const iconMap: Record<string, LucideIcon> = {
  User,
  Stethoscope,
  Shield,
  FlaskConical,
  Pill,
  CreditCard,
  Scan
}

function PortalCard({ name, url, icon, color, description }: PortalCardProps) {
  const IconComponent = iconMap[icon] || User

  const handleClick = () => {
    window.location.href = url
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      window.location.href = url
    }
  }

  return (
    <div 
      className="portal-card" 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Access ${name}`}
      style={{ '--portal-color': color } as React.CSSProperties}
    >
      <div className="portal-card-icon-wrapper">
        <div className="portal-card-icon">
          <IconComponent size={32} strokeWidth={2} />
        </div>
      </div>
      
      <div className="portal-card-content">
        <h2 className="portal-card-title">{name}</h2>
        <p className="portal-card-description">{description}</p>
      </div>
      
      <div className="portal-card-footer">
        <span className="portal-card-link">Access Portal</span>
        <ArrowRight size={20} className="portal-card-arrow" />
      </div>
    </div>
  )
}

export default PortalCard

