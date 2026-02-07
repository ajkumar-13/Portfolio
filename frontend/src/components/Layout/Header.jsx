import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import styles from '../../styles/components.module.css';

/**
 * Header Component
 * 
 * The navigation bar at the top of every page.
 * Features:
 * - Logo with gradient text
 * - Navigation links
 * - Theme toggle (sun/moon icon)
 * - 2D/3D view toggle button
 */
const Header = () => {
    const location = useLocation();
    const { theme, toggleTheme, isDark } = useTheme();

    // Check if current path matches the link
    const isActive = (path) => location.pathname === path;

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                {/* Logo */}
                <Link to="/" className={styles.logo}>
                    <span className={styles.logoIcon}>🧠</span>
                    Ajay Kumar
                </Link>

                {/* Navigation Links */}
                <nav className={styles.nav}>
                    <Link
                        to="/"
                        className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/work"
                        className={`${styles.navLink} ${isActive('/work') ? styles.active : ''}`}
                    >
                        Projects
                    </Link>
                    <Link
                        to="/blogs"
                        className={`${styles.navLink} ${location.pathname.startsWith('/blogs') ? styles.active : ''}`}
                    >
                        Blog
                    </Link>
                    <Link
                        to="/admin"
                        className={`${styles.navLink} ${isActive('/admin') ? styles.active : ''}`}
                    >
                        Admin
                    </Link>
                </nav>

                {/* Right side buttons */}
                <div className={styles.headerButtons}>
                    {/* Theme Toggle Button */}
                    <button
                        className={styles.themeToggle}
                        onClick={toggleTheme}
                        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>

                    {/* 2D/3D Toggle (placeholder for future) */}
                    <button
                        className={styles.viewToggle}
                        onClick={() => alert("3D View coming soon! 🚀")}
                        title="Toggle 3D View"
                    >
                        2D ↔ 3D
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
