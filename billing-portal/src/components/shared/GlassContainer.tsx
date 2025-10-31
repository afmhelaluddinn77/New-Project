import { ReactNode, CSSProperties } from 'react'
import './GlassContainer.css'

interface GlassContainerProps {
  children: ReactNode
  variant?: 'default' | 'strong' | 'subtle'
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

export default function GlassContainer({
  children,
  variant = 'default',
  className = '',
  style,
  onClick,
}: GlassContainerProps) {
  const variantClass = `glass-container-${variant}`

  return (
    <div
      className={`glass-container ${variantClass} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

