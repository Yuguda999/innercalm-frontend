import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usersAPI } from '../services/api'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light')
  const [isLoading, setIsLoading] = useState(true)

  // Load theme from localStorage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // First check localStorage for immediate theme application
        const savedTheme = localStorage.getItem('theme') as Theme
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setThemeState(savedTheme)
          applyTheme(savedTheme)
        }

        // Then try to load from user preferences if authenticated
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const preferences = await usersAPI.getPreferences()
            if (preferences.theme && preferences.theme !== savedTheme) {
              setThemeState(preferences.theme as Theme)
              applyTheme(preferences.theme as Theme)
              localStorage.setItem('theme', preferences.theme)
            }
          } catch (error) {
            // If preferences fail to load, keep the localStorage theme
            console.log('Could not load theme preferences, using local storage')
          }
        }
      } catch (error) {
        // Fallback to system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const fallbackTheme = systemPrefersDark ? 'dark' : 'light'
        setThemeState(fallbackTheme)
        applyTheme(fallbackTheme)
        localStorage.setItem('theme', fallbackTheme)
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if no theme is explicitly set
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme) {
        const newTheme = e.matches ? 'dark' : 'light'
        setThemeState(newTheme)
        applyTheme(newTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    // Try to save to user preferences if authenticated
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await usersAPI.updatePreferences({ theme: newTheme })
      } catch (error) {
        console.log('Could not save theme preference to server')
      }
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isLoading,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
