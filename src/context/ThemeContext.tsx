import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'

type ThemeContextType = {
    theme: Theme
    isDark: boolean
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextType | null>(null)

const STORAGE_KEY = 'theme'

function readStoredTheme(): Theme | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored === 'dark' || stored === 'light' ? stored : null
    } catch {
        return null
    }
}

/**
 * Reads the theme the pre-paint script in index.html already resolved,
 * so the first render matches the DOM instead of fighting it.
 */
function getInitialTheme(): Theme {
    if (typeof document === 'undefined') return 'light'
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        try {
            localStorage.setItem(STORAGE_KEY, theme)
        } catch {
            // Storage unavailable (private mode / quota) — theme still applies for this session.
        }
    }, [theme])

    // Follow the OS only while the user has not made an explicit choice.
    useEffect(() => {
        const query = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (event: MediaQueryListEvent) => {
            if (readStoredTheme() === null) setThemeState(event.matches ? 'dark' : 'light')
        }
        query.addEventListener('change', handleChange)
        return () => query.removeEventListener('change', handleChange)
    }, [])

    // Keep multiple tabs of the app in sync.
    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY && (event.newValue === 'dark' || event.newValue === 'light')) {
                setThemeState(event.newValue)
            }
        }
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    const toggleTheme = useCallback(() => {
        setThemeState((current) => (current === 'dark' ? 'light' : 'dark'))
    }, [])

    const setTheme = useCallback((next: Theme) => setThemeState(next), [])

    // Memoized: an inline object would re-render every consumer on each parent render.
    const value = useMemo<ThemeContextType>(
        () => ({ theme, isDark: theme === 'dark', toggleTheme, setTheme }),
        [theme, toggleTheme, setTheme],
    )

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
