import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import './DarkModeToggle.css'

interface DarkModeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function DarkModeToggle({ className = '', size = 'md' }: DarkModeToggleProps) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('darkMode')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const shouldBeDark = savedTheme === 'true' || (!savedTheme && systemPrefersDark)
    setIsDark(shouldBeDark)
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    
    // Update DOM
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Save preference
    localStorage.setItem('darkMode', newDarkMode.toString())
    
    // Announce to screen readers
    announceThemeChange(newDarkMode)
  }

  const announceThemeChange = (isDark: boolean) => {
    const announcement = `Theme changed to ${isDark ? 'dark' : 'light'} mode`
    const announcementElement = document.createElement('div')
    announcementElement.setAttribute('aria-live', 'polite')
    announcementElement.setAttribute('aria-atomic', 'true')
    announcementElement.className = 'sr-only'
    announcementElement.textContent = announcement
    document.body.appendChild(announcementElement)
    
    setTimeout(() => {
      document.body.removeChild(announcementElement)
    }, 1000)
  }

  const sizeClasses = {
    sm: 'dark-mode-toggle-sm',
    md: 'dark-mode-toggle-md',
    lg: 'dark-mode-toggle-lg'
  }

  if (!mounted) {
    // Return placeholder to avoid layout shift
    return (
      <button 
        className={`dark-mode-toggle-placeholder ${sizeClasses[size]} ${className}`}
        aria-label="Loading theme toggle"
        disabled
      >
        <div className="placeholder-icon"></div>
      </button>
    )
  }

  return (
    <button
      className={`dark-mode-toggle ${sizeClasses[size]} ${className}`}
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="dark-mode-toggle-track">
        <div className="dark-mode-toggle-thumb">
          {isDark ? (
            <Moon className="dark-mode-icon" size={16} />
          ) : (
            <Sun className="dark-mode-icon" size={16} />
          )}
        </div>
      </div>
      <span className="dark-mode-toggle-label">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}
