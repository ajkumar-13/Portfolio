import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Theme Context
 * 
 * This creates a global "context" that any component can access.
 * Think of it like a global variable, but React-friendly.
 * 
 * We use this to share the current theme (dark/light) across all components
 * without having to pass props down through every level.
 */
const ThemeContext = createContext();

/**
 * Custom hook to use the theme
 * Instead of writing useContext(ThemeContext) everywhere,
 * we create this simple useTheme() hook
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

/**
 * Theme Provider Component
 * 
 * This wraps your entire app and provides theme state to all children.
 * It also handles:
 * - Saving theme preference to localStorage (persists across refreshes)
 * - Applying the theme class to the document body
 */
export const ThemeProvider = ({ children }) => {
    // Initialize theme from localStorage, or default to 'dark'
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('portfolio-theme');
        return saved || 'dark';
    });

    // Whenever theme changes, update localStorage and body class
    useEffect(() => {
        localStorage.setItem('portfolio-theme', theme);
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    // Toggle function to switch between themes
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // The value we provide to all children
    const value = {
        theme,
        toggleTheme,
        isDark: theme === 'dark'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
